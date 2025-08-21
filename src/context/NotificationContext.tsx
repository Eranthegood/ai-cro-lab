import { createContext, useContext, useState, ReactNode } from "react";

interface BackgroundTask {
  id: string;
  type: 'vault-analysis';
  title: string;
  status: 'processing' | 'completed' | 'error';
  progress?: string;
  result?: any;
  timestamp: Date;
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

    // Add completion notification
    const completedTask = backgroundTasks.find(t => t.id === taskId);
    if (completedTask) {
      setDynamicNotifications(prev => [...prev, {
        id: `completed-${taskId}`,
        type: 'task-completed',
        title: 'Analyse terminée',
        message: `${completedTask.title} - Cliquez pour voir les résultats`,
        timestamp: new Date(),
        read: false,
        actionUrl: '/vault-simple'
      }]);
    }
  };

  const errorTask = (taskId: string, error: string) => {
    setBackgroundTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: 'error' as const, progress: error } : task
      )
    );
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
      errorTask
    }}>
      {children}
    </NotificationContext.Provider>
  );
};