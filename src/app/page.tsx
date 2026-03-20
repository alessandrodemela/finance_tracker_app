'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { Home, Calendar, BarChart3, PiggyBank, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { HomeTab } from '@/components/tabs/HomeTab';
import { MonthlyTab } from '@/components/tabs/MonthlyTab';
import { YearlyTab } from '@/components/tabs/YearlyTab';
import { BudgetTab } from '@/components/tabs/BudgetTab';
import { InsightsTab } from '@/components/tabs/InsightsTab';
import { cn } from '@/lib/utils';
import styles from './page.module.css';

type Tab = 'home' | 'monthly' | 'yearly' | 'budget' | 'insights';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSensitiveVisible, setIsSensitiveVisible] = useState(true);

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
      <main className={cn(styles.container, "pb-12")}>
        {/* Header Section */}
        <header className="flex items-center justify-between px-4 sm:px-6 pt-8 pb-2">
          <div className="flex flex-col">
            <h1 className="text-[20px] font-light text-[var(--color-brand-secondary)] tracking-[4px]">
              {/* text-xl font-semibold text-[var(--muted)] font-sans" */}
              WELCOME BACK
            </h1>
            {/* <p className="text-[14px] font-medium text-[var(--color-brand-secondary)] opacity-70">
              Your financial overview is ready
            </p> */}
          </div>
          <button
            onClick={() => setIsSensitiveVisible(!isSensitiveVisible)}
            className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-all active:scale-95 shadow-lg"
            aria-label={isSensitiveVisible ? "Hide sensitive information" : "Show sensitive information"}
          >
            {isSensitiveVisible ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </header>

        {/* Tab content with responsive padding */}
        <div className="px-4 sm:px-6 pt-4 pb-40">
          {activeTab === 'home' && <HomeTab isSensitiveVisible={isSensitiveVisible} />}
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
