'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { financeService } from '@/lib/financeService';
import { useTransactions, useBudgetCategories } from '@/hooks/useData';
import { useDate } from '@/context/DateContext';
import { ChevronLeft, Search, Download, Calendar, Check } from 'lucide-react';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { Button } from '@/components/ui/Button';
import { Transaction } from '@/types/database';

export default function TransactionsPage() {
  const router = useRouter();

  const handleDelete = async (tx: Transaction) => {
    if (window.confirm('Sei sicuro di voler eliminare questa transazione?')) {
      try {
        await financeService.deleteTransaction(tx);
        window.location.reload();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Errore eliminazione transazione');
      }
    }
  };
  const { currentMonthStr } = useDate();
  
  // 1. Input state for the range (what user is typing/picking)
  const [inputRange, setInputRange] = useState({
    start: `${currentMonthStr}-01`,
    end: new Date(
      parseInt(currentMonthStr.split('-')[0]), 
      parseInt(currentMonthStr.split('-')[1]), 
      0
    ).toISOString().split('T')[0]
  });

  // 2. Active state for the range (what is actually used for the query)
  const [activeRange, setActiveRange] = useState(inputRange);

  const { transactions, loading } = useTransactions(0, activeRange.start, activeRange.end);
  const { budgetCategories } = useBudgetCategories();
  const [search, setSearch] = useState('');

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const s = search.toLowerCase();
    return transactions.filter(t => 
      t.notes?.toLowerCase().includes(s) || 
      t.amount.toString().includes(s)
    );
  }, [transactions, search]);

  const handleApplyFilter = () => {
    setActiveRange(inputRange);
  };

  const handleDownload = () => {
    if (filteredTransactions.length === 0) return;
    
    // Create CSV content
    const headers = ['Date', 'Amount', 'Type', 'Category', 'Notes'];
    const rows = filteredTransactions.map(t => {
      const cat = budgetCategories.find(c => c.id === t.budget_category_id)?.name || 'Uncategorized';
      return [t.date, t.amount, t.type, cat, t.notes || ''].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${activeRange.start}_to_${activeRange.end}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFilterChanged = inputRange.start !== activeRange.start || inputRange.end !== activeRange.end;

  return (
    <div className="bg-[var(--color-brand-navy)] min-h-screen text-[var(--color-brand-primary)] pb-12">
      <div className="max-w-2xl mx-auto px-6 pt-8 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-brand-secondary)] hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-display-40 font-bold tracking-tight text-white">History</h1>
          </div>
          <button 
            onClick={handleDownload}
            disabled={filteredTransactions.length === 0}
            className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] text-[var(--color-brand-secondary)] hover:text-white transition-colors border border-[rgba(255,255,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download size={18} />
          </button>
        </header>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          
          <div className="glass-panel p-4 flex flex-col gap-4 border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-1">
               <div className="flex items-center gap-2">
                 <Calendar size={14} className="text-[var(--color-brand-accent)]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-secondary)]">Date Range Filter</span>
               </div>
               
               <button 
                  onClick={handleApplyFilter}
                  disabled={!isFilterChanged || loading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isFilterChanged 
                    ? 'bg-[var(--color-brand-accent)] text-white shadow-lg shadow-[rgba(99,102,241,0.2)]' 
                    : 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.2)]'
                  }`}
               >
                 <Check size={12} />
                 Apply Range
               </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase pl-1">From</label>
                <input 
                  type="date" 
                  value={inputRange.start}
                  onChange={(e) => setInputRange({ ...inputRange, start: e.target.value })}
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[var(--color-brand-accent)] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase pl-1">To</label>
                <input 
                  type="date" 
                  value={inputRange.end}
                  onChange={(e) => setInputRange({ ...inputRange, end: e.target.value })}
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-[var(--color-brand-accent)] transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-brand-secondary)] group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by notes or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-[var(--color-brand-secondary)] outline-none focus:border-[var(--color-brand-accent)] focus:bg-[rgba(255,255,255,0.05)] transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Transactions list */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="py-20 text-center text-[var(--color-brand-secondary)] flex flex-col items-center gap-4">
               <div className="w-8 h-8 border-4 border-t-[var(--color-brand-accent)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
               Filtering results...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-20 text-center glass-panel border-dashed border-[rgba(255,255,255,0.1)] px-4">
              <p className="text-[var(--color-brand-secondary)] text-sm font-medium leading-relaxed">No transactions found for the selected period.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {filteredTransactions.map((tx) => {
                 const category = budgetCategories.find(c => c.id === tx.budget_category_id);
                 return (
                   <TransactionCard 
                     key={tx.id} 
                     title={tx.notes || 'No notes'}
                     subtitle={category?.name || 'Uncategorized'}
                     amount={tx.amount}
                     type={tx.type as "income" | "expense"}
                     date={tx.date}
                     onEdit={() => router.push(`/edit/${tx.id}`)}
                     onDelete={() => handleDelete(tx)}
                   />
                 );
               })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
