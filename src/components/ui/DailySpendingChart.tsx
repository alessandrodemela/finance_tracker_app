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
      <div className="w-full h-full flex justify-center items-center text-[var(--color-brand-secondary)] text-sm font-medium">
        No spending data for this month
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis 
          dataKey="day" 
          stroke="rgba(255,255,255,0.2)" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          dy={10} 
        />
        <YAxis 
          stroke="rgba(255,255,255,0.2)" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(value) => `€${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{
            backgroundColor: '#0d0d12',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            fontSize: '12px',
            fontFamily: 'Inter',
            fontWeight: 500
          }}
          itemStyle={{ color: '#ffffff', fontWeight: 700 }}
          formatter={(value: any) => [`€ ${Number(value).toFixed(2)}`, 'Spent']}
          labelFormatter={(label) => `Day ${label}`}
        />
        <Bar 
          dataKey="amount" 
          fill="var(--color-brand-accent)" 
          radius={[4, 4, 0, 0]} 
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
