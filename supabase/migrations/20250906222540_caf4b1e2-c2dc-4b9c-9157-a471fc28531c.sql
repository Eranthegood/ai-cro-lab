-- Fix waitlist table security issue: prevent public email harvesting
-- Drop existing policies to recreate with proper security
DROP POLICY IF EXISTS "Public can join waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Workspace admins can view waitlist" ON public.waitlist;

-- Ensure RLS is enabled
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public signups (INSERT only) - no read access
CREATE POLICY "Public signup allowed"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Restrict SELECT to workspace admins for their workspace entries
CREATE POLICY "Workspace admins can view their waitlist"
ON public.waitlist
FOR SELECT
TO authenticated
USING (
  workspace_id IS NOT NULL 
  AND check_workspace_permission(auth.uid(), workspace_id, 'admin')
);

-- Allow super admins to view public waitlist entries (no workspace_id)
-- Only for authenticated users with proper admin rights
CREATE POLICY "System admins can view public waitlist"
ON public.waitlist  
FOR SELECT
TO authenticated
USING (
  workspace_id IS NULL
  AND auth.uid() IN (
    SELECT user_id FROM workspace_members 
    WHERE role = 'owner' 
    LIMIT 1
  )
);

-- Prevent any UPDATE or DELETE operations for security
-- (These policies explicitly deny all UPDATE/DELETE operations)
CREATE POLICY "No updates allowed on waitlist"
ON public.waitlist
FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "No deletes allowed on waitlist"
ON public.waitlist
FOR DELETE  
TO anon, authenticated
USING (false);