'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TrendComparisonData {
  month: string;
  income: number;
  expense: number;
}

interface TrendComparisonChartProps {
  data: TrendComparisonData[];
}

export function TrendComparisonChart({ data }: TrendComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center text-slate-500 text-sm font-medium">
        No income/expense data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
        <XAxis 
          dataKey="month" 
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
          cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-[#0D0D0D] border border-white/10 p-3 rounded-xl shadow-2xl min-w-[150px]">
                  <p className="text-[#71717A] text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
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
        <Line 
          type="monotone" 
          dataKey="income" 
          name="Income"
          stroke="#10B981" 
          strokeWidth={2.5}
          dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Line 
          type="monotone" 
          dataKey="expense" 
          name="Expense"
          stroke="#F05A64" 
          strokeWidth={2.5}
          dot={{ fill: '#F05A64', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
