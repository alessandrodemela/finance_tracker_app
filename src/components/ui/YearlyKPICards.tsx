import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YearlyKPICardsProps {
  income: { value: number; trend: number };
  expenses: { value: number; trend: number };
  net: { value: number; trend: number };
  savingsRate: { value: number; trend: number };
  isSensitiveVisible?: boolean;
}

export function YearlyKPICards({ 
  income, 
  expenses, 
  net, 
  savingsRate,
  isSensitiveVisible = true 
}: YearlyKPICardsProps) {
  const renderTrend = (trend: number, invertColors = false) => {
    const isPositive = trend >= 0;
    const isGood = invertColors ? !isPositive : isPositive;
    return (
      <div className={cn(
        "flex items-center gap-1 text-[11px] font-bold tracking-wide mt-1.5",
        isGood ? 'text-emerald-400' : 'text-rose-400',
        !isSensitiveVisible && "blur-sm select-none"
      )}>
        {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        <span>{Math.abs(trend).toFixed(1)}% vs prev year</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Income */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">INCOME</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ArrowUpRight className="text-emerald-400 w-4 h-4" />
          </div>
        </div>
        <div>
          <span className={cn(
            "text-xl lg:text-2xl text-white font-bold font-mono tracking-tight block transition-all",
            !isSensitiveVisible && "blur-md select-none"
          )}>
            €{income.value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {renderTrend(income.trend)}
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">EXPENSES</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ArrowDownRight className="text-rose-400 w-4 h-4" />
          </div>
        </div>
        <div>
          <span className={cn(
            "text-xl lg:text-2xl text-white font-bold font-mono tracking-tight block transition-all",
            !isSensitiveVisible && "blur-md select-none"
          )}>
            €{expenses.value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {renderTrend(expenses.trend, true)}
        </div>
      </div>

      {/* Net Savings */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">NET SAVINGS</span>
          <div className={cn(
            "w-8 h-8 rounded-xl border flex items-center justify-center",
            net.value >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
          )}>
            <TrendingUp className={cn("w-4 h-4", net.value >= 0 ? "text-emerald-400" : "text-rose-400")} />
          </div>
        </div>
        <div>
          <span className={cn(
            "text-xl lg:text-2xl font-bold font-mono tracking-tight block transition-all",
            net.value >= 0 ? "text-white" : "text-rose-400",
            !isSensitiveVisible && "blur-md select-none"
          )}>
            {net.value < 0 ? '-' : ''}€{Math.abs(net.value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {renderTrend(net.trend)}
        </div>
      </div>

      {/* Savings Rate */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">SAVINGS RATE</span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Percent className="text-cyan-400 w-4 h-4" />
          </div>
        </div>
        <div>
          <span className={cn(
            "text-xl lg:text-2xl font-bold font-mono tracking-tight block transition-all",
            savingsRate.value >= 0 ? "text-emerald-400" : "text-rose-400",
            !isSensitiveVisible && "blur-md select-none"
          )}>
            {savingsRate.value >= 0 ? '+' : ''}{savingsRate.value.toFixed(1)}%
          </span>
          {renderTrend(savingsRate.trend)}
        </div>
      </div>
    </div>
  );
}
