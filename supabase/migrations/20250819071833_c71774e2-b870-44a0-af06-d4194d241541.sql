-- Fix security issues: Update functions to have proper search_path

-- Fix function 1: get_user_workspaces
CREATE OR REPLACE FUNCTION public.get_user_workspaces(user_uuid UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT workspace_id 
  FROM public.workspace_members 
  WHERE user_id = user_uuid;
$$;

-- Fix function 2: check_workspace_permission  
CREATE OR REPLACE FUNCTION public.check_workspace_permission(user_uuid UUID, workspace_uuid UUID, required_role TEXT DEFAULT 'viewer')
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.workspace_members wm
    WHERE wm.user_id = user_uuid 
    AND wm.workspace_id = workspace_uuid
    AND (
      CASE required_role
        WHEN 'owner' THEN wm.role = 'owner'
        WHEN 'admin' THEN wm.role IN ('owner', 'admin')
        WHEN 'member' THEN wm.role IN ('owner', 'admin', 'member')
        WHEN 'viewer' THEN wm.role IN ('owner', 'admin', 'member', 'viewer')
        ELSE false
      END
    )
  );
$$;

-- Fix function 3: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;