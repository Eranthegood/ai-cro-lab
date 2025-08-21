import { useState, useEffect } from 'react';
import { useWorkspace } from './useWorkspace';

interface RateLimitData {
  count: number;
  date: string;
}

export const useRateLimit = () => {
  const { currentWorkspace } = useWorkspace();
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  // Initialize count on mount or workspace change
  useEffect(() => {
    setLoading(true);
    const count = loadDailyCount();
    setDailyCount(count);
    setLoading(false);
  }, [currentWorkspace?.id]);

  return {
    dailyCount,
    limit,
    isUnlimited,
    loading,
    incrementCount,
    canMakeRequest,
    getUsagePercentage,
  };
};