import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KnowledgeVaultData {
  configurations: any[];
  files: any[];
  workspaceInfo: any;
  parsedFiles: Record<string, any>;
}

interface ParsedFileContent {
  type: 'csv' | 'json' | 'text' | 'image';
  data: any;
  summary: string;
  metadata: Record<string, any>;
  tokens: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestStart = Date.now();
    const requestId = crypto.randomUUID().substring(0, 8);
    console.log(`🚀 [${requestId}] Knowledge Vault Chat function started`);

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message, workspaceId, projectId, userId } = await req.json();
    console.log(`📝 [${requestId}] Request:`, { 
      messageLength: message?.length, 
      workspaceId: workspaceId?.substring(0, 8), 
      projectId: projectId?.substring(0, 8) || 'global',
      userId: userId?.substring(0, 8)
    });

    // Verify workspace access
    const { data: workspaceAccess } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (!workspaceAccess) {
      throw new Error('Access denied to workspace');
    }

    // Gather Knowledge Vault data with smart parsing
    const dataStart = Date.now();
    const knowledgeVaultData = await gatherKnowledgeVaultData(supabase, workspaceId);
    console.log(`📊 [${requestId}] Data gathered: ${knowledgeVaultData.files?.length || 0} files, ${Date.now() - dataStart}ms`);

    // Parse files based on user query for contextual relevance
    const parseStart = Date.now();
    const parsedFiles = await parseRelevantFiles(supabase, knowledgeVaultData.files, message, workspaceId);
    knowledgeVaultData.parsedFiles = parsedFiles;
    console.log(`🔧 [${requestId}] Files parsed: ${Object.keys(parsedFiles).length}, ${Date.now() - parseStart}ms`);

    // Create smart context based on query and available data
    const contextStart = Date.now();
    const context = await createSmartContext(knowledgeVaultData, message, projectId);
    const contextTokens = Math.ceil(context.length / 4);
    console.log(`🧠 [${requestId}] Context created: ${contextTokens} tokens, ${Date.now() - contextStart}ms`);

    // ========== PHASE 3: STREAMING RÉEL CLAUDE ==========
    
    // Check rate limiting (50 messages/jour pour utilisateurs gratuits)
    const rateLimitResult = await checkRateLimit(supabase, workspaceId, userId);
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ 
        error: `Limite quotidienne atteinte (${rateLimitResult.count}/50). Revenez demain ou passez en premium.`,
        rate_limit: true
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Claude with intelligent retry and real streaming
    const claudeStart = Date.now();
    const stream = await callClaudeWithStreamingRetry(anthropicApiKey, {
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      stream: true, // Enable real streaming
      messages: [
        {
          role: 'user',
          content: `Assistant IA Knowledge Vault - Analyse concise et précise.

${projectId ? 
  `Projet: ${projectId} - Focus sur données du projet.` :
  `Mode global - Analyse complète workspace.`
}

DONNÉES VAULT:
${context}

QUESTION: ${message}

Réponds de manière:
- Concise mais complète
- Actionnable avec insights précis  
- Basée sur les données réelles
- En français professionnel`
        }
      ]
    });

    console.log(`🚀 [${requestId}] Claude streaming initiated: ${Date.now() - claudeStart}ms`);
    
    // Return streaming response
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Request-ID': requestId
      },
    });

  } catch (error) {
    const totalTime = Date.now() - requestStart;
    console.error(`🚨 [${requestId}] Function error: ${error?.message} (${totalTime}ms)`);
    
    // Log erreur pour monitoring
    try {
      await supabase.rpc('log_knowledge_vault_action', {
        p_workspace_id: workspaceId,
        p_action: 'error',
        p_resource_type: 'chat',
        p_resource_id: projectId || null,
        p_metadata: {
          request_id: requestId,
          error_message: error?.message,
          error_type: error?.constructor?.name,
          total_time_ms: totalTime
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      request_id: requestId,
      details: 'Erreur détaillée disponible dans les logs'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ========== PHASE 3: RATE LIMITING INTELLIGENT ==========
async function checkRateLimit(supabase: any, workspaceId: string, userId: string): Promise<{allowed: boolean, count: number}> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check workspace plan
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('plan')
      .eq('id', workspaceId)
      .single();
    
    // Premium users have no limits
    if (workspace?.plan === 'premium' || workspace?.plan === 'pro') {
      return { allowed: true, count: 0 };
    }
    
    // Count today's interactions for this user
    const { data: interactions } = await supabase
      .from('knowledge_vault_audit')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('action', 'ai_interaction')
      .gte('created_at', today + 'T00:00:00Z')
      .lt('created_at', today + 'T23:59:59Z');
    
    const count = interactions?.length || 0;
    const limit = 50; // Free tier limit
    
    return { 
      allowed: count < limit, 
      count 
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, count: 0 }; // Fail open
  }
}

// ========== PHASE 3: STREAMING RÉEL CLAUDE ==========
async function callClaudeWithStreamingRetry(apiKey: string, payload: any, maxRetries = 3): Promise<ReadableStream> {
  const delays = [1000, 2000, 4000];
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌊 Claude Streaming attempt ${attempt + 1}/${maxRetries + 1}`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok && response.body) {
        console.log(`✅ Claude streaming initiated successfully`);
        
        // Transform Claude's stream to Server-Sent Events
        const transformStream = new TransformStream({
          transform(chunk, controller) {
            const decoder = new TextDecoder();
            const text = decoder.decode(chunk);
            
            // Parse Claude streaming format and convert to SSE
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'content_block_delta' && data.delta?.text) {
                    // Send as Server-Sent Event
                    controller.enqueue(`data: ${JSON.stringify({ 
                      type: 'content', 
                      content: data.delta.text 
                    })}\n\n`);
                  } else if (data.type === 'message_stop') {
                    controller.enqueue(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                  }
                } catch (e) {
                  // Ignore parse errors for streaming
                }
              }
            }
          }
        });

        return response.body.pipeThrough(transformStream);
      }

      const status = response.status;
      if (status === 429) {
        const delay = delays[attempt] || 8000;
        console.warn(`⚠️ Rate limited (429), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (status >= 500) {
        const delay = delays[attempt] || 4000;
        console.warn(`⚠️ Server error (${status}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw new Error(`HTTP ${status}: ${await response.text()}`);

    } catch (error) {
      console.error(`❌ Claude streaming attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries) {
        // Fallback to non-streaming response
        const fallbackPayload = { ...payload, stream: false };
        const fallbackResponse = await callClaudeWithRetry(apiKey, fallbackPayload);
        
        // Convert to streaming format
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            const text = fallbackResponse.content[0].text;
            const words = text.split(' ');
            let i = 0;
            
            const sendNext = () => {
              if (i < words.length) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'content', 
                  content: words[i] + ' ' 
                })}\n\n`));
                i++;
                setTimeout(sendNext, 50); // 50ms delay between words
              } else {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
                controller.close();
              }
            };
            
            sendNext();
          }
        });
        
        return stream;
      }
      
      const delay = delays[attempt] || 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('All streaming attempts failed');
}
  const delays = [1000, 2000, 4000, 8000]; // Backoff exponentiel: 1s, 2s, 4s, 8s
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Claude API attempt ${attempt + 1}/${maxRetries + 1}`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Claude API success on attempt ${attempt + 1}`);
        return data;
      }

      // Gérer les erreurs spécifiques
      const status = response.status;
      const errorText = await response.text();
      
      if (status === 429 || status === 529) {
        // Rate limit ou surcharge - retry avec backoff
        if (attempt < maxRetries) {
          const delay = delays[attempt];
          console.log(`⏳ Retry ${attempt + 1} in ${delay}ms - Status: ${status}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else if (status >= 400 && status < 500 && status !== 429) {
        // Erreur client - ne pas retry
        console.error(`❌ Client error ${status}:`, errorText);
        throw new Error(`Claude API client error: ${status} - ${errorText}`);
      }
      
      // Dernière tentative ou erreur serveur
      if (attempt === maxRetries) {
        console.error(`❌ Final attempt failed - Status: ${status}:`, errorText);
        
        // Fallback vers un modèle plus simple si disponible
        if (payload.model === 'claude-3-5-haiku-20241022') {
          console.log('🔄 Fallback: trying with reduced context...');
          const fallbackPayload = {
            ...payload,
            max_tokens: Math.min(1000, payload.max_tokens),
            messages: [{
              role: 'user',
              content: payload.messages[0].content.slice(0, 8000) + '\n\nRéponds de manière concise en te basant sur les données disponibles.'
            }]
          };
          
          try {
            const fallbackResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify(fallbackPayload)
            });
            
            if (fallbackResponse.ok) {
              console.log('✅ Fallback successful');
              return await fallbackResponse.json();
            }
          } catch (fallbackError) {
            console.error('❌ Fallback failed:', fallbackError);
          }
        }
        
        throw new Error(`Claude API error after ${maxRetries + 1} attempts: ${status} - ${errorText}`);
      }
      
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`❌ Network error on final attempt:`, error);
        throw new Error(`Network error after ${maxRetries + 1} attempts: ${error.message}`);
      }
      
      const delay = delays[attempt] || 2000;
      console.log(`⏳ Network error, retry ${attempt + 1} in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Unexpected end of retry loop');
}

async function gatherKnowledgeVaultData(supabase: any, workspaceId: string): Promise<KnowledgeVaultData> {
  console.log('Gathering Knowledge Vault data for workspace:', workspaceId);

  // Get workspace information
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  // Get all configurations
  const { data: configurations } = await supabase
    .from('knowledge_vault_config')
    .select('*')
    .eq('workspace_id', workspaceId);

  // Get all files metadata
  const { data: files } = await supabase
    .from('knowledge_vault_files')
    .select('*')
    .eq('workspace_id', workspaceId);

  // Get knowledge base entries
  const { data: knowledgeBase } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('workspace_id', workspaceId);

  // Get A/B tests data
  const { data: abTests } = await supabase
    .from('ab_tests')
    .select('*')
    .eq('workspace_id', workspaceId);

  // Get ContentSquare data
  const { data: contentSquareData } = await supabase
    .from('contentsquare_data')
    .select('*')
    .eq('workspace_id', workspaceId);

  return {
    configurations: configurations || [],
    files: files || [],
    workspaceInfo: {
      workspace,
      knowledgeBase: knowledgeBase || [],
      abTests: abTests || [],
      contentSquareData: contentSquareData || []
    },
    parsedFiles: {}
  };
}

// ========== PHASE 2 CORRECTIONS: PARSER CSV ROBUSTIFIÉ ==========
function csvSplit(line: string): string[] {
  // Vérifications de sécurité pour éviter undefined.length
  if (!line || typeof line !== 'string') {
    console.warn('⚠️ CSV Split: Invalid line input:', line);
    return [];
  }
  
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  try {
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    
    // Log pour diagnostics avancés
    if (result.length === 0) {
      console.warn('⚠️ CSV Split: Empty result for line:', line.substring(0, 100));
    }
    
    return result;
  } catch (error) {
    console.error('🚨 CSV Split Error:', error, 'Line:', line?.substring(0, 100));
    return [];
  }
}

function normalizePercent(val?: string): number | null {
  if (!val) return null;
  let s = val.replace(/"/g, '').replace(/%/g, '').replace(/\u00A0/g, '').replace(/\s+/g, '');
  if (s.includes(',') && !s.includes('.')) s = s.replace(/,/g, '.');
  const num = parseFloat(s);
  return Number.isFinite(num) ? num : null;
}

function parseDDMMYYYY(str: string): Date | null {
  const m = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const y = parseInt(m[3], 10);
  const date = new Date(y, mo, d);
  return isNaN(date.getTime()) ? null : date;
}

function formatDDMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function computeCVRSummary(
  supabase: any,
  storagePath: string
): Promise<{ summaryText: string; yesterdayCVR?: number; yesterdayDate?: string }> {
  const startTime = Date.now();
  
  try {
    console.log('📊 Starting CVR Summary for:', storagePath);
    
    const { data, error } = await supabase.storage.from('knowledge-vault').download(storagePath);
    if (error || !data) {
      console.error('🚨 CVR Download failed:', error?.message || 'No data');
      return { summaryText: '' };
    }

    const text = await data.text();
    
    // Vérifications de sécurité robustes
    if (!text || typeof text !== 'string') {
      console.error('🚨 Invalid CSV text content');
      return { summaryText: '' };
    }
    
    const lines = text.split(/\r?\n/).filter((l: string) => l?.trim()?.length > 0);
    
    if (!lines || lines.length === 0) {
      console.warn('⚠️ Empty CSV file');
      return { summaryText: '' };
    }

    // Détection intelligente du header avec vérifications de sécurité
    let headerIdx = -1;
    
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      if (!line || typeof line !== 'string') continue;
      
      const lowerLine = line.toLowerCase();
      if ((lowerLine.includes('daynum') && lowerLine.includes('dayweek')) || 
          (lowerLine.includes('date') && lowerLine.includes('cvr'))) {
        headerIdx = i;
        break;
      }
    }
    
    if (headerIdx === -1) {
      console.warn('⚠️ No valid header found in CSV');
      return { summaryText: '' };
    }

    const headerLine = lines[headerIdx];
    if (!headerLine) {
      console.error('🚨 Header line is undefined at index:', headerIdx);
      return { summaryText: '' };
    }

    const header = csvSplit(headerLine).map((s) => s?.trim() || '').filter(h => h.length > 0);
    
    if (header.length === 0) {
      console.error('🚨 Empty header after parsing');
      return { summaryText: '' };
    }
    
    console.log('📝 CSV Header parsed:', header.length, 'columns');
    
    const idxDate = header.findIndex((h) => h && h.toLowerCase() === 'date');
    const idxCVR = header.findIndex((h) => h && h.toLowerCase() === 'cvr');
    const idxWebCVR = header.findIndex((h) => h && h.toLowerCase().includes('web') && h.toLowerCase().includes('cvr'));
    const idxAppCVR = header.findIndex((h) => h && h.toLowerCase().includes('app') && h.toLowerCase().includes('cvr'));

    const entries: { date: Date; dateStr: string; cvr: number | null; web: number | null; app: number | null }[] = [];

    // Parsing robuste des données avec vérifications
    let processedRows = 0;
    let errorRows = 0;
    
    for (let i = headerIdx + 1; i < Math.min(lines.length, headerIdx + 1000); i++) {
      const line = lines[i];
      
      if (!line || typeof line !== 'string') {
        errorRows++;
        continue;
      }
      
      if (line.toLowerCase().includes('daynum')) break; // stop at next header block
      
      try {
        const cells = csvSplit(line);
        
        if (!cells || cells.length === 0) {
          errorRows++;
          continue;
        }
        
        if (idxDate < 0 || idxDate >= cells.length) continue;
        
        const dateStr = cells[idxDate];
        if (!dateStr) continue;
        
        const d = parseDDMMYYYY(dateStr);
        if (!d) continue;
        
        const cvr = idxCVR >= 0 && idxCVR < cells.length ? normalizePercent(cells[idxCVR]) : null;
        const web = idxWebCVR >= 0 && idxWebCVR < cells.length ? normalizePercent(cells[idxWebCVR]) : null;
        const app = idxAppCVR >= 0 && idxAppCVR < cells.length ? normalizePercent(cells[idxAppCVR]) : null;
        
        entries.push({ date: d, dateStr: formatDDMMYYYY(d), cvr, web, app });
        processedRows++;
        
      } catch (rowError) {
        console.warn('⚠️ Error parsing CSV row', i, ':', rowError);
        errorRows++;
      }
    }
    
    console.log(`📊 CSV Parsing complete: ${processedRows} rows processed, ${errorRows} errors, ${Date.now() - startTime}ms`);

    if (entries.length === 0) return { summaryText: '' };

    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    const now = new Date();
    const yd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayOrLatest = entries.filter((e) => e.date.getTime() <= yd.getTime()).pop() || entries[entries.length - 1];

    const lastN = entries.slice(-14);
    let summary = 'RÉSUMÉ CVR (REAL 24-25 - 14 derniers jours):\n';
    summary += 'Date | CVR | Web | App\n';
    lastN.forEach((e) => {
      const cvrStr = e.cvr != null ? `${e.cvr.toFixed(2)}%` : '-';
      const webStr = e.web != null ? `${e.web.toFixed(2)}%` : '-';
      const appStr = e.app != null ? `${e.app.toFixed(2)}%` : '-';
      summary += `${e.dateStr} | ${cvrStr} | ${webStr} | ${appStr}\n`;
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ CVR Summary generated: ${entries.length} entries, ${processingTime}ms`);
    
    return { 
      summaryText: summary, 
      yesterdayCVR: yesterdayOrLatest.cvr ?? undefined, 
      yesterdayDate: yesterdayOrLatest.dateStr 
    };
  } catch (e) {
    const processingTime = Date.now() - startTime;
    console.error('🚨 CVR Summary Error:', e?.message || e, `(${processingTime}ms)`);
    return { summaryText: `Erreur parsing CVR: ${e?.message || 'Erreur inconnue'}` };
  }
}

// Advanced file parsing with type detection and content extraction
async function parseFileContent(supabase: any, file: any): Promise<ParsedFileContent> {
  const fileExtension = file.file_name.split('.').pop()?.toLowerCase();
  
  try {
    const { data, error } = await supabase.storage.from('knowledge-vault').download(file.storage_path);
    if (error || !data) {
      throw new Error(`Failed to download file: ${error?.message}`);
    }

    const content = await data.text();
    let parsedData: any = {};
    let summary = '';
    let tokens = 0;

    switch (fileExtension) {
      case 'csv':
        parsedData = await parseCSVContent(content, file.file_name);
        summary = `CSV avec ${parsedData.rows?.length || 0} lignes et ${parsedData.columns?.length || 0} colonnes`;
        tokens = Math.ceil(content.length / 4); // Rough token estimation
        break;
      
      case 'json':
        parsedData = JSON.parse(content);
        summary = `JSON avec ${Object.keys(parsedData).length} propriétés principales`;
        tokens = Math.ceil(content.length / 4);
        break;
      
      case 'txt':
      case 'md':
        parsedData = { text: content };
        summary = `Document texte de ${content.length} caractères`;
        tokens = Math.ceil(content.length / 4);
        break;
      
      default:
        // Binary files or unsupported formats
        summary = `Fichier ${fileExtension?.toUpperCase() || 'binaire'} de ${Math.round(file.file_size / 1024)}KB`;
        tokens = 50; // Minimal token count for metadata
        break;
    }

    return {
      type: fileExtension === 'csv' ? 'csv' : fileExtension === 'json' ? 'json' : 'text',
      data: parsedData,
      summary,
      metadata: {
        fileName: file.file_name,
        fileSize: file.file_size,
        section: file.config_section,
        uploadedAt: file.created_at
      },
      tokens
    };
  } catch (error) {
    console.error(`Error parsing file ${file.file_name}:`, error);
    return {
      type: 'text',
      data: {},
      summary: `Erreur lors de la lecture du fichier: ${error.message}`,
      metadata: { fileName: file.file_name, error: error.message },
      tokens: 20
    };
  }
}

// ========== PHASE 2: CSV PARSING ROBUSTIFIÉ & OPTIMISÉ ==========
async function parseCSVContent(content: string, fileName: string): Promise<any> {
  const startTime = Date.now();
  console.log('📊 Starting robust CSV parsing for:', fileName);
  
  // Vérifications de sécurité renforcées
  if (!content || typeof content !== 'string') {
    console.error('🚨 Invalid CSV content');
    return { rows: [], columns: [], summary: 'Contenu CSV invalide', error: 'Invalid content type' };
  }

  const lines = content.split(/\r?\n/).filter(l => l?.trim()?.length > 0);
  if (!lines || lines.length === 0) {
    console.warn('⚠️ Empty CSV');
    return { rows: [], columns: [], summary: 'CSV vide', error: 'Empty file' };
  }

  try {
    // Détection intelligente du header
    let headerIdx = 0;
    if (fileName.includes('REAL 24-25') || fileName.includes('SHIFT Digital')) {
      const foundIdx = lines.findIndex(l => {
        if (!l || typeof l !== 'string') return false;
        const lower = l.toLowerCase();
        return lower.includes('date') && lower.includes('cvr');
      });
      if (foundIdx !== -1) headerIdx = foundIdx;
    }
    
    const headerLine = lines[headerIdx];
    if (!headerLine) {
      throw new Error(`Header line not found at index ${headerIdx}`);
    }
    
    const header = csvSplit(headerLine).map(h => (h || '').trim()).filter(h => h.length > 0);
    if (header.length === 0) {
      throw new Error('Empty header after parsing');
    }
    
    console.log(`📝 Header parsed: ${header.length} columns`);
    
    const dataRows = [];
    let processedRows = 0;
    let errorRows = 0;
    const maxRows = Math.min(lines.length, headerIdx + 500); // Limit for token management
    
    // Parsing robuste des données
    for (let i = headerIdx + 1; i < maxRows; i++) {
      const line = lines[i];
      if (!line || typeof line !== 'string') {
        errorRows++;
        continue;
      }
      
      try {
        const cells = csvSplit(line);
        if (!cells || cells.length === 0) {
          errorRows++;
          continue;
        }
        
        // Accepter les lignes avec au moins 50% des colonnes
        if (cells.length >= Math.floor(header.length * 0.5)) {
          const row: any = {};
          header.forEach((col, idx) => {
            row[col] = (cells[idx] || '').trim();
          });
          dataRows.push(row);
          processedRows++;
        } else {
          errorRows++;
        }
      } catch (rowError) {
        console.warn(`⚠️ Row ${i} parsing error:`, rowError);
        errorRows++;
      }
    }

    // Détection intelligente des colonnes clés
    const dateColumns = header.filter(h => h && h.toLowerCase().includes('date'));
    const cvrColumns = header.filter(h => h && h.toLowerCase().includes('cvr'));
    const trafficColumns = header.filter(h => h && (h.toLowerCase().includes('traffic') || h.toLowerCase().includes('visit')));
    const revenueColumns = header.filter(h => h && (h.toLowerCase().includes('revenue') || h.toLowerCase().includes('ca')));
    
    const processingTime = Date.now() - startTime;
    const successRate = processedRows / (processedRows + errorRows) * 100;
    
    console.log(`✅ CSV Parsing complete: ${processedRows} rows, ${errorRows} errors, ${successRate.toFixed(1)}% success, ${processingTime}ms`);

    return {
      rows: dataRows,
      columns: header,
      totalRows: lines.length - headerIdx - 1,
      processedRows,
      errorRows,
      successRate,
      processingTime,
      keyColumns: {
      dates: dateColumns,
      cvr: cvrColumns,
      traffic: trafficColumns,
      revenue: revenueColumns
      },
      summary: `CSV ${fileName}: ${dataRows.length} lignes analysées (${cvrColumns.length} CVR, ${dateColumns.length} dates, ${successRate.toFixed(1)}% succès)`
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('🚨 CSV Parsing Error:', error?.message, `(${processingTime}ms)`);
    return {
      rows: [],
      columns: [],
      summary: `Erreur parsing ${fileName}: ${error?.message || 'Erreur inconnue'}`,
      error: error?.message,
      processingTime
    };
  }
}

// Generate file hash for cache validation
async function generateFileHash(supabase: any, file: any): Promise<string> {
  try {
    const { data: fileBlob } = await supabase.storage
      .from('knowledge-vault')
      .download(file.storage_path);
    
    if (!fileBlob) return '';
    
    const arrayBuffer = await fileBlob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error generating file hash:', error);
    return `${file.id}-${file.file_size}-${file.created_at}`; // Fallback
  }
}

// ========== PHASE 2: SYSTÈME DE CACHE OPTIMISÉ & INTELLIGENT ==========
async function getCachedFileContent(supabase: any, workspaceId: string, file: any): Promise<ParsedFileContent | null> {
  const startTime = Date.now();
  
  try {
    // Nettoyage automatique du cache ancien (>7 jours)
    await cleanOldCache(supabase, workspaceId);
    
    const fileHash = await generateFileHash(supabase, file);
    
    const { data: cachedData } = await supabase
      .from('knowledge_vault_cache')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('file_id', file.id)
      .eq('file_hash', fileHash)
      .maybeSingle();
    
    if (cachedData) {
      // Update last_accessed pour le garbage collection
      await supabase
        .from('knowledge_vault_cache')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', cachedData.id);
      
      const cacheAge = Date.now() - new Date(cachedData.created_at).getTime();
      console.log(`✅ Cache HIT: ${file.file_name} (age: ${Math.round(cacheAge / 1000 / 60)}min, ${Date.now() - startTime}ms)`);
      
      return cachedData.parsed_content as ParsedFileContent;
    }
    
    console.log(`❌ Cache MISS: ${file.file_name} (${Date.now() - startTime}ms)`);
    return null;
  } catch (error) {
    console.error('🚨 Cache check error:', error?.message, `(${Date.now() - startTime}ms)`);
    return null;
  }
}

// Nettoyage intelligent du cache ancien
async function cleanOldCache(supabase: any, workspaceId: string): Promise<void> {
  try {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 jours
    
    const { data: deletedEntries } = await supabase
      .from('knowledge_vault_cache')
      .delete()
      .eq('workspace_id', workspaceId)
      .lt('last_accessed', cutoffDate)
      .select('id');
    
    if (deletedEntries && deletedEntries.length > 0) {
      console.log(`🧹 Cache cleanup: ${deletedEntries.length} old entries removed`);
    }
  } catch (error) {
    console.warn('⚠️ Cache cleanup error:', error?.message);
  }
}

// Sauvegarde intelligente avec compression automatique
async function saveParsedContentToCache(supabase: any, workspaceId: string, file: any, parsedContent: ParsedFileContent): Promise<void> {
  const startTime = Date.now();
  
  try {
    const fileHash = await generateFileHash(supabase, file);
    const contentString = JSON.stringify(parsedContent);
    const contextSize = contentString.length;
    
    // Compression automatique des gros contextes (>50KB)
    let finalContent = parsedContent;
    let isCompressed = false;
    
    if (contextSize > 50000) {
      // Compression intelligente : garder summary et métadonnées, réduire data
      finalContent = {
        ...parsedContent,
        data: parsedContent.type === 'csv' && parsedContent.data.rows ? 
          { 
            ...parsedContent.data, 
            rows: parsedContent.data.rows.slice(0, 100) // Garder 100 lignes max
          } : 
          parsedContent.data,
        compressed: true,
        originalSize: contextSize
      };
      isCompressed = true;
    }
    
    await supabase
      .from('knowledge_vault_cache')
      .upsert({
        workspace_id: workspaceId,
        file_id: file.id,
        file_hash: fileHash,
        parsed_content: finalContent,
        context_size: JSON.stringify(finalContent).length,
        token_count: parsedContent.tokens || 0,
        last_accessed: new Date().toISOString()
      });
    
    const finalSize = JSON.stringify(finalContent).length;
    const compressionRatio = isCompressed ? Math.round((1 - finalSize / contextSize) * 100) : 0;
    
    console.log(`💾 Cached: ${file.file_name} (${parsedContent.tokens} tokens, ${Math.round(finalSize/1024)}KB${isCompressed ? `, -${compressionRatio}%` : ''}, ${Date.now() - startTime}ms)`);
  } catch (error) {
    console.error('🚨 Cache save error:', error?.message, `(${Date.now() - startTime}ms)`);
  }
}

// Optimized file parsing - reads from pre-parsed content table
async function parseRelevantFiles(supabase: any, files: any[], userQuery: string, workspaceId: string): Promise<Record<string, ParsedFileContent>> {
  const queryLower = userQuery.toLowerCase();
  const relevantFiles: any[] = [];
  
  // Score files based on query relevance
  files.forEach(file => {
    // Add safety checks for required fields
    if (!file?.file_name || !file?.id) {
      console.warn('⚠️ Skipping file with missing required fields:', file);
      return;
    }
    
    let relevanceScore = 0;
    const fileName = file.file_name.toLowerCase();
    const fileType = (file.file_type || '').toLowerCase();
    
    console.log(`🔍 Analyzing file: ${file.file_name} (type: ${fileType})`);
    
    // CVR-related queries
    if (queryLower.includes('cvr') || queryLower.includes('conversion')) {
      if (fileName.includes('real') || fileName.includes('cvr')) relevanceScore += 10;
    }
    
    // Date-related queries
    if (queryLower.includes('hier') || queryLower.includes('yesterday') || queryLower.includes('today')) {
      if (fileName.includes('real') || fileName.includes('daily')) relevanceScore += 8;
    }
    
    // Detail queries (columnes, schéma, détail)
    if (queryLower.includes('colonnes') || queryLower.includes('schéma') || queryLower.includes('détail') || queryLower.includes('structure')) {
      relevanceScore += 12; // High priority for detail requests
    }
    
    // Section-specific queries
    if (queryLower.includes('traffic') || queryLower.includes('audience')) {
      if (file.config_section === 'behavioral') relevanceScore += 6;
    }
    
    // Always include REAL 24-25 for analysis
    if (fileName.includes('real 24-25')) relevanceScore += 15;
    
    // File type preferences (with null safety)
    if (fileType && fileType.includes('csv')) relevanceScore += 3;
    if (fileType && fileType.includes('json')) relevanceScore += 2;
    
    if (relevanceScore > 5) {
      relevantFiles.push({ ...file, relevanceScore });
    }
  });
  
  // Sort by relevance and limit to top 5 files to manage tokens
  relevantFiles.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topFiles = relevantFiles.slice(0, 5);
  
  const parsedFiles: Record<string, ParsedFileContent> = {};
  let preParseHits = 0;
  let cacheFallbacks = 0;
  
  // First try to get from pre-parsed content table
  await Promise.all(
    topFiles.map(async (file) => {
      // Try to get from knowledge_vault_parsed_content first
      const { data: parsedContent } = await supabase
        .from('knowledge_vault_parsed_content')
        .select('*')
        .eq('file_id', file.id)
        .eq('parsing_status', 'success')
        .single();
      
      if (parsedContent) {
        console.log(`✅ Pre-parsed content found for file: ${file.file_name}`);
        parsedFiles[file.id] = {
          type: parsedContent.content_type || 'text',
          data: parsedContent.structured_data || {},
          summary: parsedContent.summary || `File: ${file.file_name}`,
          metadata: {
            fileName: file.file_name,
            fileSize: file.file_size,
            section: file.config_section,
            uploadedAt: file.created_at,
            ...(parsedContent.columns_metadata || {})
          },
          tokens: parsedContent.token_count || 0
        };
        preParseHits++;
      } else {
        console.log(`❌ No pre-parsed content for file: ${file.file_name}, falling back to cache`);
        // Fallback to old cache method for files not yet parsed
        const cachedContent = await getCachedFileContent(supabase, workspaceId, file);
        
        if (cachedContent) {
          parsedFiles[file.id] = cachedContent;
          cacheFallbacks++;
        } else {
          // Last resort: parse on demand
          console.log(`⚠️ Parsing on demand: ${file.file_name}`);
          const parsed = await parseFileContent(supabase, file);
          parsedFiles[file.id] = parsed;
          await saveParsedContentToCache(supabase, workspaceId, file, parsed);
        }
      }
    })
  );
  
  console.log(`📊 Parse stats: ${preParseHits} pre-parsed, ${cacheFallbacks} cache fallbacks`);
  
  return parsedFiles;
}

// Create smart context that adapts to user query and token limits
async function createSmartContext(vaultData: KnowledgeVaultData, userQuery: string, projectId?: string | null): Promise<string> {
  let context = "";
  let totalTokens = 0;
  const maxTokens = 180000; // Leave room for Claude's response
  
  // Always include workspace info (low token cost)
  if (vaultData.workspaceInfo.workspace) {
    const workspaceInfo = `WORKSPACE: ${vaultData.workspaceInfo.workspace.name} (${vaultData.workspaceInfo.workspace.plan})\n`;
    context += workspaceInfo;
    totalTokens += Math.ceil(workspaceInfo.length / 4);
  }
  
  // Include business configuration if available
  const businessConfig = vaultData.configurations.find(c => c.config_section === 'business');
  if (businessConfig?.config_data) {
    const businessInfo = `BUSINESS: ${businessConfig.config_data.industry || 'N/A'} - ${businessConfig.config_data.businessModel || 'N/A'}\n`;
    context += businessInfo;
    totalTokens += Math.ceil(businessInfo.length / 4);
  }
  
  // Add parsed file data based on relevance and token budget
  const queryLower = userQuery.toLowerCase();
  let remainingTokens = maxTokens - totalTokens - 1000; // Reserve tokens for structure
  
  // Prioritize REAL 24-25 data if query is about CVR/metrics
  if (queryLower.includes('cvr') || queryLower.includes('hier') || queryLower.includes('conversion')) {
    const realFile = Object.values(vaultData.parsedFiles).find(
      f => f.metadata?.fileName?.toLowerCase().includes('real 24-25')
    );
    
    if (realFile && realFile.tokens < remainingTokens) {
      console.log(`📊 Prioritizing REAL 24-25 file: ${realFile.metadata?.fileName}`);
      context += await formatFileDataForContext(realFile, 'detailed');
      remainingTokens -= realFile.tokens;
    }
  }
  
  // Add other relevant files within token budget
  for (const [fileId, parsedFile] of Object.entries(vaultData.parsedFiles)) {
    const fileName = parsedFile.metadata?.fileName?.toLowerCase() || '';
    const tokens = parsedFile.tokens || 0;
    
    if (tokens < remainingTokens && !fileName.includes('real 24-25')) {
      const formatLevel = tokens > 5000 ? 'summary' : 'detailed';
      console.log(`📎 Adding file to context: ${parsedFile.metadata?.fileName} (${formatLevel})`);
      context += await formatFileDataForContext(parsedFile, formatLevel);
      remainingTokens -= formatLevel === 'summary' ? 1000 : tokens;
    }
    
    if (remainingTokens < 1000) break; // Stop if running low on tokens
  }
  
  // Add file listing for non-parsed files
  const nonParsedFiles = vaultData.files.filter(f => !vaultData.parsedFiles[f.id]);
  if (nonParsedFiles.length > 0) {
    context += `\nAUTRES FICHIERS DISPONIBLES:\n`;
    nonParsedFiles.slice(0, 10).forEach(file => {
      context += `- ${file.file_name} (${file.config_section})\n`;
    });
  }
  
  return context || "Aucune donnée disponible dans la Knowledge Vault.";
}

// Format file data for context with different detail levels
async function formatFileDataForContext(parsedFile: ParsedFileContent, level: 'summary' | 'detailed'): Promise<string> {
  const fileName = parsedFile.metadata?.fileName || 'Fichier inconnu';
  const fileType = parsedFile.type || 'unknown';
  const summary = parsedFile.summary || 'Aucun résumé disponible';
  
  let formatted = `\n=== ${fileName.toUpperCase()} ===\n`;
  formatted += `Type: ${fileType} | ${summary}\n`;
  
  console.log(`📝 Formatting file for context: ${fileName} (${level})`);
  
  // Safety check for metadata
  if (!parsedFile.metadata) {
    console.warn('⚠️ Missing metadata for file, using fallback format');
    return formatted + 'Données limitées disponibles.\n\n';
  }
  
  if (level === 'summary') {
    formatted += `Résumé: ${parsedFile.summary}\n\n`;
    return formatted;
  }
  
  // Detailed formatting based on file type
  switch (parsedFile.type) {
    case 'csv':
      if (parsedFile.data.rows && parsedFile.data.keyColumns) {
        formatted += `Colonnes clés: ${Object.entries(parsedFile.data.keyColumns)
          .filter(([_, cols]: any) => cols.length > 0)
          .map(([type, cols]: any) => `${type}(${cols.join(', ')})`)
          .join(' | ')}\n`;
        
        // Include recent data samples for CVR analysis
        if (parsedFile.metadata.fileName.includes('REAL 24-25')) {
          const recentRows = parsedFile.data.rows.slice(-7); // Last 7 days
          formatted += `\nDONNÉES RÉCENTES (7 derniers jours):\n`;
          recentRows.forEach((row: any) => {
            const date = row.Date || row.date || 'N/A';
            const cvr = row.CVR || row.cvr || row['CVR Total'] || 'N/A';
            const webCvr = row['CVR Web'] || row.cvr_web || 'N/A';
            const appCvr = row['CVR App'] || row.cvr_app || 'N/A';
            formatted += `${date}: CVR=${cvr}%, Web=${webCvr}%, App=${appCvr}%\n`;
          });
        }
      }
      break;
      
    case 'json':
      const keys = Object.keys(parsedFile.data).slice(0, 10);
      formatted += `Propriétés: ${keys.join(', ')}\n`;
      break;
      
    case 'text':
      const preview = parsedFile.data.text?.substring(0, 500) || '';
      formatted += `Aperçu: ${preview}${preview.length >= 500 ? '...' : ''}\n`;
      break;
  }
  
  formatted += '\n';
  return formatted;
}

function createContextFromVault(vaultData: KnowledgeVaultData, projectId?: string | null): string {
  // Legacy function - now using createSmartContext instead
  return "Context généré par createSmartContext";
}