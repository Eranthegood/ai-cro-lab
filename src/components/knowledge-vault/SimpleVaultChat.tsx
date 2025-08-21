import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Brain, Loader2, File, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProjects } from '@/hooks/useProjects';
import { useSimpleVault } from '@/hooks/useSimpleVault';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProjectSelector } from '@/components/project/ProjectSelector';
import { useNotifications } from '@/context/NotificationContext';
import { useRateLimit } from '@/hooks/useRateLimit';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface SimpleVaultChatProps {
  className?: string;
}

export const SimpleVaultChat = ({ className }: SimpleVaultChatProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { currentProject } = useProjects();
  const { files, uploading, uploadFile, deleteFile } = useSimpleVault();
  const { startBackgroundTask, startPersistentStream } = useNotifications();
  const { canMakeRequest, incrementCount } = useRateLimit();
  const { 
    messages, 
    addMessage, 
    updateMessage, 
    currentConversation, 
    createConversation, 
    setCurrentConversation 
  } = useChat();
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Create conversation if none exists for current workspace
  useEffect(() => {
    if (currentWorkspace && !currentConversation) {
      const conversationId = createConversation(currentWorkspace.id, currentProject?.id);
      setCurrentConversation(conversationId);
    }
  }, [currentWorkspace, currentProject, currentConversation, createConversation, setCurrentConversation]);

  // Listen for persistent stream updates
  useEffect(() => {
    const handleStreamUpdate = (event: CustomEvent) => {
      const { messageId, content } = event.detail;
      updateMessage(messageId, { content, isStreaming: true });
    };

    const handleStreamComplete = (event: CustomEvent) => {
      const { messageId, content } = event.detail;
      updateMessage(messageId, { content, isStreaming: false });
      setLoading(false);
    };

    const handleStreamError = (event: CustomEvent) => {
      const { messageId, error } = event.detail;
      updateMessage(messageId, { 
        content: "⚠️ **Erreur technique**\n\nProblème temporaire. Vérifiez votre connexion et réessayez.", 
        isStreaming: false 
      });
      setLoading(false);
    };

    window.addEventListener('chatStreamUpdate', handleStreamUpdate as EventListener);
    window.addEventListener('chatStreamComplete', handleStreamComplete as EventListener);
    window.addEventListener('chatStreamError', handleStreamError as EventListener);

    return () => {
      window.removeEventListener('chatStreamUpdate', handleStreamUpdate as EventListener);
      window.removeEventListener('chatStreamComplete', handleStreamComplete as EventListener);
      window.removeEventListener('chatStreamError', handleStreamError as EventListener);
    };
  }, [updateMessage]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user || !currentWorkspace || loading || !currentConversation) return;

    // Check rate limit before proceeding
    if (!canMakeRequest()) {
      toast({
        title: "Limite quotidienne atteinte",
        description: "Vous avez atteint votre limite de 50 interactions par jour. Passez au plan premium pour un accès illimité.",
        variant: "destructive",
      });
      return;
    }

    // Increment rate limit counter
    if (!incrementCount()) {
      toast({
        title: "Erreur",
        description: "Impossible d'incrémenter le compteur d'interactions.",
        variant: "destructive",
      });
      return;
    }

    // Add user message to conversation
    const userMessageId = addMessage({
      type: 'user',
      content: input.trim()
    });

    const messageContent = input.trim();
    setInput('');
    setLoading(true);
    
    // Add streaming placeholder
    const streamingMessageId = addMessage({
      type: 'assistant',
      content: '',
      isStreaming: true
    });

    // Start background task for navigation
    const taskId = `analysis-${Date.now()}`;
    startBackgroundTask({
      id: taskId,
      type: 'vault-analysis',
      title: 'Analyse Knowledge Vault',
      status: 'processing'
    });

    try {
      // Start persistent stream that will continue even after navigation
      await startPersistentStream({
        taskId,
        message: messageContent,
        workspaceId: currentWorkspace.id,
        projectId: currentProject?.id,
        userId: user.id,
        conversationId: currentConversation.id,
        messageId: streamingMessageId
      });

    } catch (error: any) {
      console.error('Error starting persistent stream:', error);
      
      updateMessage(streamingMessageId, {
        content: "⚠️ **Erreur technique**\n\nProblème temporaire. Vérifiez votre connexion et réessayez.",
        isStreaming: false
      });

      toast({
        variant: "destructive",
        title: "Erreur d'analyse",
        description: error.message || "Impossible d'analyser les fichiers",
      });
      
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    for (const file of Array.from(selectedFiles)) {
      try {
        await uploadFile(file);
      } catch (error: any) {
        console.error('Upload failed:', error);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("h-[700px] flex gap-4", className)}>
      {/* Main Chat Interface */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              Knowledge Vault Simple
            </CardTitle>
          </div>
          <ProjectSelector />
        </CardHeader>

        <CardContent className="flex flex-col flex-1 p-4 gap-4">
          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-3 max-w-[85%] break-words",
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.type === 'system'
                        ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-foreground border border-primary/20'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && messages[messages.length - 1]?.type !== 'assistant' && (
                <div className="space-y-3">
                  <div className="flex gap-3 justify-start">
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg px-4 py-3 max-w-[85%]">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">Claude analyse vos documents...</span>
                        </div>
                        
                        {/* Progress indicator */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Progression</span>
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-primary to-primary/80 h-1.5 rounded-full transition-all duration-1000 animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        </div>

                        {/* Navigation reminder */}
                        <div className="bg-background/50 rounded-md p-2 border border-border/50">
                          <p className="text-xs text-muted-foreground">
                            💡 <span className="font-medium">Tip:</span> Vous pouvez naviguer ailleurs pendant l'analyse. 
                            Vous recevrez une notification quand c'est prêt !
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {!currentWorkspace && (
            <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Sélectionnez un workspace pour commencer
              </p>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question sur vos fichiers..."
              className="min-h-[80px] resize-none"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading || !currentWorkspace}
              className="px-3 self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files Sidebar */}
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            Fichiers ({files.length})
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.csv,.txt,.json,.png,.jpg,.jpeg"
          />
          
          {uploading && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Upload en cours...</span>
            </div>
          )}
          
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <File className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" title={file.file_name}>
                        {file.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(file.id, file.storage_path)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {files.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun fichier</p>
                  <p className="text-xs">Cliquez sur Upload pour commencer</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};