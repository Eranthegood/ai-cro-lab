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
    console.log('Knowledge Vault Chat function called');

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message, workspaceId, projectId, userId } = await req.json();
    console.log('Request data:', { message, workspaceId, projectId, userId });

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
    const knowledgeVaultData = await gatherKnowledgeVaultData(supabase, workspaceId);
    console.log('Knowledge Vault data gathered:', knowledgeVaultData);

    // Parse files based on user query for contextual relevance
    const parsedFiles = await parseRelevantFiles(supabase, knowledgeVaultData.files, message, workspaceId);
    knowledgeVaultData.parsedFiles = parsedFiles;

    // Create smart context based on query and available data
    const context = await createSmartContext(knowledgeVaultData, message, projectId);
    console.log('Smart context created, tokens:', context.length);

    // Call Claude with the enriched context
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `Tu es Claude, un assistant IA intégré à une Knowledge Vault intelligente. Tu as accès à toutes les données de configuration business, visuelles, comportementales, prédictives et aux documents de l'entreprise.

${projectId ? 
  `Tu travailles actuellement dans le contexte du projet ID: ${projectId}. Concentre ton analyse sur les données liées à ce projet quand c'est pertinent.` :
  `Tu es en mode analyse globale du workspace. Analyse toutes les données disponibles sans restriction de projet.`
}

CONTEXTE DE LA KNOWLEDGE VAULT:
${context}

QUESTION DE L'UTILISATEUR: ${message}

Instructions:
- Utilise TOUTES les informations de la Knowledge Vault pour enrichir ta réponse
- Fais des liens entre les différentes sections (business, visual, behavioral, predictive, repository)
- Donne des insights actionnables basés sur les données disponibles
- Si tu manques d'informations spécifiques, suggère quelles données ajouter à la vault
- Sois précis et concret en utilisant les données réelles de la vault
- Réponds en français de manière professionnelle et perspicace`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Claude response received');

    // Log the interaction for audit
    await supabase.rpc('log_knowledge_vault_action', {
      p_workspace_id: workspaceId,
      p_action: 'ai_interaction',
      p_resource_type: 'chat',
      p_resource_id: projectId || null,
      p_metadata: {
        message_length: message.length,
        response_length: data.content[0].text.length,
        model: 'claude-sonnet-4-20250514',
        project_id: projectId || null,
        mode: projectId ? 'project' : 'global'
      }
    });

    return new Response(JSON.stringify({
      response: data.content[0].text,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in knowledge-vault-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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

// Helpers for CSV parsing and CVR summary
function csvSplit(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
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
  return result;
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
  try {
    const { data, error } = await supabase.storage.from('knowledge-vault').download(storagePath);
    if (error || !data) {
      console.log('Failed to download CSV:', error);
      return { summaryText: '' };
    }

    const text = await data.text();
    const lines = text.split(/\r?\n/).filter((l: string) => l.trim().length > 0);

    let headerIdx = lines.findIndex((l: string) => l.toLowerCase().includes('daynum') && l.toLowerCase().includes('dayweek'));
    if (headerIdx === -1) {
      headerIdx = lines.findIndex((l: string) => l.toLowerCase().includes('date') && l.toLowerCase().includes('cvr'));
    }
    if (headerIdx === -1) return { summaryText: '' };

    const header = csvSplit(lines[headerIdx]).map((s) => s.trim());
    const idxDate = header.findIndex((h) => h.toLowerCase() === 'date');
    const idxCVR = header.findIndex((h) => h.toLowerCase() === 'cvr');
    const idxWebCVR = header.findIndex((h) => h.toLowerCase().includes('web') && h.toLowerCase().includes('cvr'));
    const idxAppCVR = header.findIndex((h) => h.toLowerCase().includes('app') && h.toLowerCase().includes('cvr'));

    const entries: { date: Date; dateStr: string; cvr: number | null; web: number | null; app: number | null }[] = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('daynum')) break; // stop at next header block if any
      const cells = csvSplit(line);
      if (idxDate < 0 || idxDate >= cells.length) continue;
      const dateStr = cells[idxDate];
      const d = parseDDMMYYYY(dateStr || '');
      if (!d) continue;
      const cvr = idxCVR >= 0 && idxCVR < cells.length ? normalizePercent(cells[idxCVR]) : null;
      const web = idxWebCVR >= 0 && idxWebCVR < cells.length ? normalizePercent(cells[idxWebCVR]) : null;
      const app = idxAppCVR >= 0 && idxAppCVR < cells.length ? normalizePercent(cells[idxAppCVR]) : null;
      entries.push({ date: d, dateStr: formatDDMMYYYY(d), cvr, web, app });
    }

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

    return { summaryText: summary, yesterdayCVR: yesterdayOrLatest.cvr ?? undefined, yesterdayDate: yesterdayOrLatest.dateStr };
  } catch (e) {
    console.log('Error computing CVR summary:', e);
    return { summaryText: '' };
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

// Enhanced CSV parsing with intelligent column detection
async function parseCSVContent(content: string, fileName: string): Promise<any> {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { rows: [], columns: [], summary: 'CSV vide' };

  // Find header line
  let headerIdx = 0;
  if (fileName.includes('REAL 24-25')) {
    headerIdx = lines.findIndex(l => l.toLowerCase().includes('date') && l.toLowerCase().includes('cvr'));
  }
  
  const header = csvSplit(lines[headerIdx]).map(h => h.trim());
  const dataRows = [];
  
  // Parse data rows
  for (let i = headerIdx + 1; i < Math.min(lines.length, headerIdx + 500); i++) { // Limit to 500 rows for token management
    const cells = csvSplit(lines[i]);
    if (cells.length >= header.length) {
      const row: any = {};
      header.forEach((col, idx) => {
        row[col] = cells[idx]?.trim() || '';
      });
      dataRows.push(row);
    }
  }

  // Detect important columns for CVR analysis
  const dateColumns = header.filter(h => h.toLowerCase().includes('date'));
  const cvrColumns = header.filter(h => h.toLowerCase().includes('cvr'));
  const trafficColumns = header.filter(h => h.toLowerCase().includes('traffic') || h.toLowerCase().includes('visit'));
  const revenueColumns = header.filter(h => h.toLowerCase().includes('revenue') || h.toLowerCase().includes('ca'));

  return {
    rows: dataRows,
    columns: header,
    totalRows: lines.length - headerIdx - 1,
    keyColumns: {
      dates: dateColumns,
      cvr: cvrColumns,
      traffic: trafficColumns,
      revenue: revenueColumns
    },
    summary: `CSV avec ${dataRows.length} lignes analysées (${cvrColumns.length} colonnes CVR, ${dateColumns.length} colonnes dates)`
  };
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

// Check cache for parsed file content
async function getCachedFileContent(supabase: any, workspaceId: string, file: any): Promise<ParsedFileContent | null> {
  try {
    const fileHash = await generateFileHash(supabase, file);
    
    const { data: cachedData } = await supabase
      .from('knowledge_vault_cache')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('file_id', file.id)
      .eq('file_hash', fileHash)
      .maybeSingle();
    
    if (cachedData) {
      // Update last_accessed
      await supabase
        .from('knowledge_vault_cache')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', cachedData.id);
      
      console.log(`✅ Cache HIT for file: ${file.file_name}`);
      return cachedData.parsed_content as ParsedFileContent;
    }
    
    console.log(`❌ Cache MISS for file: ${file.file_name}`);
    return null;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
}

// Save parsed content to cache
async function saveParsedContentToCache(supabase: any, workspaceId: string, file: any, parsedContent: ParsedFileContent): Promise<void> {
  try {
    const fileHash = await generateFileHash(supabase, file);
    
    await supabase
      .from('knowledge_vault_cache')
      .upsert({
        workspace_id: workspaceId,
        file_id: file.id,
        file_hash: fileHash,
        parsed_content: parsedContent,
        context_size: JSON.stringify(parsedContent).length,
        token_count: parsedContent.tokens || 0,
        last_accessed: new Date().toISOString()
      });
    
    console.log(`💾 Cached file: ${file.file_name} (${parsedContent.tokens} tokens)`);
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

// Smart file parsing with intelligent caching
async function parseRelevantFiles(supabase: any, files: any[], userQuery: string, workspaceId: string): Promise<Record<string, ParsedFileContent>> {
  const queryLower = userQuery.toLowerCase();
  const relevantFiles: any[] = [];
  
  // Score files based on query relevance
  files.forEach(file => {
    let relevanceScore = 0;
    const fileName = file.file_name.toLowerCase();
    
    // CVR-related queries
    if (queryLower.includes('cvr') || queryLower.includes('conversion')) {
      if (fileName.includes('real') || fileName.includes('cvr')) relevanceScore += 10;
    }
    
    // Date-related queries
    if (queryLower.includes('hier') || queryLower.includes('yesterday') || queryLower.includes('today')) {
      if (fileName.includes('real') || fileName.includes('daily')) relevanceScore += 8;
    }
    
    // Section-specific queries
    if (queryLower.includes('traffic') || queryLower.includes('audience')) {
      if (file.config_section === 'behavioral') relevanceScore += 6;
    }
    
    // Always include REAL 24-25 for analysis
    if (fileName.includes('real 24-25')) relevanceScore += 15;
    
    // File type preferences
    if (file.file_type.includes('csv')) relevanceScore += 3;
    if (file.file_type.includes('json')) relevanceScore += 2;
    
    if (relevanceScore > 5) {
      relevantFiles.push({ ...file, relevanceScore });
    }
  });
  
  // Sort by relevance and limit to top 5 files to manage tokens
  relevantFiles.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topFiles = relevantFiles.slice(0, 5);
  
  const parsedFiles: Record<string, ParsedFileContent> = {};
  let cacheHits = 0;
  let cacheMisses = 0;
  
  // Check cache first, then parse if needed
  await Promise.all(
    topFiles.map(async (file) => {
      // Try to get from cache first
      const cachedContent = await getCachedFileContent(supabase, workspaceId, file);
      
      if (cachedContent) {
        parsedFiles[file.id] = cachedContent;
        cacheHits++;
      } else {
        // Parse file and save to cache
        const parsed = await parseFileContent(supabase, file);
        parsedFiles[file.id] = parsed;
        await saveParsedContentToCache(supabase, workspaceId, file, parsed);
        cacheMisses++;
      }
    })
  );
  
  console.log(`📊 Cache stats: ${cacheHits} hits, ${cacheMisses} misses (${Math.round(cacheHits/(cacheHits+cacheMisses)*100)}% hit rate)`);
  
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
      f => f.metadata.fileName.toLowerCase().includes('real 24-25')
    );
    
    if (realFile && realFile.tokens < remainingTokens) {
      context += await formatFileDataForContext(realFile, 'detailed');
      remainingTokens -= realFile.tokens;
    }
  }
  
  // Add other relevant files within token budget
  for (const [fileId, parsedFile] of Object.entries(vaultData.parsedFiles)) {
    if (parsedFile.tokens < remainingTokens && !parsedFile.metadata.fileName.toLowerCase().includes('real 24-25')) {
      const formatLevel = parsedFile.tokens > 5000 ? 'summary' : 'detailed';
      context += await formatFileDataForContext(parsedFile, formatLevel);
      remainingTokens -= formatLevel === 'summary' ? 1000 : parsedFile.tokens;
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
  let formatted = `\n=== ${parsedFile.metadata.fileName.toUpperCase()} ===\n`;
  formatted += `Type: ${parsedFile.type} | ${parsedFile.summary}\n`;
  
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