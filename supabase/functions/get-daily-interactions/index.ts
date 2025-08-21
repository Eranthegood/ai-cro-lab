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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { workspaceId, userId } = await req.json();

    if (!workspaceId || !userId) {
      throw new Error('workspaceId and userId are required');
    }

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

    // Get today's interactions count
    const today = new Date().toISOString().split('T')[0];
    const { data: interactions, error } = await supabase
      .from('knowledge_vault_audit')
      .select('id, created_at')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .eq('action', 'ai_interaction')
      .gte('created_at', today + 'T00:00:00Z')
      .lt('created_at', today + 'T23:59:59Z')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch interactions');
    }

    const dailyCount = interactions?.length || 0;
    const limit = 50; // Fixed limit for now
    
    return new Response(JSON.stringify({ 
      dailyCount,
      limit,
      remaining: Math.max(0, limit - dailyCount),
      canMakeRequest: dailyCount < limit,
      resetTime: today + 'T23:59:59Z'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Function error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal error',
      dailyCount: 0,
      limit: 50,
      remaining: 50,
      canMakeRequest: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});