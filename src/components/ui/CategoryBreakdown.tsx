import React from 'react';
import { cn } from '@/lib/utils';

export interface CategoryBudgetItem {
  id: string;
  name: string;
  spent: number;
  budget: number;
}

interface CategoryBreakdownProps {
  items: CategoryBudgetItem[];
  loading?: boolean;
}

export function CategoryBreakdown({ items, loading = false }: CategoryBreakdownProps) {
  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm font-medium">
        Loading categories...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm font-medium">
        No budget or spending recorded for this month.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const remaining = item.budget - item.spent;
        const isOver = remaining < 0;
        const percent = item.budget > 0 ? Math.min((item.spent / item.budget) * 100, 100) : item.spent > 0 ? 100 : 0;
        
        return (
          <div key={item.id} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-2.5 group hover:border-slate-700/80 transition-all">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-white tracking-wide text-sm">{item.name}</span>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-bold text-white font-mono">
                  €{item.spent.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  <span className="text-slate-500 font-normal ml-1">
                    / €{item.budget.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </span>
                <span className={cn("text-[10px] font-extrabold uppercase tracking-wider", isOver ? 'text-rose-400' : 'text-emerald-400')}>
                  {isOver ? `Over by €${Math.abs(remaining).toFixed(0)}` : `€${remaining.toFixed(0)} left`}
                </span>
              </div>
            </div>
            
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  isOver 
                    ? 'bg-gradient-to-r from-rose-500 to-rose-400' 
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
