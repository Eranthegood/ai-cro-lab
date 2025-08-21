import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Loader2, Sparkles, Archive, Zap, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProjectSelector } from '@/components/project/ProjectSelector';
import { SaveToVaultModal } from '@/components/project/SaveToVaultModal';
import { DataExplorationPanel } from './DataExplorationPanel';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: any;
}

interface StreamingChatInterfaceProps {
  className?: string;
}

export const StreamingChatInterface = ({ className }: StreamingChatInterfaceProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { currentProject } = useProjects();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: '🚀 **Knowledge Vault Intelligence activée**\n\nJe suis Claude, votre assistant IA connecté à votre Knowledge Vault. Je peux maintenant :\n\n• **Analyser vos données en temps réel** - CVR, traffic, conversions\n• **Parser automatiquement vos fichiers** - CSV, JSON, documents\n• **Générer des insights actionnables** - Tendances, optimisations, prédictions\n• **Adapter mon analyse à vos questions** - Context intelligent et données pertinentes\n\nVotre vault contient des données précieuses. Que souhaitez-vous analyser ?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user || !currentWorkspace || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Add streaming placeholder
    const streamingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };
    setMessages([...newMessages, streamingMessage]);

    try {
      // ========== PHASE 3: STREAMING RÉEL CÔTÉ CLIENT ==========
      const response = await fetch(`https://wtpmxuhkbwwiougblkki.supabase.co/functions/v1/knowledge-vault-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG14dWhrYnd3aW91Z2Jsa2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDk5NDMsImV4cCI6MjA3MTEyNTk0M30.aAHUQ-8vLmfOL9st7EGjC_SDD7kuzyqJx6ZiiY1Rw2A`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          workspaceId: currentWorkspace.id,
          projectId: currentProject?.id || null,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          throw new Error(`Limite quotidienne atteinte. ${errorData.error || 'Revenez demain ou passez en premium.'}`);
        }
        
        throw new Error(errorData.error || 'Erreur de communication');
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        if (!reader) throw new Error('No stream available');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'content') {
                  accumulatedContent += data.content;
                  
                  // Update streaming message in real-time
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === streamingMessage.id 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                } else if (data.type === 'done') {
                  // Finalize message
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === streamingMessage.id 
                        ? { 
                            ...msg, 
                            content: accumulatedContent, 
                            isStreaming: false,
                            metadata: { usage: data.usage }
                          }
                        : msg
                    )
                  );
                  
                  toast({
                    title: "Analyse terminée",
                    description: "Claude a analysé votre Knowledge Vault avec succès",
                  });
                  
                  return; // Exit the function
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } else {
        // Fallback to regular JSON response for compatibility
        const data = await response.json();
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingMessage.id 
              ? { 
                  ...msg, 
                  content: data.response, 
                  isStreaming: false,
                  metadata: { usage: data.usage }
                }
              : msg
          )
        );

        toast({
          title: "Analyse terminée",
          description: "Claude a analysé votre Knowledge Vault avec succès",
        });
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === streamingMessage.id 
            ? { 
                ...msg, 
                content: "⚠️ **Erreur technique**\n\nJe rencontre un problème temporaire. Vérifiez que :\n• Votre workspace est bien configuré\n• Vos fichiers sont accessibles\n• Votre connexion est stable\n\nRéessayez dans quelques instants.", 
                isStreaming: false 
              }
            : msg
        )
      );

      toast({
        variant: "destructive",
        title: "Erreur d'analyse",
        description: error.message || "Impossible d'analyser la Knowledge Vault",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuerySuggestion = (query: string) => {
    setInput(query);
    setActiveTab('chat'); // Switch back to chat when selecting a suggestion
  };

  const smartSuggestions = [
    {
      category: "Analyse CVR",
      queries: [
        "Quel est le CVR d'hier ?",
        "Compare le CVR web vs app sur 7 jours",
        "Tendance CVR des 2 dernières semaines"
      ]
    },
    {
      category: "Performance",
      queries: [
        "Identifie les pics de conversion",
        "Analyse l'impact du traffic sur le CVR",
        "Recommandations d'optimisation"
      ]
    },
    {
      category: "Insights Business",
      queries: [
        "Points de friction dans le funnel",
        "Opportunités d'amélioration CRO",
        "Benchmark vs objectifs"
      ]
    }
  ];

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
              Knowledge Vault Intelligence
              <Badge variant="secondary" className="ml-2">
                <Zap className="h-3 w-3 mr-1" />
                Smart Context
              </Badge>
            </CardTitle>
          </div>
          <div className="flex items-center justify-between">
            <ProjectSelector />
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              <span>Parsing intelligent activé</span>
            </div>
          </div>
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
                      
                      {message.type === 'assistant' && !message.isStreaming && currentProject && (
                        <div className="flex items-center gap-2">
                          {message.metadata?.usage && (
                            <span className="text-xs opacity-60">
                              {message.metadata.usage.input_tokens + message.metadata.usage.output_tokens} tokens
                            </span>
                          )}
                          <SaveToVaultModal 
                            content={message.content}
                            messageContext={{
                              messageId: message.id,
                              timestamp: message.timestamp,
                              projectId: currentProject.id
                            }}
                          >
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
                              <Archive className="h-3 w-3" />
                            </Button>
                          </SaveToVaultModal>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && messages[messages.length - 1]?.type !== 'assistant' && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyse intelligente en cours...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Smart Suggestions */}
          {messages.length <= 1 && currentWorkspace && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium">✨ Suggestions intelligentes :</p>
              <div className="grid gap-3">
                {smartSuggestions.map((category, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">{category.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.queries.map((query, queryIdx) => (
                        <Button
                          key={queryIdx}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-2 px-3 hover:bg-primary/10 hover:border-primary/20"
                          onClick={() => setInput(query)}
                          disabled={loading}
                        >
                          {query}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!currentWorkspace && (
            <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Sélectionnez un workspace pour utiliser l'Intelligence Collective
              </p>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question à l'Intelligence Collective..."
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

          <div className="text-xs text-muted-foreground">
            🧠 Context intelligent • 📊 Parsing automatique • ⚡ Réponses en temps réel
          </div>
        </CardContent>
      </Card>

      {/* Data Exploration Sidebar */}
      <div className="w-80">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="explore">Exploration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="explore" className="mt-4 h-full">
            <DataExplorationPanel onQuerySuggestion={handleQuerySuggestion} />
          </TabsContent>
          
          <TabsContent value="chat" className="mt-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm">Historique & Context</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <div className="space-y-2">
                  <p>Messages: {messages.filter(m => m.type !== 'system').length}</p>
                  <p>Workspace: {currentWorkspace?.name || 'Non sélectionné'}</p>
                  <p>Projet: {currentProject?.name || 'Mode global'}</p>
                  <div className="pt-2 border-t">
                    <p className="font-medium mb-1">Dernière analyse:</p>
                    <p>{messages[messages.length - 1]?.timestamp.toLocaleString() || 'Aucune'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};