-- Drop the overly permissive policy
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Create a new policy that restricts viewing to workspace members only
CREATE POLICY "Users can view profiles from their workspaces" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT wm.user_id 
    FROM public.workspace_members wm
    WHERE wm.workspace_id IN (
      SELECT get_user_workspaces(auth.uid())
    )
  )
);