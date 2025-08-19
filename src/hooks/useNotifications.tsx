import { createContext, useContext, ReactNode } from "react";

interface NotificationContextType {
  hasDataFreshnessWarning: boolean;
  hasKnowledgeScoreWarning: boolean;
  notifications: Array<{
    id: string;
    type: 'admin' | 'freshness' | 'knowledge';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
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
  freshnessStatus: { status: string };
  knowledgeStatus: { status: string };
}

export const NotificationProvider = ({ 
  children, 
  freshnessStatus, 
  knowledgeStatus 
}: NotificationProviderProps) => {
  const hasDataFreshnessWarning = freshnessStatus.status !== 'good';
  const hasKnowledgeScoreWarning = knowledgeStatus.status !== 'good';

  // Mock notifications - in real app this would come from API/database
  const notifications = [
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

  return (
    <NotificationContext.Provider value={{
      hasDataFreshnessWarning,
      hasKnowledgeScoreWarning,
      notifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};