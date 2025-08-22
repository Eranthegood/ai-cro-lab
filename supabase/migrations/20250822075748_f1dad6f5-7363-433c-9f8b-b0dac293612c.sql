-- Restrict access to sensitive knowledge vault configurations to admins only
-- Drop existing broad policy
DROP POLICY IF EXISTS "Knowledge vault access for workspace members only" ON public.knowledge_vault_config;

-- Create separate policies for sensitive vs non-sensitive configurations
-- Policy 1: Allow members to access non-sensitive configurations
CREATE POLICY "Members can access non-sensitive vault config"
ON public.knowledge_vault_config
FOR ALL
USING (
  check_workspace_permission(auth.uid(), workspace_id, 'member') 
  AND is_sensitive = false
)
WITH CHECK (
  check_workspace_permission(auth.uid(), workspace_id, 'member') 
  AND is_sensitive = false
);

-- Policy 2: Only allow admins to access sensitive configurations
CREATE POLICY "Admins only can access sensitive vault config"
ON public.knowledge_vault_config
FOR ALL
USING (
  check_workspace_permission(auth.uid(), workspace_id, 'admin') 
  AND is_sensitive = true
)
WITH CHECK (
  check_workspace_permission(auth.uid(), workspace_id, 'admin') 
  AND is_sensitive = true
);

-- Policy 3: Allow admins full access to all configurations (sensitive and non-sensitive)
CREATE POLICY "Admins can access all vault config"
ON public.knowledge_vault_config
FOR ALL
USING (
  check_workspace_permission(auth.uid(), workspace_id, 'admin')
)
WITH CHECK (
  check_workspace_permission(auth.uid(), workspace_id, 'admin')
);