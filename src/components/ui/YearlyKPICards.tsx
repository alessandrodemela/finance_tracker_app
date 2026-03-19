import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface YearlyKPICardsProps {
  income: { value: number, trend: number };
  expenses: { value: number, trend: number };
  net: { value: number, trend: number };
  savingsRate: { value: number, trend: number };
}

export function YearlyKPICards({ income, expenses, net, savingsRate }: YearlyKPICardsProps) {
  const renderTrend = (trend: number, invertColors = false) => {
    const isPositive = trend >= 0;
    const isGood = invertColors ? !isPositive : isPositive;
    return (
      <div className={`flex items-center gap-1 text-[11px] font-bold tracking-wide mt-1 ${isGood ? 'text-[#10B981]' : 'text-[#F05A64]'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Income */}
      <div className="glass-panel p-5 flex flex-col justify-between border-t-2 border-t-[#10B981]/50 relative overflow-hidden group hover:bg-[rgba(255,255,255,0.03)] transition-colors h-[110px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981] opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-10" />
        <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">INCOME</span>
        <div>
          <span className="text-xl text-[#10B981] font-bold">
            €{income.value.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </span>
          {renderTrend(income.trend)}
        </div>
      </div>

      {/* Expenses */}
      <div className="glass-panel p-5 flex flex-col justify-between border-t-2 border-t-[#F05A64]/50 relative overflow-hidden group hover:bg-[rgba(255,255,255,0.03)] transition-colors h-[110px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#F05A64] opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-10" />
        <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">EXPENSES</span>
        <div>
          <span className="text-xl text-[#F05A64] font-bold">
            €{expenses.value.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </span>
          {renderTrend(expenses.trend, true)}
        </div>
      </div>

      {/* Net Savings */}
      <div className="glass-panel p-5 flex flex-col justify-between border-t-2 border-t-[var(--color-brand-accent)]/50 relative overflow-hidden group hover:bg-[rgba(255,255,255,0.03)] transition-colors h-[110px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-brand-accent)] opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-10" />
        <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">NET SAVINGS</span>
        <div>
          <span className="text-xl text-white font-bold">
            €{net.value.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </span>
          {renderTrend(net.trend)}
        </div>
      </div>

      {/* Savings Rate */}
      <div className="glass-panel p-5 flex flex-col justify-between border-t-2 border-t-[#8b5cf6]/50 relative overflow-hidden group hover:bg-[rgba(255,255,255,0.03)] transition-colors h-[110px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#8b5cf6] opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-10" />
        <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">SAVINGS RATE</span>
        <div>
          <span className="text-xl text-[#8b5cf6] font-bold">
            {savingsRate.value.toFixed(1)}%
          </span>
          {/* Note: pp = percentage points but we display as % for simplicity */}
          {renderTrend(savingsRate.trend)}
        </div>
      </div>
    </div>
  );
}
