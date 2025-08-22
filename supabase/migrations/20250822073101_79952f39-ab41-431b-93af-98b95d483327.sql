-- Fix the profiles RLS policy to work without context variables
-- The previous policy relied on current_setting() which wasn't being set by the app

DROP POLICY IF EXISTS "Users can view profiles from current workspace only" ON public.profiles;

-- Create a working policy that allows users to see profiles of members 
-- in ANY workspace they belong to (this is the intended behavior)
CREATE POLICY "Users can view profiles from their workspaces" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see profiles of other members in workspaces they belong to
  id IN (
    SELECT DISTINCT wm2.user_id
    FROM workspace_members wm1
    JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
    WHERE wm1.user_id = auth.uid()
  )
  OR 
  -- Users can always see their own profile
  id = auth.uid()
);