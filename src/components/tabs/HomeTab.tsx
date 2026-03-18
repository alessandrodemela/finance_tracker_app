import { useState } from 'react';
import { MonthSelector } from '@/components/MonthSelector';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-display-40">Home</h1>
      </header>

      <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel text-center p-3">
          <div className="text-label mb-1">Income</div>
          <div className="text-heading-3 text-[var(--color-brand-success)]">€{totalIncome.toFixed(0)}</div>
        </div>
        <div className="glass-panel text-center p-3">
          <div className="text-label mb-1">Expenses</div>
          <div className="text-heading-3 text-[var(--color-brand-danger)]">€{totalExpenses.toFixed(0)}</div>
        </div>
        <div className="glass-panel text-center p-3">
          <div className="text-label mb-1">Net</div>
          <div className={`text-heading-3 ${monthlyNet >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]"}`}>
            {monthlyNet < 0 ? "-" : ""}€{Math.abs(monthlyNet).toFixed(0)}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        <span className="text-body">Savings Rate</span>
        <div className="flex items-center gap-2">
          <span className={`text-heading-3 ${monthlySavingsRate >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]"}`}>
            {monthlySavingsRate.toFixed(1)}%
          </span>
          <span className="text-small opacity-60">
            (Ann: {annualSavingsRate.toFixed(1)}%)
          </span>
        </div>
      </div>

      <Link href="/add" className="w-full">
        <Button fullWidth className="gap-2">
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
                    <span className="font-medium text-[var(--color-brand-primary)]">{item.name}</span>
                    <span className="text-[var(--color-brand-secondary)]">
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
