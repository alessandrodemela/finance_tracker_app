'use client';

import { useState } from 'react';
import { MonthSelector } from '@/components/MonthSelector';
import { useTransactions, useCategories, useAccounts } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { useDate } from '@/context/DateContext';
import Link from 'next/link';
import { Trash2, Edit2, Filter } from 'lucide-react';
import styles from './page.module.css';
import { Select } from '@/components/ui/Select';

export default function TransactionsPage() {
  const { currentDate, setCurrentDate, currentMonthStr } = useDate();
  const { transactions, loading: mvmtLoading } = useTransactions(0, currentMonthStr);
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  // Filters state
  const [filters, setFilters] = useState({
    category_id: '',
    account_id: '',
    is_fixed: 'all',
    is_necessary: 'all',
    is_split: 'all',
  });

  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = transactions.filter(m => {
    if (filters.category_id && m.category_id !== filters.category_id) return false;
    if (filters.account_id && m.account_id !== filters.account_id) return false;
    
    if (filters.is_fixed !== 'all') {
      const val = filters.is_fixed === 'true';
      if (m.is_fixed !== val) return false;
    }
    
    if (filters.is_necessary !== 'all') {
      const val = filters.is_necessary === 'true';
      if (m.is_necessary !== val) return false;
    }
    
    if (filters.is_split !== 'all') {
      const val = filters.is_split === 'true';
      if (m.is_split !== val) return false;
    }
    
    return true;
  });

  const expenses = filteredTransactions.filter(m => m.type === 'expense');
  const incomes = filteredTransactions.filter(m => m.type === 'income');
  const transfers = filteredTransactions.filter(m => m.type === 'transfer');

  // KPIs
  const totalIncome = incomes.reduce((sum, m) => sum + Number(m.amount), 0);
  const totalExpenses = expenses.reduce((sum, m) => sum + Number(m.amount), 0);

  const getAccountName = (id: string | null) => {
    if (!id) return '-';
    const acc = accounts.find(a => a.id === id);
    return acc ? acc.name : 'Unknown';
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return 'Uncategorized';
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await supabase.from('transactions').delete().eq('id', id);
      window.location.reload(); 
    }
  };

  const resetFilters = () => {
    setFilters({
      category_id: '',
      account_id: '',
      is_fixed: 'all',
      is_necessary: 'all',
      is_split: 'all',
    });
  };

  const renderTransaction = (m: any) => {
    const isExpense = m.type === 'expense';
    const isIncome = m.type === 'income';
    const isTransfer = m.type === 'transfer';

    return (
      <div key={m.id} className={styles.transactionRow}>
        <div className={styles.transactionInfo}>
          {isTransfer ? (
            <div className={styles.category}>
              {getAccountName(m.from_account_id)} → {getAccountName(m.to_account_id)}
            </div>
          ) : (
            <div className={styles.category}>{getCategoryName(m.category_id)}</div>
          )}
          {m.notes && <div className={styles.note}>{m.notes}</div>}
          <div className={styles.date}>{new Date(m.date).toLocaleDateString()}</div>
        </div>
        <div className={styles.transactionActions}>
          <div className={`${styles.amount} ${isExpense ? styles.negative : isIncome ? styles.positive : styles.transfer}`}>
            {isExpense ? '- ' : isIncome ? '+ ' : ''}€{Math.abs(Number(m.amount)).toFixed(2)}
          </div>
          <div className={styles.actions}>
            <Link href={`/edit/${m.id}`} className={styles.iconBtn}>
              <Edit2 size={16} />
            </Link>
            <button className={styles.iconBtn} onClick={() => handleDelete(m.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className="gradient-text">Transactions</h1>
      </header>

      <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

      {/* KPI Section */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} data-type="income">
          <span className={styles.kpiLabel}>Income</span>
          <span className={styles.kpiValuePositive}>€{totalIncome.toFixed(0)}</span>
        </div>
        <div className={styles.kpiCard} data-type="expense">
          <span className={styles.kpiLabel}>Expenses</span>
          <span className={styles.kpiValueNegative}>€{totalExpenses.toFixed(0)}</span>
        </div>
        <div className={styles.kpiCard} data-type={(totalIncome - totalExpenses) >= 0 ? "income" : "expense"}>
          <span className={styles.kpiLabel}>Net</span>
          <span className={(totalIncome - totalExpenses) >= 0 ? styles.kpiValuePositive : styles.kpiValueNegative}>
            {Math.sign(totalIncome - totalExpenses) === -1 ? "- " : ""}€{Math.abs(totalIncome - totalExpenses).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className={styles.filterActions}>
        <button 
          className={`${styles.filterToggle} ${showFilters ? styles.filterActive : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          <span>Filters</span>
          {(filters.category_id || filters.account_id || filters.is_fixed !== 'all' || filters.is_necessary !== 'all' || filters.is_split !== 'all') && (
            <span className={styles.filterBadge}>!</span>
          )}
        </button>
        {showFilters && (
          <button className={styles.resetBtn} onClick={resetFilters}>
            Reset
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGrid}>
            <Select
              label="Category"
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(c => ({ value: c.id, label: c.name }))
              ]}
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
            />
            <Select
              label="Account"
              options={[
                { value: '', label: 'All Accounts' },
                ...accounts.map(a => ({ value: a.id, label: a.name }))
              ]}
              value={filters.account_id}
              onChange={(e) => setFilters({ ...filters, account_id: e.target.value })}
            />
            <Select
              label="Fixed"
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
              value={filters.is_fixed}
              onChange={(e) => setFilters({ ...filters, is_fixed: e.target.value })}
            />
            <Select
              label="Necessary"
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
              value={filters.is_necessary}
              onChange={(e) => setFilters({ ...filters, is_necessary: e.target.value })}
            />
            <Select
              label="Split"
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
              value={filters.is_split}
              onChange={(e) => setFilters({ ...filters, is_split: e.target.value })}
            />
          </div>
        </div>
      )}

      {mvmtLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.lists}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Income</h2>
            {incomes.length === 0 ? (
              <div className={styles.empty}>No income matches filters</div>
            ) : (
              <div className={styles.cardList}>
                {incomes.map(m => renderTransaction(m))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Expenses</h2>
            {expenses.length === 0 ? (
              <div className={styles.empty}>No expenses matches filters</div>
            ) : (
              <div className={styles.cardList}>
                {expenses.map(m => renderTransaction(m))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Transfers</h2>
            {transfers.length === 0 ? (
              <div className={styles.empty}>No transfers matches filters</div>
            ) : (
              <div className={styles.cardList}>
                {transfers.map(m => renderTransaction(m))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
