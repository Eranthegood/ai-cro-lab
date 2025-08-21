import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

interface SimpleVaultFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

export const useSimpleVault = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [files, setFiles] = useState<SimpleVaultFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Get all files from workspace (no sections)
  const getFiles = async () => {
    if (!currentWorkspace || !user) return { files: [] };
    
    try {
      const { data, error } = await supabase
        .from('knowledge_vault_files')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { files: data || [] };
    } catch (error: any) {
      console.error('Error fetching files:', error);
      return { files: [] };
    }
  };

  // Upload file (no section needed)
  const uploadFile = async (file: File, metadata?: Record<string, any>) => {
    if (!currentWorkspace || !user) {
      throw new Error('Workspace ou utilisateur manquant');
    }

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${currentWorkspace.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('knowledge-vault')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { data, error: dbError } = await supabase
        .from('knowledge_vault_files')
        .insert({
          workspace_id: currentWorkspace.id,
          config_section: 'repository', // Default section for simple vault
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          upload_metadata: metadata || {},
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Refresh files list
      const { files: updatedFiles } = await getFiles();
      setFiles(updatedFiles);

      toast({
        title: "Fichier uploadé",
        description: `${file.name} a été ajouté au vault`,
      });

      return data;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'upload",
        description: error.message,
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Delete file
  const deleteFile = async (fileId: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('knowledge-vault')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('knowledge_vault_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Refresh files list
      const { files: updatedFiles } = await getFiles();
      setFiles(updatedFiles);

      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  // Load files on mount and workspace change
  useEffect(() => {
    const loadFiles = async () => {
      if (!currentWorkspace) return;
      
      setLoading(true);
      try {
        const { files } = await getFiles();
        setFiles(files);
      } catch (error) {
        console.error('Error loading files:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [currentWorkspace, user]);

  return {
    files,
    loading,
    uploading,
    getFiles,
    uploadFile,
    deleteFile,
  };
};