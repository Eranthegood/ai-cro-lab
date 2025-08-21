import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { LDClient, initialize, LDUser } from 'launchdarkly-react-client-sdk';

// LaunchDarkly client key
const LAUNCHDARKLY_CLIENT_KEY = 'mob-87367c08-aa54-4386-b0dd-945eebba83a4';

interface LaunchDarklyContextType {
  client: LDClient | null;
  flags: Record<string, any>;
}

const LaunchDarklyContext = createContext<LaunchDarklyContextType>({
  client: null,
  flags: {},
});

export const useLaunchDarklyContext = () => {
  const context = useContext(LaunchDarklyContext);
  return context;
};

interface LaunchDarklyProviderProps {
  children: ReactNode;
}

export const LaunchDarklyProvider = ({ children }: LaunchDarklyProviderProps) => {
  const [client, setClient] = useState<LDClient | null>(null);
  const [flags, setFlags] = useState<Record<string, any>>({});

  useEffect(() => {
    const ldClient = initialize(LAUNCHDARKLY_CLIENT_KEY, {
      key: 'anonymous-user',
      anonymous: true,
    }, {
      bootstrap: 'localStorage',
    });

    setClient(ldClient);

    ldClient.on('ready', () => {
      setFlags(ldClient.allFlags());
    });

    ldClient.on('change', () => {
      setFlags(ldClient.allFlags());
    });

    return () => {
      ldClient.close();
    };
  }, []);

  return (
    <LaunchDarklyContext.Provider value={{ client, flags }}>
      {children}
    </LaunchDarklyContext.Provider>
  );
};