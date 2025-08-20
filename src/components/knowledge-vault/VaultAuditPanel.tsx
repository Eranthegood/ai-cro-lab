import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, FileText, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";

interface ParsedFile {
  id: string;
  file_name: string;
  file_type: string;
  config_section: string;
  parsing_status: 'pending' | 'processing' | 'success' | 'error';
  parsing_error?: string;
  token_count: number;
  parsed_at?: string;
  content_type?: string;
  columns_metadata?: any;
  summary?: string;
}

export function VaultAuditPanel() {
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();

  const fetchParsedFiles = async () => {
    if (!currentWorkspace?.id) return;

    try {
      const { data, error } = await supabase
        .from('knowledge_vault_files')
        .select(`
          id,
          file_name,
          file_type,
          config_section,
          is_processed,
          knowledge_vault_parsed_content (
            parsing_status,
            parsing_error,
            token_count,
            parsed_at,
            content_type,
            columns_metadata,
            summary
          )
        `)
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedFiles = data.map(file => ({
        id: file.id,
        file_name: file.file_name,
        file_type: file.file_type,
        config_section: file.config_section,
        parsing_status: file.knowledge_vault_parsed_content?.[0]?.parsing_status || 
                       (file.is_processed ? 'success' : 'pending'),
        parsing_error: file.knowledge_vault_parsed_content?.[0]?.parsing_error,
        token_count: file.knowledge_vault_parsed_content?.[0]?.token_count || 0,
        parsed_at: file.knowledge_vault_parsed_content?.[0]?.parsed_at,
        content_type: file.knowledge_vault_parsed_content?.[0]?.content_type,
        columns_metadata: file.knowledge_vault_parsed_content?.[0]?.columns_metadata,
        summary: file.knowledge_vault_parsed_content?.[0]?.summary
      }));

      setFiles(processedFiles);
    } catch (error: any) {
      console.error('Error fetching parsed files:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch parsed files"
      });
    } finally {
      setLoading(false);
    }
  };

  const migrateAllFiles = async () => {
    if (!currentWorkspace?.id) return;
    
    setMigrating(true);
    const unparsedFiles = files.filter(f => f.parsing_status === 'pending');
    
    try {
      toast({
        title: "Migration started",
        description: `Parsing ${unparsedFiles.length} files...`
      });

      // Parse files in batches of 3 to avoid overwhelming the system
      for (let i = 0; i < unparsedFiles.length; i += 3) {
        const batch = unparsedFiles.slice(i, i + 3);
        
        await Promise.all(
          batch.map(async (file) => {
            try {
              const { error } = await supabase.functions.invoke('parse-vault-file', {
                body: {
                  fileId: file.id,
                  workspaceId: currentWorkspace.id
                }
              });
              
              if (error) {
                console.error(`Error parsing ${file.file_name}:`, error);
              }
            } catch (err) {
              console.error(`Failed to parse ${file.file_name}:`, err);
            }
          })
        );
        
        // Wait 2 seconds between batches
        if (i + 3 < unparsedFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      toast({
        title: "Migration completed",
        description: "All files have been processed"
      });
      
      // Refresh the list
      await fetchParsedFiles();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Migration failed",
        description: error.message
      });
    } finally {
      setMigrating(false);
    }
  };

  const reparseFile = async (fileId: string, fileName: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const { error } = await supabase.functions.invoke('parse-vault-file', {
        body: {
          fileId,
          workspaceId: currentWorkspace.id
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Re-parsing started",
        description: `${fileName} is being re-parsed`
      });
      
      // Refresh after a delay
      setTimeout(() => fetchParsedFiles(), 3000);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Re-parsing failed",
        description: error.message
      });
    }
  };

  useEffect(() => {
    fetchParsedFiles();
  }, [currentWorkspace?.id]);

  const statusStats = files.reduce((acc, file) => {
    acc[file.parsing_status] = (acc[file.parsing_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTokens = files.reduce((sum, file) => sum + file.token_count, 0);
  const successRate = files.length > 0 ? Math.round((statusStats.success || 0) / files.length * 100) : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vault Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Vault Audit & Processing
        </CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{files.length}</div>
            <div className="text-sm text-muted-foreground">Total Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{statusStats.success || 0}</div>
            <div className="text-sm text-muted-foreground">Parsed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{statusStats.pending || 0}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{Math.round(totalTokens / 1000)}k</div>
            <div className="text-sm text-muted-foreground">Tokens</div>
          </div>
        </div>
        <Progress value={successRate} className="mt-2" />
        <div className="text-sm text-muted-foreground mt-1">{successRate}% processed</div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={fetchParsedFiles}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          {(statusStats.pending || 0) > 0 && (
            <Button
              onClick={migrateAllFiles}
              disabled={migrating}
              className="gap-2"
            >
              {migrating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Parse All ({statusStats.pending || 0} files)
            </Button>
          )}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{file.file_name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {file.config_section}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {file.parsing_status === 'success' && <CheckCircle className="h-3 w-3 text-success" />}
                    {file.parsing_status === 'error' && <XCircle className="h-3 w-3 text-destructive" />}
                    {file.parsing_status === 'pending' && <Clock className="h-3 w-3 text-warning" />}
                    <span className="capitalize">{file.parsing_status}</span>
                  </div>
                  
                  {file.token_count > 0 && (
                    <span>{file.token_count} tokens</span>
                  )}
                  
                  {file.content_type && (
                    <Badge variant="outline" className="text-xs">
                      {file.content_type}
                    </Badge>
                  )}
                </div>
                
                {file.summary && (
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {file.summary}
                  </div>
                )}
                
                {file.parsing_error && (
                  <div className="text-xs text-destructive mt-1">
                    Error: {file.parsing_error}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {(file.parsing_status === 'error' || file.parsing_status === 'pending') && (
                  <Button
                    onClick={() => reparseFile(file.id, file.file_name)}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}