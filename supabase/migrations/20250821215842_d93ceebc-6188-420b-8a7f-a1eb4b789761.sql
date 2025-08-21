-- Fix Supabase security warnings with proper syntax

-- Enable leaked password protection (this sets default values for new accounts)
-- Note: These settings affect new user registrations
INSERT INTO auth.config (
  parameter, 
  value
) VALUES 
  ('password_min_length', '8'),
  ('password_require_letters', 'true'),
  ('password_require_numbers', 'true'),
  ('password_require_uppercase', 'true'),
  ('password_require_symbols', 'false')
ON CONFLICT (parameter) DO UPDATE SET
  value = EXCLUDED.value;

-- Reduce OTP expiry to recommended 600 seconds (10 minutes)
INSERT INTO auth.config (parameter, value) VALUES ('otp_exp', '600')
ON CONFLICT (parameter) DO UPDATE SET value = '600';

-- Double-check RLS is enabled on critical tables
ALTER TABLE ab_test_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_vault_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

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

-- Enable RLS on new tables
ALTER TABLE ab_test_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_suggestions_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON ab_test_user_preferences;
CREATE POLICY "Users can view their own preferences" ON ab_test_user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON ab_test_user_preferences;
CREATE POLICY "Users can update their own preferences" ON ab_test_user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for suggestions history
DROP POLICY IF EXISTS "Users can view their own history" ON ab_test_suggestions_history;  
CREATE POLICY "Users can view their own history" ON ab_test_suggestions_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own history" ON ab_test_suggestions_history;
CREATE POLICY "Users can insert their own history" ON ab_test_suggestions_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);