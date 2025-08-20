import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrateRequest {
  workspaceId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Migrate vault files function called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { workspaceId }: MigrateRequest = await req.json();
    console.log('Migrating files for workspace:', workspaceId);

    // Get all unparsed files
    const { data: unparsedFiles, error: filesError } = await supabase
      .from('knowledge_vault_files')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_processed', false);

    if (filesError) {
      throw new Error(`Failed to fetch files: ${filesError.message}`);
    }

    if (!unparsedFiles || unparsedFiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No files to migrate',
          processedCount: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${unparsedFiles.length} files to migrate`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process files in batches of 3 to avoid overwhelming the system
    for (let i = 0; i < unparsedFiles.length; i += 3) {
      const batch = unparsedFiles.slice(i, i + 3);
      
      await Promise.all(
        batch.map(async (file) => {
          try {
            console.log(`Processing file: ${file.file_name}`);

            // Check if already parsed or currently processing
            const { data: existing, error: existingErr } = await supabase
              .from('knowledge_vault_parsed_content')
              .select('parsing_status, token_count')
              .eq('file_id', file.id)
              .eq('workspace_id', workspaceId)
              .maybeSingle();

            if (existingErr) {
              console.warn(`Check existing failed for ${file.file_name}:`, existingErr.message);
            }

            if (existing?.parsing_status === 'success') {
              await supabase
                .from('knowledge_vault_files')
                .update({ is_processed: true })
                .eq('id', file.id);
              console.log(`Already parsed, skipping: ${file.file_name}`);
              successCount++;
              return;
            }

            if (existing?.parsing_status === 'processing') {
              console.log(`Already processing, skipping: ${file.file_name}`);
              return;
            }

            const { data: parsedResult, error: parseError } = await supabase.functions.invoke('parse-vault-file', {
              body: {
                fileId: file.id,
                workspaceId
              }
            });
            
            if (parseError || !parsedResult?.success) {
              const message = parseError?.message || parsedResult?.error || 'Unknown error';
              console.error(`Error parsing ${file.file_name}:`, message);
              errors.push(`${file.file_name}: ${message}`);
              errorCount++;
            } else {
              console.log(`✅ Parsed: ${file.file_name}`);
              successCount++;
            }
          } catch (err: any) {
            console.error(`Failed to parse ${file.file_name}:`, err);
            errors.push(`${file.file_name}: ${err.message}`);
            errorCount++;
          }
        })
      );
      
      // Wait 2 seconds between batches to avoid rate limiting
      if (i + 3 < unparsedFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Migration completed: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processedCount: unparsedFiles.length,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in migrate-vault-files function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});