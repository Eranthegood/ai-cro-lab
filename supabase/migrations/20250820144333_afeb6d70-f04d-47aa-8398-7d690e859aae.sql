-- Create knowledge vault cache table for intelligent caching
CREATE TABLE public.knowledge_vault_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  file_id UUID NOT NULL,
  file_hash TEXT NOT NULL,
  parsed_content JSONB NOT NULL DEFAULT '{}',
  context_size INTEGER NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(workspace_id, file_id, file_hash)
);

-- Enable RLS
ALTER TABLE public.knowledge_vault_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for cache access
CREATE POLICY "Cache access for workspace members only" 
ON public.knowledge_vault_cache 
FOR ALL 
USING (check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- Add index for performance
CREATE INDEX idx_vault_cache_workspace_file ON public.knowledge_vault_cache(workspace_id, file_id);
CREATE INDEX idx_vault_cache_hash ON public.knowledge_vault_cache(file_hash);
CREATE INDEX idx_vault_cache_last_accessed ON public.knowledge_vault_cache(last_accessed);

-- Add trigger for updated_at
CREATE TRIGGER update_vault_cache_updated_at
  BEFORE UPDATE ON public.knowledge_vault_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to clean old cache entries (older than 7 days)
CREATE OR REPLACE FUNCTION public.clean_vault_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.knowledge_vault_cache 
  WHERE last_accessed < now() - interval '7 days';
END;
$$;