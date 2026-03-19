'use client';

import React, { useMemo } from 'react';
import { useDate } from '@/context/DateContext';
import { useTransactions, useBudgetCategories, useBudgets } from '@/hooks/useData';
import { Transaction, BudgetCategory } from '@/types/database';

import { MonthSelector } from '@/components/MonthSelector';
import { MonthlyKPICards } from '@/components/ui/MonthlyKPICards';
import { CategoryBreakdown, CategoryBudgetItem } from '@/components/ui/CategoryBreakdown';
import { DailySpendingChart, DailySpendingData } from '@/components/ui/DailySpendingChart';
import { TransactionCard } from '@/components/ui/TransactionCard';

export function MonthlyTab() {
  const { currentDate, setCurrentDate, currentMonthStr } = useDate();
  
  // Data Fetching
  const dateRange = useMemo(() => {
    const [year, month] = currentMonthStr.split('-').map(Number);
    return {
      start: `${currentMonthStr}-01`,
      end: new Date(year, month, 0).toISOString().split('T')[0]
    };
  }, [currentMonthStr]);

  const { transactions, loading: txLoading } = useTransactions(0, dateRange.start, dateRange.end);
  const { budgetCategories, loading: catLoading } = useBudgetCategories();
  const { budgets, loading: bgtLoading } = useBudgets(currentMonthStr);

  // Calculations
  const { income, expenses, net, savingsRate } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    
    transactions.forEach(t => {
      if (t.type === 'income') inc += Number(t.amount);
      else if (t.type === 'expense') exp += Number(t.amount);
    });
    
    const n = inc - exp;
    const rate = inc > 0 ? (n / inc) * 100 : 0;
    
    return { income: inc, expenses: exp, net: n, savingsRate: rate };
  }, [transactions]);

  // Category Breakdown Logic
  const budgetItems = useMemo<CategoryBudgetItem[]>(() => {
    const spendingMap = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const catId = t.budget_category_id || 'unassigned';
        acc[catId] = (acc[catId] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    return budgetCategories
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        spent: spendingMap[cat.id] || 0,
        budget: budgets[cat.id] || 0
      }))
      .filter(item => item.spent > 0 || item.budget > 0)
      // Sort by percentage spent
      .sort((a, b) => {
        const p1 = a.budget > 0 ? a.spent / a.budget : (a.spent > 0 ? 1 : 0);
        const p2 = b.budget > 0 ? b.spent / b.budget : (b.spent > 0 ? 1 : 0);
        return p2 - p1;
      });
  }, [transactions, budgetCategories, budgets]);

  // Daily Spending Chart Data
  const dailyChartData = useMemo<DailySpendingData[]>(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const dataObj: Record<string, number> = {};
    
    // Initialize all days to 0
    for(let i=1; i<=daysInMonth; i++) {
        dataObj[i.toString().padStart(2, '0')] = 0;
    }

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const day = t.date.slice(8, 10);
        dataObj[day] = (dataObj[day] || 0) + Number(t.amount);
      });

    return Object.entries(dataObj)
      .sort()
      .map(([day, amount]) => ({ day, amount }));
  }, [transactions, currentDate]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-6 animate-in slide-in-from-bottom-[10px] fade-in duration-500">
      
      {/* 1. Month Selector */}
      <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

      {/* 2. Monthly KPI Cards */}
      <MonthlyKPICards income={income} expenses={expenses} net={net} />

      {/* 3. Savings Rate Badge */}
      <div className="self-center bg-[rgba(20,27,53,0.6)] backdrop-blur-sm rounded-full px-8 py-2.5 border border-[rgba(255,255,255,0.05)] shadow-lg mt-[-10px]">
        <div className="text-small font-medium tracking-wide flex items-center gap-3">
          <span className="font-bold text-[var(--color-brand-secondary)] uppercase text-[10px] tracking-widest bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded">Savings Rate</span>
          <span className={`font-bold text-[14px] ${savingsRate >= 0 ? "text-[#10B981]" : "text-[#F05A64]"}`}>
            {savingsRate >= 0 ? "+" : ""}{savingsRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 4. Category Breakdown */}
      <div className="glass-panel p-5 mt-2 overflow-hidden relative">
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-heading-3 tracking-wide text-white">Budget vs Actual</h3>
          <button 
            onClick={() => window.location.href = '/budget'}
            className="text-[10px] font-bold tracking-widest uppercase bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-brand-secondary)] hover:text-white px-3 py-1.5 rounded transition-all border border-[rgba(255,255,255,0.05)]"
          >
            Edit Budgeting
          </button>
        </div>
        <div className="h-full max-h-[300px] overflow-y-auto custom-scrollbar pr-2 pb-2">
            <CategoryBreakdown items={budgetItems} loading={txLoading || catLoading || bgtLoading} />
        </div>
      </div>

      {/* 5. Daily Spending Trend Chart */}
      <div className="glass-panel p-5 mt-1 relative">
        <h3 className="text-heading-3 mb-5 px-1 tracking-wide text-white">Daily Spending Trend</h3>
        <div className="h-[200px] w-full">
            <DailySpendingChart data={dailyChartData} />
        </div>
      </div>

      {/* 6. Transaction List (Full month) */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-heading-3 px-1 tracking-wide text-white">Monthly Transactions</h3>
        {txLoading ? (
            <div className="py-10 text-center text-[var(--color-brand-secondary)] text-sm">Loading transactions...</div>
        ) : transactions.length === 0 ? (
            <div className="py-10 text-center glass-panel border-dashed border-[rgba(255,255,255,0.1)] text-[var(--color-brand-secondary)] text-sm">No transactions this month.</div>
        ) : (
            transactions.map(tx => {
                const category = budgetCategories.find(c => c.id === tx.budget_category_id);
                return (
                    <TransactionCard 
                        key={tx.id} 
                        title={tx.notes || 'No notes'}
                        subtitle={category?.name || 'Uncategorized'}
                        amount={tx.amount}
                        type={tx.type as "income" | "expense"}
                        date={tx.date}
                    />
                );
            })
        )}
      </div>

    </div>
  );
}
