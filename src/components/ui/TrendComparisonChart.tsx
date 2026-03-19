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
      <div className="w-full h-full flex justify-center items-center text-[var(--color-brand-secondary)] text-sm font-medium">
        No income/expense data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis 
          dataKey="month" 
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
          tickFormatter={(value) => `€${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0d0d12',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            fontSize: '12px',
            fontFamily: 'Inter',
            fontWeight: 500
          }}
          itemStyle={{ fontWeight: 700 }}
          formatter={(value: any, name: any) => [`€ ${Number(value).toFixed(2)}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
        />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#10B981" 
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Line 
          type="monotone" 
          dataKey="expense" 
          stroke="#F05A64" 
          strokeWidth={2}
          dot={{ fill: '#F05A64', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
