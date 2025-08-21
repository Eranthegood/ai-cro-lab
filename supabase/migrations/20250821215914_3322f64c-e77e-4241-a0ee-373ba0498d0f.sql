-- Create missing tables and ensure proper RLS policies
-- This migration focuses on what we can control via SQL

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS ab_test_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS ab_test_suggestions_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  suggestion_data JSONB,
  user_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all relevant tables
ALTER TABLE ab_test_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_suggestions_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for ab_test_user_preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON ab_test_user_preferences;
CREATE POLICY "Users can manage own preferences" ON ab_test_user_preferences
  FOR ALL USING (
    auth.uid() = user_id AND 
    check_workspace_permission(auth.uid(), workspace_id, 'member')
  );

-- Create secure RLS policies for ab_test_suggestions_history
DROP POLICY IF EXISTS "Users can access own history" ON ab_test_suggestions_history;
CREATE POLICY "Users can access own history" ON ab_test_suggestions_history
  FOR ALL USING (
    auth.uid() = user_id AND 
    check_workspace_permission(auth.uid(), workspace_id, 'member')
  );

-- Update ab_test_suggestions RLS policy to be more secure
DROP POLICY IF EXISTS "Users can access suggestions in their workspace" ON ab_test_suggestions;
CREATE POLICY "Users can access suggestions in their workspace" ON ab_test_suggestions
  FOR ALL USING (
    check_workspace_permission(auth.uid(), workspace_id, 'member')
  );

-- Create trigger for updating updated_at timestamp on preferences
DROP TRIGGER IF EXISTS update_ab_test_user_preferences_updated_at ON ab_test_user_preferences;
CREATE TRIGGER update_ab_test_user_preferences_updated_at
  BEFORE UPDATE ON ab_test_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ab_test_user_preferences_workspace_user 
  ON ab_test_user_preferences(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_ab_test_suggestions_history_workspace_user 
  ON ab_test_suggestions_history(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_ab_test_suggestions_history_created_at 
  ON ab_test_suggestions_history(created_at DESC);