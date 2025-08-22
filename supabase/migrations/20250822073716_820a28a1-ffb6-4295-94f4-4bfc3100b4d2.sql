-- Fix Alert System Security - Remove overly permissive policy
DROP POLICY IF EXISTS "alerts_log_system_insert" ON public.alerts_log;

-- Create a more secure alert insertion policy that only allows system operations
-- This prevents arbitrary alert insertion while maintaining system functionality
CREATE POLICY "Secure system alert insertion"
ON public.alerts_log
FOR INSERT
WITH CHECK (
  -- Only allow insertion if the user is authenticated and has admin role in the workspace
  auth.uid() IS NOT NULL 
  AND check_workspace_permission(auth.uid(), workspace_id, 'admin')
);

-- Fix database functions search paths for security
-- Update can_access_knowledge_base function
CREATE OR REPLACE FUNCTION public.can_access_knowledge_base(kb_workspace_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT check_workspace_permission(auth.uid(), kb_workspace_id, 'viewer');
$function$;

-- Update get_knowledge_vault_progress function  
CREATE OR REPLACE FUNCTION public.get_knowledge_vault_progress(p_workspace_id uuid)
 RETURNS TABLE(section text, score integer, max_score integer, completion_percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Update update_knowledge_vault_config function
CREATE OR REPLACE FUNCTION public.update_knowledge_vault_config(p_workspace_id uuid, p_section text, p_config_data jsonb, p_completion_score integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  config_id UUID;
BEGIN
  -- Verify user has access
  IF NOT check_workspace_permission(auth.uid(), p_workspace_id, 'member') THEN
    RAISE EXCEPTION 'Access denied. User does not have permission to modify this workspace.';
  END IF;

  -- Validate section
  IF p_section NOT IN ('business', 'visual', 'behavioral', 'predictive', 'repository') THEN
    RAISE EXCEPTION 'Invalid section. Must be one of: business, visual, behavioral, predictive, repository';
  END IF;

  -- Validate completion score
  IF p_completion_score < 0 OR p_completion_score > 20 THEN
    RAISE EXCEPTION 'Invalid completion score. Must be between 0 and 20.';
  END IF;

  -- Insert or update configuration
  INSERT INTO public.knowledge_vault_config (
    workspace_id,
    config_section,
    config_data,
    completion_score,
    created_by
  ) VALUES (
    p_workspace_id,
    p_section,
    p_config_data,
    p_completion_score,
    auth.uid()
  )
  ON CONFLICT (workspace_id, config_section) 
  DO UPDATE SET
    config_data = p_config_data,
    completion_score = p_completion_score,
    updated_at = now()
  RETURNING id INTO config_id;

  -- Log the action
  PERFORM log_knowledge_vault_action(
    p_workspace_id,
    'update',
    'config',
    config_id,
    jsonb_build_object(
      'section', p_section,
      'score', p_completion_score
    )
  );

  RETURN config_id;
END;
$function$;

-- Update log_knowledge_vault_action function
CREATE OR REPLACE FUNCTION public.log_knowledge_vault_action(p_workspace_id uuid, p_action text, p_resource_type text, p_resource_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;