-- Fix storage RLS policy for knowledge-vault bucket to prevent circular dependency
-- Remove existing problematic policies
DROP POLICY IF EXISTS "Knowledge vault files for workspace members only" ON storage.objects;

-- Create new policy that checks workspace membership from the file path
-- Path structure: {workspace_id}/{section}/{filename}
CREATE POLICY "Allow knowledge vault uploads for workspace members"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'knowledge-vault' 
  AND check_workspace_permission(
    auth.uid(), 
    (string_to_array(name, '/'))[1]::uuid, 
    'member'
  )
);

-- Allow workspace members to select/download their files
CREATE POLICY "Allow knowledge vault downloads for workspace members"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'knowledge-vault' 
  AND check_workspace_permission(
    auth.uid(), 
    (string_to_array(name, '/'))[1]::uuid, 
    'member'
  )
);

-- Allow workspace members to delete their files
CREATE POLICY "Allow knowledge vault deletions for workspace members"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'knowledge-vault' 
  AND check_workspace_permission(
    auth.uid(), 
    (string_to_array(name, '/'))[1]::uuid, 
    'member'
  )
);