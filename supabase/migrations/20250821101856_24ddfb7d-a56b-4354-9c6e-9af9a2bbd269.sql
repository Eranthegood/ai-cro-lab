-- CORRECTION: Insertion des règles d'alertes par défaut avec requêtes séparées

-- Règles Budget (50$)
INSERT INTO alert_rules (workspace_id, alert_type, threshold_value, notification_channels)
SELECT w.id, 'budget', 50.0, '["email"]'::jsonb
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM alert_rules ar 
  WHERE ar.workspace_id = w.id AND ar.alert_type = 'budget'
);

-- Règles Taux d'erreur (10%)  
INSERT INTO alert_rules (workspace_id, alert_type, threshold_value, notification_channels)
SELECT w.id, 'error_rate', 10.0, '["email"]'::jsonb
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM alert_rules ar 
  WHERE ar.workspace_id = w.id AND ar.alert_type = 'error_rate'
);

-- Règles Pic de trafic (300%)
INSERT INTO alert_rules (workspace_id, alert_type, threshold_value, notification_channels)
SELECT w.id, 'traffic_spike', 3.0, '["email"]'::jsonb
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM alert_rules ar 
  WHERE ar.workspace_id = w.id AND ar.alert_type = 'traffic_spike'
);

-- Règles Sécurité (5 tentatives suspectes)
INSERT INTO alert_rules (workspace_id, alert_type, threshold_value, notification_channels)
SELECT w.id, 'security', 5.0, '["email"]'::jsonb
FROM workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM alert_rules ar 
  WHERE ar.workspace_id = w.id AND ar.alert_type = 'security'
);