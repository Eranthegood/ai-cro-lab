-- Fix security vulnerability: Remove public access to waitlist emails
-- Only authenticated workspace members can view waitlist entries

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Workspace members can view waitlist" ON public.waitlist;

-- Create a secure SELECT policy that requires authentication and workspace permissions
CREATE POLICY "Authenticated workspace members can view waitlist"
ON public.waitlist
FOR SELECT
TO authenticated
USING (
  workspace_id IS NOT NULL AND 
  check_workspace_permission(auth.uid(), workspace_id, 'viewer'::text)
);

-- Keep the INSERT policy unchanged so anyone can still join the waitlist
-- This policy already exists and is secure:
-- "Anyone can join waitlist" FOR INSERT WITH CHECK (true)