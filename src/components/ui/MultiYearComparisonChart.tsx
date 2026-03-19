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
      <div className="w-full h-full flex justify-center items-center text-[var(--color-brand-secondary)] text-sm font-medium">
        No data available for comparison
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis 
          dataKey="year" 
          stroke="rgba(255,255,255,0.2)" 
          fontSize={11} 
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
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
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
        <Legend 
          iconType="circle" 
          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
        />
        <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expense" fill="#F05A64" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
