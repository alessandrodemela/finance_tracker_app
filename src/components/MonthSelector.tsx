'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  currentDate: Date;
  onChange: (d: Date) => void;
}

export function MonthSelector({ currentDate, onChange }: MonthSelectorProps) {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate);
  };

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-2 backdrop-blur-sm">
      <button 
        onClick={handlePrev} 
        className="p-3 text-[var(--color-brand-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-all active:scale-95"
      >
        <ChevronLeft size={24} />
      </button>
      <h2 className="text-lg font-bold text-white tracking-wide uppercase">{monthName}</h2>
      <button 
        onClick={handleNext} 
        className="p-3 text-[var(--color-brand-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-all active:scale-95"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
