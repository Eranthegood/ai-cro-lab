import { useState, useEffect } from 'react';
import { useWorkspace } from './useWorkspace';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitData {
  count: number;
  date: string;
}

interface ServerRateLimitData {
  dailyCount: number;
  limit: number;
  remaining: number;
  canMakeRequest: boolean;
  resetTime?: string;
}

export const useRateLimit = () => {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  // Determine rate limit based on workspace plan
  const getRateLimit = (): number => {
    if (!currentWorkspace) return 50;
    
    const plan = currentWorkspace.plan || 'free';
    switch (plan) {
      case 'premium':
      case 'pro':
        return -1; // Unlimited
      default:
        return 50; // Free tier
    }
  };

  const limit = getRateLimit();
  const isUnlimited = limit === -1;

  // Get today's date string
  const getTodayString = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Get storage key for current workspace
  const getStorageKey = (): string => {
    return `rate-limit-${currentWorkspace?.id || 'default'}`;
  };

  // Load current count from localStorage
  const loadDailyCount = (): number => {
    if (!currentWorkspace || isUnlimited) return 0;
    
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (!stored) return 0;

      const data: RateLimitData = JSON.parse(stored);
      const today = getTodayString();

      // Reset if it's a new day
      if (data.date !== today) {
        localStorage.setItem(getStorageKey(), JSON.stringify({ count: 0, date: today }));
        return 0;
      }

      return data.count;
    } catch {
      return 0;
    }
  };

  // Save count to localStorage
  const saveDailyCount = (count: number): void => {
    if (!currentWorkspace || isUnlimited) return;
    
    const today = getTodayString();
    const data: RateLimitData = { count, date: today };
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
  };

  // Increment interaction count
  const incrementCount = (): boolean => {
    if (isUnlimited) return true;
    
    const newCount = dailyCount + 1;
    if (newCount > limit) return false;
    
    setDailyCount(newCount);
    saveDailyCount(newCount);
    return true;
  };

  // Check if user can make another request
  const canMakeRequest = (): boolean => {
    return isUnlimited || dailyCount < limit;
  };

  // Get usage percentage (0-100)
  const getUsagePercentage = (): number => {
    if (isUnlimited) return 0;
    return Math.round((dailyCount / limit) * 100);
  };

  // Fetch current count from server (authoritative)
  const fetchServerCount = async (): Promise<void> => {
    if (!currentWorkspace || !user || isUnlimited) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-daily-interactions', {
        body: {
          workspaceId: currentWorkspace.id,
          userId: user.id
        }
      });

      if (error) {
        console.error('Failed to fetch server count:', error);
        return;
      }

      if (data && typeof data.dailyCount === 'number') {
        setDailyCount(data.dailyCount);
        saveDailyCount(data.dailyCount);
        setLastSyncTime(Date.now());
        console.log('📊 Rate limit synced with server:', data.dailyCount);
      }
    } catch (error) {
      console.error('Rate limit sync error:', error);
      // Fallback to local storage in case of error
      const localCount = loadDailyCount();
      setDailyCount(localCount);
    }
  };

  // Initialize count on mount or workspace/user change
  useEffect(() => {
    // Don't initialize until we have workspace and user data
    if (currentWorkspace === undefined || !user) return;
    
    setLoading(true);
    
    // For unlimited users, just set to 0
    if (isUnlimited) {
      setDailyCount(0);
      setLoading(false);
      return;
    }
    
    // Try to sync with server first, fallback to localStorage
    const initializeCount = async () => {
      const localCount = loadDailyCount();
      setDailyCount(localCount); // Set local count immediately for UX
      
      // Then sync with server if it's been more than 5 minutes since last sync
      const shouldSync = Date.now() - lastSyncTime > 5 * 60 * 1000;
      if (shouldSync) {
        await fetchServerCount();
      }
      
      setLoading(false);
    };
    
    initializeCount();
  }, [currentWorkspace?.id, user?.id]);

  // Update count from server response (when available)
  const updateFromServerResponse = (serverData: ServerRateLimitData): void => {
    if (serverData && typeof serverData.dailyCount === 'number') {
      setDailyCount(serverData.dailyCount);
      saveDailyCount(serverData.dailyCount);
      setLastSyncTime(Date.now());
    }
  };

  // Force refresh from server
  const refreshFromServer = (): Promise<void> => {
    return fetchServerCount();
  };

  return {
    dailyCount,
    limit,
    isUnlimited,
    loading,
    incrementCount,
    canMakeRequest,
    getUsagePercentage,
    updateFromServerResponse,
    refreshFromServer,
  };
};