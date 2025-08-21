// PRIORITÉ 3: SYSTÈME D'ALERTES INTELLIGENTES 🛡️
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRule {
  id: string;
  workspace_id: string;
  alert_type: 'budget' | 'error_rate' | 'traffic_spike' | 'security';
  threshold_value: number;
  notification_channels: string[];
  is_active: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, workspaceId, alertData } = await req.json();
    
    if (action === 'check') {
      await checkAllAlerts(supabase, workspaceId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'trigger') {
      await triggerAlert(supabase, alertData);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Smart alerts error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkAllAlerts(supabase: any, workspaceId: string): Promise<void> {
  try {
    const { data: rules } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true);

    if (!rules) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    for (const rule of rules) {
      switch (rule.alert_type) {
        case 'budget':
          await checkBudgetAlert(supabase, rule, today);
          break;
        case 'error_rate':
          await checkErrorRateAlert(supabase, rule, hourAgo);
          break;
        case 'traffic_spike':
          await checkTrafficSpikeAlert(supabase, rule, hourAgo);
          break;
        case 'security':
          await checkSecurityAlert(supabase, rule, hourAgo);
          break;
      }
    }
  } catch (error) {
    console.error('Check alerts error:', error);
  }
}

async function checkBudgetAlert(supabase: any, rule: AlertRule, today: string): Promise<void> {
  try {
    // Calculer le coût d'aujourd'hui
    const { data: interactions } = await supabase
      .from('knowledge_vault_audit')
      .select('metadata')
      .eq('workspace_id', rule.workspace_id)
      .eq('action', 'ai_interaction')
      .gte('created_at', today + 'T00:00:00Z');

    const totalCost = interactions?.reduce((sum: number, int: any) => {
      return sum + (int.metadata?.cost_estimate || 0);
    }, 0) || 0;

    if (totalCost > rule.threshold_value) {
      await triggerAlert(supabase, {
        workspace_id: rule.workspace_id,
        alert_type: 'budget',
        severity: totalCost > rule.threshold_value * 1.5 ? 'critical' : 'warning',
        title: `Budget quotidien dépassé`,
        message: `Coût actuel: $${totalCost.toFixed(2)} (limite: $${rule.threshold_value})`,
        metadata: { current_cost: totalCost, threshold: rule.threshold_value }
      });
    }
  } catch (error) {
    console.error('Budget alert check error:', error);
  }
}

async function checkErrorRateAlert(supabase: any, rule: AlertRule, hourAgo: string): Promise<void> {
  try {
    const { data: logs } = await supabase
      .from('knowledge_vault_audit')
      .select('action, metadata')
      .eq('workspace_id', rule.workspace_id)
      .gte('created_at', hourAgo);

    const total = logs?.length || 0;
    const errors = logs?.filter(log => log.action === 'error' || log.metadata?.error_type)?.length || 0;
    const errorRate = total > 0 ? (errors / total) * 100 : 0;

    if (errorRate > rule.threshold_value) {
      await triggerAlert(supabase, {
        workspace_id: rule.workspace_id,
        alert_type: 'error_rate',
        severity: errorRate > rule.threshold_value * 2 ? 'critical' : 'warning',
        title: `Taux d'erreur élevé`,
        message: `${errorRate.toFixed(1)}% d'erreurs dans la dernière heure (${errors}/${total} requêtes)`,
        metadata: { error_rate: errorRate, errors, total }
      });
    }
  } catch (error) {
    console.error('Error rate alert check error:', error);
  }
}

async function checkTrafficSpikeAlert(supabase: any, rule: AlertRule, hourAgo: string): Promise<void> {
  try {
    const { data: currentHour } = await supabase
      .from('knowledge_vault_audit')
      .select('id')
      .eq('workspace_id', rule.workspace_id)
      .eq('action', 'ai_interaction')
      .gte('created_at', hourAgo);

    const currentTraffic = currentHour?.length || 0;

    // Comparer avec la moyenne des 7 derniers jours à la même heure
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: historicalData } = await supabase
      .from('knowledge_vault_audit')
      .select('created_at')
      .eq('workspace_id', rule.workspace_id)
      .eq('action', 'ai_interaction')
      .gte('created_at', weekAgo);

    const avgTraffic = calculateHourlyAverage(historicalData || []);
    const spikeRatio = avgTraffic > 0 ? currentTraffic / avgTraffic : 1;

    if (spikeRatio > rule.threshold_value) {
      await triggerAlert(supabase, {
        workspace_id: rule.workspace_id,
        alert_type: 'traffic_spike',
        severity: spikeRatio > rule.threshold_value * 2 ? 'critical' : 'warning',
        title: `Pic de trafic détecté`,
        message: `${currentTraffic} requêtes/heure vs moyenne ${avgTraffic.toFixed(1)} (+${((spikeRatio-1)*100).toFixed(0)}%)`,
        metadata: { current: currentTraffic, average: avgTraffic, spike_ratio: spikeRatio }
      });
    }
  } catch (error) {
    console.error('Traffic spike alert check error:', error);
  }
}

async function checkSecurityAlert(supabase: any, rule: AlertRule, hourAgo: string): Promise<void> {
  try {
    // Détecter les tentatives d'accès non autorisées ou patterns suspects
    const { data: logs } = await supabase
      .from('knowledge_vault_audit')
      .select('*')
      .eq('workspace_id', rule.workspace_id)
      .gte('created_at', hourAgo);

    const suspiciousActivities = logs?.filter(log => 
      log.metadata?.error_type === 'Unauthorized' || 
      log.metadata?.error_message?.includes('permission') ||
      log.metadata?.error_message?.includes('RLS')
    ) || [];

    if (suspiciousActivities.length > rule.threshold_value) {
      await triggerAlert(supabase, {
        workspace_id: rule.workspace_id,
        alert_type: 'security',
        severity: 'critical',
        title: `Activité suspecte détectée`,
        message: `${suspiciousActivities.length} tentatives d'accès non autorisées dans la dernière heure`,
        metadata: { suspicious_count: suspiciousActivities.length, details: suspiciousActivities }
      });
    }
  } catch (error) {
    console.error('Security alert check error:', error);
  }
}

async function triggerAlert(supabase: any, alertData: any): Promise<void> {
  try {
    // Enregistrer l'alerte
    await supabase.from('alerts_log').insert({
      workspace_id: alertData.workspace_id,
      alert_type: alertData.alert_type,
      severity: alertData.severity,
      title: alertData.title,
      message: alertData.message,
      metadata: alertData.metadata,
      status: 'active'
    });

    console.log(`🚨 Alert triggered: ${alertData.title} (${alertData.severity})`);

    // TODO: Implémenter l'envoi d'emails/SMS selon les canaux configurés
    // Ici on pourrait intégrer SendGrid, Twilio, Slack, etc.
    
  } catch (error) {
    console.error('Trigger alert error:', error);
  }
}

function calculateHourlyAverage(logs: any[]): number {
  if (logs.length === 0) return 0;
  
  const hours = 7 * 24; // 7 jours
  return logs.length / hours;
}