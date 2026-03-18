import { useState } from 'react';
import { MonthSelector } from '@/components/MonthSelector';
import { Button } from '@/components/ui/Button';
import { PlusCircle, ArrowUpRight, ArrowDownRight, Equal } from 'lucide-react';
import Link from 'next/link';
import { SpendingTrendChart } from '@/components/DashboardCharts';
import { useDate } from '@/context/DateContext';
import { useTransactions, useBudgetCategories, useBudgets, useAccountBalances, useAnnualSummary } from '@/hooks/useData';
import { Transaction, BudgetCategory } from '@/types/database';

export function HomeTab() {
  const { currentDate, setCurrentDate, currentMonthStr } = useDate();
  const { transactions, loading: mvmtLoading } = useTransactions(0, currentMonthStr);
  const { budgetCategories, loading: catLoading } = useBudgetCategories();
  const { budgets, loading: bgtLoading } = useBudgets(currentMonthStr);
  const { history: balanceData } = useAccountBalances('2025-12-31');
  const { data: annualData } = useAnnualSummary(currentDate.getFullYear());

  const totalIncome = transactions
    .filter((m: Transaction) => m.type === 'income')
    .reduce((sum: number, m: Transaction) => sum + Number(m.amount), 0);

  const totalExpenses = transactions
    .filter((m: Transaction) => m.type === 'expense')
    .reduce((sum: number, m: Transaction) => sum + Number(m.amount), 0);

  const annualTotalIncome = annualData.reduce((sum: number, m: any) => sum + m.income, 0);
  const annualTotalExpense = annualData.reduce((sum: number, m: any) => sum + m.expense, 0);
  const annualNet = annualTotalIncome - annualTotalExpense;
  const annualSavingsRate = annualTotalIncome > 0 ? (annualNet / annualTotalIncome) * 100 : 0;

  const monthlyNet = totalIncome - totalExpenses;
  const monthlySavingsRate = totalIncome > 0 ? (monthlyNet / totalIncome) * 100 : 0;

  const categorySpendingMap = transactions
    .filter((m: Transaction) => m.type === 'expense')
    .reduce((acc: Record<string, number>, m: Transaction) => {
      const catId = m.budget_category_id || 'unassigned';
      acc[catId] = (acc[catId] || 0) + Number(m.amount);
      return acc;
    }, {});

  const dailySpending = transactions
    .filter((m: Transaction) => m.type === 'expense')
    .reduce((acc: Record<string, number>, m: Transaction) => {
      const day = m.date.slice(8, 10);
      acc[day] = (acc[day] || 0) + Number(m.amount);
      return acc;
    }, {});

  const trendData = Object.entries(dailySpending)
    .sort()
    .map(([day, amount]) => ({
      name: day,
      amount: amount as number
    }));

  const budgetItems = budgetCategories
    .map((cat: BudgetCategory) => {
      const spent = categorySpendingMap[cat.id] || 0;
      const budget = budgets[cat.id] || 0;
      return { ...cat, spent, budget };
    })
    .filter((item: any) => item.spent > 0 || item.budget > 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-display-40">Home</h1>
      </header>
      <div className="flex flex-col gap-6">
        <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

        {/* Savings Rate Badge */}
        <div className="self-center bg-[rgba(20,27,53,0.6)] backdrop-blur-sm rounded-full px-6 py-2 border border-[rgba(99,102,241,0.1)]">
          <div className="text-small font-medium tracking-wide flex items-center gap-2">
            <span className="text-[var(--color-brand-secondary)]">Savings Rate</span>
            <span className={monthlySavingsRate >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]"}>
              {monthlySavingsRate >= 0 ? "+" : ""}{monthlySavingsRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Income Card */}
          <div className="glass-panel flex flex-col items-center justify-center gap-2 py-6 px-2">
            <ArrowUpRight className="text-[var(--color-brand-success)] opacity-80" size={24} />
            <span className="text-label opacity-60">INCOME</span>
            <span className="text-heading-3 text-[var(--color-brand-success)] font-semibold">
              €{totalIncome.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Expenses Card */}
          <div className="glass-panel flex flex-col items-center justify-center gap-2 py-6 px-2">
            <ArrowDownRight className="text-[var(--color-brand-danger)] opacity-80" size={24} />
            <span className="text-label opacity-60">EXPENSES</span>
            <span className="text-heading-3 text-white font-semibold">
              €{totalExpenses.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Net Card */}
          <div className="glass-panel flex flex-col items-center justify-center gap-2 py-6 px-2">
            <Equal className="text-[var(--color-brand-secondary)] opacity-80" size={24} />
            <span className="text-label opacity-60">NET</span>
            <span className="text-heading-3 text-white font-semibold">
              €{monthlyNet.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      <Link href="/add" className="w-full">
        <Button fullWidth className="gap-2 py-4">
          <PlusCircle size={20} />
          <span>Add Transaction</span>
        </Button>
      </Link>

      <div className="glass-panel">
        <h3 className="text-heading-3 mb-4">Daily Spending Trend</h3>
        <div className="h-[200px] w-full">
          <SpendingTrendChart data={trendData} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-heading-3">Budget vs Actual</h3>
        {catLoading || mvmtLoading || bgtLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : budgetItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {budgetItems.map((item: any) => {
              const percent = item.budget > 0 ? Math.min((item.spent / item.budget) * 100, 100) : 0;
              return (
                <div key={item.id} className="glass-panel p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-body">
                    <span className="font-medium text-[var(--color-brand-primary)] text-sm">{item.name}</span>
                    <span className="text-xs text-[var(--color-brand-secondary)]">
                      €{item.spent.toFixed(0)} / €{item.budget}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[rgba(99,102,241,0.1)] rounded overflow-hidden mt-1">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: percent > 90 ? 'var(--color-brand-danger)' : 'var(--color-brand-accent)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 opacity-50 text-small">No transactions for this month.</div>
        )}
      </div>
    </div>
  );
}
