import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Trash2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectConversation {
  id: string;
  title?: string;
  messages: any[];
  created_at: string;
  updated_at: string;
}

interface ProjectHistoryPanelProps {
  projectId: string;
  className?: string;
  onConversationSelect?: (conversation: ProjectConversation) => void;
}

export const ProjectHistoryPanel: React.FC<ProjectHistoryPanelProps> = ({ 
  projectId, 
  className = "",
  onConversationSelect
}) => {
  const [conversations, setConversations] = useState<ProjectConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const fetchConversations = async () => {
    if (!projectId || !currentWorkspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Convert and ensure messages is always an array
      const processedConversations = (data || []).map(conv => ({
        ...conv,
        messages: Array.isArray(conv.messages) ? conv.messages : []
      }));
      
      setConversations(processedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        variant: "destructive",
        title: "Error loading conversations",
        description: "Could not load conversation history",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [projectId, currentWorkspace]);

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('project_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: "Conversation deleted",
        description: "Conversation has been removed from history",
      });

      fetchConversations();
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast({
        variant: "destructive", 
        title: "Delete failed",
        description: error.message || "Could not delete conversation",
      });
    }
  };

  const generateConversationTitle = (messages: any[]) => {
    if (!messages || messages.length === 0) return "Nouvelle conversation";
    
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage && firstUserMessage.content) {
      return firstUserMessage.content.length > 50 
        ? firstUserMessage.content.substring(0, 50) + "..."
        : firstUserMessage.content;
    }
    
    return "Conversation sans titre";
  };

  const getMessageCount = (messages: any[]) => {
    return Array.isArray(messages) ? messages.length : 0;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Historique des conversations
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start chatting to create your first conversation</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onConversationSelect?.(conversation)}
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium truncate">
                      {conversation.title || generateConversationTitle(conversation.messages)}
                    </h4>
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {getMessageCount(conversation.messages)} messages
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      Dernier message il y a{' '}
                      {formatDistanceToNow(new Date(conversation.updated_at), {
                        locale: fr,
                        addSuffix: false
                      })}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};