'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { Home, ListOrdered, PiggyBank, BarChart3 } from 'lucide-react';
import { HomeTab } from '@/components/tabs/HomeTab';
import { TransactionsTab } from '@/components/tabs/TransactionsTab';
import { BudgetTab } from '@/components/tabs/BudgetTab';
import { BalanceTab } from '@/components/tabs/BalanceTab';

type Tab = 'home' | 'transactions' | 'budget' | 'balance';

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
    }
  ];

  return (
    <div className="bg-[var(--color-brand-navy)] min-h-screen text-[var(--color-brand-primary)]">
      {/* Tab content with proper padding */}
      <div className="px-6 pt-6 pb-24">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'balance' && <BalanceTab />}
      </div>
      
      {/* Fixed bottom navigation */}
      <BottomNav items={navItems} />
    </div>
  );
}
