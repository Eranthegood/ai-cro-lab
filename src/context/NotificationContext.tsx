import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from '@/integrations/supabase/client';

interface BackgroundTask {
  id: string;
  type: 'vault-analysis';
  title: string;
  status: 'processing' | 'completed' | 'error';
  progress?: string;
  result?: any;
  timestamp: Date;
  streamReader?: ReadableStreamDefaultReader<Uint8Array>;
  conversationId?: string;
  messageId?: string;
}

interface NotificationContextType {
  hasDataFreshnessWarning: boolean;
  hasKnowledgeScoreWarning: boolean;
  notifications: Array<{
    id: string;
    type: 'admin' | 'freshness' | 'knowledge' | 'task-completed';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
  }>;
  backgroundTasks: BackgroundTask[];
  updateStatuses: (freshnessStatus: { status: string }, knowledgeStatus: { status: string }) => void;
  startBackgroundTask: (task: Omit<BackgroundTask, 'timestamp'>) => void;
  updateTaskProgress: (taskId: string, progress: string) => void;
  completeTask: (taskId: string, result?: any) => void;
  errorTask: (taskId: string, error: string) => void;
  startPersistentStream: (params: {
    taskId: string;
    message: string;
    workspaceId: string;
    projectId?: string;
    userId: string;
    conversationId?: string;
    messageId?: string;
  }) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [hasDataFreshnessWarning, setHasDataFreshnessWarning] = useState(false);
  const [hasKnowledgeScoreWarning, setHasKnowledgeScoreWarning] = useState(false);
  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
  const [dynamicNotifications, setDynamicNotifications] = useState<Array<{
    id: string;
    type: 'admin' | 'freshness' | 'knowledge' | 'task-completed';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
  }>>([]);

  const updateStatuses = (freshnessStatus: { status: string }, knowledgeStatus: { status: string }) => {
    setHasDataFreshnessWarning(freshnessStatus.status !== 'good');
    setHasKnowledgeScoreWarning(knowledgeStatus.status !== 'good');
  };

  const startBackgroundTask = (task: Omit<BackgroundTask, 'timestamp'>) => {
    const newTask: BackgroundTask = {
      ...task,
      timestamp: new Date()
    };
    setBackgroundTasks(prev => [...prev, newTask]);
  };

  const updateTaskProgress = (taskId: string, progress: string) => {
    setBackgroundTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, progress } : task
      )
    );
  };

  const completeTask = (taskId: string, result?: any) => {
    setBackgroundTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: 'completed' as const, result } : task
      )
    );

    // Add completion notification with improved messaging
    const completedTask = backgroundTasks.find(t => t.id === taskId);
    if (completedTask) {
      setDynamicNotifications(prev => [...prev, {
        id: `completed-${taskId}`,
        type: 'task-completed',
        title: '✅ Analyse Knowledge Vault terminée',
        message: `Claude a fini d'analyser vos fichiers. Consultez les résultats dans la Knowledge Vault.`,
        timestamp: new Date(),
        read: false,
        actionUrl: '/vault-simple'
      }]);

      // Auto-remove completed task after 30 seconds to keep UI clean
      setTimeout(() => {
        setBackgroundTasks(prev => prev.filter(task => task.id !== taskId));
      }, 30000);
    }
  };

  const errorTask = (taskId: string, error: string) => {
    setBackgroundTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: 'error' as const, progress: error } : task
      )
    );
  };

  const startPersistentStream = async (params: {
    taskId: string;
    message: string;
    workspaceId: string;
    projectId?: string;
    userId: string;
    conversationId?: string;
    messageId?: string;
  }) => {
    try {
      // Get fresh auth token
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('No active session');
      }

      updateTaskProgress(params.taskId, '🔍 Lecture des fichiers...');
      
      const response = await fetch(`https://wtpmxuhkbwwiougblkki.supabase.co/functions/v1/simple-vault-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          message: params.message,
          workspaceId: params.workspaceId,
          projectId: params.projectId || null,
          userId: params.userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error(`Limite quotidienne atteinte. ${errorData.error || 'Revenez demain.'}`);
        }
        throw new Error(errorData.error || 'Erreur de communication');
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        updateTaskProgress(params.taskId, '🧠 Claude analyse vos documents...');
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No stream available');

        // Store reader in task for potential cleanup
        setBackgroundTasks(prev => 
          prev.map(task => 
            task.id === params.taskId 
              ? { 
                  ...task, 
                  streamReader: reader,
                  conversationId: params.conversationId,
                  messageId: params.messageId
                } 
              : task
          )
        );

        const decoder = new TextDecoder();
        let accumulatedContent = '';

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
                  updateTaskProgress(params.taskId, '✍️ Claude rédige sa réponse...');
                  
                  // Notify components about streaming update
                  if (params.conversationId && params.messageId) {
                    // This would be handled by ChatContext if integrated
                    const updateEvent = new CustomEvent('chatStreamUpdate', {
                      detail: {
                        conversationId: params.conversationId,
                        messageId: params.messageId,
                        content: accumulatedContent
                      }
                    });
                    window.dispatchEvent(updateEvent);
                  }
                } else if (data.type === 'done') {
                  // Notify about completion
                  if (params.conversationId && params.messageId) {
                    const completeEvent = new CustomEvent('chatStreamComplete', {
                      detail: {
                        conversationId: params.conversationId,
                        messageId: params.messageId,
                        content: accumulatedContent
                      }
                    });
                    window.dispatchEvent(completeEvent);
                  }
                  
                  completeTask(params.taskId, { content: accumulatedContent });
                  return;
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } else {
        // Fallback to regular JSON response
        const data = await response.json();
        
        if (params.conversationId && params.messageId) {
          const completeEvent = new CustomEvent('chatStreamComplete', {
            detail: {
              conversationId: params.conversationId,
              messageId: params.messageId,
              content: data.response
            }
          });
          window.dispatchEvent(completeEvent);
        }

        completeTask(params.taskId, { content: data.response });
      }

    } catch (error: any) {
      console.error('Persistent stream error:', error);
      errorTask(params.taskId, error.message || 'Erreur technique');
      
      if (params.conversationId && params.messageId) {
        const errorEvent = new CustomEvent('chatStreamError', {
          detail: {
            conversationId: params.conversationId,
            messageId: params.messageId,
            error: error.message
          }
        });
        window.dispatchEvent(errorEvent);
      }
    }
  };

  // Mock notifications - in real app this would come from API/database
  const staticNotifications = [
    {
      id: '1',
      type: 'admin' as const,
      title: 'New Feature Available',
      message: 'Advanced A/B testing analytics are now available in your dashboard.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false
    },
    ...(hasDataFreshnessWarning ? [{
      id: '2',
      type: 'freshness' as const,
      title: 'Data Freshness Warning',
      message: 'Your data freshness is below optimal levels. Consider updating your knowledge base.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false
    }] : []),
    ...(hasKnowledgeScoreWarning ? [{
      id: '3',
      type: 'knowledge' as const,
      title: 'Knowledge Score Alert',
      message: 'Your knowledge score is lower than recommended. Review your data quality.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      read: false
    }] : [])
  ];

  const notifications = [...staticNotifications, ...dynamicNotifications];

  return (
    <NotificationContext.Provider value={{
      hasDataFreshnessWarning,
      hasKnowledgeScoreWarning,
      notifications,
      backgroundTasks,
      updateStatuses,
      startBackgroundTask,
      updateTaskProgress,
      completeTask,
      errorTask,
      startPersistentStream
    }}>
      {children}
    </NotificationContext.Provider>
  );
};