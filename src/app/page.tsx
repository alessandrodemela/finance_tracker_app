'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import { Home, Calendar, BarChart3, TrendingUp, Eye, EyeOff, LogOut } from 'lucide-react';
import { HomeTab } from '@/components/tabs/HomeTab';
import { MonthlyTab } from '@/components/tabs/MonthlyTab';
import { YearlyTab } from '@/components/tabs/YearlyTab';
import { InsightsTab } from '@/components/tabs/InsightsTab';
import { cn } from '@/lib/utils';


type Tab = 'home' | 'monthly' | 'yearly' | 'insights';

import { Sidebar } from '@/components/ui/Sidebar';
import { DesktopDashboard } from '@/components/DesktopDashboard';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSensitiveVisible, setIsSensitiveVisible] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Client-side auth guard: verify token on every mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem('auth_token');
          router.replace('/login');
        } else {
          setIsAuthChecked(true);
        }
      })
      .catch(() => {
        // Network error: let them through (middleware already covers the server-side check)
        setIsAuthChecked(true);
      });
  }, [router]);

  const handleLogout = async () => {
    // Clear client-side token
    localStorage.removeItem('auth_token');
    // Clear server-side cookie
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  // Show spinner while checking auth
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-navy)]">
        <div className="w-6 h-6 border-2 border-[var(--color-brand-success)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        
        {/* Mobile-only Header Section */}
        <header className="flex lg:hidden items-center justify-between px-6 pt-10 pb-4">
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white tracking-[0.3em] uppercase">
              {activeTab === 'home' ? 'Overview' : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Eye toggle */}
            <button 
              onClick={() => setIsSensitiveVisible(!isSensitiveVisible)}
              className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white active:bg-[rgba(255,255,255,0.1)] transition-all active:scale-95 shadow-lg touch-manipulation"
              aria-label={isSensitiveVisible ? "Hide sensitive information" : "Show sensitive information"}
            >
              {isSensitiveVisible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        </header>

        {/* Desktop Dashboard — full width, no horizontal padding */}
        <div className="hidden lg:block w-full">
          {activeTab === 'home' && (
            <DesktopDashboard 
              isSensitiveVisible={isSensitiveVisible} 
              setIsSensitiveVisible={setIsSensitiveVisible} 
            />
          )}
          {activeTab !== 'home' && (
            <div className="px-6 pt-4 pb-10">
              {activeTab === 'monthly' && <MonthlyTab />}
              {activeTab === 'yearly' && <YearlyTab />}
              {activeTab === 'insights' && <InsightsTab />}
            </div>
          )}
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden px-4 sm:px-6 pt-4 pb-40">
          {activeTab === 'home' && <HomeTab isSensitiveVisible={isSensitiveVisible} />}
          {activeTab === 'monthly' && <MonthlyTab />}
          {activeTab === 'yearly' && <YearlyTab />}
          {activeTab === 'insights' && <InsightsTab />}
        </div>
      </main>

      {/* Fixed bottom navigation (Mobile only) */}
      <div className="lg:hidden">
        <BottomNav items={navItems.map(item => ({ ...item, icon: React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 }) }))} />
      </div>
    </div>
  );
}
