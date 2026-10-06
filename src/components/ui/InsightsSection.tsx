import React from 'react';
import { Trophy, AlertTriangle, Activity } from 'lucide-react';

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
    <div className="space-y-3">
      {/* Best Month */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Trophy size={14} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 block">Best Month</span>
            <span className="text-xs font-semibold text-white">
              {data.bestMonth.month}
            </span>
          </div>
        </div>
        <span className="text-xs text-emerald-400 font-mono font-bold">
          +€{data.bestMonth.amount.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
        </span>
      </div>

      {/* Highest Spending Category */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={14} className="text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 block">Top Expense Category</span>
            <span className="text-xs font-semibold text-white">
              {data.highestSpending.category}
            </span>
          </div>
        </div>
        <span className="text-xs text-rose-400 font-mono font-bold">
          €{data.highestSpending.amount.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
        </span>
      </div>

      {/* Avg Monthly Savings */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Activity size={14} className="text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 block">Avg Monthly Savings</span>
            <span className="text-xs font-semibold text-white">
              Per month this year
            </span>
          </div>
        </div>
        <span className="text-xs text-cyan-400 font-mono font-bold">
          €{data.averageSavings.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}
