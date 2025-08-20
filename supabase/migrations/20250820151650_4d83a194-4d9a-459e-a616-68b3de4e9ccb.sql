-- Create table for storing parsed content from knowledge vault files
CREATE TABLE public.knowledge_vault_parsed_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'csv', 'json', 'txt', 'image'
  structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  columns_metadata JSONB DEFAULT '{}'::jsonb, -- For CSV: column names, types, samples
  summary TEXT,
  token_count INTEGER NOT NULL DEFAULT 0,
  parsing_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error'
  parsing_error TEXT,
  parsed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraint
  CONSTRAINT fk_knowledge_vault_parsed_content_file
    FOREIGN KEY (file_id) 
    REFERENCES public.knowledge_vault_files(id) 
    ON DELETE CASCADE,
    
  -- Ensure one parsed content per file
  UNIQUE(file_id)
);

-- Enable RLS
ALTER TABLE public.knowledge_vault_parsed_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Parsed content access for workspace members only" 
ON public.knowledge_vault_parsed_content 
FOR ALL 
USING (check_workspace_permission(auth.uid(), workspace_id, 'member'));

-- Create indexes for performance
CREATE INDEX idx_knowledge_vault_parsed_content_file_id ON public.knowledge_vault_parsed_content(file_id);
CREATE INDEX idx_knowledge_vault_parsed_content_workspace_id ON public.knowledge_vault_parsed_content(workspace_id);
CREATE INDEX idx_knowledge_vault_parsed_content_status ON public.knowledge_vault_parsed_content(parsing_status);

-- Create trigger for updated_at
CREATE TRIGGER update_knowledge_vault_parsed_content_updated_at
  BEFORE UPDATE ON public.knowledge_vault_parsed_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();