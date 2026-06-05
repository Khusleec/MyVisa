"use client";

import React, { createContext, useContext } from "react";
import { useVisaApp as useVisaAppHook } from "../../hooks/useVisaApp";

type VisaAppContextType = ReturnType<typeof useVisaAppHook>;

const VisaAppContext = createContext<VisaAppContextType | null>(null);

export function VisaAppProvider({ children }: { children: React.ReactNode }) {
  const value = useVisaAppHook();
  return (
    <VisaAppContext.Provider value={value}>
      {children}
    </VisaAppContext.Provider>
  );
}

export function useVisaAppContext() {
  const context = useContext(VisaAppContext);
  if (!context) {
    throw new Error("useVisaAppContext must be used within a VisaAppProvider");
  }
  return context;
}
