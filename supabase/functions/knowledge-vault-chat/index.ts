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

    // Gather Knowledge Vault data
    const knowledgeVaultData = await gatherKnowledgeVaultData(supabase, workspaceId);
    console.log('Knowledge Vault data gathered:', knowledgeVaultData);

    // Attempt to compute recent CVR summary from repository CSV
    let summaryText = '' as string;
    try {
      const realFile = knowledgeVaultData.files.find((f: any) => f.config_section === 'repository' && f.file_name.includes('REAL 24-25'));
      if (realFile?.storage_path) {
        const summary = await computeCVRSummary(supabase, realFile.storage_path);
        summaryText = summary.summaryText;
        if (summary.yesterdayCVR && summary.yesterdayDate) {
          summaryText += `\nCVR d'hier (${summary.yesterdayDate}): ${summary.yesterdayCVR.toFixed(2)}%`;
        }
      }
    } catch (e) {
      console.log('CVR summary compute failed', e);
    }

    const context = createContextFromVault(knowledgeVaultData, projectId) + (summaryText ? `\n${summaryText}\n` : '');
    console.log('Context created from vault');

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
    }
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

function createContextFromVault(vaultData: KnowledgeVaultData, projectId?: string | null): string {
  let context = "";

  // Workspace info
  if (vaultData.workspaceInfo.workspace) {
    context += `INFORMATIONS WORKSPACE:\n`;
    context += `- Nom: ${vaultData.workspaceInfo.workspace.name}\n`;
    context += `- Plan: ${vaultData.workspaceInfo.workspace.plan}\n`;
    
    if (projectId) {
      context += `- Mode: Projet spécifique (ID: ${projectId})\n`;
    } else {
      context += `- Mode: Analyse globale du workspace\n`;
    }
    context += '\n';
  }

  // Configuration sections - business context
  const businessConfig = vaultData.configurations.find(c => c.config_section === 'business');
  if (businessConfig && businessConfig.config_data) {
    context += `CONTEXTE BUSINESS:\n`;
    context += `- Score: ${businessConfig.completion_score}/20\n`;
    const data = businessConfig.config_data;
    if (data.industry) context += `- Secteur: ${data.industry}\n`;
    if (data.businessModel) context += `- Modèle: ${data.businessModel}\n`;
    if (data.revenueRange) context += `- CA: ${data.revenueRange}\n`;
    if (data.challenges) context += `- Défis: ${data.challenges}\n`;
    if (data.companyDescription) context += `- Description: ${data.companyDescription}\n`;
    context += '\n';
  }

  // Files summary avec focus sur les données clés
  const filesBySection = vaultData.files.reduce((acc: any, file) => {
    if (!acc[file.config_section]) acc[file.config_section] = [];
    acc[file.config_section].push(file);
    return acc;
  }, {});

  // Section Repository - Focus sur les données CSV importantes
  if (filesBySection.repository) {
    context += `DONNÉES DISPONIBLES (Repository):\n`;
    filesBySection.repository.forEach((file: any) => {
      context += `- ${file.file_name} (${Math.round(file.file_size / 1024)}KB)\n`;
      
      // Détection spéciale pour le fichier REAL 24-25
      if (file.file_name.includes('REAL 24-25')) {
        context += `  → Données e-commerce quotidiennes 2024-2025\n`;
        context += `  → Contient: CVR, Traffic, Commandes, AOV, Taux de retour\n`;
        context += `  → Métriques: Conversion web/app, Add to cart, Funnel complet\n`;
        context += `  → Format: Données journalières avec détail par canal\n`;
      }
      if (file.file_name.includes('Cockpit')) {
        context += `  → Dashboard de pilotage 2025\n`;
        context += `  → Données de suivi et KPIs\n`;
      }
    });
    context += '\n';
  }

  // Autres sections de fichiers (résumé)
  ['behavioral', 'visual', 'predictive'].forEach(section => {
    if (filesBySection[section]) {
      context += `FICHIERS ${section.toUpperCase()} (${filesBySection[section].length} fichiers):\n`;
      filesBySection[section].forEach((file: any) => {
        context += `- ${file.file_name} (${file.file_type})\n`;
      });
      context += '\n';
    }
  });

  // Instructions spéciales pour l'analyse des données
  const hasRealData = vaultData.files.some(file => file.file_name.includes('REAL 24-25'));
  if (hasRealData) {
    context += `CAPACITÉS D'ANALYSE:\n`;
    context += `- Je peux analyser les données CVR quotidiennes du fichier REAL 24-25\n`;
    context += `- Je peux calculer des moyennes, tendances, et comparaisons\n`;
    context += `- Je peux identifier les métriques d'hier, de la semaine, du mois\n`;
    context += `- Je peux analyser les canaux (web, app, paid, organic)\n`;
    context += `- Questions supportées: CVR d'hier, performance par canal, tendances\n`;
    context += '\n';
  }

  // Configuration scores pour référence
  const completionScores = vaultData.configurations.map(c => 
    `${c.config_section}: ${c.completion_score}/20`
  ).join(', ');
  
  if (completionScores) {
    context += `SCORES DE COMPLÉTION: ${completionScores}\n\n`;
  }

  return context || "Aucune donnée disponible dans la Knowledge Vault.";
}