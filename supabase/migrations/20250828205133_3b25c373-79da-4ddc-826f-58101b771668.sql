-- Fix email harvesting vulnerability by allowing workspace admins to view waitlist
CREATE POLICY "Workspace admins can view waitlist" 
ON public.waitlist
FOR SELECT 
USING (
  workspace_id IS NOT NULL AND 
  check_workspace_permission(auth.uid(), workspace_id, 'admin'::text)
);

-- Add email uniqueness constraint to prevent duplicate submissions
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_unique ON public.waitlist(email);

-- Add expiration validation trigger for workspace invitations
CREATE OR REPLACE FUNCTION public.validate_invitation_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if invitation has expired during access/update
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Invitation has expired and cannot be processed';
  END IF;
  
  -- Ensure invitations expire within reasonable timeframe (7 days max)
  IF NEW.expires_at > now() + interval '7 days' THEN
    NEW.expires_at = now() + interval '7 days';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply expiration validation trigger
CREATE TRIGGER validate_invitation_expiry_trigger
  BEFORE INSERT OR UPDATE ON public.workspace_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_invitation_expiry();

-- Add security audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid,
  p_workspace_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.knowledge_vault_audit (
    workspace_id,
    action,
    resource_type,
    user_id,
    action_metadata
  ) VALUES (
    COALESCE(p_workspace_id, (SELECT id FROM public.workspaces LIMIT 1)),
    p_event_type,
    'security_event',
    p_user_id,
    p_details || jsonb_build_object(
      'timestamp', now(),
      'event_type', p_event_type
    )
  );
END;
$$;

-- Add profile update validation trigger with email verification requirement
CREATE OR REPLACE FUNCTION public.validate_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Log profile updates for security monitoring
  PERFORM log_security_event(
    'profile_update',
    NEW.id,
    NULL,
    jsonb_build_object(
      'changed_fields', 
      CASE 
        WHEN OLD.email != NEW.email THEN jsonb_build_array('email')
        WHEN OLD.full_name != NEW.full_name THEN jsonb_build_array('full_name')
        ELSE jsonb_build_array()
      END
    )
  );
  
  -- Prevent email changes without proper verification (future enhancement)
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    -- For now, just log the change. In production, you'd want email verification
    PERFORM log_security_event(
      'email_change_attempt',
      NEW.id,
      NULL,
      jsonb_build_object('old_email', OLD.email, 'new_email', NEW.email)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply profile validation trigger
CREATE TRIGGER validate_profile_updates_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_updates();

-- Add rate limiting table for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  operation_type text NOT NULL,
  attempts_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, operation_type)
);

-- Enable RLS on rate limits table
ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limits policy - users can only see their own limits
CREATE POLICY "Users can view their own rate limits"
ON public.security_rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_operation_type text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_attempts integer;
  window_start timestamp with time zone;
BEGIN
  -- Get current rate limit record
  SELECT attempts_count, security_rate_limits.window_start
  INTO current_attempts, window_start
  FROM public.security_rate_limits
  WHERE user_id = p_user_id AND operation_type = p_operation_type;
  
  -- If no record exists or window has expired, create/reset
  IF current_attempts IS NULL OR window_start < now() - (p_window_minutes || ' minutes')::interval THEN
    INSERT INTO public.security_rate_limits (user_id, operation_type, attempts_count, window_start)
    VALUES (p_user_id, p_operation_type, 1, now())
    ON CONFLICT (user_id, operation_type)
    DO UPDATE SET
      attempts_count = 1,
      window_start = now(),
      blocked_until = NULL;
    RETURN true;
  END IF;
  
  -- Check if user is blocked
  IF EXISTS (
    SELECT 1 FROM public.security_rate_limits
    WHERE user_id = p_user_id 
    AND operation_type = p_operation_type
    AND blocked_until > now()
  ) THEN
    RETURN false;
  END IF;
  
  -- Increment attempts
  UPDATE public.security_rate_limits
  SET attempts_count = attempts_count + 1,
      blocked_until = CASE 
        WHEN attempts_count >= p_max_attempts THEN now() + (p_window_minutes || ' minutes')::interval
        ELSE NULL
      END
  WHERE user_id = p_user_id AND operation_type = p_operation_type;
  
  -- Return whether request should be allowed
  RETURN current_attempts < p_max_attempts;
END;
$$;