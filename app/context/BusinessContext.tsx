'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface BusinessContextType {
  business_id: number | null;
  setBusinessId: React.Dispatch<React.SetStateAction<number | null>>;
}

// Create the context with a default value
const BusinessContext = createContext<BusinessContextType | null>(null);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [business_id, setBusinessId] = useState<number | null>(null);

  return (
    <BusinessContext.Provider value={{ business_id, setBusinessId }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusinessContext must be used within a BusinessProvider");
  }
  return context;
};


