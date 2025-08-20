import { useState, useRef, useEffect } from 'react';
import { Send, Brain, Loader2, Sparkles, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProjectSelector } from '@/components/project/ProjectSelector';
import { SaveToVaultModal } from '@/components/project/SaveToVaultModal';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VaultChatInterfaceProps {
  className?: string;
}

export const VaultChatInterface = ({ className }: VaultChatInterfaceProps) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { currentProject, createConversation, updateConversation } = useProjects();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Bonjour ! Je suis Claude, votre assistant IA connecté à votre Knowledge Vault. Je peux analyser toutes vos données business, visuelles, comportementales et prédictives pour vous donner des insights actionnables. Que souhaitez-vous analyser ?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [useGlobalMode, setUseGlobalMode] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user || !currentWorkspace || loading) return;
    
    // Check if we have a project or are in global mode
    if (!currentProject && !useGlobalMode) return;

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

    try {
      // Create conversation if we have a project and none exists
      if (currentProject && !currentConversationId) {
        const { conversation, error: convError } = await createConversation(
          currentProject.id,
          `Conversation ${new Date().toLocaleDateString()}`
        );
        if (!convError && conversation) {
          setCurrentConversationId(conversation.id);
        }
      }

      const { data, error } = await supabase.functions.invoke('knowledge-vault-chat', {
        body: {
          message: userMessage.content,
          workspaceId: currentWorkspace.id,
          projectId: currentProject?.id || null,
          userId: user.id
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Save conversation only if we have a project
      if (currentProject && currentConversationId) {
        await updateConversation(currentConversationId, updatedMessages);
      }
      
      toast({
        title: "Analyse terminée",
        description: "Claude a analysé votre Knowledge Vault",
      });

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
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

  const suggestedPrompts = [
    "Analyse mes données de conversion et suggère des améliorations",
    "Quelles sont les principales opportunités CRO basées sur ma vault ?", 
    "Compare mes métriques business avec les benchmarks de mon industrie",
    "Quelles sont les prochaines étapes pour optimiser mon funnel ?",
    "Identifie les points de friction dans mon parcours utilisateur"
  ];

  return (
    <Card className={cn("h-[600px] flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            Intelligence Collective
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Claude + Vault
            </Badge>
          </CardTitle>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <ProjectSelector />
          <div className="flex items-center space-x-2">
            <label className="text-xs text-muted-foreground">Mode global</label>
            <input
              type="checkbox"
              checked={useGlobalMode}
              onChange={(e) => setUseGlobalMode(e.target.checked)}
              className="w-4 h-4 rounded border border-input"
            />
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
                    "rounded-lg px-4 py-2 max-w-[80%] break-words",
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-60">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.type === 'assistant' && currentProject && !useGlobalMode && (
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
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Claude analyse votre Knowledge Vault...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (currentProject || useGlobalMode) && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Suggestions d'analyse :</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
                  onClick={() => setInput(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {!currentProject && !useGlobalMode && (
          <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Créez/sélectionnez un projet ou activez le mode global pour utiliser Claude
            </p>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question à Claude sur votre Knowledge Vault..."
            className="min-h-[80px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading || (!currentProject && !useGlobalMode)}
            className="px-3 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Claude analysera automatiquement toutes les données de votre Knowledge Vault pour vous donner des insights personnalisés.
        </div>
      </CardContent>
    </Card>
  );
};