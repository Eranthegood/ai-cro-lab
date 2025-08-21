import { useCallback, useEffect } from 'react';
import { useLaunchDarklyContext } from '@/context/LaunchDarklyProvider';
import { LDUser } from 'launchdarkly-react-client-sdk';

// Custom hook for A/B testing
export const useAbTest = (flagKey: string, defaultValue: boolean = false) => {
  const { flags } = useLaunchDarklyContext();
  return flags[flagKey] !== undefined ? flags[flagKey] : defaultValue;
};

// Custom hook for feature flags with string values
export const useFeatureFlag = (flagKey: string, defaultValue: string = '') => {
  const { flags } = useLaunchDarklyContext();
  return flags[flagKey] !== undefined ? flags[flagKey] : defaultValue;
};

// Custom hook for tracking events
export const useTrackEvent = () => {
  const { client } = useLaunchDarklyContext();
  
  return useCallback((eventKey: string, data?: any, metricValue?: number) => {
    if (client) {
      client.track(eventKey, data, metricValue);
    }
  }, [client]);
};

// Custom hook for identifying users
export const useIdentifyUser = () => {
  const { client } = useLaunchDarklyContext();
  
  return useCallback((user: LDUser) => {
    if (client) {
      return client.identify(user);
    }
    return Promise.resolve();
  }, [client]);
};

// Hook for getting all current flag states
export const useAllFlags = () => {
  const { flags } = useLaunchDarklyContext();
  return flags;
};

// Custom hook for A/B testing with variant tracking
export const useAbTestWithTracking = (
  flagKey: string, 
  defaultVariant: string = 'control'
) => {
  const { flags } = useLaunchDarklyContext();
  const trackEvent = useTrackEvent();
  
  const variant = flags[flagKey] !== undefined ? flags[flagKey] : defaultVariant;
  
  // Track variant exposure using useEffect
  useEffect(() => {
    trackEvent(`${flagKey}_variant_exposed`, {
      variant,
      flagKey,
      timestamp: Date.now()
    });
  }, [variant, flagKey, trackEvent]);
  
  return variant;
};