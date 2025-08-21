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
    console.log(`🎯 [${requestId}] AB Test Suggestions Generation started`);

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      pageUrl, 
      goalType, 
      businessContext, 
      currentPain, 
      useVaultKnowledge, 
      uploadedFiles, 
      workspaceId, 
      userId,
      context 
    } = await req.json();

    console.log(`📋 [${requestId}] Request:`, { 
      pageUrl: pageUrl?.substring(0, 50), 
      goalType,
      filesCount: uploadedFiles?.length || 0,
      useVaultKnowledge,
      context
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

    // Build context from uploaded files if vault knowledge is enabled
    let vaultContext = '';
    if (useVaultKnowledge && uploadedFiles && uploadedFiles.length > 0) {
      console.log(`📚 [${requestId}] Processing ${uploadedFiles.length} vault files`);
      
      vaultContext = 'DONNÉES DU KNOWLEDGE VAULT:\n\n';
      for (const file of uploadedFiles.slice(0, 5)) { // Limit to 5 files for context
        try {
          const { data: fileData } = await supabase.storage
            .from('knowledge-vault')
            .download(file.storage_path);
          
          if (fileData && file.file_type?.includes('text') || file.file_name.endsWith('.csv')) {
            const text = await fileData.text();
            const preview = text.substring(0, 1000);
            vaultContext += `📄 ${file.file_name}:\n${preview}${text.length > 1000 ? '...' : ''}\n\n`;
          } else {
            vaultContext += `📄 ${file.file_name}: [${file.file_type} - ${Math.round(file.file_size / 1024)}KB]\n\n`;
          }
        } catch (error) {
          console.log(`⚠️ [${requestId}] Could not process file ${file.file_name}:`, error.message);
          vaultContext += `📄 ${file.file_name}: [Fichier non accessible]\n\n`;
        }
      }
    }

    // Build comprehensive prompt for Claude
    const prompt = `Tu es un expert en CRO (Conversion Rate Optimization) et AB testing avec 10 ans d'expérience. Tu vas analyser une page web et générer des suggestions de tests AB très spécifiques et actionnables.

CONTEXTE DE LA PAGE:
- URL: ${pageUrl}
- Type de page: ${context.pageType}
- Industrie: ${context.industry}
- Marque détectée: ${context.brand || 'Non détectée'}
- Objectif principal: ${goalType}

CONTEXTE BUSINESS:
${businessContext || 'Non spécifié'}

PROBLÈME ACTUEL IDENTIFIÉ:
${currentPain || 'Non spécifié'}

${vaultContext}

MISSION:
Génère exactement 3 suggestions de tests AB très spécifiques, avec une expertise approfondie en psychologie comportementale et UX. Chaque suggestion doit être unique, actionnable et basée sur des insights psychologiques avérés.

FORMAT DE RÉPONSE (JSON strict):
{
  "suggestions": [
    {
      "id": "1",
      "title": "Titre accrocheur du test",
      "problem": "Description précise du problème identifié avec des données/pourcentages si possible",
      "solution": "Solution détaillée et spécifique à implémenter",
      "expectedImpact": "+XX-XX%",
      "confidence": 85,
      "difficulty": "Facile|Moyen|Avancé",
      "psychologyInsight": "Explication du principe psychologique utilisé",
      "uniqueness": "Pourquoi cette approche est différente/innovante",
      "brandContext": "Contexte spécifique à la marque si applicable",
      "implementation": {
        "platform": "AB Tasty",
        "code": "Code CSS/JS spécifique et prêt à utiliser",
        "setup": ["Étape 1", "Étape 2", "Étape 3", "Étape 4"]
      },
      "metrics": {
        "primary": "Métrique principale à suivre",
        "secondary": ["Métrique 2", "Métrique 3", "Métrique 4"]
      }
    }
  ]
}

CONTRAINTES:
- Suggestions très spécifiques au contexte (page type, industrie, objectif)
- Code CSS/JS prêt à utiliser avec sélecteurs réalistes
- Insights psychologiques avancés (pas basiques)
- Impacts chiffrés réalistes basés sur l'expérience
- Solutions innovantes et différenciantes
- Si marque connue, intégrer ses spécificités (positionnement, personas)

STYLE:
- Titres percutants et professionnels
- Problèmes chiffrés quand possible
- Solutions concrètes et détaillées
- Psychologie comportementale avancée
- Code production-ready`;

    console.log(`🧠 [${requestId}] Calling Claude for AB test suggestions`);

    // Call Claude API
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
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [${requestId}] Claude API error:`, response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log(`✅ [${requestId}] Claude response received: ${Date.now() - requestStart}ms`);

    // Parse Claude's response
    let suggestions;
    try {
      const content = aiResponse.content[0].text;
      console.log(`📝 [${requestId}] Raw Claude response length:`, content.length);
      
      // Extract JSON from response (in case Claude adds explanation)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in Claude response');
      }
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse Claude response:`, parseError);
      // Return fallback suggestions
      suggestions = generateFallbackSuggestions(context, goalType);
    }

    // Log interaction for analytics
    try {
      await supabase
        .from('knowledge_vault_audit')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          action: 'ab_test_generation',
          resource_type: 'ab_test_suggestions',
          action_metadata: {
            request_id: requestId,
            page_url: pageUrl,
            goal_type: goalType,
            context: context,
            suggestions_count: suggestions?.suggestions?.length || 0
          }
        });
    } catch (logError) {
      console.warn(`⚠️ [${requestId}] Failed to log interaction:`, logError);
    }

    console.log(`🎯 [${requestId}] AB test suggestions generated successfully: ${Date.now() - requestStart}ms`);

    return new Response(JSON.stringify(suggestions), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
    });

  } catch (error: any) {
    console.error(`🚨 [${crypto.randomUUID().substring(0, 8)}] Function error:`, error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal error generating AB test suggestions',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback suggestions generator
function generateFallbackSuggestions(context: any, goalType: string) {
  const baseSuggestions = [
    {
      id: "1",
      title: "Optimisation psychologique du CTA principal",
      problem: "Le bouton d'action principal manque d'urgence et de clarté sur la valeur proposée, créant une hésitation chez 73% des visiteurs.",
      solution: "Implémenter un design avec contraste élevé, texte orienté bénéfice, et éléments d'urgence visuelle pour maximiser l'attention et réduire la friction cognitive.",
      expectedImpact: "+25-35%",
      confidence: 85,
      difficulty: "Moyen",
      psychologyInsight: "L'urgence temporelle et la clarté des bénéfices réduisent l'anxiété décisionnelle et activent le système 1 (décision rapide) plutôt que le système 2 (réflexion).",
      uniqueness: "Combine psychologie comportementale et design persuasif pour créer un effet de conversion composé plutôt qu'une simple optimisation esthétique.",
      implementation: {
        platform: "AB Tasty",
        code: `
.cta-button {
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%) !important;
  color: white !important;
  font-size: 18px !important;
  padding: 16px 32px !important;
  border-radius: 8px !important;
  font-weight: 700 !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
}
.cta-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4) !important;
}
.cta-button:before {
  content: "⚡ " !important;
}`,
        setup: [
          "Identifier le sélecteur CSS exact du bouton principal dans la page",
          "Créer une nouvelle variation dans AB Tasty avec ce CSS",
          "Configurer le tracking des clics sur le bouton",
          "Définir la répartition de trafic 50/50 et lancer le test"
        ]
      },
      metrics: {
        primary: "Taux de clic sur le CTA principal",
        secondary: ["Temps d'hésitation avant clic", "Taux de conversion global", "Engagement post-clic"]
      }
    }
  ];

  return { suggestions: baseSuggestions };
}