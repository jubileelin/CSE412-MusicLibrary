import React, { createContext, useContext, useMemo, useState } from 'react';

const CurrentAccountContext = createContext({
  currentAccount: null,
  setCurrentAccount: () => {}
});

export const CurrentAccountProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const value = useMemo(() => ({ currentAccount, setCurrentAccount }), [currentAccount]);

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

