-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace members junction table with roles
CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create contentsquare_data table compartmented by workspace
CREATE TABLE public.contentsquare_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  analysis_results JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ab_tests table compartmented by workspace
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hypothesis TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'deployed', 'completed', 'archived')),
  framework TEXT DEFAULT 'react' CHECK (framework IN ('react', 'vue', 'html', 'angular')),
  code_generated TEXT,
  metrics JSONB DEFAULT '{}',
  business_impact JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge_base table compartmented by workspace
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('design_system', 'business_doc', 'user_research', 'tech_doc')),
  name TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_invitations table
CREATE TABLE public.workspace_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contentsquare_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_workspaces(user_uuid UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT workspace_id 
  FROM public.workspace_members 
  WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.check_workspace_permission(user_uuid UUID, workspace_uuid UUID, required_role TEXT DEFAULT 'viewer')
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.workspace_members wm
    WHERE wm.user_id = user_uuid 
    AND wm.workspace_id = workspace_uuid
    AND (
      CASE required_role
        WHEN 'owner' THEN wm.role = 'owner'
        WHEN 'admin' THEN wm.role IN ('owner', 'admin')
        WHEN 'member' THEN wm.role IN ('owner', 'admin', 'member')
        WHEN 'viewer' THEN wm.role IN ('owner', 'admin', 'member', 'viewer')
        ELSE false
      END
    )
  );
$$;

-- RLS Policies for workspaces
CREATE POLICY "Users can view their workspaces"
ON public.workspaces FOR SELECT
USING (id IN (SELECT public.get_user_workspaces(auth.uid())));

CREATE POLICY "Users can update workspaces where they are owner/admin"
ON public.workspaces FOR UPDATE
USING (public.check_workspace_permission(auth.uid(), id, 'admin'));

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- RLS Policies for workspace_members
CREATE POLICY "Users can view members of their workspaces"
ON public.workspace_members FOR SELECT
USING (workspace_id IN (SELECT public.get_user_workspaces(auth.uid())));

CREATE POLICY "Admins can manage workspace members"
ON public.workspace_members FOR ALL
USING (public.check_workspace_permission(auth.uid(), workspace_id, 'admin'));

CREATE POLICY "Users can insert themselves as members"
ON public.workspace_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for contentsquare_data
CREATE POLICY "Users can view data from their workspaces"
ON public.contentsquare_data FOR SELECT
USING (public.check_workspace_permission(auth.uid(), workspace_id, 'viewer'));

CREATE POLICY "Members can manage data in their workspaces"
ON public.contentsquare_data FOR ALL
USING (public.check_workspace_permission(auth.uid(), workspace_id, 'member'))
WITH CHECK (public.check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- RLS Policies for ab_tests
CREATE POLICY "Users can view tests from their workspaces"
ON public.ab_tests FOR SELECT
USING (public.check_workspace_permission(auth.uid(), workspace_id, 'viewer'));

CREATE POLICY "Members can manage tests in their workspaces"
ON public.ab_tests FOR ALL
USING (public.check_workspace_permission(auth.uid(), workspace_id, 'member'))
WITH CHECK (public.check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- RLS Policies for knowledge_base
CREATE POLICY "Users can view knowledge base from their workspaces"
ON public.knowledge_base FOR SELECT
USING (public.check_workspace_permission(auth.uid(), workspace_id, 'viewer'));

CREATE POLICY "Members can manage knowledge base in their workspaces"
ON public.knowledge_base FOR ALL
USING (public.check_workspace_permission(auth.uid(), workspace_id, 'member'))
WITH CHECK (public.check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- RLS Policies for workspace_invitations
CREATE POLICY "Admins can view invitations for their workspaces"
ON public.workspace_invitations FOR SELECT
USING (public.check_workspace_permission(auth.uid(), workspace_id, 'admin'));

CREATE POLICY "Admins can manage invitations for their workspaces"
ON public.workspace_invitations FOR ALL
USING (public.check_workspace_permission(auth.uid(), workspace_id, 'admin'));

-- Function to create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  workspace_uuid UUID;
  workspace_slug TEXT;
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  -- Create default workspace for new user
  workspace_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
  
  -- Make sure slug is unique
  IF EXISTS (SELECT 1 FROM public.workspaces WHERE slug = workspace_slug) THEN
    workspace_slug := workspace_slug || '-' || substring(NEW.id::text from 1 for 8);
  END IF;

  INSERT INTO public.workspaces (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace',
    workspace_slug
  )
  RETURNING id INTO workspace_uuid;

  -- Add user as owner of the workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (workspace_uuid, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

-- Trigger to handle new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();