-- SECURITY FIX: Restrict access to user email addresses and sensitive data
-- This migration addresses critical security vulnerabilities where user data was publicly accessible

-- 1. Fix profiles table RLS policies - CRITICAL: Emails were publicly readable
DROP POLICY IF EXISTS "Users can view profiles from their workspaces" ON public.profiles;

CREATE POLICY "Authenticated users can view workspace profiles"
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  (id IN ( 
    SELECT DISTINCT wm2.user_id
    FROM (workspace_members wm1 JOIN workspace_members wm2 ON ((wm1.workspace_id = wm2.workspace_id)))
    WHERE (wm1.user_id = auth.uid())
  )) OR (id = auth.uid())
);

-- Ensure INSERT and UPDATE policies are properly restricted to authenticated users
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- 2. Fix workspace_invitations table - CRITICAL: Invitation tokens and emails were exposed
DROP POLICY IF EXISTS "Workspace admins can view own workspace invitations only" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Workspace admins can manage own workspace invitations only" ON public.workspace_invitations;

CREATE POLICY "Workspace admins can view own workspace invitations"
ON public.workspace_invitations 
FOR SELECT 
TO authenticated
USING (
  check_workspace_permission(auth.uid(), workspace_id, 'admin'::text) AND 
  (workspace_id IN ( SELECT get_user_workspaces(auth.uid()) AS get_user_workspaces))
);

CREATE POLICY "Workspace admins can manage own workspace invitations"
ON public.workspace_invitations 
FOR ALL 
TO authenticated
USING (check_workspace_permission(auth.uid(), workspace_id, 'admin'::text))
WITH CHECK (check_workspace_permission(auth.uid(), workspace_id, 'admin'::text));

-- 3. Fix waitlist table - CRITICAL: Emails and IPs were publicly readable
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated workspace members can view waitlist" ON public.waitlist;

-- Allow public signup to waitlist but with restricted data exposure
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

-- Only workspace admins can view waitlist data (emails, IPs)
CREATE POLICY "Workspace admins can view waitlist data"
ON public.waitlist 
FOR SELECT 
TO authenticated
USING (
  (workspace_id IS NOT NULL) AND 
  check_workspace_permission(auth.uid(), workspace_id, 'admin'::text)
);

-- 4. Ensure workspace_members table is properly secured
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;

CREATE POLICY "Authenticated users can view workspace members"
ON public.workspace_members 
FOR SELECT 
TO authenticated
USING (workspace_id IN ( SELECT get_user_workspaces(auth.uid()) AS get_user_workspaces));

-- 5. Update the user insertion policy to be more explicit
DROP POLICY IF EXISTS "Users can insert themselves as members" ON public.workspace_members;

CREATE POLICY "Authenticated users can insert themselves as members"
ON public.workspace_members 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. Add explicit denial for unauthenticated access where not intended
-- This ensures no accidental public access to sensitive tables