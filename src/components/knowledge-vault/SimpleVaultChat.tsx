import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Brain, Loader2, File, Upload, X, Files } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
      console.log('📝 Stream update received:', { messageId, contentLength: content?.length });
      updateMessage(messageId, { content, isStreaming: true });
    };

    const handleStreamComplete = (event: CustomEvent) => {
      const { messageId } = event.detail;
      console.log('✅ Stream completed for message:', messageId);
      updateMessage(messageId, { isStreaming: false });
      setLoading(false);
      
      // Show success toast
      toast({
        title: "Analyse terminée",
        description: "Votre réponse est prête !",
      });
    };

    const handleStreamError = (event: CustomEvent) => {
      const { messageId, error } = event.detail;
      console.error('❌ Stream error:', { messageId, error });
      updateMessage(messageId, { 
        content: "⚠️ **Erreur technique**\n\nProblème temporaire. Vérifiez votre connexion et réessayez.", 
        isStreaming: false 
      });
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de recevoir la réponse. Réessayez dans un moment.",
      });
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

  const handleSendMessage = async (retryCount = 0) => {
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
    console.log('💬 User message added:', userMessageId);

    const messageContent = input.trim();
    setInput('');
    setLoading(true);
    
    // Add streaming placeholder with slight delay to ensure unique ID
    await new Promise(resolve => setTimeout(resolve, 10));
    const streamingMessageId = addMessage({
      type: 'assistant',
      content: '',
      isStreaming: true
    });
    console.log('🤖 Assistant message placeholder created:', streamingMessageId);
    
    // Show processing toast
    toast({
      title: "Analyse en cours...",
      description: "Claude analyse vos données et ses connaissances...",
    });

    try {
      // Call simple-vault-chat edge function directly with SSE
      const { data, error } = await supabase.functions.invoke('simple-vault-chat', {
        body: {
          message: messageContent,
          workspaceId: currentWorkspace.id,
          projectId: currentProject?.id,
          userId: user.id
        }
      });

      if (error) {
        console.error('📡 Supabase function error:', error);
        throw new Error(error.message || 'Erreur de connexion');
      }

      // Handle successful response
      console.log('✅ Function response received:', { dataType: typeof data, hasData: !!data });
      
      if (data?.error) {
        throw new Error(data.error);
      }

      // For non-streaming response, update message directly
      if (data && typeof data === 'object' && data.content) {
        updateMessage(streamingMessageId, {
          content: data.content,
          isStreaming: false
        });
        setLoading(false);
        toast({
          title: "Réponse prête !",
          description: "Claude a analysé votre demande.",
        });
      } else {
        // This shouldn't happen with current setup, but fallback
        throw new Error('Réponse inattendue du serveur');
      }

    } catch (error: any) {
      console.error('🚨 Error in handleSendMessage:', error);
      
      // Retry logic for network errors
      if (retryCount < 2 && (error.message?.includes('network') || error.message?.includes('timeout'))) {
        console.log(`🔄 Retrying request (attempt ${retryCount + 1}/3)`);
        toast({
          title: "Reconnexion...",
          description: `Tentative ${retryCount + 1}/3`,
        });
        
        setTimeout(() => {
          // Restore input and retry
          setInput(messageContent);
          setLoading(false);
          // Remove the failed streaming message
          // Note: In a real implementation, we'd need a way to remove messages
          handleSendMessage(retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
      
      updateMessage(streamingMessageId, {
        content: `⚠️ **Erreur technique**\n\n${error.message || 'Problème temporaire. Vérifiez votre connexion et réessayez.'}`,
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

  // Mobile Layout with Tabs
  if (isMobile) {
    return (
      <div className={cn("h-[calc(100vh-8rem)] flex flex-col", className)}>
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Files className="h-4 w-4" />
              Fichiers ({files.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col mt-2">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  Knowledge Vault
                </CardTitle>
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
                            "rounded-lg px-4 py-3 max-w-[90%] break-words",
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
                          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg px-4 py-3 max-w-[90%]">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Claude analyse...</span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="w-full bg-muted rounded-full h-1.5">
                                  <div className="bg-gradient-to-r from-primary to-primary/80 h-1.5 rounded-full transition-all duration-1000 animate-pulse" style={{width: '60%'}}></div>
                                </div>
                              </div>

                              <div className="bg-background/50 rounded-md p-2 border border-border/50">
                                <p className="text-xs text-muted-foreground">
                                  💡 Vous pouvez consulter vos fichiers pendant l'analyse
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
                    placeholder="Posez votre question..."
                    className="min-h-[60px] resize-none text-sm"
                    disabled={loading}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || loading || !currentWorkspace}
                    className="px-3 self-end"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="files" className="flex-1 mt-2">
            <Card className="h-full">
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
                
                <ScrollArea className="h-[calc(100vh-16rem)]">
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
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop Layout
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
              onClick={() => handleSendMessage()}
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