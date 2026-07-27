'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import { Home, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import { HomeTab } from '@/components/tabs/HomeTab';
import { MonthlyTab } from '@/components/tabs/MonthlyTab';
import { YearlyTab } from '@/components/tabs/YearlyTab';
import { InsightsTab } from '@/components/tabs/InsightsTab';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

type Tab = 'home' | 'monthly' | 'yearly' | 'insights';

import { Sidebar } from '@/components/ui/Sidebar';
import { DesktopDashboard } from '@/components/DesktopDashboard';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSensitiveVisible, setIsSensitiveVisible] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const navItems = [
    {
      icon: <Home size={20} />,
      label: 'Home',
      isActive: activeTab === 'home',
      onClick: () => setActiveTab('home')
    },
    {
      icon: <Calendar size={20} />,
      label: 'Monthly',
      isActive: activeTab === 'monthly',
      onClick: () => setActiveTab('monthly')
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Yearly',
      isActive: activeTab === 'yearly',
      onClick: () => setActiveTab('yearly')
    },
    {
      icon: <TrendingUp size={20} />,
      label: 'Insights',
      isActive: activeTab === 'insights',
      onClick: () => setActiveTab('insights')
    }
  ];

  return (
    <div className="bg-[var(--color-brand-navy)] min-h-screen text-[var(--color-brand-primary)] flex w-full">
      {/* Desktop Sidebar */}
      <Sidebar items={navItems} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-w-0 w-full",
        "lg:pl-72", // Offset for Sidebar (w-72) using padding so w-full is exact
        "pb-12 lg:pb-0"
      )}>
        
        {/* Unified Dashboard Content */}
        <div className="w-full pb-24 lg:pb-0">
          {activeTab === 'home' && (
            <DesktopDashboard 
              isSensitiveVisible={isSensitiveVisible} 
              setIsSensitiveVisible={setIsSensitiveVisible} 
            />
          )}
          {activeTab !== 'home' && (
            <div className="px-4 lg:px-6 pt-4 pb-10">
              {activeTab === 'monthly' && <MonthlyTab />}
              {activeTab === 'yearly' && <YearlyTab />}
              {activeTab === 'insights' && <InsightsTab />}
            </div>
          )}
        </div>
      </main>

      {/* Fixed bottom navigation (Mobile only) */}
      <div className="lg:hidden">
        <BottomNav items={navItems.map(item => ({ ...item, icon: React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 }) }))} />
      </div>
    </div>
  );
}
