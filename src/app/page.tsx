'use client';

import { useState } from 'react';
import { MonthSelector } from '@/components/MonthSelector';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useTransactions, useBudgetCategories, useBudgets } from '@/hooks/useData';
import { Transaction, BudgetCategory } from '@/types/database';
import { SpendingTrendChart, CategoryPieChart } from '@/components/DashboardCharts';
import { useDate } from '@/context/DateContext';
import styles from './page.module.css';

export default function Dashboard() {
  const { currentDate, setCurrentDate, currentMonthStr } = useDate();
  const { transactions, loading: mvmtLoading } = useTransactions(0, currentMonthStr);
  const { budgetCategories, loading: catLoading } = useBudgetCategories();
  const { budgets, loading: bgtLoading } = useBudgets(currentMonthStr);

  // KPIs
  const totalIncome = transactions
    .filter((m: Transaction) => m.type === 'income')
    .reduce((sum: number, m: Transaction) => sum + Number(m.amount), 0);

  const totalExpenses = transactions
    .filter((m: Transaction) => m.type === 'expense')
    .reduce((sum: number, m: Transaction) => sum + Number(m.amount), 0);

  // Data for Charts
  const categorySpendingMap = transactions
    .filter((m: Transaction) => m.type === 'expense')
    .reduce((acc: Record<string, number>, m: Transaction) => {
      const catId = m.budget_category_id || 'unassigned';
      acc[catId] = (acc[catId] || 0) + Number(m.amount);
      return acc;
    }, {});

  const pieData = budgetCategories
    .map(cat => ({
      name: cat.name,
      value: categorySpendingMap[cat.id] || 0
    }))
    .filter(item => item.value > 0);

  // Group by day for trend chart
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
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className="gradient-text">Personal Finance</h1>
      </header>

      <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Income</div>
          <div className={styles.kpiValuePositive}>€{totalIncome.toFixed(0)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Expenses</div>
          <div className={styles.kpiValueNegative}>€{totalExpenses.toFixed(0)}</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Daily Spending Trend</h3>
          <div className={styles.chartContainer}>
            <SpendingTrendChart data={trendData} />
          </div>
        </div>
      </div>

      <Link href="/add" className={styles.addButtonWrapper}>
        <Button className={styles.addButton}>
          <PlusCircle size={20} />
          <span>Add Transaction</span>
        </Button>
      </Link>

      <div className={styles.budgetSection}>
        <h3 className={styles.sectionTitle}>Budget vs Actual</h3>
        {catLoading || mvmtLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : budgetItems.length > 0 ? (
          <div className={styles.budgetList}>
            {budgetItems.map(item => {
              const percent = Math.min((item.spent / item.budget) * 100, 100);
              return (
                <div key={item.id} className={styles.budgetItem}>
                  <div className={styles.budgetHeader}>
                    <span className={styles.budgetCategory}>{item.name}</span>
                    <span className={styles.budgetAmounts}>
                      €{item.spent.toFixed(0)} / €{item.budget}
                    </span>
                  </div>
                  <div className={styles.progressContainer}>
                    <div
                      className={styles.progressBar}
                      style={{
                        width: `${percent}%`,
                        backgroundColor: percent > 90 ? 'var(--destructive)' : 'var(--primary)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>No transactions for this month.</div>
        )}
      </div>
    </main>
  );
}
