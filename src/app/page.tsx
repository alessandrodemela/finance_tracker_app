'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import { Home, Calendar, BarChart3, TrendingUp, Eye, EyeOff, LogOut } from 'lucide-react';
import { HomeTab } from '@/components/tabs/HomeTab';
import { MonthlyTab } from '@/components/tabs/MonthlyTab';
import { YearlyTab } from '@/components/tabs/YearlyTab';
import { InsightsTab } from '@/components/tabs/InsightsTab';
import { cn } from '@/lib/utils';
import styles from './page.module.css';

type Tab = 'home' | 'monthly' | 'yearly' | 'insights';

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
        {/* Header Section - Only visible on Home tab */}
        {activeTab === 'home' && (
          <header className="flex items-center justify-between px-4 sm:px-6 pt-8 pb-2">
            <div className="flex flex-col">
              <h1 className="text-[20px] font-light text-[var(--color-brand-secondary)] tracking-[4px]">
                WELCOME BACK
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Eye toggle */}
              <button 
                onClick={() => setIsSensitiveVisible(!isSensitiveVisible)}
                className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-all active:scale-95 shadow-lg"
                aria-label={isSensitiveVisible ? "Hide sensitive information" : "Show sensitive information"}
              >
                {isSensitiveVisible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-danger)] hover:bg-[rgba(240,90,100,0.08)] hover:border-[rgba(240,90,100,0.2)] transition-all active:scale-95 shadow-lg"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          </header>
        )}

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
