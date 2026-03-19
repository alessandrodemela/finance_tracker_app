import { useState } from 'react';
import { MonthSelector } from '@/components/MonthSelector';
import { useTransactions, useCategories, useAccounts } from '@/hooks/useData';
import { useDate } from '@/context/DateContext';
import Link from 'next/link';
import { Trash2, Edit2, Filter } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { financeService } from '@/lib/financeService';
import { TransactionCard } from '@/components/ui/TransactionCard';

export function TransactionsTab() {
  const { currentDate, setCurrentDate, currentMonthStr } = useDate();
  const { transactions, loading: mvmtLoading } = useTransactions(0, currentMonthStr);
  const { categories } = useCategories();
  const { accounts } = useAccounts();

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this transaction?')) {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
        await financeService.deleteTransaction(tx);
        window.location.reload(); 
      }
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
    const isTrans = m.type === 'transfer';
    const title = isTrans 
      ? `${getAccountName(m.from_account_id)} → ${getAccountName(m.to_account_id)}`
      : getCategoryName(m.category_id);
    const subtitle = new Date(m.date).toLocaleDateString() + (m.notes ? ` • ${m.notes}` : '');
    
    return (
      <Link href={`/edit/${m.id}`} key={m.id} className="block relative group">
        <TransactionCard 
          title={title}
          subtitle={subtitle}
          amount={m.amount}
          type={m.type === 'income' ? 'income' : 'expense'}
        />
        <button 
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-brand-danger)] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => handleDelete(m.id, e)}
        >
          <Trash2 size={16} />
        </button>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-display-40">History</h1>
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
          <div className={`text-heading-3 ${totalIncome - totalExpenses >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]"}`}>
            {totalIncome - totalExpenses < 0 ? "-" : ""}€{Math.abs(totalIncome - totalExpenses).toFixed(0)}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${showFilters ? 'bg-[rgba(99,102,241,0.2)] text-[var(--color-brand-primary)]' : 'bg-transparent text-[var(--color-brand-secondary)]'}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          <span className="text-small font-medium">Filters</span>
          {(filters.category_id || filters.account_id || filters.is_fixed !== 'all' || filters.is_necessary !== 'all' || filters.is_split !== 'all') && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] ml-1" />
          )}
        </button>
        {showFilters && (
          <button className="text-small text-[var(--color-brand-secondary)] hover:text-white" onClick={resetFilters}>
            Reset
          </button>
        )}
      </div>

      {showFilters && (
        <div className="glass-panel p-4 flex flex-col gap-4">
          <Select
            label="Category"
            options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
            value={filters.category_id}
            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          />
          <Select
            label="Account"
            options={[{ value: '', label: 'All Accounts' }, ...accounts.map(a => ({ value: a.id, label: a.name }))]}
            value={filters.account_id}
            onChange={(e) => setFilters({ ...filters, account_id: e.target.value })}
          />
        </div>
      )}

      {mvmtLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-heading-3">Income</h2>
            {incomes.length === 0 ? (
              <div className="text-center py-4 opacity-50 text-small">No income matches filters</div>
            ) : (
              <div className="flex flex-col gap-2">
                {incomes.map(m => renderTransaction(m))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-heading-3">Expenses</h2>
            {expenses.length === 0 ? (
              <div className="text-center py-4 opacity-50 text-small">No expenses matches filters</div>
            ) : (
              <div className="flex flex-col gap-2">
                {expenses.map(m => renderTransaction(m))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-heading-3">Transfers</h2>
            {transfers.length === 0 ? (
              <div className="text-center py-4 opacity-50 text-small">No transfers matches filters</div>
            ) : (
              <div className="flex flex-col gap-2">
                {transfers.map(m => renderTransaction(m))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
