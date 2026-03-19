'use client';

import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { Transaction, BudgetCategory } from '@/types/database';
import { TransactionCard } from './TransactionCard';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: BudgetCategory[];
  onOpenAll: () => void;
}

export function RecentTransactions({ 
  transactions, 
  categories, 
  onOpenAll 
}: RecentTransactionsProps) {
  return (
    <div className="glass-panel p-5 flex flex-col gap-5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[rgba(0,210,255,0.03)] rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between z-10">
        <h3 className="text-heading-3 flex items-center gap-2 text-white font-bold">
          <FileText size={20} className="text-[var(--color-brand-accent)]" />
          Recent Activity
        </h3>
      </div>
      
      <div className="flex flex-col gap-3 z-10 w-full mb-2">
        {transactions.length > 0 ? (
          transactions.map(tx => {
            const cat = categories.find(c => c.id === tx.budget_category_id);
            return (
              <TransactionCard 
                key={tx.id}
                title={tx.notes || 'No notes'}
                subtitle={cat?.name || 'Uncategorized'}
                amount={tx.amount}
                type={tx.type as "income" | "expense"}
                date={tx.date}
              />
            );
          })
        ) : (
          <div className="py-8 w-full flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-1">
              <FileText size={20} className="text-[var(--color-brand-secondary)] opacity-50" />
            </div>
            <p className="text-sm font-medium text-[var(--color-brand-secondary)]">No recent transactions to display</p>
          </div>
        )}
      </div>
      
      {transactions.length > 0 && (
        <button 
          onClick={onOpenAll}
          className="w-full z-10 mt-1 py-3.5 rounded-xl bg-[rgba(0,210,255,0.05)] text-[var(--color-brand-accent)] hover:bg-[rgba(0,210,255,0.1)] hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-bold tracking-wide group"
        >
          <span>See All Transactions</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
}
