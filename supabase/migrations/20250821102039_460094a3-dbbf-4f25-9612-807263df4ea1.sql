-- CORRECTION URGENTE: Activation RLS sur toutes les nouvelles tables

-- Activer RLS sur toutes les tables
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_cache ENABLE ROW LEVEL SECURITY;

-- Policies de sécurité strictes pour alert_rules
CREATE POLICY "alert_rules_workspace_access" ON alert_rules
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
) WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Policies de sécurité pour alerts_log
CREATE POLICY "alerts_log_read_workspace" ON alerts_log
FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "alerts_log_system_insert" ON alerts_log
FOR INSERT WITH CHECK (true); -- Les edge functions peuvent écrire

-- Policies de sécurité pour semantic_cache  
CREATE POLICY "semantic_cache_workspace_access" ON semantic_cache
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
) WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);