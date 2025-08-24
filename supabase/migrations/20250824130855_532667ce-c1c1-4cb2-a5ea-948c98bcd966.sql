-- Create waitlist table for email collection
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  workspace_id UUID REFERENCES public.workspaces(id),
  user_agent TEXT,
  ip_address INET
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert their email (public waitlist)
CREATE POLICY "Anyone can join waitlist" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

-- Create policy for workspace members to view waitlist entries
CREATE POLICY "Workspace members can view waitlist" 
ON public.waitlist 
FOR SELECT 
USING (
  workspace_id IS NULL OR 
  check_workspace_permission(auth.uid(), workspace_id, 'viewer')
);

-- Create index for faster email lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);