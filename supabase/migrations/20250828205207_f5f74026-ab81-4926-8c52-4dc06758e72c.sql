-- Fix function search path security issues
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';