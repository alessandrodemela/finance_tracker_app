'use client';

import React, { useMemo, useState } from 'react';
import { useDate } from '@/context/DateContext';
import { useTransactions, useBudgetCategories, useBudgets, triggerRefresh } from '@/hooks/useData';
import { Transaction } from '@/types/database';
import { showToast, showConfirm } from '@/components/ui/GlobalUI';
import { useRouter } from 'next/navigation';
import { financeService } from '@/lib/financeService';

import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer, DashboardGrid, GridCol } from '@/components/ui/DashboardGrid';
import { MonthSelector } from '@/components/MonthSelector';
import { MonthlyKPICards } from '@/components/ui/MonthlyKPICards';
import { CategoryBreakdown, CategoryBudgetItem } from '@/components/ui/CategoryBreakdown';
import { DailySpendingChart, DailySpendingData } from '@/components/ui/DailySpendingChart';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { Search, Plus, Filter, Calendar, Eye, EyeOff } from 'lucide-react';
import { NewTransactionModal } from '@/components/modals/NewTransactionModal';

interface MonthlyTabProps {
  isSensitiveVisible?: boolean;
  setIsSensitiveVisible?: (visible: boolean) => void;
}

export function MonthlyTab({ isSensitiveVisible = true, setIsSensitiveVisible }: MonthlyTabProps) {
  const router = useRouter();
  const { currentDate, setCurrentDate, currentMonthStr } = useDate();

  // Local state for transaction filtering & modals
  const [txSearch, setTxSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (tx: Transaction) => {
    showConfirm('Sei sicuro di voler eliminare questa transazione?', async () => {
      try {
        await financeService.deleteTransaction(tx);
        triggerRefresh();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        showToast('Errore eliminazione transazione', 'error');
      }
    });
  };

  // Data Fetching
  const dateRange = useMemo(() => {
    const [year, month] = currentMonthStr.split('-').map(Number);
    const lastDay = new Date(year, month, 0);
    return {
      start: `${currentMonthStr}-01`,
      end: `${currentMonthStr}-${String(lastDay.getDate()).padStart(2, '0')}`
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

    for (let i = 1; i <= daysInMonth; i++) {
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

  // Filtered Transactions List
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const notes = t.notes || '';
      const catName = budgetCategories.find(c => c.id === t.budget_category_id)?.name || '';
      const matchesSearch = !txSearch.trim() ||
        notes.toLowerCase().includes(txSearch.toLowerCase()) ||
        catName.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.amount.toString().includes(txSearch);

      return matchesType && matchesSearch;
    });
  }, [transactions, typeFilter, txSearch, budgetCategories]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-brand-navy)] text-[var(--color-brand-primary)] animate-in fade-in duration-500 w-full">
      {/* 1. Page Header with Month Selector & Action Button */}
      <PageHeader
        title="Monthly Overview"
        subtitle={`Summary and detailed breakdown for ${currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`}
        controls={<MonthSelector currentDate={currentDate} onChange={setCurrentDate} />}
        actions={
          <div className="flex items-center gap-3">
            {setIsSensitiveVisible && (
              <button
                onClick={() => setIsSensitiveVisible(!isSensitiveVisible)}
                className="text-[var(--color-brand-secondary)] hover:text-white transition-colors p-2.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10"
                title={isSensitiveVisible ? "Hide sensitive data" : "Show sensitive data"}
              >
                {isSensitiveVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-slate-200 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Transaction</span>
            </button>
          </div>
        }
      />

      {/* 2. Main Page Grid Container */}
      <PageContainer>
        {/* Monthly KPI Cards Row */}
        <MonthlyKPICards
          income={income}
          expenses={expenses}
          net={net}
          savingsRate={savingsRate}
          isSensitiveVisible={isSensitiveVisible}
        />

        {/* 12-Column Responsive Dashboard Layout */}
        <DashboardGrid>
          {/* Main Column (8 cols): Charts & Budget Breakdown */}
          <GridCol span={8} className="space-y-6">
            {/* Daily Spending Trend */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 lg:p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">Daily Spending Trend</h3>
                  <p className="text-xs text-slate-400">Expense pattern over the current month</p>
                </div>
              </div>
              <div className="h-[240px] w-full">
                <DailySpendingChart data={dailyChartData} />
              </div>
            </div>

            {/* Budget vs Actual Category Breakdown */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 lg:p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">Budget vs Actual</h3>
                  <p className="text-xs text-slate-400">Category spending against allocated budgets</p>
                </div>
                <button
                  onClick={() => router.push('/budget')}
                  className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50"
                >
                  Edit Budgets
                </button>
              </div>
              <CategoryBreakdown 
                items={budgetItems} 
                loading={txLoading || catLoading || bgtLoading} 
                isSensitiveVisible={isSensitiveVisible}
              />
            </div>
          </GridCol>

          {/* Secondary Column (4 cols): Month Transactions List */}
          <GridCol span={4}>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 lg:p-6 backdrop-blur-md flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white tracking-tight">Transactions</h3>
                <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                  {filteredTransactions.length}
                </span>
              </div>

              {/* Filters & Search for Transactions */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-slate-700 transition-all">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search in month..."
                    value={txSearch}
                    onChange={e => setTxSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500 w-full"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-800/60">
                  {(['all', 'expense', 'income'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1 rounded-lg transition-all ${
                        typeFilter === type
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="space-y-2.5 overflow-y-auto max-h-[750px] custom-scrollbar pr-1">
                {txLoading ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Loading transactions...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    No transactions match your filter.
                  </div>
                ) : (
                  filteredTransactions.map(tx => {
                    const category = budgetCategories.find(c => c.id === tx.budget_category_id);
                    return (
                      <TransactionCard
                        key={tx.id}
                        title={tx.notes || 'No notes'}
                        subtitle={category?.name || 'Uncategorized'}
                        amount={tx.amount}
                        type={tx.type as "income" | "expense"}
                        date={tx.date}
                        isSensitiveVisible={isSensitiveVisible}
                        onEdit={() => router.push(`/edit/${tx.id}`)}
                        onDelete={() => handleDelete(tx)}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </GridCol>
        </DashboardGrid>
      </PageContainer>

      {/* New Transaction Modal */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => triggerRefresh()}
      />
    </div>
  );
}
