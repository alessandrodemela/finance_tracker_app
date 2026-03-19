import React from 'react';
import { Lightbulb, Trophy, AlertTriangle, Activity } from 'lucide-react';

export interface InsightData {
  bestMonth: { month: string; amount: number };
  highestSpending: { category: string; amount: number };
  averageSavings: number;
}

interface InsightsSectionProps {
  data: InsightData;
}

export function InsightsSection({ data }: InsightsSectionProps) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-accent)] opacity-[0.03] rounded-full blur-3xl" />
      
      <div className="flex items-center gap-2">
        <Lightbulb className="text-[var(--color-brand-accent)]" size={20} />
        <h3 className="text-heading-3 text-white font-bold">Yearly Insights</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 relative z-10">
        
        {/* Best Month */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(16,185,129,0.3)] transition-colors">
          <div className="p-2 rounded-lg bg-[rgba(16,185,129,0.1)] mt-0.5">
            <Trophy size={16} className="text-[#10B981]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-brand-secondary)]">Best Month</span>
            <span className="text-sm font-semibold text-white mt-0.5 max-w-[200px] truncate">
              {data.bestMonth.month}
            </span>
            <span className="text-xs text-[#10B981] font-medium mt-1">€{data.bestMonth.amount.toLocaleString('it-IT')} saved</span>
          </div>
        </div>

        {/* Highest Spending Category */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(240,90,100,0.3)] transition-colors">
          <div className="p-2 rounded-lg bg-[rgba(240,90,100,0.1)] mt-0.5">
            <AlertTriangle size={16} className="text-[#F05A64]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-brand-secondary)]">Highest Spending</span>
            <span className="text-sm font-semibold text-white mt-0.5 max-w-[200px] truncate">
              {data.highestSpending.category}
            </span>
            <span className="text-xs text-[#F05A64] font-medium mt-1">€{data.highestSpending.amount.toLocaleString('it-IT')}</span>
          </div>
        </div>

        {/* Avg Monthly Savings */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,210,255,0.3)] transition-colors">
          <div className="p-2 rounded-lg bg-[rgba(0,210,255,0.1)] mt-0.5">
            <Activity size={16} className="text-[var(--color-brand-accent)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-brand-secondary)]">Avg Monthly Savings</span>
            <span className="text-sm font-semibold text-white mt-0.5">
              €{data.averageSavings.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-[var(--color-brand-secondary)] font-medium mt-1">Per month this year</span>
          </div>
        </div>

      </div>
    </div>
  );
}
