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
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-3">Month</th>
            <th className="py-3 px-3 text-right">Income</th>
            <th className="py-3 px-3 text-right">Expense</th>
            <th className="py-3 px-3 text-right">Net</th>
            <th className="py-3 px-3 text-right">Savings %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
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
                className="hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-2.5 px-3 text-xs font-semibold text-white">{row.month}</td>
                <td className="py-2.5 px-3 text-xs text-emerald-400 font-mono text-right">
                  €{row.income.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                </td>
                <td className="py-2.5 px-3 text-xs text-rose-400 font-mono text-right">
                  €{row.expense.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                </td>
                <td className={`py-2.5 px-3 text-xs font-mono font-bold text-right ${row.net >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  {row.net < 0 ? '-' : ''}€{Math.abs(row.net).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                </td>
                <td className="py-2.5 px-3 text-xs font-mono text-slate-400 text-right">
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
