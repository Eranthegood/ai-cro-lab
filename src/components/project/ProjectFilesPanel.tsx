import React, { useState } from 'react';
import { Upload, FileText, File, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';

interface ProjectFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
  upload_metadata?: any;
}

interface ProjectFilesPanelProps {
  projectId: string;
  className?: string;
}

export const ProjectFilesPanel: React.FC<ProjectFilesPanelProps> = ({ 
  projectId, 
  className = "" 
}) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const fetchFiles = async () => {
    if (!projectId || !currentWorkspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('knowledge_vault_files')
        .select('*')
        .eq('project_id', projectId)
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: "Could not load project files",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFiles();
  }, [projectId, currentWorkspace]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !currentWorkspace) return;

    try {
      setUploading(true);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('knowledge-vault')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('knowledge_vault_files')
        .insert({
          workspace_id: currentWorkspace.id,
          project_id: projectId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: fileName,
          config_section: 'project',
          uploaded_by: user.id,
          upload_metadata: {
            original_name: file.name,
            size: file.size,
            type: file.type
          }
        });

      if (dbError) throw dbError;

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });

      fetchFiles();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Could not upload file",
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
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

      toast({
        title: "File deleted",
        description: "File has been removed from the project",
      });

      fetchFiles();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Could not delete file",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (fileType.includes('text')) return <FileText className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);
  const maxSize = 100 * 1024 * 1024; // 100MB limit
  const usagePercentage = (totalSize / maxSize) * 100;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Fichiers</CardTitle>
          <Button
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Add'}
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{Math.round(usagePercentage)}% de la capacité du projet utilisée</span>
            <span>{formatFileSize(totalSize)} / {formatFileSize(maxSize)}</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.txt,.doc,.docx,.md"
        />

        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading files...
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files uploaded yet</p>
            <p className="text-xs">Click "Add" to upload your first file</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.file_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-2 py-0"
                      >
                        {file.file_type.includes('pdf') ? 'PDF' : 'TEXT'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteFile(file.id, file.storage_path)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};