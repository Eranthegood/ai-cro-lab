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

    const { message, workspaceId, userId } = await req.json();
    console.log('Request data:', { message, workspaceId, userId });

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

    // Create context from Knowledge Vault
    const context = createContextFromVault(knowledgeVaultData);
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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `Tu es Claude, un assistant IA intégré à une Knowledge Vault intelligente. Tu as accès à toutes les données de configuration business, visuelles, comportementales, prédictives et aux documents de l'entreprise.

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
      p_metadata: {
        message_length: message.length,
        response_length: data.content[0].text.length,
        model: 'claude-3-5-sonnet-20241022'
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

function createContextFromVault(vaultData: KnowledgeVaultData): string {
  let context = "";

  // Workspace info
  if (vaultData.workspaceInfo.workspace) {
    context += `INFORMATIONS WORKSPACE:\n`;
    context += `- Nom: ${vaultData.workspaceInfo.workspace.name}\n`;
    context += `- Plan: ${vaultData.workspaceInfo.workspace.plan}\n`;
    context += `- Paramètres: ${JSON.stringify(vaultData.workspaceInfo.workspace.settings)}\n\n`;
  }

  // Configuration sections
  const sections = ['business', 'visual', 'behavioral', 'predictive', 'repository'];
  
  sections.forEach(section => {
    const config = vaultData.configurations.find(c => c.config_section === section);
    if (config && config.config_data) {
      context += `CONFIGURATION ${section.toUpperCase()}:\n`;
      context += `- Score de completion: ${config.completion_score}/20\n`;
      
      const data = config.config_data;
      if (typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
          if (value && value !== '') {
            context += `- ${key}: ${JSON.stringify(value)}\n`;
          }
        });
      }
      context += '\n';
    }
  });

  // Files summary
  const filesBySection = vaultData.files.reduce((acc: any, file) => {
    if (!acc[file.config_section]) acc[file.config_section] = [];
    acc[file.config_section].push(file);
    return acc;
  }, {});

  Object.entries(filesBySection).forEach(([section, files]: [string, any[]]) => {
    context += `FICHIERS ${section.toUpperCase()}:\n`;
    files.forEach(file => {
      context += `- ${file.file_name} (${file.file_type}, ${Math.round(file.file_size / 1024)}KB)\n`;
    });
    context += '\n';
  });

  // A/B Tests
  if (vaultData.workspaceInfo.abTests && vaultData.workspaceInfo.abTests.length > 0) {
    context += `TESTS A/B:\n`;
    vaultData.workspaceInfo.abTests.forEach((test: any) => {
      context += `- ${test.name} (${test.status}): ${test.hypothesis}\n`;
      if (test.metrics) {
        context += `  Métriques: ${JSON.stringify(test.metrics)}\n`;
      }
    });
    context += '\n';
  }

  // ContentSquare data
  if (vaultData.workspaceInfo.contentSquareData && vaultData.workspaceInfo.contentSquareData.length > 0) {
    context += `DONNÉES CONTENTSQUARE:\n`;
    vaultData.workspaceInfo.contentSquareData.forEach((data: any) => {
      context += `- ${data.filename} (${data.file_type})\n`;
      if (data.analysis_results) {
        context += `  Analyses: ${JSON.stringify(data.analysis_results)}\n`;
      }
    });
    context += '\n';
  }

  // Knowledge base
  if (vaultData.workspaceInfo.knowledgeBase && vaultData.workspaceInfo.knowledgeBase.length > 0) {
    context += `BASE DE CONNAISSANCES:\n`;
    vaultData.workspaceInfo.knowledgeBase.forEach((item: any) => {
      context += `- ${item.name} (${item.type})\n`;
      if (item.content && typeof item.content === 'object') {
        const contentSummary = JSON.stringify(item.content).substring(0, 200);
        context += `  Contenu: ${contentSummary}...\n`;
      }
    });
    context += '\n';
  }

  return context || "Aucune donnée disponible dans la Knowledge Vault.";
}