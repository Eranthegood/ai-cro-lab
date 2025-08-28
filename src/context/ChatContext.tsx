import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace, WorkspaceContext } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  conversationId: string;
}

interface ChatConversation {
  id: string;
  workspaceId: string;
  projectId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  createConversation: (workspaceId: string, projectId?: string) => string;
  addMessage: (message: Omit<ChatMessage, 'id' | 'conversationId' | 'timestamp'>) => string;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  startPersistentStream: (messageContent: string, workspaceId: string, projectId?: string, userId?: string) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { user } = useAuth();
  const workspaceCtx = useContext(WorkspaceContext as any);
  const currentWorkspace = (workspaceCtx as any)?.currentWorkspace || null;
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversationState] = useState<ChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const loadConversations = () => {
      try {
        const stored = localStorage.getItem('chat_conversations');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          const conversations = parsed.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setConversations(conversations);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };

    loadConversations();
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chat_conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }, [conversations]);

  // Auto-create conversation for current workspace if none exists
  useEffect(() => {
    if (currentWorkspace && conversations.length === 0) {
      const conversationId = createConversation(currentWorkspace.id);
      setCurrentConversation(conversationId);
    }
  }, [currentWorkspace, conversations.length]);

  // Restore current conversation from localStorage
  useEffect(() => {
    const currentConversationId = localStorage.getItem('current_conversation_id');
    if (currentConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === currentConversationId);
      if (conversation) {
        setCurrentConversationState(conversation);
      }
    }
  }, [conversations]);

  const createConversation = useCallback((workspaceId: string, projectId?: string): string => {
    const conversationId = `conv_${Date.now()}`;
    const newConversation: ChatConversation = {
      id: conversationId,
      workspaceId,
      projectId,
      messages: [{
        id: 'system_1',
        type: 'system',
        content: '🚀 **Knowledge Vault Simple**\n\nInterface Claude-style : Upload vos fichiers → Posez vos questions\n\nJe peux analyser tous types de documents, données CSV, images, etc.',
        timestamp: new Date(),
        conversationId
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => [...prev, newConversation]);
    return conversationId;
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'conversationId' | 'timestamp'>): string => {
    if (!currentConversation) return '';

    // Generate truly unique ID with timestamp + random component
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 Creating message with ID:', messageId, 'type:', message.type);
    
    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
      conversationId: currentConversation.id,
      timestamp: new Date()
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              updatedAt: new Date()
            }
          : conv
      )
    );

    return messageId;
  }, [currentConversation]);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    if (!currentConversation) return;

    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversation.id
          ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
              updatedAt: new Date()
            }
          : conv
      )
    );
  }, [currentConversation]);

  const setCurrentConversation = useCallback((conversationId: string | null) => {
    if (!conversationId) {
      setCurrentConversationState(null);
      localStorage.removeItem('current_conversation_id');
      return;
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationState(conversation);
      localStorage.setItem('current_conversation_id', conversationId);
    }
  }, [conversations]);

  const startPersistentStream = useCallback(async (
    messageContent: string,
    workspaceId: string,
    projectId?: string,
    userId?: string
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    // Get fresh auth token
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('No active session');
    }

    const streamId = `stream_${Date.now()}`;
    
    // This will be handled by NotificationContext
    return streamId;
  }, [user]);

  const messages = currentConversation?.messages || [];

  // Update current conversation state when conversations change
  useEffect(() => {
    if (currentConversation) {
      const updatedConversation = conversations.find(c => c.id === currentConversation.id);
      if (updatedConversation) {
        setCurrentConversationState(updatedConversation);
      }
    }
  }, [conversations, currentConversation?.id]);

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      messages,
      isLoading,
      createConversation,
      addMessage,
      updateMessage,
      setCurrentConversation,
      startPersistentStream
    }}>
      {children}
    </ChatContext.Provider>
  );
};