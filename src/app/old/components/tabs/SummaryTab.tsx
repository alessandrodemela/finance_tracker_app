'use client';

import { useState } from 'react';
import { useAnnualSummary } from '@/hooks/useData';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Target } from 'lucide-react';

export function SummaryTab() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading } = useAnnualSummary(year);

  const annualIncome = data.reduce((sum, m) => sum + m.income, 0);
  const annualExpense = data.reduce((sum, m) => sum + m.expense, 0);
  const annualNet = annualIncome - annualExpense;
  const annualSavingsRate = annualIncome > 0 ? (annualNet / annualIncome) * 100 : 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-6 items-start">
        <h1 className="text-display-40 font-bold">Annual Summary</h1>

        <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.03)] rounded-2xl p-1.5 border border-white/5">
          <button
            onClick={() => setYear(y => y - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xl font-bold tracking-tight">{year}</span>
          <button
            onClick={() => setYear(y => y + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 flex flex-col gap-3 border-b-2 border-b-[var(--color-brand-success)]/30">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-[var(--color-brand-success)]" size={20} />
            <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">TOTAL INCOME</span>
          </div>
          <span className="text-3xl font-bold text-[var(--color-brand-success)]">
            €{annualIncome.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="glass-panel p-5 flex flex-col gap-3 border-b-2 border-b-[var(--color-brand-danger)]/30">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-[var(--color-brand-danger)]" size={20} />
            <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">TOTAL EXPENSE</span>
          </div>
          <span className="text-3xl font-bold text-[var(--color-brand-danger)]">
            €{annualExpense.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className={`glass-panel p-5 flex flex-col gap-3 border-b-2 ${annualNet >= 0 ? 'border-b-[var(--color-brand-success)]/30' : 'border-b-[var(--color-brand-danger)]/30'}`}>
          <div className="flex items-center gap-2">
            <Target className="text-[var(--color-brand-accent)]" size={20} />
            <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">NET SAVINGS</span>
          </div>
          <span className={`text-3xl font-bold ${annualNet >= 0 ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-danger)]'}`}>
            {annualNet < 0 ? '-' : ''}€{Math.abs(annualNet).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="glass-panel p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Target className="text-[var(--color-brand-secondary)] opacity-80" size={20} />
            <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">SAVINGS RATE</span>
          </div>
          <span className={`text-2xl font-bold ${annualSavingsRate >= 0 ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-danger)]'}`}>
            {annualSavingsRate < 0 ? '-' : ''}{Math.abs(annualSavingsRate).toFixed(1)}%
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 opacity-50">Loading annual data...</div>
      ) : (
        <div className="glass-panel p-0 overflow-hidden mt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-4 text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">MONTH</th>
                  <th className="p-4 text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase text-right">INCOME</th>
                  <th className="p-4 text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase text-right">EXPENSE</th>
                  <th className="p-4 text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase text-right">NET</th>
                  <th className="p-4 text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase text-center">SAVINGS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((m) => (
                  <tr key={m.month} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-semibold text-sm uppercase tracking-tight opacity-90">{m.monthName}</td>
                    <td className="p-4 text-sm text-right text-[var(--color-brand-success)] opacity-80">€{m.income.toFixed(0)}</td>
                    <td className="p-4 text-sm text-right text-[var(--color-brand-danger)] opacity-80">€{m.expense.toFixed(0)}</td>
                    <td className={`p-4 text-sm text-right font-semibold ${m.net >= 0 ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-danger)]'}`}>
                      €{Math.abs(m.net).toFixed(0)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${m.savingsRate >= 0 ? 'bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)]' : 'bg-[var(--color-brand-danger)]/10 text-[var(--color-brand-danger)]'}`}>
                        {m.savingsRate.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
