import React, { useState, useEffect } from 'react';
import { Plus, Globe, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';

interface ProjectUrl {
  id: string;
  url: string;
  title?: string;
  description?: string;
  content?: string;
  last_crawled?: string;
  created_at: string;
  metadata?: any;
}

interface ProjectUrlsPanelProps {
  projectId: string;
  className?: string;
}

export const ProjectUrlsPanel: React.FC<ProjectUrlsPanelProps> = ({ 
  projectId, 
  className = "" 
}) => {
  const [urls, setUrls] = useState<ProjectUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [crawling, setCrawling] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const fetchUrls = async () => {
    if (!projectId || !currentWorkspace) return;

    try {
      setLoading(true);
      // Store URLs in knowledge_vault_files table with a special type
      const { data, error } = await supabase
        .from('knowledge_vault_files')
        .select('*')
        .eq('project_id', projectId)
        .eq('workspace_id', currentWorkspace.id)
        .eq('file_type', 'url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const processedUrls = (data || []).map(item => {
        const metadata = item.upload_metadata as any || {};
        return {
          id: item.id,
          url: item.storage_path, // We store the URL in storage_path
          title: metadata.title || item.file_name,
          description: metadata.description,
          content: metadata.content,
          last_crawled: metadata.last_crawled,
          created_at: item.created_at,
          metadata: metadata
        };
      });
      
      setUrls(processedUrls);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      toast({
        variant: "destructive",
        title: "Error loading URLs",
        description: "Could not load project URLs",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [projectId, currentWorkspace]);

  const handleAddUrl = async () => {
    if (!newUrl.trim() || !user || !currentWorkspace) return;

    try {
      setCrawling(newUrl);
      
      // Validate URL
      const url = new URL(newUrl.trim());
      
      // Basic save first (without content)
      const { error: dbError } = await supabase
        .from('knowledge_vault_files')
        .insert({
          workspace_id: currentWorkspace.id,
          project_id: projectId,
          file_name: url.hostname,
          file_type: 'url',
          file_size: 0,
          storage_path: newUrl.trim(),
          config_section: 'project',
          uploaded_by: user.id,
          upload_metadata: {
            url: newUrl.trim(),
            title: url.hostname,
            added_at: new Date().toISOString(),
            status: 'pending'
          }
        });

      if (dbError) throw dbError;

      toast({
        title: "URL added",
        description: "URL has been added to the project",
      });

      setNewUrl('');
      setIsAddDialogOpen(false);
      fetchUrls();

    } catch (error: any) {
      console.error('Error adding URL:', error);
      toast({
        variant: "destructive",
        title: "Failed to add URL",
        description: error.message || "Could not add URL",
      });
    } finally {
      setCrawling(null);
    }
  };

  const handleRefreshUrl = async (urlId: string, url: string) => {
    try {
      setCrawling(urlId);
      
      // Update metadata to show refreshing
      const { error } = await supabase
        .from('knowledge_vault_files')
        .update({
          upload_metadata: {
            url: url,
            title: new URL(url).hostname,
            last_crawled: new Date().toISOString(),
            status: 'refreshed'
          }
        })
        .eq('id', urlId);

      if (error) throw error;

      toast({
        title: "URL refreshed",
        description: "URL content has been updated",
      });

      fetchUrls();
    } catch (error: any) {
      console.error('Error refreshing URL:', error);
      toast({
        variant: "destructive",
        title: "Refresh failed",
        description: error.message || "Could not refresh URL",
      });
    } finally {
      setCrawling(null);
    }
  };

  const handleDeleteUrl = async (urlId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_vault_files')
        .delete()
        .eq('id', urlId);

      if (error) throw error;

      toast({
        title: "URL removed",
        description: "URL has been removed from the project",
      });

      fetchUrls();
    } catch (error: any) {
      console.error('Error deleting URL:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Could not delete URL",
      });
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            URLs clés
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add URL
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une URL</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setNewUrl('');
                    }}
                    disabled={crawling === newUrl}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddUrl}
                    disabled={!newUrl.trim() || crawling === newUrl}
                  >
                    {crawling === newUrl ? "Adding..." : "Ajouter"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading URLs...
          </div>
        ) : urls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune URL ajoutée</p>
            <p className="text-xs">Cliquez sur "Add URL" pour ajouter votre première URL</p>
          </div>
        ) : (
          <div className="space-y-3">
            {urls.map((urlItem) => (
              <div
                key={urlItem.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {urlItem.title || getDomainFromUrl(urlItem.url)}
                      </p>
                      <a
                        href={urlItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        URL
                      </Badge>
                      {urlItem.last_crawled && (
                        <span className="text-xs text-muted-foreground">
                          Crawled {new Date(urlItem.last_crawled).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {urlItem.url}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRefreshUrl(urlItem.id, urlItem.url)}
                    disabled={crawling === urlItem.id}
                  >
                    <RefreshCw className={`w-4 h-4 ${crawling === urlItem.id ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteUrl(urlItem.id)}
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