'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';

import {
  useTransactions,
  useAccounts,
  triggerRefresh,
  useAccountBalances
} from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useDate } from '@/context/DateContext';
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  MoreHorizontal,
  Eye,
  EyeOff,
  LogOut,
  X
} from 'lucide-react';
import { NetWorthChart } from '@/components/DashboardCharts';
import { cn } from '@/lib/utils';
import { NewTransactionModal } from '@/components/modals/NewTransactionModal';
import { NewAccountModal } from '@/components/modals/NewAccountModal';

interface DesktopDashboardProps {
  isSensitiveVisible: boolean;
  setIsSensitiveVisible: (visible: boolean) => void;
}

// All possible KPI ranges
type KpiRange = '1M' | 'MTD' | '1Y' | 'YTD' | 'ALL';
const KPI_RANGES: KpiRange[] = ['1M', 'MTD', '1Y', 'YTD', 'ALL'];

/** Compute start/end date strings for a given KPI range */
function getKpiDateRange(range: KpiRange): { start: string; end: string } {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  switch (range) {
    case '1M': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return { start: d.toISOString().split('T')[0], end: today };
    }
    case 'MTD': {
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      return { start, end: today };
    }
    case '1Y': {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return { start: d.toISOString().split('T')[0], end: today };
    }
    case 'YTD': {
      const start = `${now.getFullYear()}-01-01`;
      return { start, end: today };
    }
    case 'ALL':
    default:
      return { start: '2000-01-01', end: today };
  }
}

export function DesktopDashboard({ isSensitiveVisible, setIsSensitiveVisible }: DesktopDashboardProps) {
  const router = useRouter();
  // Data Fetching
  const { accounts } = useAccounts();
  const { history, current: currentBalances, loading: balancesLoading } = useAccountBalances('2024-01-01');

  // Auth User State
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User';
        setUserName(name);
        setUserInitials(name.substring(0, 2).toUpperCase());
      }
    });
  }, []);

  // Independent KPI time range state
  const [kpiRange, setKpiRange] = useState<KpiRange>('MTD');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const kpiDateRange = useMemo(() => getKpiDateRange(kpiRange), [kpiRange]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch ALL transactions for full-period search
  const { transactions: allTransactions } = useTransactions(0, '2000-01-01', new Date().toISOString().split('T')[0]);

  // Fetch transactions for KPI range
  const { transactions: kpiTransactions, loading: txLoading } = useTransactions(0, kpiDateRange.start, kpiDateRange.end);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTransactions.filter(t =>
      t.notes?.toLowerCase().includes(q) ||
      t.amount.toString().includes(q) ||
      t.type.includes(q)
    ).slice(0, 8);
  }, [allTransactions, searchQuery]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Calculations — Total Net Worth
  const totalBalance = useMemo(() => {
    return Object.values(currentBalances).reduce((sum, b) => sum + b, 0);
  }, [currentBalances]);

  // KPI calculations based on selected KPI range
  const { income, expenses, net } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    kpiTransactions.forEach(t => {
      if (t.type === 'income') inc += Number(t.amount);
      else if (t.type === 'expense') exp += Number(t.amount);
    });
    return { income: inc, expenses: exp, net: inc - exp };
  }, [kpiTransactions]);

  // Chart Data Processing for Net Worth — now synced with kpiRange
  const chartData = useMemo(() => {
    if (history.length === 0) return [];
    const now = new Date();
    let filterDate: Date;

    switch (kpiRange) {
      case '1M': filterDate = new Date(now.setMonth(now.getMonth() - 1)); break;
      case 'MTD': filterDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case '1Y': filterDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      case 'YTD': filterDate = new Date(now.getFullYear(), 0, 1); break;
      case 'ALL': default: return history;
    }
    return history.filter(d => new Date(d.fullDate || d.name) >= filterDate);
  }, [history, kpiRange]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-brand-navy)] text-[var(--color-brand-primary)] animate-in fade-in duration-700 w-full">
      {/* TOP HEADER */}
      <header className="h-24 border-b border-white/5 bg-black/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-10 sticky top-0 z-10 w-full">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-[var(--color-brand-primary)] tracking-tight">Welcome back, {userName}</p>
          </div>

          {/* TOTAL NET WORTH HERO IN HEADER */}
          <div className="hidden xl:flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-[1.25rem] px-6 py-3 backdrop-blur-sm group hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-default">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--color-brand-secondary)] text-[10px] font-black uppercase tracking-[0.2em]">Total Net Worth</span>
              <span className={cn(
                "text-2xl font-bold tracking-tighter text-white font-mono",
                !isSensitiveVisible && "blur-lg"
              )}>
                €{totalBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Functional Search Bar */}
          <div ref={searchRef} className="relative hidden md:block">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-72 focus-within:border-white/20 transition-all group">
              <Search className="w-4 h-4 text-[var(--color-brand-secondary)]" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                onFocus={() => setIsSearchOpen(true)}
                className="bg-transparent border-none outline-none text-sm text-[var(--color-brand-primary)] placeholder:text-[var(--color-brand-secondary)] w-full"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="text-[var(--color-brand-secondary)] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {isSearchOpen && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-[var(--color-brand-card)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-4 text-[var(--color-brand-secondary)] text-sm text-center">No results found</div>
                ) : (
                  searchResults.map(t => (
                    <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors" onClick={() => router.push(`/edit/${t.id}`)}>
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">{t.notes || 'No notes'}</span>
                        <span className="text-xs text-[var(--color-brand-secondary)]">{t.date} · {t.type}</span>
                      </div>
                      <span className={cn('text-sm font-bold font-mono', t.type === 'income' ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-danger)]')}>
                        {t.type === 'income' ? '+' : '-'}€{Math.abs(Number(t.amount)).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSensitiveVisible(!isSensitiveVisible)}
              className="text-[var(--color-brand-secondary)] hover:text-white transition-colors p-2.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10"
              title={isSensitiveVisible ? "Hide sensitive data" : "Show sensitive data"}
            >
              {isSensitiveVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace('/login');
              }}
              className="lg:hidden text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-danger)] transition-colors p-2.5 hover:bg-[var(--color-brand-danger)]/10 rounded-xl border border-transparent"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-2"></div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-white text-black hover:bg-white/90 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add New</span>
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-black border border-white/20 flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-xl">
              {userInitials}
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <div className="flex-1 px-4 lg:px-10 py-8 flex flex-col gap-8 pb-20 w-full mx-auto">

        {/* SECTION: KPI CARDS */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-[var(--color-brand-secondary)] text-xs font-bold uppercase tracking-[0.15em]">
              Overview
            </h2>
            <div className="flex items-center gap-1 bg-black border border-white/5 rounded-xl p-1">
              {KPI_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setKpiRange(range)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    kpiRange === range
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-[var(--color-brand-secondary)] hover:text-white"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <KPICard
              label="Total Income"
              value={income}
              icon={<ArrowUpRight className="w-5 h-5 text-[var(--color-brand-success)]" />}
              isVisible={isSensitiveVisible}
              loading={txLoading}
            />
            <KPICard
              label="Total Expenses"
              value={expenses}
              icon={<ArrowDownRight className="w-5 h-5 text-[var(--color-brand-danger)]" />}
              isVisible={isSensitiveVisible}
              loading={txLoading}
            />
            <KPICard
              label="Total Savings"
              value={net}
              icon={<TrendingUp className="w-5 h-5 text-[var(--color-brand-success)]" />}
              isVisible={isSensitiveVisible}
              loading={txLoading}
            />
          </div>
        </div>

        {/* ROW 2: NET WORTH CHART + ACCOUNTS side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-5 gap-8 w-full">

          <div className="xl:col-span-3">
            <DashboardCard className="h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white font-bold text-lg">Net Worth Trend</h3>
                  <p className="text-[var(--color-brand-secondary)] text-sm">Historical balance overview</p>
                </div>
              </div>
              <div className="h-[400px] w-full">
                {balancesLoading ? (
                  <div className="w-full h-full animate-pulse bg-white/5 rounded-2xl"></div>
                ) : (
                  <NetWorthChart data={chartData} isVisible={isSensitiveVisible} />
                )}
              </div>
            </DashboardCard>
          </div>

          {/* YOUR ACCOUNTS — takes 2/5 of the row */}
          <div className="xl:col-span-2">
            <DashboardCard className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white font-bold text-lg">Your Accounts</h3>
                </div>
                <button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="text-[var(--color-brand-secondary)] hover:text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>

              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {balancesLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 animate-pulse bg-white/5 rounded-2xl"></div>
                    ))}
                  </div>
                ) : accounts.length > 0 ? (
                  accounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors group mb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{account.name}</p>
                          <p className="text-[var(--color-brand-secondary)] text-xs font-medium uppercase">{account.currency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-white font-mono font-bold text-sm", !isSensitiveVisible && "blur-md")}>
                          € {currentBalances[account.id]?.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[var(--color-brand-secondary)] text-sm text-center mt-10">No accounts yet.</div>
                )}
              </div>
            </DashboardCard>
          </div>

        </div>
      </div>

      {/* NEW TRANSACTION MODAL */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
        }}
      />

      <NewAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSuccess={() => {
          triggerRefresh();
        }}
      />

    </div>
  );
}

function DashboardCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "bg-[var(--color-brand-card)] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group/card hover:border-white/10 transition-all duration-500",
      className
    )}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl -mr-32 -mt-32 group-hover/card:bg-white/[0.03] transition-colors duration-500"></div>
      {children}
    </div>
  );
}

function KPICard({ label, value, trend, trendUp, icon, isVisible, loading }: any) {
  return (
    <DashboardCard className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
          {icon}
        </div>
        <button className="p-1 rounded-lg transition-colors hover:bg-white/5 text-white/40">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-auto">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <div className="h-9 w-32 animate-pulse bg-white/10 rounded-lg"></div>
          ) : (
            <h2 className={cn(
              "text-3xl font-bold tracking-tight font-mono text-white",
              !isVisible && "blur-lg"
            )}>
              €{Math.abs(value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}
