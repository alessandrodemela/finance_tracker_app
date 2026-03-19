'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTransactions, useBudgetCategories, useAccountBalances, useAccounts } from '@/hooks/useData';
import { useDate } from '@/context/DateContext';
import { Transaction, Account } from '@/types/database';

import { BalanceHero } from '@/components/ui/BalanceHero';
import { NetWorthTimeRange, TimeRange } from '@/components/ui/NetWorthTimeRange';
import { AccountsAccordion } from '@/components/ui/AccountsAccordion';
import { RecentTransactions } from '@/components/ui/RecentTransactions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlusCircle } from 'lucide-react';

export function HomeTab() {
  const { currentMonthStr } = useDate();
  
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
  const { accounts, addAccount, updateAccount, deleteAccount, loading: accLoading } = useAccounts();
  const { history, current: currentBalances } = useAccountBalances('2000-01-01');

  // Local State
  const [activeRange, setActiveRange] = useState<TimeRange>('1A');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState({ name: '', balance: '', currency: 'EUR' });

  // Calculations
  const totalBalance = useMemo(() => {
    return Object.values(currentBalances).reduce((sum, b) => sum + b, 0);
  }, [currentBalances]);

  // Chart Data Processing
  const processedData = useMemo(() => {
    if (history.length === 0) return [];
    const base = [...history];
    const lastPoint = base[base.length - 1];
    if (Math.abs(lastPoint.amount - totalBalance) > 1) {
      base.push({
        ...lastPoint,
        name: 'Today',
        fullDate: new Date().toISOString().split('T')[0],
        amount: totalBalance,
      });
    }
    return base;
  }, [history, totalBalance]);

  const chartData = useMemo(() => {
    if (processedData.length === 0) return [];
    const now = new Date();
    let filterDate: Date;

    switch (activeRange) {
      case '7D': filterDate = new Date(now.setDate(now.getDate() - 7)); break;
      case '1M': filterDate = new Date(now.setMonth(now.getMonth() - 1)); break;
      case '1A': filterDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      case 'YTD': filterDate = new Date(now.getFullYear(), 0, 1); break;
      case 'MAX': return processedData;
      default: return processedData;
    }
    return processedData.filter(d => new Date(d.fullDate || d.name) >= filterDate);
  }, [processedData, activeRange]);

  // Derived state
  const recentTransactions = transactions.slice(0, 3);

  // Handlers
  const handleAddAccount = () => {
    setEditingAccount(null);
    setAccountForm({ name: '', balance: '', currency: 'EUR' });
    setShowAccountForm(true);
  };

  const handleEditAccount = (acc: Account) => {
    setEditingAccount(acc.id);
    setAccountForm({ name: acc.name, balance: acc.active_balance.toString(), currency: acc.currency || 'EUR' });
    setShowAccountForm(true);
  };

  const handleDeleteAccount = async (acc: Account) => {
    if (window.confirm(`Are you sure you want to delete ${acc.name}?`)) {
      await deleteAccount(acc.id);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(accountForm.balance) || 0;

    if (editingAccount) {
      const { error } = await updateAccount(editingAccount, {
        name: accountForm.name,
        active_balance: val,
        currency: accountForm.currency
      });
      if (error) alert('Error updating account: ' + error.message);
      else setShowAccountForm(false);
    } else {
      const { error } = await addAccount(accountForm.name, val, accountForm.currency);
      if (error) alert('Error adding account: ' + error.message);
      else setShowAccountForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-6 animate-in slide-in-from-bottom-[10px] fade-in duration-500">
      
      {/* 1. Hero Section */}
      <BalanceHero totalBalance={totalBalance} />

      {/* 2. Time Range Selector + Chart */}
      <NetWorthTimeRange 
        chartData={chartData} 
        selectedRange={activeRange} 
        onRangeChange={setActiveRange} 
      />

      {/* 3. Bank Accounts Accordion (Restored) */}
      <AccountsAccordion 
        accounts={accounts} 
        onAddClick={handleAddAccount} 
        onEditClick={handleEditAccount} 
        onDeleteClick={handleDeleteAccount} 
      />

      {/* Account Form Modal (Restored) */}
      {showAccountForm && (
        <div className="glass-panel p-5 mt-[-10px] animate-in slide-in-from-top-2 fade-in relative z-0 border border-[rgba(255,255,255,0.1)]">
          <form onSubmit={handleSaveAccount} className="flex flex-col gap-4">
            <h3 className="text-heading-3 text-white">{editingAccount ? 'Edit Account' : 'New Account'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Account Name"
                  placeholder="e.g. Main Checking"
                  value={accountForm.name}
                  onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={accountForm.balance}
                onChange={e => setAccountForm({ ...accountForm, balance: e.target.value })}
                required
              />
              <Input
                label="Currency"
                placeholder="EUR"
                value={accountForm.currency}
                onChange={e => setAccountForm({ ...accountForm, currency: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" type="button" onClick={() => setShowAccountForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAccount ? 'Save Changes' : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Quick Actions */}
      <div className="flex flex-col gap-3 mt-4">
        <Link href="/add" className="w-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-accent)] to-[#10B981] rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <Button fullWidth className="relative bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)] py-4 rounded-xl gap-2 font-bold text-[15px] shadow-xl group-hover:scale-[1.01] transition-all">
            <PlusCircle size={20} className="text-[var(--color-brand-accent)]" />
            <span>Add Transaction</span>
          </Button>
        </Link>
      </div>

      {/* 5. Recent Transactions */}
      {txLoading || catLoading ? (
        <div className="glass-panel p-6 flex justify-center items-center text-[var(--color-brand-secondary)] text-sm font-medium">
          Loading transactions...
        </div>
      ) : (
        <RecentTransactions 
          transactions={recentTransactions} 
          categories={budgetCategories} 
          onOpenAll={() => {
            window.location.href = '/transactions';
          }} 
        />
      )}

    </div>
  );
}
