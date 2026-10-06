import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Percent } from 'lucide-react';
import { DashboardCard } from '@/components/ui/DashboardCard';
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
        "flex items-center gap-1 text-[11px] font-bold tracking-wide mt-2",
        isGood ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-danger)]',
        !isSensitiveVisible && "blur-sm select-none"
      )}>
        {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        <span>{Math.abs(trend).toFixed(1)}% vs prev year</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Income */}
      <DashboardCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
            <ArrowUpRight className="text-[var(--color-brand-success)] w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
            Total Income
          </p>
          <h2 className={cn(
            "text-2xl lg:text-3xl text-white font-bold font-mono tracking-tight block transition-all",
            !isSensitiveVisible && "blur-lg select-none"
          )}>
            €{income.value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          {renderTrend(income.trend)}
        </div>
      </DashboardCard>

      {/* Expenses */}
      <DashboardCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
            <ArrowDownRight className="text-[var(--color-brand-danger)] w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
            Total Expenses
          </p>
          <h2 className={cn(
            "text-2xl lg:text-3xl text-white font-bold font-mono tracking-tight block transition-all",
            !isSensitiveVisible && "blur-lg select-none"
          )}>
            €{expenses.value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          {renderTrend(expenses.trend, true)}
        </div>
      </DashboardCard>

      {/* Net Savings */}
      <DashboardCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
            <TrendingUp className={cn("w-5 h-5", net.value >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]")} />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
            Net Savings
          </p>
          <h2 className={cn(
            "text-2xl lg:text-3xl font-bold font-mono tracking-tight block transition-all",
            net.value >= 0 ? "text-white" : "text-[var(--color-brand-danger)]",
            !isSensitiveVisible && "blur-lg select-none"
          )}>
            {net.value < 0 ? '-' : ''}€{Math.abs(net.value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          {renderTrend(net.trend)}
        </div>
      </DashboardCard>

      {/* Savings Rate */}
      <DashboardCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
            <Percent className="text-cyan-400 w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
            Savings Rate
          </p>
          <h2 className={cn(
            "text-2xl lg:text-3xl font-bold font-mono tracking-tight block transition-all",
            savingsRate.value >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]",
            !isSensitiveVisible && "blur-lg select-none"
          )}>
            {savingsRate.value >= 0 ? '+' : ''}{savingsRate.value.toFixed(1)}%
          </h2>
          {renderTrend(savingsRate.trend)}
        </div>
      </DashboardCard>
    </div>
  );
}
