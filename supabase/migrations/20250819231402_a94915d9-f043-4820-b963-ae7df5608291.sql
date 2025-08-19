-- Create knowledge_vault_config table for ultra-secure data storage
CREATE TABLE public.knowledge_vault_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  config_section TEXT NOT NULL CHECK (config_section IN ('business', 'visual', 'behavioral', 'predictive', 'repository')),
  config_data JSONB NOT NULL DEFAULT '{}',
  completion_score INTEGER NOT NULL DEFAULT 0 CHECK (completion_score >= 0 AND completion_score <= 20),
  is_sensitive BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, config_section)
);

-- Enable Row Level Security - CRITICAL for data protection
ALTER TABLE public.knowledge_vault_config ENABLE ROW LEVEL SECURITY;

-- Create ultra-restrictive policies for knowledge vault data
-- Only members and above can read/write their workspace's knowledge vault
CREATE POLICY "Knowledge vault access for workspace members only" 
ON public.knowledge_vault_config 
FOR ALL
USING (check_workspace_permission(auth.uid(), workspace_id, 'member'))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- Create secure file storage table for uploaded documents
CREATE TABLE public.knowledge_vault_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  config_section TEXT NOT NULL CHECK (config_section IN ('business', 'visual', 'behavioral', 'predictive', 'repository')),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  upload_metadata JSONB DEFAULT '{}',
  is_processed BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on files table
ALTER TABLE public.knowledge_vault_files ENABLE ROW LEVEL SECURITY;

-- Ultra-secure policy for files - only workspace members can access
CREATE POLICY "Knowledge vault files for workspace members only" 
ON public.knowledge_vault_files 
FOR ALL
USING (check_workspace_permission(auth.uid(), workspace_id, 'member'))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- Create audit log for sensitive operations
CREATE TABLE public.knowledge_vault_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'file_upload', 'file_download'
  resource_type TEXT NOT NULL, -- 'config', 'file'
  resource_id UUID,
  user_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  action_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.knowledge_vault_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Audit logs for workspace admins only" 
ON public.knowledge_vault_audit 
FOR SELECT
USING (check_workspace_permission(auth.uid(), workspace_id, 'admin'));

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_knowledge_vault_action(
  p_workspace_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.knowledge_vault_audit (
    workspace_id,
    action,
    resource_type,
    resource_id,
    user_id,
    action_metadata
  ) VALUES (
    p_workspace_id,
    p_action,
    p_resource_type,
    p_resource_id,
    auth.uid(),
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get knowledge vault progress for a workspace
CREATE OR REPLACE FUNCTION public.get_knowledge_vault_progress(p_workspace_id UUID)
RETURNS TABLE(
  section TEXT,
  score INTEGER,
  max_score INTEGER,
  completion_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.section_name::TEXT,
    COALESCE(kvc.completion_score, 0)::INTEGER,
    20::INTEGER as max_score,
    ROUND((COALESCE(kvc.completion_score, 0)::DECIMAL / 20::DECIMAL) * 100, 1) as completion_percentage
  FROM (
    VALUES 
    ('business'),
    ('visual'),
    ('behavioral'),
    ('predictive'),
    ('repository')
  ) AS s(section_name)
  LEFT JOIN public.knowledge_vault_config kvc 
    ON kvc.config_section = s.section_name 
    AND kvc.workspace_id = p_workspace_id
  WHERE check_workspace_permission(auth.uid(), p_workspace_id, 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER update_knowledge_vault_config_updated_at
  BEFORE UPDATE ON public.knowledge_vault_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance while maintaining security
CREATE INDEX idx_knowledge_vault_config_workspace ON public.knowledge_vault_config(workspace_id);
CREATE INDEX idx_knowledge_vault_files_workspace ON public.knowledge_vault_files(workspace_id);
CREATE INDEX idx_knowledge_vault_audit_workspace_created ON public.knowledge_vault_audit(workspace_id, created_at DESC);