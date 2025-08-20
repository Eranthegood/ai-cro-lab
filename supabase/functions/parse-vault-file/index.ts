import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseFileRequest {
  fileId: string;
  workspaceId: string;
}

interface ParsedFileContent {
  type: string;
  data: any;
  summary: string;
  metadata: Record<string, any>;
  tokenCount: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parse vault file function called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { fileId, workspaceId }: ParseFileRequest = await req.json();
    console.log('Parsing file:', { fileId, workspaceId });

    // Get file info
    const { data: fileData, error: fileError } = await supabase
      .from('knowledge_vault_files')
      .select('*')
      .eq('id', fileId)
      .eq('workspace_id', workspaceId)
      .single();

    if (fileError || !fileData) {
      throw new Error(`File not found: ${fileError?.message}`);
    }

    // Mark as processing
    await supabase
      .from('knowledge_vault_parsed_content')
      .upsert({
        file_id: fileId,
        workspace_id: workspaceId,
        content_type: fileData.file_type,
        parsing_status: 'processing',
        structured_data: {},
        token_count: 0
      }, { onConflict: 'file_id' });

    console.log('Starting to parse file:', fileData.file_name);

    // Download file from storage
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('knowledge-vault')
      .download(fileData.storage_path);

    if (downloadError || !fileBlob) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    let parsedContent: ParsedFileContent;

    // If the file is an image, avoid reading it as text to prevent huge token counts
    if (fileData.file_type && fileData.file_type.startsWith('image/')) {
      const size = (fileBlob as Blob).size ?? 0;
      parsedContent = {
        type: 'image',
        data: {
          fileName: fileData.file_name,
          path: fileData.storage_path,
          sizeBytes: size,
        },
        summary: `Image file: ${fileData.file_name} (${fileData.file_type}), ~${Math.round(size / 1024)}KB`,
        metadata: { fileType: fileData.file_type, sizeBytes: size },
        tokenCount: 0,
      };
    } else {
      const fileContent = await (fileBlob as Blob).text();
      console.log('File downloaded, size:', fileContent.length);

      // Parse based on file type
      if (fileData.file_type === 'text/csv') {
        parsedContent = parseCSVContent(fileContent, fileData.file_name);
      } else if (fileData.file_type === 'application/json') {
        parsedContent = parseJSONContent(fileContent);
      } else if (fileData.file_type && fileData.file_type.startsWith('text/')) {
        parsedContent = parseTextContent(fileContent);
      } else {
        parsedContent = {
          type: 'other',
          data: { size: fileContent.length },
          summary: `File: ${fileData.file_name} (${fileData.file_type})`,
          metadata: { fileType: fileData.file_type },
          tokenCount: Math.ceil(fileContent.length / 4),
        };
      }
    }

    console.log('File parsed successfully, tokens:', parsedContent.tokenCount);

    // Save parsed content
    const { error: saveError } = await supabase
      .from('knowledge_vault_parsed_content')
      .upsert({
        file_id: fileId,
        workspace_id: workspaceId,
        content_type: parsedContent.type,
        structured_data: parsedContent.data,
        columns_metadata: parsedContent.metadata,
        summary: parsedContent.summary,
        token_count: parsedContent.tokenCount,
        parsing_status: 'success',
        parsed_at: new Date().toISOString()
      }, { onConflict: 'file_id' });

    if (saveError) {
      throw new Error(`Failed to save parsed content: ${saveError.message}`);
    }

    // Update file as processed
    await supabase
      .from('knowledge_vault_files')
      .update({ is_processed: true })
      .eq('id', fileId);

    console.log('✅ File parsing completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        tokenCount: parsedContent.tokenCount,
        contentType: parsedContent.type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-vault-file function:', error);
    
    const { fileId, workspaceId } = await req.json().catch(() => ({}));
    
    if (fileId && workspaceId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase
        .from('knowledge_vault_parsed_content')
        .upsert({
          file_id: fileId,
          workspace_id: workspaceId,
          content_type: 'error',
          parsing_status: 'error',
          parsing_error: error.message,
          structured_data: {},
          token_count: 0
        }, { onConflict: 'file_id' });
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function parseCSVContent(content: string, fileName: string): ParsedFileContent {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return {
      type: 'csv',
      data: { rows: [], columns: [] },
      summary: `Empty CSV file: ${fileName}`,
      metadata: { columnsDetected: [] },
      tokenCount: 20
    };
  }

  const headers = csvSplit(lines[0]);
  const dataRows = lines.slice(1).map(line => csvSplit(line)).filter(row => row.length > 0);
  
  // Detect important columns
  const importantColumns = detectImportantColumns(headers);
  
  // Sample first 10 rows for analysis
  const sampleData = dataRows.slice(0, 10).map(row => {
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });

  // Special handling for REAL 24-25 files (CVR data)
  let summary = `CSV file: ${fileName} with ${headers.length} columns and ${dataRows.length} rows.`;
  let detectedMetrics: any = {};

  if (fileName.includes('REAL 24-25')) {
    const cvrData = analyzeCVRData(headers, dataRows);
    summary = `CVR Data: ${cvrData.summary}`;
    detectedMetrics = cvrData.metrics;
  }

  return {
    type: 'csv',
    data: {
      headers,
      sampleRows: sampleData,
      totalRows: dataRows.length,
      metrics: detectedMetrics
    },
    summary,
    metadata: {
      columnsDetected: importantColumns,
      totalColumns: headers.length,
      totalRows: dataRows.length,
      fileType: 'csv'
    },
    tokenCount: Math.min(Math.ceil(content.length / 6), 2000) // More accurate CSV token estimation
  };
}

function parseJSONContent(content: string): ParsedFileContent {
  try {
    const data = JSON.parse(content);
    const keys = Object.keys(data);
    
    return {
      type: 'json',
      data: data,
      summary: `JSON file with ${keys.length} main properties: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`,
      metadata: {
        keys: keys,
        type: Array.isArray(data) ? 'array' : 'object',
        size: keys.length
      },
      tokenCount: Math.ceil(content.length / 4)
    };
  } catch {
    return {
      type: 'text',
      data: { content },
      summary: 'Invalid JSON file, treated as text',
      metadata: { fileType: 'json-invalid' },
      tokenCount: Math.ceil(content.length / 4)
    };
  }
}

function parseTextContent(content: string): ParsedFileContent {
  const lines = content.split('\n').length;
  const words = content.split(/\s+/).length;
  
  return {
    type: 'text',
    data: { content },
    summary: `Text file with ${lines} lines and ${words} words`,
    metadata: {
      lines,
      words,
      characters: content.length
    },
    tokenCount: Math.ceil(content.length / 4)
  };
}

function csvSplit(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }
  
  result.push(current.trim());
  return result;
}

function detectImportantColumns(headers: string[]): string[] {
  const important: string[] = [];
  const patterns = [
    { regex: /(cvr|conversion|taux)/i, type: 'cvr' },
    { regex: /(date|jour|day)/i, type: 'date' },
    { regex: /(traffic|visits|sessions)/i, type: 'traffic' },
    { regex: /(revenue|ca|chiffre)/i, type: 'revenue' },
    { regex: /(orders|commandes)/i, type: 'orders' }
  ];

  headers.forEach(header => {
    patterns.forEach(pattern => {
      if (pattern.regex.test(header)) {
        important.push(header);
      }
    });
  });

  return important;
}

function analyzeCVRData(headers: string[], rows: string[][]): { summary: string; metrics: any } {
  // Find date and CVR columns
  const dateCol = headers.findIndex(h => /(date|jour)/i.test(h));
  const cvrCol = headers.findIndex(h => /(cvr|conversion)/i.test(h));
  
  if (dateCol === -1 || cvrCol === -1) {
    return {
      summary: 'CVR data detected but unable to analyze columns',
      metrics: {}
    };
  }

  // Get yesterday's date for reference (assuming today is 2025-08-20)
  const yesterday = '19/08/2025';
  const yesterdayRow = rows.find(row => row[dateCol] === yesterday);
  
  const metrics: any = {
    totalDays: rows.length,
    dateColumn: headers[dateCol],
    cvrColumn: headers[cvrCol]
  };

  if (yesterdayRow) {
    const yesterdayCVR = yesterdayRow[cvrCol];
    metrics.yesterdayCVR = yesterdayCVR;
    return {
      summary: `CVR data with ${rows.length} days. Yesterday (${yesterday}): ${yesterdayCVR}% CVR`,
      metrics
    };
  }

  return {
    summary: `CVR data with ${rows.length} days of data`,
    metrics
  };
}