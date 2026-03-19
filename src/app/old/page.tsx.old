'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { Home, ListOrdered, PiggyBank, BarChart3, TrendingUp } from 'lucide-react';
import { HomeTab } from '@/components/tabs/HomeTab';
import { TransactionsTab } from '@/components/tabs/TransactionsTab';
import { BudgetTab } from '@/components/tabs/BudgetTab';
import { BalanceTab } from '@/components/tabs/BalanceTab';
import { SummaryTab } from '@/components/tabs/SummaryTab';
import styles from './page.module.css';

type Tab = 'home' | 'transactions' | 'budget' | 'balance' | 'summary';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const navItems = [
    {
      icon: <Home size={24} />,
      label: 'Home',
      isActive: activeTab === 'home',
      onClick: () => setActiveTab('home')
    },
    {
      icon: <ListOrdered size={24} />,
      label: 'History',
      isActive: activeTab === 'transactions',
      onClick: () => setActiveTab('transactions')
    },
    {
      icon: <PiggyBank size={24} />,
      label: 'Budget',
      isActive: activeTab === 'budget',
      onClick: () => setActiveTab('budget')
    },
    {
      icon: <BarChart3 size={24} />,
      label: 'Balance',
      isActive: activeTab === 'balance',
      onClick: () => setActiveTab('balance')
    },
    {
      icon: <TrendingUp size={24} />,
      label: 'Summary',
      isActive: activeTab === 'summary',
      onClick: () => setActiveTab('summary')
    }
  ];

  return (
    <div className="bg-[var(--color-brand-navy)] min-h-screen text-[var(--color-brand-primary)]">
      <main className={styles.container}>
        {/* Tab content with proper padding */}
        <div className="px-6 pt-6 pb-32">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'budget' && <BudgetTab />}
          {activeTab === 'balance' && <BalanceTab />}
          {activeTab === 'summary' && <SummaryTab />}
        </div>
      </main>

      {/* Fixed bottom navigation */}
      <BottomNav items={navItems} />
    </div>
  );
}
