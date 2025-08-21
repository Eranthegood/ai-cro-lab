-- PRIORITÉ 2 & 3: Tables pour Cache Sémantique et Alertes Intelligentes

-- Table pour le cache sémantique
CREATE TABLE IF NOT EXISTS semantic_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  query_hash TEXT NOT NULL,
  query_text TEXT NOT NULL,
  response_content TEXT NOT NULL,
  tokens_saved INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_semantic_cache_workspace_query ON semantic_cache(workspace_id, query_hash);
CREATE INDEX IF NOT EXISTS idx_semantic_cache_workspace_created ON semantic_cache(workspace_id, created_at DESC);

-- Table pour les règles d'alertes
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('budget', 'error_rate', 'traffic_spike', 'security')),
  threshold_value NUMERIC NOT NULL DEFAULT 0,
  notification_channels JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le log des alertes déclenchées
CREATE TABLE IF NOT EXISTS alerts_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies pour sécurité
ALTER TABLE semantic_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;  
ALTER TABLE alerts_log ENABLE ROW LEVEL SECURITY;

-- Cache sémantique - accès par membres du workspace
CREATE POLICY "semantic_cache_workspace_members" ON semantic_cache
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Règles d'alertes - accès par admins du workspace
CREATE POLICY "alert_rules_workspace_admins" ON alert_rules
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Log alertes - lecture pour tous les membres, écriture pour système
CREATE POLICY "alerts_log_workspace_read" ON alerts_log
FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "alerts_log_system_write" ON alerts_log
FOR INSERT WITH CHECK (true); -- Les edge functions peuvent écrire

-- Index pour performance des alertes
CREATE INDEX IF NOT EXISTS idx_alert_rules_workspace_active ON alert_rules(workspace_id, is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_log_workspace_created ON alerts_log(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_log_status ON alerts_log(status, created_at);

-- Règles d'alertes par défaut pour nouveaux workspaces
INSERT INTO alert_rules (workspace_id, alert_type, threshold_value, notification_channels)
SELECT 
  w.id,
  unnest(ARRAY['budget', 'error_rate', 'traffic_spike', 'security']) as alert_type,
  CASE 
    WHEN unnest(ARRAY['budget', 'error_rate', 'traffic_spike', 'security']) = 'budget' THEN 50.0
    WHEN unnest(ARRAY['budget', 'error_rate', 'traffic_spike', 'security']) = 'error_rate' THEN 10.0  
    WHEN unnest(ARRAY['budget', 'error_rate', 'traffic_spike', 'security']) = 'traffic_spike' THEN 3.0
    WHEN unnest(ARRAY['budget', 'error_rate', 'traffic_spike', 'security']) = 'security' THEN 5.0
  END as threshold_value,
  '["email"]'::jsonb as notification_channels
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM alert_rules ar WHERE ar.workspace_id = w.id
);