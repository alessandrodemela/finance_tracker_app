import React from 'react';
import { Trophy, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InsightData {
  bestMonth: { month: string; amount: number };
  highestSpending: { category: string; amount: number };
  averageSavings: number;
}

interface InsightsSectionProps {
  data: InsightData;
  isSensitiveVisible?: boolean;
}

export function InsightsSection({ data, isSensitiveVisible = true }: InsightsSectionProps) {
  return (
    <div className="space-y-3">
      {/* Best Month */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Trophy size={16} className="text-[var(--color-brand-success)]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--color-brand-secondary)] block">Best Month</span>
            <span className="text-xs font-semibold text-white">
              {data.bestMonth.month}
            </span>
          </div>
        </div>
        <span className={cn(
          "text-xs text-[var(--color-brand-success)] font-mono font-bold transition-all",
          !isSensitiveVisible && "blur-md select-none"
        )}>
          +€{data.bestMonth.amount.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
        </span>
      </div>

      {/* Highest Spending Category */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-[var(--color-brand-danger)]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--color-brand-secondary)] block">Top Expense Category</span>
            <span className="text-xs font-semibold text-white">
              {data.highestSpending.category}
            </span>
          </div>
        </div>
        <span className={cn(
          "text-xs text-[var(--color-brand-danger)] font-mono font-bold transition-all",
          !isSensitiveVisible && "blur-md select-none"
        )}>
          €{data.highestSpending.amount.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
        </span>
      </div>

      {/* Avg Monthly Savings */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Activity size={16} className="text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[var(--color-brand-secondary)] block">Avg Monthly Savings</span>
            <span className="text-xs font-semibold text-white">
              Per month this year
            </span>
          </div>
        </div>
        <span className={cn(
          "text-xs text-cyan-400 font-mono font-bold transition-all",
          !isSensitiveVisible && "blur-md select-none"
        )}>
          €{data.averageSavings.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}
