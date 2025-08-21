// PRIORITÉ 2: CACHE SÉMANTIQUE INTELLIGENT 🧠
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SemanticCacheEntry {
  id: string;
  query_hash: string;
  query_text: string;
  response_content: string;
  workspace_id: string;
  similarity_score?: number;
  tokens_saved: number;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, query, response, workspaceId } = await req.json();
    
    if (action === 'search') {
      const cached = await searchSemanticCache(supabase, query, workspaceId);
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'store') {
      await storeSemanticCache(supabase, query, response, workspaceId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Semantic cache error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function searchSemanticCache(
  supabase: any, 
  query: string, 
  workspaceId: string
): Promise<SemanticCacheEntry | null> {
  try {
    // Recherche avec fuzzy matching (60% similarité minimum)
    const { data: entries } = await supabase
      .from('semantic_cache')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // 24h cache

    if (!entries || entries.length === 0) return null;

    // Calcul de similarité simple (Levenshtein distance normalisée)
    let bestMatch: SemanticCacheEntry | null = null;
    let bestScore = 0;

    for (const entry of entries) {
      const similarity = calculateSimilarity(query.toLowerCase(), entry.query_text.toLowerCase());
      if (similarity >= 0.6 && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = { ...entry, similarity_score: similarity };
      }
    }

    if (bestMatch) {
      console.log(`🎯 Cache hit: ${bestScore.toFixed(2)} similarity for "${query.substring(0, 50)}..."`);
      
      // Log cache hit for analytics
      await supabase.from('knowledge_vault_audit').insert({
        workspace_id: workspaceId,
        action: 'cache_hit',
        metadata: {
          similarity_score: bestScore,
          tokens_saved: bestMatch.tokens_saved,
          original_query: query,
          cached_query: bestMatch.query_text
        }
      });
    }

    return bestMatch;
  } catch (error) {
    console.error('Cache search error:', error);
    return null;
  }
}

async function storeSemanticCache(
  supabase: any,
  query: string,
  response: string,
  workspaceId: string
): Promise<void> {
  try {
    const queryHash = await generateQueryHash(query);
    const tokensEstimate = Math.ceil((query.length + response.length) / 4);

    await supabase.from('semantic_cache').insert({
      query_hash: queryHash,
      query_text: query,
      response_content: response,
      workspace_id: workspaceId,
      tokens_saved: tokensEstimate
    });

    console.log(`💾 Cached response for "${query.substring(0, 50)}..." (${tokensEstimate} tokens)`);
  } catch (error) {
    console.error('Cache store error:', error);
  }
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  // Jaccard similarity avec mots-clés
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

async function generateQueryHash(query: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(query.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}