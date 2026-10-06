'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthSelectorProps {
  currentDate: Date;
  onChange: (d: Date) => void;
  className?: string;
}

export function MonthSelector({ currentDate, onChange, className }: MonthSelectorProps) {
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

  const monthName = currentDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className={cn(
      "flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1 backdrop-blur-md shadow-sm",
      className
    )}>
      <button 
        onClick={handlePrev} 
        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-95"
        title="Previous Month"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-xs font-bold text-white tracking-wider uppercase px-2 font-mono min-w-[90px] text-center">
        {monthName}
      </span>

      <button 
        onClick={handleNext} 
        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-95"
        title="Next Month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
