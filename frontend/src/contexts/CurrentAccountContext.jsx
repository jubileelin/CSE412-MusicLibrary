import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const CurrentAccountContext = createContext({
  currentAccount: null,
  setCurrentAccount: () => {},
  followVersion: 0,
  incrementFollowVersion: () => {}
});

export const CurrentAccountProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [followVersion, setFollowVersion] = useState(0);
  const incrementFollowVersion = useCallback(
    () => setFollowVersion((version) => version + 1),
    []
  );
  const value = useMemo(
    () => ({ currentAccount, setCurrentAccount, followVersion, incrementFollowVersion }),
    [currentAccount, followVersion, incrementFollowVersion]
  );

  return (
    <CurrentAccountContext.Provider value={value}>
      {children}
    </CurrentAccountContext.Provider>
  );
};

export const useCurrentAccount = () => {
  const context = useContext(CurrentAccountContext);
  if (context === undefined) {
    throw new Error('useCurrentAccount must be used within a CurrentAccountProvider');
  }
  return context;
};

