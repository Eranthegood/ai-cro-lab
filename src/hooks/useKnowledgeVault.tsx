import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';
import { toast } from '@/hooks/use-toast';

export interface KnowledgeVaultConfig {
  id?: string;
  workspace_id: string;
  config_section: string;
  config_data: any;
  completion_score: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeVaultFile {
  id?: string;
  workspace_id: string;
  config_section: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  uploaded_by?: string;
  is_processed: boolean;
  upload_metadata?: any;
  created_at?: string;
}

export interface VaultProgress {
  section: string;
  score: number;
  max_score: number;
  completion_percentage: number;
}

export const useKnowledgeVault = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [configurations, setConfigurations] = useState<Record<string, KnowledgeVaultConfig>>({});
  const [progress, setProgress] = useState<VaultProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch vault configurations and progress
  const fetchVaultData = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);

      // Fetch configurations
      const { data: configs, error: configError } = await supabase
        .from('knowledge_vault_config')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      if (configError) throw configError;

      // Convert to record for easier access
      const configRecord: Record<string, KnowledgeVaultConfig> = {};
      configs?.forEach(config => {
        configRecord[config.config_section] = config;
      });
      setConfigurations(configRecord);

      // Fetch progress using the database function
      const { data: progressData, error: progressError } = await supabase
        .rpc('get_knowledge_vault_progress', { p_workspace_id: currentWorkspace.id });

      if (progressError) throw progressError;
      setProgress(progressData || []);

    } catch (error: any) {
      console.error('Error fetching vault data:', error);
      toast({
        variant: "destructive",
        title: "Error loading Knowledge Vault",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  // Update configuration
  const updateConfiguration = useCallback(async (
    section: string,
    configData: any,
    completionScore: number
  ) => {
    if (!currentWorkspace?.id || !user) return { error: new Error('Missing workspace or user') };

    try {
      // Use the RPC function for proper validation and RLS
      const { data, error } = await supabase.rpc('update_knowledge_vault_config', {
        p_workspace_id: currentWorkspace.id,
        p_section: section,
        p_config_data: configData,
        p_completion_score: completionScore
      });

      if (error) throw error;

      toast({
        title: "Configuration saved",
        description: `${section} section updated successfully`,
      });

      // Refresh data
      await fetchVaultData();
      return { error: null, data };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving configuration",
        description: error.message,
      });
      return { error };
    }
  }, [currentWorkspace?.id, user, fetchVaultData]);

  // Upload file to storage
  const uploadFile = useCallback(async (
    file: File,
    section: string,
    metadata?: Record<string, any>
  ): Promise<{ error: any; file?: KnowledgeVaultFile }> => {
    if (!currentWorkspace?.id || !user) return { error: new Error('Missing workspace or user') };

    try {
      setUploading(true);

      // Generate unique file path
      const fileExtension = file.name.split('.').pop();
      const fileName = `${section}/${Date.now()}-${file.name}`;
      const storagePath = `${currentWorkspace.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('knowledge-vault')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Save file record to database
      const fileRecord = {
        workspace_id: currentWorkspace.id,
        config_section: section,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        uploaded_by: user.id,
        is_processed: false,
        upload_metadata: metadata || {}
      };

      const { data, error: dbError } = await supabase
        .from('knowledge_vault_files')
        .insert([fileRecord])
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully`,
      });

      return { error: null, file: data };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
      return { error };
    } finally {
      setUploading(false);
    }
  }, [currentWorkspace?.id, user]);

  // Get uploaded files for a section
  const getFiles = useCallback(async (section?: string) => {
    if (!currentWorkspace?.id) return { error: new Error('Missing workspace'), files: [] };

    try {
      let query = supabase
        .from('knowledge_vault_files')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('config_section', section);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { error: null, files: data || [] };
    } catch (error: any) {
      return { error, files: [] };
    }
  }, [currentWorkspace?.id]);

  // Delete file
  const deleteFile = useCallback(async (fileId: string, storagePath: string) => {
    if (!currentWorkspace?.id) return { error: new Error('Missing workspace') };

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
        .eq('id', fileId)
        .eq('workspace_id', currentWorkspace.id);

      if (dbError) throw dbError;

      toast({
        title: "File deleted",
        description: "File removed successfully",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
      return { error };
    }
  }, [currentWorkspace?.id]);

  // Get download URL for file
  const getFileUrl = useCallback(async (storagePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('knowledge-vault')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) throw error;
      return { error: null, url: data.signedUrl };
    } catch (error: any) {
      return { error, url: null };
    }
  }, []);

  // Calculate total progress
  const totalProgress = progress.reduce((sum, section) => sum + (section.completion_percentage || 0), 0) / 5;

  return {
    configurations,
    progress,
    totalProgress,
    loading,
    uploading,
    updateConfiguration,
    uploadFile,
    getFiles,
    deleteFile,
    getFileUrl,
    refreshVault: fetchVaultData
  };
};