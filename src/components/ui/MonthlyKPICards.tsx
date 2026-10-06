import React from 'react';
import { ArrowUpRight, ArrowDownRight, Equal, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthlyKPICardsProps {
  income: number;
  expenses: number;
  net: number;
  savingsRate?: number;
}

export function MonthlyKPICards({ income, expenses, net, savingsRate }: MonthlyKPICardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* INCOME */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">INCOME</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ArrowUpRight className="text-emerald-400 w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-bold text-white font-mono tracking-tight">
          €{income.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* EXPENSES */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">EXPENSES</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ArrowDownRight className="text-rose-400 w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-bold text-white font-mono tracking-tight">
          €{expenses.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* NET */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">NET BALANCE</span>
          <div className={cn(
            "w-8 h-8 rounded-xl border flex items-center justify-center",
            net >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
          )}>
            <Equal className={cn("w-4 h-4", net >= 0 ? "text-emerald-400" : "text-rose-400")} />
          </div>
        </div>
        <div className={cn(
          "text-xl lg:text-2xl font-bold font-mono tracking-tight",
          net >= 0 ? "text-white" : "text-rose-400"
        )}>
          {net < 0 ? '-' : ''}€{Math.abs(net).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* SAVINGS RATE */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">SAVINGS RATE</span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Percent className="text-cyan-400 w-4 h-4" />
          </div>
        </div>
        <div className={cn(
          "text-xl lg:text-2xl font-bold font-mono tracking-tight",
          (savingsRate ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
        )}>
          {savingsRate !== undefined ? `${savingsRate >= 0 ? '+' : ''}${savingsRate.toFixed(1)}%` : '0.0%'}
        </div>
      </div>
    </div>
  );
}
