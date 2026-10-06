import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Percent } from 'lucide-react';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { cn, formatCurrency } from '@/lib/utils';

interface MonthlyKPICardsProps {
  income: number;
  expenses: number;
  net: number;
  savingsRate?: number;
  isSensitiveVisible?: boolean;
}

export function MonthlyKPICards({ 
  income, 
  expenses, 
  net, 
  savingsRate,
  isSensitiveVisible = true 
}: MonthlyKPICardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {/* INCOME */}
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
            "text-2xl lg:text-3xl font-bold tracking-tight font-mono text-white transition-all",
            !isSensitiveVisible && "blur-lg select-none"
          )}>
            {formatCurrency(income)}
          </h2>
        </div>
      </DashboardCard>

      {/* EXPENSES */}
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
            "text-2xl lg:text-3xl font-bold tracking-tight font-mono text-white transition-all",
            !isSensitiveVisible && "blur-lg select-none"
          )}>
            {formatCurrency(expenses)}
          </h2>
        </div>
      </DashboardCard>

      {/* NET BALANCE */}
      <DashboardCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
            <TrendingUp className={cn("w-5 h-5", net >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]")} />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
            Net Savings
          </p>
          <h2 className={cn(
            "text-2xl lg:text-3xl font-bold tracking-tight font-mono text-white transition-all",
            net < 0 && "text-[var(--color-brand-danger)]",
            !isSensitiveVisible && "blur-lg select-none"
          )}>
            {formatCurrency(net)}
          </h2>
        </div>
      </DashboardCard>

      {/* SAVINGS RATE */}
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
            "text-2xl lg:text-3xl font-bold tracking-tight font-mono text-white transition-all",
            (savingsRate ?? 0) >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]",
            !isSensitiveVisible && "blur-lg select-none"
          )}>
            {savingsRate !== undefined ? `${savingsRate >= 0 ? '+' : ''}${savingsRate.toFixed(1)}%` : '0.0%'}
          </h2>
        </div>
      </DashboardCard>
    </div>
  );
}
