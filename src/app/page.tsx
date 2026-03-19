'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { Home, Calendar, BarChart3, PiggyBank, TrendingUp } from 'lucide-react';
import { HomeTab } from '@/components/tabs/HomeTab';
import { MonthlyTab } from '@/components/tabs/MonthlyTab';
import { YearlyTab } from '@/components/tabs/YearlyTab';
import { BudgetTab } from '@/components/tabs/BudgetTab';
import { InsightsTab } from '@/components/tabs/InsightsTab';
import styles from './page.module.css';

type Tab = 'home' | 'monthly' | 'yearly' | 'budget' | 'insights';

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
      icon: <Calendar size={24} />,
      label: 'Monthly',
      isActive: activeTab === 'monthly',
      onClick: () => setActiveTab('monthly')
    },
    {
      icon: <BarChart3 size={24} />,
      label: 'Yearly',
      isActive: activeTab === 'yearly',
      onClick: () => setActiveTab('yearly')
    },
    {
      icon: <TrendingUp size={24} />,
      label: 'Insights',
      isActive: activeTab === 'insights',
      onClick: () => setActiveTab('insights')
    }
  ];

  return (
    <div className="bg-[var(--color-brand-navy)] min-h-screen text-[var(--color-brand-primary)]">
      <main className={styles.container}>
        {/* Tab content with proper padding */}
        <div className="px-6 pt-6 pb-32">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'monthly' && <MonthlyTab />}
          {activeTab === 'yearly' && <YearlyTab />}
          {activeTab === 'insights' && <InsightsTab />}
        </div>
      </main>

      {/* Fixed bottom navigation */}
      <BottomNav items={navItems} />
    </div>
  );
}
