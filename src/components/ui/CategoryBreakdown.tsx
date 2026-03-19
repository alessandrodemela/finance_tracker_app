import React from 'react';

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
      <div className="glass-panel p-6 flex justify-center items-center">
        <span className="text-[var(--color-brand-secondary)] text-sm font-medium">Loading categories...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass-panel p-8 flex flex-col justify-center items-center text-center gap-2">
        <span className="text-[var(--color-brand-secondary)] text-sm font-medium">No budget or spending for this month</span>
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
          <div key={item.id} className="glass-panel p-4 flex flex-col gap-3 group hover:border-[rgba(255,255,255,0.08)] transition-all">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-white tracking-wide text-[15px]">{item.name}</span>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[13px] font-bold text-white">
                  €{item.spent.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  <span className="text-[var(--color-brand-secondary)] font-normal ml-1">
                    / €{item.budget.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isOver ? 'text-[#F05A64]' : 'text-[#10B981]'}`}>
                  {isOver ? `Over by €${Math.abs(remaining).toFixed(0)}` : `€${remaining.toFixed(0)} left`}
                </span>
              </div>
            </div>
            
            <div className="h-2.5 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden relative shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                  isOver 
                  ? 'bg-gradient-to-r from-[#F05A64] to-[#ff7a83]' 
                  : 'bg-gradient-to-r from-[var(--color-brand-accent)] to-[#4de1ff]'
                }`}
                style={{ width: `${percent}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[rgba(255,255,255,0.2)]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)', mixBlendMode: 'overlay' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
