'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export interface MultiYearData {
  year: string;
  income: number;
  expense: number;
  net: number;
}

interface MultiYearComparisonChartProps {
  data: MultiYearData[];
}

export function MultiYearComparisonChart({ data }: MultiYearComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center text-slate-500 text-sm font-medium">
        No data available for comparison
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
        <XAxis 
          dataKey="year" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#71717A', fontSize: 11 }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#71717A', fontSize: 11 }} 
          tickFormatter={(value) => `€${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-[#0D0D0D] border border-white/10 p-3 rounded-xl shadow-2xl min-w-[150px]">
                  <p className="text-[#71717A] text-[10px] font-bold uppercase tracking-widest mb-2">Year {label}</p>
                  <div className="space-y-1.5 text-xs">
                    {payload.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="text-[#E2E8F0] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          {entry.name}
                        </span>
                        <span className="text-white font-mono font-bold">
                          €{Number(entry.value).toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend 
          iconType="circle" 
          wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} 
        />
        <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="expense" name="Expense" fill="#F05A64" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
