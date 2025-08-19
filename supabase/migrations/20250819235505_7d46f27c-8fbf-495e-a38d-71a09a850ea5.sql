-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view projects from their workspaces" 
ON public.projects 
FOR SELECT 
USING (check_workspace_permission(auth.uid(), workspace_id, 'viewer'));

CREATE POLICY "Members can manage projects in their workspaces" 
ON public.projects 
FOR ALL 
USING (check_workspace_permission(auth.uid(), workspace_id, 'member'))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- Create project_conversations table
CREATE TABLE public.project_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for project_conversations
CREATE POLICY "Users can view conversations from accessible projects"
ON public.project_conversations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.projects p 
  WHERE p.id = project_id 
  AND check_workspace_permission(auth.uid(), p.workspace_id, 'viewer')
));

CREATE POLICY "Members can manage conversations in accessible projects"
ON public.project_conversations
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.projects p 
  WHERE p.id = project_id 
  AND check_workspace_permission(auth.uid(), p.workspace_id, 'member')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects p 
  WHERE p.id = project_id 
  AND check_workspace_permission(auth.uid(), p.workspace_id, 'member')
));

-- Create vault_saved_responses table
CREATE TABLE public.vault_saved_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_context JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_saved_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for vault_saved_responses
CREATE POLICY "Users can view saved responses from their workspaces"
ON public.vault_saved_responses
FOR SELECT
USING (check_workspace_permission(auth.uid(), workspace_id, 'viewer'));

CREATE POLICY "Members can manage saved responses in their workspaces"
ON public.vault_saved_responses
FOR ALL
USING (check_workspace_permission(auth.uid(), workspace_id, 'member'))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- Add project_id to knowledge_vault_files (optional, for better organization)
ALTER TABLE public.knowledge_vault_files 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_conversations_updated_at
BEFORE UPDATE ON public.project_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();