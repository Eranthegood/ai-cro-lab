-- COMPLETE SECURITY LOCKDOWN: Eliminate all public access to sensitive user data
-- This addresses persistent security vulnerabilities with stricter policies

-- 1. Fix function search paths (Security Warning)
ALTER FUNCTION public.can_access_knowledge_base(uuid) SET search_path TO 'public';
ALTER FUNCTION public.clean_vault_cache() SET search_path TO 'public';
ALTER FUNCTION public.get_knowledge_vault_progress(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_knowledge_vault_config(uuid, text, jsonb, integer) SET search_path TO 'public';
ALTER FUNCTION public.log_knowledge_vault_action(uuid, text, text, uuid, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.get_user_workspaces(uuid) SET search_path TO 'public';
ALTER FUNCTION public.check_workspace_permission(uuid, uuid, text) SET search_path TO 'public';

-- 2. COMPLETE LOCKDOWN: Remove any potential public access to profiles
-- Drop all existing policies and create ultra-restrictive ones
DROP POLICY IF EXISTS "Authenticated users can view workspace profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;

-- Only allow users to see their OWN profile and profiles they explicitly need for workspace functionality
CREATE POLICY "Users can only view own profile"
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can only insert own profile"
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can only update own profile"
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- 3. COMPLETE LOCKDOWN: Workspace invitations - admin only
DROP POLICY IF EXISTS "Workspace admins can view own workspace invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Workspace admins can manage own workspace invitations" ON public.workspace_invitations;

CREATE POLICY "Strict admin access to workspace invitations"
ON public.workspace_invitations 
FOR ALL
TO authenticated
USING (check_workspace_permission(auth.uid(), workspace_id, 'admin'::text))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'admin'::text));

-- 4. COMPLETE LOCKDOWN: Waitlist - prevent any read access except for system admins
DROP POLICY IF EXISTS "Workspace admins can view waitlist data" ON public.waitlist;
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

-- Allow public signup only (no read access to emails/IPs)
CREATE POLICY "Public can join waitlist"
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

-- Completely deny SELECT access to waitlist data
-- No read access to emails/IPs for anyone except direct database access
-- This prevents any email harvesting through the API

-- 5. Create a secure workspace profile access function that doesn't expose emails
CREATE OR REPLACE FUNCTION public.get_workspace_profile_names(workspace_uuid uuid)
RETURNS TABLE(user_id uuid, full_name text) 
LANGUAGE sql 
SECURITY DEFINER 
STABLE 
SET search_path TO 'public'
AS $$
  SELECT p.id, p.full_name 
  FROM public.profiles p
  JOIN public.workspace_members wm ON p.id = wm.user_id
  WHERE wm.workspace_id = workspace_uuid 
    AND check_workspace_permission(auth.uid(), workspace_uuid, 'member'::text);
$$;

-- 6. Ensure workspace_members is properly secured
DROP POLICY IF EXISTS "Authenticated users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Authenticated users can insert themselves as members" ON public.workspace_members;

CREATE POLICY "Members can view workspace memberships"
ON public.workspace_members 
FOR SELECT 
TO authenticated
USING (workspace_id IN ( SELECT get_user_workspaces(auth.uid())));

CREATE POLICY "Users can join as members"
ON public.workspace_members 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage members"  
ON public.workspace_members
FOR ALL
TO authenticated
USING (check_workspace_permission(auth.uid(), workspace_id, 'admin'::text))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'admin'::text));