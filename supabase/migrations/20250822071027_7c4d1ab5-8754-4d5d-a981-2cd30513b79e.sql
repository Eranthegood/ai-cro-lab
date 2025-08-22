-- Fix the profiles table RLS policy to prevent cross-workspace data exposure
DROP POLICY IF EXISTS "Users can view profiles from their workspaces" ON public.profiles;

-- Create a more restrictive profile access policy
-- Users can only see profiles of people in the SAME SPECIFIC workspace, not all their workspaces
CREATE POLICY "Users can view profiles from current workspace only" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT wm.user_id 
    FROM workspace_members wm 
    WHERE wm.workspace_id = current_setting('app.current_workspace_id', true)::uuid
    AND EXISTS (
      SELECT 1 FROM workspace_members my_membership 
      WHERE my_membership.user_id = auth.uid() 
      AND my_membership.workspace_id = wm.workspace_id
    )
  )
);

-- Add a function to safely check knowledge base access
CREATE OR REPLACE FUNCTION public.can_access_knowledge_base(kb_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT check_workspace_permission(auth.uid(), kb_workspace_id, 'viewer');
$$;

-- Ensure knowledge_base table has the most restrictive policies
DROP POLICY IF EXISTS "Users can view knowledge base from their workspaces" ON public.knowledge_base;
DROP POLICY IF EXISTS "Members can manage knowledge base in their workspaces" ON public.knowledge_base;

-- Recreate with more explicit security
CREATE POLICY "Workspace members can view knowledge base" 
ON public.knowledge_base 
FOR SELECT 
USING (can_access_knowledge_base(workspace_id));

CREATE POLICY "Workspace members can manage knowledge base" 
ON public.knowledge_base 
FOR ALL 
USING (check_workspace_permission(auth.uid(), workspace_id, 'member'))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- Fix workspace invitations to be more restrictive
DROP POLICY IF EXISTS "Admins can view invitations for their workspaces" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Admins can manage invitations for their workspaces" ON public.workspace_invitations;

CREATE POLICY "Workspace admins can view own workspace invitations only"
ON public.workspace_invitations
FOR SELECT
USING (
  check_workspace_permission(auth.uid(), workspace_id, 'admin')
  AND workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

CREATE POLICY "Workspace admins can manage own workspace invitations only"
ON public.workspace_invitations
FOR ALL
USING (check_workspace_permission(auth.uid(), workspace_id, 'admin'))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'admin'));

-- Update function search paths to be immutable (security fix)
CREATE OR REPLACE FUNCTION public.clean_vault_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.knowledge_vault_cache 
  WHERE last_accessed < now() - interval '7 days';
END;
$$;