import React, { createContext, useContext, useState } from 'react';

interface ConstructorContextType {
  isConstructorOpen: boolean;
  openConstructor: (context: any) => void;
  closeConstructor: () => void;
  currentConstructorContext: any | null;
}

const ConstructorContext = createContext<ConstructorContextType | undefined>(undefined);

export function ConstructorProvider({ children }: { children: React.ReactNode }) {
  const [isConstructorOpen, setIsConstructorOpen] = useState(false);
  const [currentConstructorContext, setCurrentConstructorContext] = useState<any | null>(null);

  const openConstructor = (context: any) => {
    setCurrentConstructorContext(context);
    setIsConstructorOpen(true);
  };

  const closeConstructor = () => {
    setIsConstructorOpen(false);
    setCurrentConstructorContext(null);
  };

  return (
    <ConstructorContext.Provider value={{ isConstructorOpen, openConstructor, closeConstructor, currentConstructorContext }}>
      {children}
    </ConstructorContext.Provider>
  );
}

export function useConstructor() {
  const context = useContext(ConstructorContext);
  if (!context) throw new Error('useConstructor must be used within a ConstructorProvider');
  return context;
}
