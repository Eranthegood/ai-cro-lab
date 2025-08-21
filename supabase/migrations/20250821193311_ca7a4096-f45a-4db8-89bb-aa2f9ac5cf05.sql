-- Create table for storing A/B test suggestions history and user preferences
CREATE TABLE public.ab_test_suggestions_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  suggestion_data JSONB NOT NULL DEFAULT '{}',
  user_action TEXT, -- 'selected', 'modified', 'rejected', 'replaced'
  session_id TEXT,
  page_url TEXT,
  goal_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_test_suggestions_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their workspace suggestions history" 
ON public.ab_test_suggestions_history 
FOR SELECT 
USING (check_workspace_permission(auth.uid(), workspace_id, 'viewer'::text));

CREATE POLICY "Users can manage suggestions history in their workspaces" 
ON public.ab_test_suggestions_history 
FOR ALL 
USING (check_workspace_permission(auth.uid(), workspace_id, 'member'::text))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'member'::text));

-- Create table for user preferences and learning
CREATE TABLE public.ab_test_user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  tone_preference TEXT DEFAULT 'balanced', -- conservative/balanced/aggressive
  scope_preference TEXT DEFAULT 'medium', -- quick-wins/medium/ambitious
  technical_comfort TEXT DEFAULT 'medium', -- low/medium/high
  industry_context TEXT DEFAULT 'ecommerce',
  successful_patterns JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Enable RLS
ALTER TABLE public.ab_test_user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences" 
ON public.ab_test_user_preferences 
FOR SELECT 
USING (auth.uid() = user_id AND check_workspace_permission(auth.uid(), workspace_id, 'viewer'::text));

CREATE POLICY "Users can manage their own preferences" 
ON public.ab_test_user_preferences 
FOR ALL 
USING (auth.uid() = user_id AND check_workspace_permission(auth.uid(), workspace_id, 'member'::text))
WITH CHECK (auth.uid() = user_id AND check_workspace_permission(auth.uid(), workspace_id, 'member'::text));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ab_test_user_preferences_updated_at
BEFORE UPDATE ON public.ab_test_user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();