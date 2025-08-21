import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestStart = Date.now();
    const requestId = crypto.randomUUID().substring(0, 8);
    console.log(`🚀 [${requestId}] Simple Vault Chat started`);

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

    // Get ALL files from workspace (Claude-style simple)
    const { data: files } = await supabase
      .from('knowledge_vault_files')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    console.log(`📊 [${requestId}] Files found: ${files?.length || 0}`);

    // Simple context building - just concatenate files
    let context = '';
    if (files && files.length > 0) {
      context += 'FICHIERS DISPONIBLES:\n\n';
      
      for (const file of files.slice(0, 10)) { // Limit to 10 files max
        context += `📄 ${file.file_name} (${file.file_type})\n`;
        
        // Try to get file content from storage
        try {
          const { data: fileData } = await supabase.storage
            .from('knowledge-vault')
            .download(file.storage_path);
          
          if (fileData) {
            const text = await fileData.text();
            // Simple parsing - just include first 1000 characters
            const preview = text.substring(0, 1000);
            context += `Contenu: ${preview}${text.length > 1000 ? '...' : ''}\n\n`;
          }
        } catch (fileError) {
          console.warn(`Failed to read file ${file.file_name}:`, fileError);
          context += `Contenu: [Fichier non-textuel ou inaccessible]\n\n`;
        }
      }
    } else {
      context = 'Aucun fichier uploadé dans ce workspace.';
    }

    console.log(`🧠 [${requestId}] Context built: ${context.length} chars`);

    // Simple rate limiting (50/day for free users)
    const today = new Date().toISOString().split('T')[0];
    const { data: interactions } = await supabase
      .from('knowledge_vault_audit')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('action', 'ai_interaction')
      .gte('created_at', today + 'T00:00:00Z')
      .lt('created_at', today + 'T23:59:59Z');

    const count = interactions?.length || 0;
    if (count >= 50) {
      return new Response(JSON.stringify({ 
        error: `Limite quotidienne atteinte (${count}/50). Revenez demain.`,
        rate_limit: true
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Claude with streaming
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2000,
        stream: true,
        messages: [{
          role: 'user',
          content: `Tu es Claude, assistant IA du Knowledge Vault - Mode Simple et Intelligent.

${projectId ? 
  `🎯 Contexte: Projet "${projectId}" - Analyse ciblée` :
  `🌐 Contexte: Vue d'ensemble workspace`
}

📚 DONNÉES DU VAULT:
${context}

❓ QUESTION DE L'UTILISATEUR: ${message}

🧠 INSTRUCTIONS:
- Si les données du vault contiennent des informations pertinentes, utilise-les EN PRIORITÉ
- Si les données sont insuffisantes ou manquantes, complète avec tes connaissances générales
- Indique clairement quelles informations viennent du vault (📄) vs tes connaissances (🧠)
- Sois concis, actionnable et pratique en français
- Suggère des actions concrètes quand c'est pertinent
- Si aucune donnée pertinente dans le vault, réponds quand même avec tes connaissances générales

Exemple de format de réponse:
📄 **D'après vos fichiers:** [informations du vault]
🧠 **Complément d'information:** [tes connaissances si utiles]
✅ **Recommandations:** [actions suggérées]`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    console.log(`🚀 [${requestId}] Claude streaming started: ${Date.now() - requestStart}ms`);

    // Log interaction for rate limiting
    try {
      await supabase
        .from('knowledge_vault_audit')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          action: 'ai_interaction',
          resource_type: 'simple_chat',
          resource_id: projectId,
          action_metadata: {
            request_id: requestId,
            message_length: message.length,
            files_count: files?.length || 0
          }
        });
    } catch (logError) {
      console.warn('Failed to log interaction:', logError);
    }

    // Collect the full response instead of streaming for simpler handling
    let fullContent = '';
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                fullContent += data.delta.text;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    }

    console.log(`✅ [${requestId}] Response completed: ${fullContent.length} chars, ${Date.now() - requestStart}ms`);

    return new Response(JSON.stringify({ 
      content: fullContent,
      request_id: requestId,
      files_analyzed: files?.length || 0
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
    });

  } catch (error: any) {
    console.error(`🚨 [${crypto.randomUUID().substring(0, 8)}] Function error:`, error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur interne',
      details: 'Simple vault chat error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});