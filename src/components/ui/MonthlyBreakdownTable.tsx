import React from 'react';
import { cn, formatCurrency } from '@/lib/utils';

export interface MonthlyBreakdownRow {
  month: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
}

interface MonthlyBreakdownTableProps {
  data: MonthlyBreakdownRow[];
  isSensitiveVisible?: boolean;
}

export function MonthlyBreakdownTable({ data, isSensitiveVisible = true }: MonthlyBreakdownTableProps) {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-black/40 text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-brand-secondary)]">
            <th className="py-3.5 px-3">Month</th>
            <th className="py-3.5 px-3 text-right">Income</th>
            <th className="py-3.5 px-3 text-right">Expense</th>
            <th className="py-3.5 px-3 text-right">Net</th>
            <th className="py-3.5 px-3 text-right">Savings %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                No data available for this year
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr 
                key={row.month} 
                className="hover:bg-white/[0.03] transition-colors"
              >
                <td className="py-3 px-3 text-xs font-bold text-white">{row.month}</td>
                <td className={cn(
                  "py-2.5 px-3 text-xs text-emerald-400 font-mono text-right transition-all",
                  !isSensitiveVisible && "blur-md select-none"
                )}>
                  {formatCurrency(row.income)}
                </td>
                <td className={cn(
                  "py-2.5 px-3 text-xs text-rose-400 font-mono text-right transition-all",
                  !isSensitiveVisible && "blur-md select-none"
                )}>
                  {formatCurrency(row.expense)}
                </td>
                <td className={cn(
                  "py-2.5 px-3 text-xs font-mono font-bold text-right transition-all",
                  row.net >= 0 ? 'text-white' : 'text-rose-400',
                  !isSensitiveVisible && "blur-md select-none"
                )}>
                  {formatCurrency(row.net)}
                </td>
                <td className={cn(
                  "py-2.5 px-3 text-xs font-mono text-slate-400 text-right transition-all",
                  !isSensitiveVisible && "blur-md select-none"
                )}>
                  {row.savingsRate.toFixed(1)}%
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
