import React from 'react';
import { ArrowUpRight, ArrowDownRight, Equal } from 'lucide-react';

interface MonthlyKPICardsProps {
  income: number;
  expenses: number;
  net: number;
}

export function MonthlyKPICards({ income, expenses, net }: MonthlyKPICardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel flex flex-col items-center justify-center gap-2 py-6 px-2 border-b-2 border-b-[#10B981]/50 relative overflow-hidden group hover:bg-[rgba(255,255,255,0.03)] transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#10B981] opacity-10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none transition-opacity group-hover:opacity-20" />
          <ArrowUpRight className="text-[#10B981] mb-1" size={24} />
          <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">INCOME</span>
          <span className="text-xl text-[#10B981] font-bold">
            €{income.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="glass-panel flex flex-col items-center justify-center gap-2 py-6 px-2 border-b-2 border-b-[#F05A64]/50 relative overflow-hidden group hover:bg-[rgba(255,255,255,0.03)] transition-colors">
          <div className="absolute top-0 left-0 w-16 h-16 bg-[#F05A64] opacity-10 rounded-full blur-2xl -ml-8 -mt-8 pointer-events-none transition-opacity group-hover:opacity-20" />
          <ArrowDownRight className="text-[#F05A64] mb-1" size={24} />
          <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">EXPENSES</span>
          <span className="text-xl text-[#F05A64] font-bold">
            €{expenses.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className={`glass-panel flex flex-col items-center justify-center gap-2 py-6 px-2 border-b-2 relative overflow-hidden group hover:bg-[rgba(255,255,255,0.03)] transition-colors ${net >= 0 ? 'border-b-[#10B981]/50' : 'border-b-[#F05A64]/50'}`}>
          <div className={`absolute bottom-0 right-0 w-20 h-20 opacity-10 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none transition-opacity group-hover:opacity-20 ${net >= 0 ? 'bg-[#10B981]' : 'bg-[#F05A64]'}`} />
          <Equal className={net >= 0 ? "text-[var(--color-brand-accent)] mb-1" : "text-[#F05A64] mb-1"} size={24} />
          <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">NET</span>
          <span className={`text-xl font-bold z-10 ${net >= 0 ? 'text-white' : 'text-[#F05A64]'}`}>
            {net < 0 ? '-' : ''}€{Math.abs(net).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
  );
}
