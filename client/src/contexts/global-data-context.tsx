import React, { createContext, useContext, useEffect, useState } from 'react';

interface GlobalDataContextType {
  lastUpdateTimestamp: number;
  triggerUpdate: () => void;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export const GlobalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(Date.now());

  const triggerUpdate = () => {
    const timestamp = Date.now();
    setLastUpdateTimestamp(timestamp);
    console.log('🔄 Global data update triggered at:', new Date(timestamp).toISOString());
    
    // Also trigger the custom event for components using the hook
    window.dispatchEvent(new CustomEvent('leadDataUpdated'));
  };

  useEffect(() => {
    // Listen for external triggers
    const handleExternalUpdate = () => {
      setLastUpdateTimestamp(Date.now());
    };

    window.addEventListener('leadDataUpdated', handleExternalUpdate);
    return () => window.removeEventListener('leadDataUpdated', handleExternalUpdate);
  }, []);

  return (
    <GlobalDataContext.Provider value={{ lastUpdateTimestamp, triggerUpdate }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalDataContext = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalDataContext must be used within a GlobalDataProvider');
  }
  return context;
};
