import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';

export interface CategoryBudgetItem {
  id: string;
  name: string;
  spent: number;
  budget: number;
}

interface CategoryBreakdownProps {
  items: CategoryBudgetItem[];
  loading?: boolean;
}

export function CategoryBreakdown({ items, loading = false }: CategoryBreakdownProps) {
  if (loading) {
    return (
      <div className="h-64 flex justify-center items-center text-slate-400 text-sm font-medium">
        Loading categories...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-64 flex justify-center items-center text-slate-500 text-sm font-medium">
        No budget or spending recorded for this month.
      </div>
    );
  }

  // Prepare chart data for vertical bars
  // percentage = spent / budget * 100
  const chartData = items.map(item => {
    const percent = item.budget > 0 ? (item.spent / item.budget) * 100 : item.spent > 0 ? 100 : 0;
    const isOver = item.budget > 0 && item.spent > item.budget;
    return {
      name: item.name,
      spent: item.spent,
      budget: item.budget,
      percent: Math.round(percent),
      displayPercent: percent.toFixed(0),
      isOver
    };
  });

  // Calculate overall metrics
  const totalSpent = items.reduce((acc, i) => acc + i.spent, 0);
  const totalBudget = items.reduce((acc, i) => acc + i.budget, 0);
  const totalPercent = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* Top summary header with total budget quota reached */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Budget Utilization</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold font-mono text-white">{totalPercent}%</span>
            <span className="text-xs text-slate-400">
              (€{totalSpent.toLocaleString('it-IT', { maximumFractionDigits: 0 })} of €{totalBudget.toLocaleString('it-IT', { maximumFractionDigits: 0 })})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">Within Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Exceeded (&gt;100%)</span>
          </div>
        </div>
      </div>

      {/* Vertical Bar Chart with percentage and top label */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 25, right: 10, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#71717A', fontSize: 11 }}
              interval={0}
              dy={8}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#71717A', fontSize: 11 }} 
              tickFormatter={(v) => `${v}%`}
            />
            <ReferenceLine y={100} stroke="#F05A64" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0D0D0D] border border-white/10 p-3 rounded-xl shadow-2xl min-w-[160px]">
                      <p className="text-[#71717A] text-[10px] font-bold uppercase tracking-widest mb-2">{data.name}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Spent:</span>
                          <span className="text-white font-mono font-bold">€{data.spent.toLocaleString('it-IT')}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Budget:</span>
                          <span className="text-white font-mono font-bold">€{data.budget.toLocaleString('it-IT')}</span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
                          <span className="text-slate-400">Quota:</span>
                          <span className={cn("font-mono font-bold", data.isOver ? 'text-rose-400' : 'text-emerald-400')}>
                            {data.displayPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="percent" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={44}
              label={{ 
                position: 'top', 
                fill: '#FFFFFF', 
                fontSize: 11, 
                fontWeight: 600,
                formatter: (val: any) => `${val}%` 
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isOver ? '#F05A64' : '#10B981'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
