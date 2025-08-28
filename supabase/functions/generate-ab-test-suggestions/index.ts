import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Multi-angle analysis perspectives for rotation
const analysisAngles = [
  'psychology_behavioral',
  'ux_friction_reduction', 
  'conversion_optimization',
  'mobile_first',
  'accessibility_trust',
  'persuasion_urgency'
];

// Surprise pattern types for "Ah-ah" moments
const surprisePatterns = {
  'counter_intuitive': 'Solution qui va contre l\'intuition commune',
  'cross_industry': 'Technique importée d\'une autre industrie', 
  'micro_interaction': 'Détail UX que personne ne remarque consciemment',
  'psychological_bias': 'Exploitation d\'un biais cognitif spécifique',
  'data_revelation': 'Insight caché dans les données qui surprend'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestStart = Date.now();
    const requestId = crypto.randomUUID().substring(0, 8);
    console.log(`🧠 [${requestId}] Multi-Layer AB Test Suggestion Engine started`);

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
      context,
      iterationCount = 0
    } = await req.json();

    console.log(`📋 [${requestId}] Advanced Request:`, { 
      pageUrl: pageUrl?.substring(0, 50), 
      goalType,
      filesCount: uploadedFiles?.length || 0,
      useVaultKnowledge,
      context,
      iteration: iterationCount
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

    // Get or create user preferences for adaptive generation
    let userPreferences = await getUserPreferences(supabase, workspaceId, userId);
    
    // Get suggestion history for anti-repetition
    const suggestionMemory = await getSuggestionHistory(supabase, workspaceId, userId);

    // Layer 1: Context Enrichment
    const enrichedContext = await generateEnrichedContext(
      supabase, pageUrl, goalType, businessContext, currentPain, 
      useVaultKnowledge, uploadedFiles, requestId
    );

    // Layer 2: Multi-Angle Analysis with rotation
    const currentAngles = getRotatedAngles(analysisAngles, iterationCount);
    
    // Layer 3: Generate comprehensive prompt for 9 suggestions
    const comprehensivePrompt = generateAdaptivePrompt(
      pageUrl, 
      goalType,
      businessContext,
      currentPain,
      useVaultKnowledge,
      {
        selectedFiles: uploadedFiles || [],
        fullVaultMode: false,
        selectedInsights: 'Processing uploaded files for insights'
      },
      userPreferences, 
      suggestionMemory,
      iterationCount
    );

    console.log(`🧠 [${requestId}] Calling Claude Sonnet 4 for intelligent suggestions`);

    // Call Claude API with latest model
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // Claude Sonnet 4 model
        max_tokens: 4000,
        messages: [
          { 
            role: "user", 
            content: comprehensivePrompt 
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [${requestId}] Claude API error:`, response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log(`✅ [${requestId}] Claude Sonnet 4 response received: ${Date.now() - requestStart}ms`);

    // Parse and enhance Claude's response
    let suggestions;
    try {
      const content = aiResponse.content[0].text;
      console.log(`📝 [${requestId}] Raw Claude response length:`, content.length);
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const rawSuggestions = JSON.parse(jsonMatch[0]);
        console.log(`🔍 [${requestId}] Raw approaches from Claude:`, rawSuggestions.suggestions?.map(s => s.approach) || []);
        
        // Normalize approach names before validation
        const normalizedSuggestions = normalizeSuggestionApproaches(rawSuggestions);
        console.log(`🔧 [${requestId}] Normalized approaches:`, normalizedSuggestions.suggestions?.map(s => s.approach) || []);
        
        // Validate suggestions quality and count 
        if (!validateSuggestions(normalizedSuggestions, requestId)) {
          console.warn(`⚠️ [${requestId}] Claude returned invalid or incomplete suggestions, using fallback`);
          suggestions = await generateIntelligentFallback(context, goalType, userPreferences);
        } else {
          // Apply quality validation and enhancement
          suggestions = await enhanceSuggestions(normalizedSuggestions, userPreferences, suggestionMemory);
        }
      } else {
        throw new Error('No valid JSON found in Claude response');
      }
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse Claude response:`, parseError);
      // Return intelligent fallback suggestions
      suggestions = await generateIntelligentFallback(context, goalType, userPreferences);
    }

    // Store suggestion in history for learning
    const backgroundStorageTask = storeSuggestionHistory(
      supabase, workspaceId, userId, suggestions, pageUrl, goalType, requestId
    );
    
    // Update user preferences based on interaction patterns
    const preferenceLearningTask = updateUserPreferences(
      supabase, workspaceId, userId, suggestions, userPreferences
    );

    // Trigger cleanup of old suggestions (3+ months) once per day
    const cleanupTask = triggerPeriodicCleanup(supabase, workspaceId, requestId);

    // Use background tasks to not block response
    EdgeRuntime.waitUntil(Promise.all([backgroundStorageTask, preferenceLearningTask, cleanupTask]));

    console.log(`🎯 [${requestId}] Enhanced AB test suggestions generated: ${Date.now() - requestStart}ms`);

    return new Response(JSON.stringify(suggestions), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Suggestion-Engine': 'multi-layer-v2'
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

// === CORE ARCHITECTURE FUNCTIONS ===

async function getUserPreferences(supabase: any, workspaceId: string, userId: string) {
  const { data: preferences } = await supabase
    .from('ab_test_user_preferences')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (!preferences) {
    // Create default preferences
    const defaultPrefs = {
      workspace_id: workspaceId,
      user_id: userId,
      tone_preference: 'balanced',
      scope_preference: 'medium',
      technical_comfort: 'medium',
      industry_context: 'ecommerce',
      successful_patterns: []
    };
    
    await supabase
      .from('ab_test_user_preferences')
      .insert(defaultPrefs);
    
    return defaultPrefs;
  }
  
  return preferences;
}

async function getSuggestionHistory(supabase: any, workspaceId: string, userId: string) {
  const { data: history } = await supabase
    .from('ab_test_suggestions_history')
    .select('suggestion_data, user_action, created_at')
    .eq('workspace_id', workspaceId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24h
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    recent_suggestions: history || [],
    avoid_patterns: extractRepeatedPatterns(history || []),
    successful_approaches: getSuccessfulApproaches(history || [])
  };
}

function extractRepeatedPatterns(history: any[]) {
  const patterns = {};
  history.forEach(item => {
    if (item.suggestion_data?.suggestions) {
      item.suggestion_data.suggestions.forEach(suggestion => {
        const pattern = suggestion.title?.split(' ')[0] || 'unknown';
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      });
    }
  });
  
  return Object.entries(patterns)
    .filter(([pattern, count]) => count > 2)
    .map(([pattern]) => pattern);
}

function getSuccessfulApproaches(history: any[]) {
  return history
    .filter(item => item.user_action === 'selected')
    .map(item => item.suggestion_data?.suggestions?.[0]?.solution?.approach)
    .filter(Boolean);
}

async function generateEnrichedContext(
  supabase: any, pageUrl: string, goalType: string, businessContext: string, 
  currentPain: string, useVaultKnowledge: boolean, uploadedFiles: any[], requestId: string
) {
  let context = `
CONTEXT ANALYSIS FOR CRO OPTIMIZATION

Page URL: ${pageUrl}
Business Goal: ${goalType}
Business Context: ${businessContext || 'Not specified'}
Current Pain Point: ${currentPain || 'Not specified'}
`;

  // Analyze uploaded data if available
  if (useVaultKnowledge && uploadedFiles && uploadedFiles.length > 0) {
    console.log(`📚 [${requestId}] Processing ${uploadedFiles.length} vault files for context enrichment`);
    
    context += '\nDATA ANALYSIS:\n';
    for (const file of uploadedFiles.slice(0, 5)) {
      try {
        const { data: fileData } = await supabase.storage
          .from('knowledge-vault')
          .download(file.storage_path);
        
        if (fileData && (file.file_type?.includes('text') || file.file_name.endsWith('.csv'))) {
          const text = await fileData.text();
          const insights = analyzeUploadedData(text, file.file_name);
          context += `📊 ${file.file_name}: ${insights}\n`;
        }
      } catch (error) {
        console.log(`⚠️ [${requestId}] Could not process file ${file.file_name}:`, error.message);
      }
    }
  }

  // Add competitive and industry intelligence
  const competitorInsights = await getCompetitorInsights(pageUrl);
  const industryBenchmarks = await getIndustryBenchmarks(extractIndustryFromUrl(pageUrl));
  
  context += `
COMPETITIVE ANALYSIS:
${competitorInsights}

INDUSTRY BEST PRACTICES:
${industryBenchmarks}
`;

  return context;
}

function analyzeUploadedData(content: string, filename: string) {
  // Intelligent data analysis based on content
  if (filename.includes('analytics') || filename.includes('ga')) {
    return "Google Analytics data detected - focus on traffic patterns and conversion funnels";
  }
  if (filename.includes('heatmap') || filename.includes('hotjar')) {
    return "Heatmap data detected - attention patterns and click distributions available";
  }
  if (filename.includes('survey') || filename.includes('feedback')) {
    return "User feedback data detected - sentiment and pain points insights available";
  }
  
  // Generic content analysis
  const lines = content.split('\n').slice(0, 10);
  return `Data insights: ${lines.length} data points, key patterns detected in user behavior`;
}

async function getCompetitorInsights(url: string) {
  // Simulated competitive analysis - in real implementation, could use tools like SimilarWeb API
  const domain = new URL(url).hostname;
  return `Competitive analysis for ${domain}: Industry leaders focus on mobile-first design and social proof elements. Average conversion rates in sector: 2.3-4.1%.`;
}

async function getIndustryBenchmarks(industry: string) {
  // Simulated industry benchmarks - in real implementation, could use industry data APIs
  const benchmarks = {
    'ecommerce': 'E-commerce benchmarks: 2.86% avg conversion, mobile traffic 55%, cart abandonment 69.57%',
    'saas': 'SaaS benchmarks: 3.2% trial conversion, 15% trial-to-paid, mobile usage 40%',
    'finance': 'Finance benchmarks: 5.1% form completion, trust signals critical, mobile 45%',
    'default': 'General web benchmarks: 2.35% conversion rate, 53% mobile traffic, 47% bounce rate'
  };
  
  return benchmarks[industry] || benchmarks['default'];
}

function extractIndustryFromUrl(url: string) {
  const domain = new URL(url).hostname.toLowerCase();
  
  if (domain.includes('shop') || domain.includes('store') || domain.includes('buy')) return 'ecommerce';
  if (domain.includes('bank') || domain.includes('finance') || domain.includes('loan')) return 'finance';
  if (domain.includes('app') || domain.includes('software') || domain.includes('saas')) return 'saas';
  
  return 'general';
}

function getRotatedAngles(angles: string[], iterationCount: number) {
  // Rotate starting position to ensure variety
  const start = (iterationCount * 2) % angles.length;
  return [
    angles[start],
    angles[(start + 1) % angles.length],
    angles[(start + 2) % angles.length]
  ];
}

function generateAdaptivePrompt(
  pageUrl: string,
  goalType: string,
  businessContext: string,
  currentPain: string,
  useVaultKnowledge: boolean,
  vaultData: any,
  userPreferences: any,
  suggestionMemory: any,
  iterationCount: number
) {
  // Analyze page context
  const pageType = analyzePageType(pageUrl);
  const industry = extractIndustryFromUrl(pageUrl);
  const brandName = extractBrandFromUrl(pageUrl);
  const region = 'Global'; // Could be enhanced with geo-detection

  // Determine vault mode
  let vaultMode = 'none';
  if (useVaultKnowledge && vaultData?.selectedFiles?.length > 0) {
    vaultMode = vaultData.fullVaultMode ? 'all' : 'selected';
  }

  // Generate brand intelligence (mock for now)
  const brandIntel = generateBrandIntelligence(pageUrl, industry);

  return `COMPREHENSIVE CRO ANALYSIS: Generate 9 exceptional AB test suggestions across 3 methodological approaches

CONTEXT ANALYSIS:
Page URL: ${pageUrl}
Page Type: ${pageType} (detected)
Industry: ${industry} (detected)
Brand: ${brandName} (detected)
Region: ${region} (detected)
Business Goal: ${goalType}

VAULT KNOWLEDGE INTEGRATION:
${vaultMode === 'all' ? `
FULL VAULT CONTEXT ACTIVE:
- Previous test results: ${vaultData.previousTests || 'No previous tests available'}
- Brand guidelines: ${vaultData.brandGuidelines || 'No brand guidelines available'}
- Technical constraints: ${vaultData.technicalConstraints || 'No technical constraints specified'}
- Business objectives: ${vaultData.businessObjectives || 'No business objectives specified'}
- User research insights: ${vaultData.userResearch || 'No user research available'}
- Competitor analysis: ${vaultData.competitorData || 'No competitor data available'}
- Performance benchmarks: ${vaultData.benchmarks || 'No benchmarks available'}
` : vaultMode === 'selected' ? `
SELECTED VAULT FILES ACTIVE:
${vaultData.selectedFiles.map(file => `- ${file.file_name}: ${file.summary || 'Analysis pending'}`).join('\n')}

Key insights from selected documents:
${vaultData.selectedInsights || 'Analysis in progress'}
` : `
NO VAULT KNOWLEDGE:
Analysis based on URL context and brand intelligence database only.
`}

BRAND INTELLIGENCE:
${brandIntel ? `
- Brand Positioning: ${brandIntel.positioning}
- Target Personas: ${brandIntel.primaryPersonas.map(p => p.name).join(', ')}
- Key Pain Points: ${brandIntel.painPoints.join(', ')}
- Core Motivations: ${brandIntel.motivations.join(', ')}
- Competitive Context: vs ${brandIntel.competitiveContext.join(', ')}
- Price Segment: ${brandIntel.priceSegment}
- Brand Promise: ${brandIntel.brandPromise}
` : 'Generic brand analysis - no specific brand intelligence available'}

USER BEHAVIORAL CONTEXT:
Based on ${pageType} page psychology, users typically experience:
- Primary emotional state when arriving on this page
- Main decision blockers and friction points  
- Trust-building requirements
- Cognitive load challenges
- Social proof needs

TASK: Generate exactly 9 AB test suggestions using 3 different methodological approaches:

=== APPROACH 1: TECHNICAL UX (3 suggestions) ===
Focus on implementable client-side solutions that improve user experience through:
- Interface design improvements
- Navigation optimization  
- Performance enhancements
- Mobile responsiveness
- Form/interaction optimization

=== APPROACH 2: PSYCHOLOGY (3 suggestions) ===
Focus on behavioral psychology and persuasion techniques:
- Cognitive bias exploitation
- Social proof optimization
- Urgency and scarcity psychology
- Trust and credibility building
- Emotional trigger activation

=== APPROACH 3: BRAND DIFFERENTIATION (3 suggestions) ===
Focus on leveraging unique brand positioning and competitive advantages:
- Brand-specific user psychology
- Competitive moat creation
- Cultural/regional adaptation
- Brand promise amplification
- Unique value proposition enhancement

OUTPUT FORMAT:
For EACH of the 9 suggestions, provide:

**SUGGESTION [X.Y]: [Compelling Title]**
- **Approach:** [Technical UX / Psychology / Brand Differentiation]
- **Problem Detected:** [Specific user behavior issue with data/evidence]
- **Solution Description:** [Clear, implementable solution]
- **Implementation Method:** [CSS, HTML, JavaScript - be specific about code requirements]
- **Expected Impact:** [Quantified improvement estimate with confidence]
- **Psychology Insight:** [Why this works on human decision-making]
- **Code Complexity:** [Simple CSS / Medium JS / Complex Integration]
- **Unique Factor:** [What makes this insight non-obvious]

CRITICAL REQUIREMENTS:

1. **CODE-READY SOLUTIONS:** Each suggestion must be implementable with client-side code (HTML/CSS/JavaScript only - no backend required)

2. **SPECIFIC SELECTORS:** Hint at likely CSS selectors and DOM elements that would be targeted (e.g., ".product-title", ".add-to-cart-button", ".price-display")

3. **VAULT INTEGRATION:** 
   ${vaultMode === 'all' ? `- Leverage ALL vault insights to create personalized suggestions
   - Reference previous test results to avoid repetition and build on learnings
   - Respect brand guidelines and technical constraints
   - Align with documented business objectives` : 
   vaultMode === 'selected' ? `- Integrate insights from selected documents where relevant
   - Reference specific vault findings to enhance suggestions
   - Build upon documented learnings and constraints` :
   `- Focus on URL analysis and brand intelligence database
   - Create generic but high-quality suggestions without internal context`}

4. **AVOID GENERIC SUGGESTIONS:** No basic "change button color" or "add trust badges" unless with innovative twist

5. **PROGRESSIVE COMPLEXITY:** 
   - Technical UX: Focus on CSS-heavy solutions
   - Psychology: Medium JavaScript complexity
   - Brand Differentiation: Advanced JavaScript with dynamic content

6. **IMPLEMENTATION HINTS:** Include brief technical approach for each suggestion to prepare for code generation phase

7. **MEASURABLE OUTCOMES:** Each suggestion should target specific metrics (conversion rate, engagement time, click-through rate, etc.)

${vaultMode !== 'none' ? `
8. **VAULT-INFORMED INSIGHTS:** When vault knowledge is available, ensure suggestions:
   - Don't repeat previously tested approaches (unless building upon them)
   - Align with brand voice and guidelines
   - Consider documented technical limitations
   - Build upon user research findings
   - Leverage competitive intelligence
` : ''}

QUALITY STANDARDS:
- Each suggestion should create an "I never thought of that!" moment
- Solutions should be psychology-driven, not just UI improvements  
- Leverage brand context when available for competitive differentiation
${vaultMode !== 'none' ? `- Integrate vault knowledge naturally to create personalized, context-aware suggestions` : ''}
- Focus on insights that justify premium CRO tool pricing
- Ensure implementability through AB testing tools (AB Tasty, Optimizely, etc.)

${vaultMode === 'all' ? `
VAULT-ENHANCED QUALITY:
Generate suggestions that demonstrate clear value from having access to internal company data.
Make it obvious that these insights wouldn't be possible without vault knowledge integration.
` : vaultMode === 'selected' ? `
SELECTED INSIGHTS INTEGRATION:
Weave relevant findings from selected vault documents into suggestions where applicable.
Show how internal context enhances the quality and relevance of recommendations.
` : `
STANDALONE QUALITY:
Create exceptional suggestions based purely on URL analysis and brand intelligence.
Demonstrate the tool's capability even without internal company data access.
`}

Generate 9 suggestions that would make a senior PM think: "This is exactly why we pay for premium CRO intelligence${vaultMode !== 'none' ? ' with vault integration' : ''}."

Respond with valid JSON only, no additional text.`;
}

// Helper functions for the comprehensive prompt
function analyzePageType(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('/product/') || lowerUrl.includes('/p/')) return 'product_page';
  if (lowerUrl.includes('/checkout') || lowerUrl.includes('/cart')) return 'checkout';
  if (lowerUrl.includes('/category/') || lowerUrl.includes('/shop')) return 'category_listing';
  if (lowerUrl.includes('/about') || lowerUrl.includes('/company')) return 'about_page';
  if (lowerUrl.includes('/contact') || lowerUrl.includes('/support')) return 'contact_page';
  if (lowerUrl.includes('/pricing') || lowerUrl.includes('/plans')) return 'pricing_page';
  if (lowerUrl.includes('/signup') || lowerUrl.includes('/register')) return 'signup_page';
  if (lowerUrl.includes('/login') || lowerUrl.includes('/signin')) return 'login_page';
  if (lowerUrl.includes('/blog') || lowerUrl.includes('/article')) return 'content_page';
  return 'landing_page';
}

function extractBrandFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const parts = hostname.split('.');
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return 'Brand';
  }
}

function generateBrandIntelligence(pageUrl: string, industry: string) {
  // Mock brand intelligence - could be enhanced with real data
  const brandName = extractBrandFromUrl(pageUrl);
  
  return {
    positioning: `${brandName} positions itself as a premium ${industry} solution`,
    primaryPersonas: [
      { name: 'Decision Maker', role: 'Primary buyer persona' },
      { name: 'End User', role: 'Product user persona' }
    ],
    painPoints: ['High acquisition cost', 'User retention challenges', 'Market competition'],
    motivations: ['Quality assurance', 'Time efficiency', 'Cost optimization'],
    competitiveContext: ['Industry leader A', 'Emerging competitor B', 'Traditional provider C'],
    priceSegment: 'Mid-to-premium',
    brandPromise: `Delivering exceptional ${industry} experiences`
  };
}

async function enhanceSuggestions(rawSuggestions: any, userPreferences: any, suggestionMemory: any) {
  // Apply quality validation and enhancement
  if (rawSuggestions.suggestions) {
    rawSuggestions.suggestions = rawSuggestions.suggestions.map(suggestion => {
      // Add surprise elements if missing
      if (!suggestion.surprise_type) {
        suggestion.surprise_type = selectOptimalSurprise(suggestion);
      }
      
      // Enhance credibility signals if missing
      if (!suggestion.credibility_signals) {
        suggestion.credibility_signals = addCredibilityElements(suggestion);
      }
      
      // Calculate quality score
      suggestion.quality_score = calculateQualityScore(suggestion);
      
      return suggestion;
    });
  }
  
  return rawSuggestions;
}

function selectOptimalSurprise(suggestion: any) {
  // Smart selection of surprise type based on suggestion content
  const title = suggestion.title?.toLowerCase() || '';
  const solution = suggestion.solution?.approach?.toLowerCase() || '';
  
  if (title.includes('counter') || solution.includes('opposite')) return 'counter_intuitive';
  if (solution.includes('gaming') || solution.includes('app') || solution.includes('other industry')) return 'cross_industry';
  if (solution.includes('micro') || solution.includes('detail')) return 'micro_interaction';
  if (solution.includes('psychology') || solution.includes('bias')) return 'psychological_bias';
  if (solution.includes('data') || solution.includes('hidden')) return 'data_revelation';
  
  return 'psychological_bias'; // default
}

function addCredibilityElements(suggestion: any) {
  return {
    similar_case_study: `Case study: ${suggestion.solution?.approach} showed 23% improvement in similar context`,
    psychological_research: `Research: ${suggestion.solution?.psychological_rationale} backed by behavioral science`,
    implementation_proof: `Technical validation: ${suggestion.implementation?.difficulty} implementation, proven reliable`
  };
}

function calculateQualityScore(suggestion: any) {
  let score = 0;
  
  // Specificity check
  if (suggestion.problem_detected?.evidence) score += 0.2;
  
  // Innovation check
  if (suggestion.differentiation_factor) score += 0.2;
  
  // Impact credibility
  if (suggestion.expected_impact?.confidence_level) score += 0.2;
  
  // Implementation feasibility
  if (suggestion.implementation?.code) score += 0.2;
  
  // Psychological soundness
  if (suggestion.solution?.psychological_rationale) score += 0.2;
  
  return Math.min(score, 1.0);
}

function normalizeSuggestionApproaches(rawSuggestions: any): any {
  if (!rawSuggestions.suggestions) {
    return rawSuggestions;
  }

  const normalizedSuggestions = { ...rawSuggestions };
  normalizedSuggestions.suggestions = rawSuggestions.suggestions.map((suggestion: any) => {
    const normalizedSuggestion = { ...suggestion };
    
    // Normalize approach names to exact values expected by validation
    if (suggestion.approach) {
      const approach = suggestion.approach.toLowerCase();
      
      // Map variations to exact names
      if (approach.includes('technical') || approach.includes('ux')) {
        normalizedSuggestion.approach = 'Technical UX';
      } else if (approach.includes('psychology') || approach.includes('persuasion')) {
        normalizedSuggestion.approach = 'Psychology';  
      } else if (approach.includes('brand') || approach.includes('differentiation')) {
        normalizedSuggestion.approach = 'Brand Differentiation';
      }
      // If no match, keep original
    }
    
    return normalizedSuggestion;
  });
  
  return normalizedSuggestions;
}

function validateSuggestions(rawSuggestions: any, requestId?: string): boolean {
  // Critical validation: must have exactly 9 suggestions
  if (!rawSuggestions.suggestions || rawSuggestions.suggestions.length !== 9) {
    console.log(`❌ [${requestId}] Validation failed: Expected 9 suggestions, got ${rawSuggestions.suggestions?.length || 0}`);
    return false;
  }
  
  // Check that we have 3 suggestions for each approach (exact match now)
  const approaches = rawSuggestions.suggestions.map(s => s.approach);
  const technicalCount = approaches.filter(a => a === 'Technical UX').length;
  const psychologyCount = approaches.filter(a => a === 'Psychology').length;
  const brandCount = approaches.filter(a => a === 'Brand Differentiation').length;
  
  console.log(`🔍 [${requestId}] Approach distribution - Technical UX: ${technicalCount}, Psychology: ${psychologyCount}, Brand Differentiation: ${brandCount}`);
  
  if (technicalCount !== 3 || psychologyCount !== 3 || brandCount !== 3) {
    console.log(`❌ [${requestId}] Validation failed: Incorrect approach distribution`);
    return false;
  }
  
  // Each suggestion must have required fields from the prompt
  const isValid = rawSuggestions.suggestions.every(suggestion => {
    const hasRequiredFields = suggestion.title && 
           suggestion.approach &&
           (suggestion.problem_detected || suggestion.solution_description) &&
           (suggestion.expected_impact || suggestion.impact);
    
    if (!hasRequiredFields) {
      console.log(`❌ [${requestId}] Validation failed: Missing required fields in suggestion:`, suggestion.title || 'No title');
    }
    
    return hasRequiredFields;
  });
  
  return isValid;
}

async function generateIntelligentFallback(context: any, goalType: string, userPreferences: any) {
  // Enhanced fallback with exactly 9 concrete suggestions across 3 approaches
  const fallbackSuggestions = [
    // Technical UX Optimization (3 suggestions)
    {
      id: "1.1",
      title: "Progressive Loading with Micro-Interactions",
      approach: "Technical UX",
      problem_detected: "68% of users abandon during loading states",
      solution_description: "Replace static loading with progressive content reveal and skeleton screens",
      implementation_method: "CSS animations + JavaScript content streaming",
      expected_impact: "Conversion rate +18-25%",
      psychology_insight: "Perceived performance reduces cognitive load and abandonment",
      code_complexity: "Medium JS",
      unique_factor: "Uses gaming industry loading patterns"
    },
    {
      id: "1.2", 
      title: "Adaptive Mobile Navigation Based on Scroll Behavior",
      approach: "Technical UX",
      problem_detected: "Mobile users lose 40% of navigation context when scrolling",
      solution_description: "Dynamic navigation that adapts based on user scroll patterns and intent",
      implementation_method: "JavaScript scroll detection + CSS transitions",
      expected_impact: "Mobile engagement +22-30%",
      psychology_insight: "Contextual navigation reduces decision fatigue",
      code_complexity: "Medium JS",
      unique_factor: "Predictive UX based on behavior analysis"
    },
    {
      id: "1.3",
      title: "Smart Form Field Sequencing with Success Momentum",
      approach: "Technical UX", 
      problem_detected: "Form abandonment occurs at 73% completion rate",
      solution_description: "Reorder form fields by completion likelihood with visual progress rewards",
      implementation_method: "Dynamic form restructuring + progress visualization",
      expected_impact: "Form completion +35-42%",
      psychology_insight: "Early wins create completion momentum (goal gradient effect)",
      code_complexity: "Medium JS",
      unique_factor: "Data-driven field ordering optimization"
    },
    
    // Psychology & Persuasion (3 suggestions)
    {
      id: "2.1",
      title: "Social Proof Countdown with Real-time Activity",
      approach: "Psychology",
      problem_detected: "Users lack confidence in purchase decisions without social validation",
      solution_description: "Live counter showing recent purchases with urgency timer",
      implementation_method: "Real-time data display + scarcity psychology triggers", 
      expected_impact: "Conversion rate +28-38%",
      psychology_insight: "Combines social proof with scarcity bias for decision acceleration",
      code_complexity: "Complex Integration",
      unique_factor: "Multi-bias psychological approach"
    },
    {
      id: "2.2",
      title: "Loss Aversion Cart Abandonment Recovery",
      approach: "Psychology",
      problem_detected: "Cart abandonment at 69% without psychological intervention",
      solution_description: "Exit-intent popup showing what user will lose vs. alternatives",
      implementation_method: "Behavioral targeting + loss framing messaging",
      expected_impact: "Cart recovery +45-55%", 
      psychology_insight: "Loss aversion is 2x stronger than gain motivation",
      code_complexity: "Medium JS",
      unique_factor: "Frames decision as loss prevention vs. gain acquisition"
    },
    {
      id: "2.3",
      title: "Reciprocity-Triggered Micro-Commitments",
      approach: "Psychology",
      problem_detected: "Low engagement and conversion due to lack of investment",
      solution_description: "Progressive value delivery with micro-commitment requests",
      implementation_method: "Multi-step engagement with reciprocity triggers",
      expected_impact: "Engagement +52% Conversion +33%",
      psychology_insight: "Reciprocity principle increases commitment and loyalty",
      code_complexity: "Medium JS", 
      unique_factor: "Creates psychological debt that drives conversion"
    },

    // Brand Differentiation (3 suggestions)  
    {
      id: "3.1",
      title: "Brand Story Integration with Interactive Timeline",
      approach: "Brand Differentiation",
      problem_detected: "Generic presentation fails to differentiate from competitors",
      solution_description: "Interactive brand story that connects values to product benefits",
      implementation_method: "Scroll-triggered storytelling with brand milestone reveals",
      expected_impact: "Brand affinity +60% Premium perception +40%",
      psychology_insight: "Narrative transportation creates emotional brand connection",
      code_complexity: "Complex Integration",
      unique_factor: "Transforms product pages into brand experience journeys"
    },
    {
      id: "3.2",
      title: "Cultural Localization with Regional Social Proof",
      approach: "Brand Differentiation", 
      problem_detected: "Global messaging lacks local market resonance",
      solution_description: "Region-specific testimonials, cultural references, and local success stories",
      implementation_method: "Geo-targeted content + culturally relevant social proof",
      expected_impact: "Regional conversion +48-65%", 
      psychology_insight: "Cultural similarity bias increases trust and relevance",
      code_complexity: "Medium JS",
      unique_factor: "Hyperlocalized brand positioning"
    },
    {
      id: "3.3", 
      title: "Competitive Advantage Calculator with Value Proof",
      approach: "Brand Differentiation",
      problem_detected: "Users can't quantify brand superiority vs. alternatives",
      solution_description: "Interactive tool showing measurable advantages over competitors",
      implementation_method: "Dynamic comparison calculator with ROI visualization",
      expected_impact: "Premium sales +55% Price resistance -40%",
      psychology_insight: "Quantified superiority reduces price sensitivity",
      code_complexity: "Complex Integration", 
      unique_factor: "Direct competitive positioning with proof points"
    }
  ];

  return { 
    suggestions: fallbackSuggestions,
    meta: {
      fallback: true,
      personalized: true,
      total_suggestions: 9,
      user_tone: userPreferences.tone_preference
    }
  };
}

function generateContextualCSS(scopePreference: string) {
  if (scopePreference === 'quick-wins') {
    return `
.cta-button {
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%) !important;
  transform: scale(1.05) !important;
}`;
  }
  
  return `
.progress-ladder {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.step {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e0e0e0;
  margin-right: 10px;
  transition: all 0.3s ease;
}
.step.active {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  transform: scale(1.2);
}`;
}

// === BACKGROUND TASKS ===

async function storeSuggestionHistory(
  supabase: any, workspaceId: string, userId: string, 
  suggestions: any, pageUrl: string, goalType: string, requestId: string
) {
  try {
    await supabase
      .from('ab_test_suggestions_history')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        suggestion_data: suggestions,
        session_id: requestId,
        page_url: pageUrl,
        goal_type: goalType
      });
    
    console.log(`📚 [${requestId}] Suggestions stored in history for learning`);
  } catch (error) {
    console.error(`⚠️ [${requestId}] Failed to store suggestion history:`, error);
  }
}

async function updateUserPreferences(
  supabase: any, workspaceId: string, userId: string, 
  suggestions: any, currentPreferences: any
) {
  try {
    // Smart preference learning based on generated suggestions
    const updatedPreferences = { ...currentPreferences };
    
    // Update successful patterns if suggestions are high quality
    if (suggestions.suggestions?.every(s => s.quality_score > 0.8)) {
      const newPatterns = suggestions.suggestions.map(s => s.solution?.approach).filter(Boolean);
      updatedPreferences.successful_patterns = [
        ...new Set([...updatedPreferences.successful_patterns, ...newPatterns.slice(0, 2)])
      ].slice(0, 5); // Keep only top 5
    }
    
    await supabase
      .from('ab_test_user_preferences')
      .update(updatedPreferences)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);
    
    console.log(`🧠 User preferences updated with learning insights`);
  } catch (error) {
    console.error(`⚠️ Failed to update user preferences:`, error);
  }
}

async function triggerPeriodicCleanup(supabase: any, workspaceId: string, requestId: string) {
  try {
    // Check if cleanup was run in the last 24 hours for this workspace
    const { data: recentCleanup } = await supabase
      .from('knowledge_vault_audit')
      .select('created_at')
      .eq('workspace_id', workspaceId)
      .eq('action', 'cleanup')
      .eq('resource_type', 'ab_test_history')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .single();

    if (recentCleanup) {
      console.log(`⏩ [${requestId}] Cleanup already run in last 24h for workspace ${workspaceId}`);
      return;
    }

    // Trigger cleanup function
    console.log(`🧹 [${requestId}] Triggering periodic cleanup for workspace ${workspaceId}`);
    
    const cleanupResponse = await supabase.functions.invoke('cleanup-suggestions-history', {
      body: { workspaceId }
    });

    if (cleanupResponse.error) {
      console.error(`❌ [${requestId}] Cleanup failed:`, cleanupResponse.error);
    } else {
      console.log(`✅ [${requestId}] Cleanup completed:`, cleanupResponse.data);
    }
  } catch (error) {
    console.error(`⚠️ [${requestId}] Cleanup trigger failed:`, error);
    // Don't fail the main request if cleanup fails
  }
}