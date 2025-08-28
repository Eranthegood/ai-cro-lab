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
    const requestId = crypto.randomUUID().substring(0, 8);
    console.log(`🧹 [${requestId}] AB Test History Cleanup started`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get workspace ID from request or clean all workspaces
    const { workspaceId, dryRun = false } = await req.json().catch(() => ({}));

    // Calculate 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cutoffDate = threeMonthsAgo.toISOString();

    console.log(`📅 [${requestId}] Cleanup cutoff date: ${cutoffDate}`);

    // Build query to find old suggestions
    let query = supabase
      .from('ab_test_suggestions_history')
      .select('id, created_at, workspace_id, goal_type')
      .lt('created_at', cutoffDate);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    // Get old suggestions to be deleted
    const { data: oldSuggestions, error: selectError } = await query;

    if (selectError) {
      throw new Error(`Failed to query old suggestions: ${selectError.message}`);
    }

    const suggestionsToDelete = oldSuggestions || [];
    const totalCount = suggestionsToDelete.length;

    console.log(`🔍 [${requestId}] Found ${totalCount} suggestions older than 3 months`);

    if (totalCount === 0) {
      return new Response(JSON.stringify({
        success: true,
        deletedCount: 0,
        message: 'No suggestions older than 3 months found',
        cutoffDate
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Group by workspace for logging
    const workspaceStats = suggestionsToDelete.reduce((acc, item) => {
      const wsId = item.workspace_id;
      if (!acc[wsId]) acc[wsId] = 0;
      acc[wsId]++;
      return acc;
    }, {} as Record<string, number>);

    console.log(`📊 [${requestId}] Suggestions by workspace:`, workspaceStats);

    if (dryRun) {
      console.log(`🚫 [${requestId}] Dry run mode - no deletions performed`);
      
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        wouldDeleteCount: totalCount,
        workspaceStats,
        cutoffDate,
        message: `Would delete ${totalCount} suggestions older than 3 months`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Perform the cleanup - delete in batches of 100 for performance
    let deletedCount = 0;
    const batchSize = 100;
    
    for (let i = 0; i < suggestionsToDelete.length; i += batchSize) {
      const batch = suggestionsToDelete.slice(i, i + batchSize);
      const idsToDelete = batch.map(item => item.id);
      
      const { error: deleteError } = await supabase
        .from('ab_test_suggestions_history')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error(`❌ [${requestId}] Error deleting batch ${i / batchSize + 1}:`, deleteError);
        throw new Error(`Failed to delete suggestions batch: ${deleteError.message}`);
      }

      deletedCount += batch.length;
      console.log(`✅ [${requestId}] Deleted batch ${i / batchSize + 1}: ${batch.length} suggestions`);
    }

    console.log(`🎯 [${requestId}] Cleanup completed: ${deletedCount} suggestions deleted`);

    // Log cleanup action for audit (optional - could be disabled for performance)
    try {
      if (workspaceId) {
        await supabase
          .from('knowledge_vault_audit')
          .insert({
            workspace_id: workspaceId,
            action: 'cleanup',
            resource_type: 'ab_test_history',
            user_id: null, // System action
            action_metadata: {
              deleted_count: deletedCount,
              cutoff_date: cutoffDate,
              cleanup_type: 'automatic_3_month_retention'
            }
          });
      }
    } catch (auditError) {
      console.log(`⚠️ [${requestId}] Could not log cleanup action:`, auditError);
      // Don't fail the cleanup if audit logging fails
    }

    return new Response(JSON.stringify({
      success: true,
      deletedCount,
      workspaceStats,
      cutoffDate,
      message: `Successfully cleaned up ${deletedCount} suggestions older than 3 months`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(`🚨 Cleanup function error:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal error during cleanup',
      deletedCount: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

/*
Usage examples:

1. Clean all workspaces (dry run):
POST /functions/v1/cleanup-suggestions-history
{ "dryRun": true }

2. Clean specific workspace:
POST /functions/v1/cleanup-suggestions-history
{ "workspaceId": "uuid-here" }

3. Clean all workspaces (for cron job):
POST /functions/v1/cleanup-suggestions-history
{}

The function automatically deletes suggestions older than 3 months.
It can be called manually or scheduled as a cron job.
*/