'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type ReasonCode = {
  reason_code: number;
  reason_description: string;
};

type ReasonCodeContextType = {
  selectedCode: ReasonCode | null;
  setSelectedCode: (code: ReasonCode | null) => void;
};

const ReasonCodeContext = createContext<ReasonCodeContextType | undefined>(undefined);

export function ReasonCodeProvider({ children }: { children: ReactNode }) {
  const [selectedCode, setSelectedCode] = useState<ReasonCode | null>(null);

  return (
    <ReasonCodeContext.Provider value={{ selectedCode, setSelectedCode }}>
      {children}
    </ReasonCodeContext.Provider>
  );
}

export function useReasonCode() {
  const context = useContext(ReasonCodeContext);
  if (context === undefined) {
    throw new Error('useReasonCode must be used within a ReasonCodeProvider');
  }
  return context;
}