-- Create AB Test system tables with proper security

-- Create AB test suggestions table
CREATE TABLE IF NOT EXISTS ab_test_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  approach TEXT,
  problem_detected TEXT,
  solution_description TEXT,
  expected_impact TEXT,
  psychology_insight TEXT,
  code_complexity TEXT,
  confidence NUMERIC,
  screenshot_data JSONB,
  visual_elements JSONB,
  detected_colors TEXT[],
  page_performance JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create AB test user preferences table
CREATE TABLE IF NOT EXISTS ab_test_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create AB test suggestions history table
CREATE TABLE IF NOT EXISTS ab_test_suggestions_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  suggestion_data JSONB,
  user_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all AB test tables
ALTER TABLE ab_test_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_suggestions_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ab_test_suggestions
CREATE POLICY "Users can access suggestions in their workspace" ON ab_test_suggestions
  FOR ALL USING (
    check_workspace_permission(auth.uid(), workspace_id, 'member')
  );

-- Create RLS policies for ab_test_user_preferences
CREATE POLICY "Users can manage own preferences" ON ab_test_user_preferences
  FOR ALL USING (
    auth.uid() = user_id AND 
    check_workspace_permission(auth.uid(), workspace_id, 'member')
  );

-- Create RLS policies for ab_test_suggestions_history
CREATE POLICY "Users can access own history" ON ab_test_suggestions_history
  FOR ALL USING (
    auth.uid() = user_id AND 
    check_workspace_permission(auth.uid(), workspace_id, 'member')
  );

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_ab_test_suggestions_updated_at
  BEFORE UPDATE ON ab_test_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_test_user_preferences_updated_at
  BEFORE UPDATE ON ab_test_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_ab_test_suggestions_workspace_user 
  ON ab_test_suggestions(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_ab_test_user_preferences_workspace_user 
  ON ab_test_user_preferences(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_ab_test_suggestions_history_workspace_user 
  ON ab_test_suggestions_history(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_ab_test_suggestions_history_created_at 
  ON ab_test_suggestions_history(created_at DESC);