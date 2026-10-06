'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface DailySpendingData {
  day: string;
  amount: number;
}

interface DailySpendingChartProps {
  data: DailySpendingData[];
}

export function DailySpendingChart({ data }: DailySpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center text-slate-500 text-sm font-medium">
        No spending data for this month
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
        <XAxis 
          dataKey="day" 
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
                <div className="bg-[#0D0D0D] border border-white/10 p-3 rounded-xl shadow-2xl min-w-[140px]">
                  <p className="text-[#71717A] text-[10px] font-bold uppercase tracking-widest mb-1.5">Day {label}</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#E2E8F0] text-xs font-medium">Spent</span>
                    <span className="text-white font-mono font-bold text-xs">
                      €{Number(payload[0].value).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="amount" 
          fill="#E2E8F0" 
          radius={[4, 4, 0, 0]} 
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
