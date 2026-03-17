'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DateContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  currentMonthStr: string;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDateState] = useState<Date>(new Date());

  const setCurrentDate = (date: Date) => {
    setCurrentDateState(date);
  };

  const currentMonthStr = currentDate.toISOString().slice(0, 7);

  return (
    <DateContext.Provider value={{ currentDate, setCurrentDate, currentMonthStr }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
}
