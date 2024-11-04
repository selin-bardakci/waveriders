// BoatContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface BoatContextType {
  boatId: number | null;
  setBoatId: React.Dispatch<React.SetStateAction<number | null>>;
  businessId: number | null;
  setBusinessId: React.Dispatch<React.SetStateAction<number | null>>;
}

// Create the context with a default value
const BoatContext = createContext<BoatContextType | null>(null);

export const BoatProvider = ({ children }: { children: ReactNode }) => {
  const [boatId, setBoatId] = useState<number | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);

  return (
    <BoatContext.Provider value={{ boatId, setBoatId, businessId, setBusinessId }}>
      {children}
    </BoatContext.Provider>
  );
};

export const useBoatContext = () => {
  const context = useContext(BoatContext);
  if (!context) {
    throw new Error("useBoatContext must be used within a BoatProvider");
  }
  return context;
};
