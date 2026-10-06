'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YearSelectorProps {
  year: number;
  onChange: (y: number) => void;
  className?: string;
}

export function YearSelector({ year, onChange, className }: YearSelectorProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1 backdrop-blur-md shadow-sm",
      className
    )}>
      <button 
        onClick={() => onChange(year - 1)} 
        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-95"
        title="Previous Year"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-xs font-bold text-white tracking-wider uppercase px-2 font-mono min-w-[60px] text-center">
        {year}
      </span>

      <button 
        onClick={() => onChange(year + 1)} 
        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-95"
        title="Next Year"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
