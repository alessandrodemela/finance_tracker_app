import React from 'react';

export interface MonthlyBreakdownRow {
  month: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
}

interface MonthlyBreakdownTableProps {
  data: MonthlyBreakdownRow[];
}

export function MonthlyBreakdownTable({ data }: MonthlyBreakdownTableProps) {
  return (
    <div className="glass-panel p-0 overflow-hidden w-full">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
              <th className="py-4 px-4 text-[10px] font-bold tracking-wider uppercase text-[var(--color-brand-secondary)] whitespace-nowrap">Month</th>
              <th className="py-4 px-4 text-[10px] font-bold tracking-wider uppercase text-[var(--color-brand-secondary)] text-right whitespace-nowrap">Income</th>
              <th className="py-4 px-4 text-[10px] font-bold tracking-wider uppercase text-[var(--color-brand-secondary)] text-right whitespace-nowrap">Expense</th>
              <th className="py-4 px-4 text-[10px] font-bold tracking-wider uppercase text-[var(--color-brand-secondary)] text-right whitespace-nowrap">Net</th>
              <th className="py-4 px-4 text-[10px] font-bold tracking-wider uppercase text-[var(--color-brand-secondary)] text-right whitespace-nowrap">Savings %</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-brand-secondary)] text-sm font-medium">
                  No data available for this year
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr 
                  key={row.month} 
                  className={`border-b border-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.03)] transition-colors ${i === data.length - 1 ? 'border-none' : ''}`}
                >
                  <td className="py-3 px-4 text-sm font-semibold text-white">{row.month}</td>
                  <td className="py-3 px-4 text-sm text-[#10B981] font-medium text-right">
                    €{row.income.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#F05A64] font-medium text-right">
                    €{row.expense.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`py-3 px-4 text-sm font-bold text-right ${row.net >= 0 ? 'text-white' : 'text-[#F05A64]'}`}>
                    €{row.net.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-[var(--color-brand-secondary)] text-right">
                    {row.savingsRate.toFixed(1)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
