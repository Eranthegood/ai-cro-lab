-- Create ab_test_backlog table
CREATE TABLE public.ab_test_backlog (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  user_id uuid NOT NULL,
  suggestion_id text NOT NULL,
  original_suggestion_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tags text[],
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'moved_to_dev')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ab_test_backlog
ALTER TABLE public.ab_test_backlog ENABLE ROW LEVEL SECURITY;

-- Create policies for ab_test_backlog
CREATE POLICY "Members can manage backlog items in their workspaces"
ON public.ab_test_backlog
FOR ALL
USING (check_workspace_permission(auth.uid(), workspace_id, 'member'::text))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'member'::text));

CREATE POLICY "Users can view backlog items from their workspaces"
ON public.ab_test_backlog
FOR SELECT
USING (check_workspace_permission(auth.uid(), workspace_id, 'viewer'::text));

-- Extend ab_tests table for tickets
ALTER TABLE public.ab_tests 
ADD COLUMN source_suggestion_id text,
ADD COLUMN external_ticket_url text,
ADD COLUMN external_ticket_id text;

-- Create trigger for updated_at on ab_test_backlog
CREATE TRIGGER update_ab_test_backlog_updated_at
BEFORE UPDATE ON public.ab_test_backlog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();