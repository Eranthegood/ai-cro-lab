-- Fix security issue: Add explicit restrictive RLS policies for audit table
-- This ensures audit logs cannot be tampered with by unauthorized users

-- Add explicit restrictive policies to deny INSERT/UPDATE/DELETE operations
-- Only system functions (SECURITY DEFINER) should be able to insert audit records

-- Deny INSERT for all users (only system functions with SECURITY DEFINER can insert)
CREATE POLICY "Deny direct INSERT into audit logs" 
ON public.knowledge_vault_audit 
FOR INSERT 
WITH CHECK (false);

-- Deny UPDATE for all users (audit logs should be immutable)
CREATE POLICY "Deny UPDATE of audit logs" 
ON public.knowledge_vault_audit 
FOR UPDATE 
USING (false);

-- Deny DELETE for all users (audit logs should be permanent)
CREATE POLICY "Deny DELETE of audit logs" 
ON public.knowledge_vault_audit 
FOR DELETE 
USING (false);

-- Add comment to document the security approach
COMMENT ON TABLE public.knowledge_vault_audit IS 'Audit log table with restrictive RLS policies. Only SECURITY DEFINER functions can insert records. Users cannot directly modify audit data to maintain integrity.';

-- Ensure the audit function works correctly by verifying it's SECURITY DEFINER
-- The existing log_knowledge_vault_action function bypasses RLS due to SECURITY DEFINER
-- This is the correct approach for audit logging