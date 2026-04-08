import React, { createContext, useContext } from 'react';

const LayerContext = createContext<string | undefined>(undefined);

export function LayerProvider({ id, children }: { id: string, children: React.ReactNode }) {
  return <LayerContext.Provider value={id}>{children}</LayerContext.Provider>;
}

export function useLayerId() {
  return useContext(LayerContext);
}
