'use client';

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface TrendData {
  name: string;
  amount: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const SpendingTrendChart = ({ data }: { data: TrendData[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
      <XAxis 
        dataKey="name" 
        stroke="#94a3b8" 
        fontSize={12} 
        tickLine={false} 
        axisLine={false} 
      />
      <YAxis 
        stroke="#94a3b8" 
        fontSize={12} 
        tickLine={false} 
        axisLine={false}
        tickFormatter={(value) => `€${Math.abs(value)}`}
      />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#17171a', 
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}
        itemStyle={{ color: '#f8fafc' }}
        formatter={(value: any) => [`€ ${Math.abs(Number(value)).toFixed(2)}`, 'Amount']}
      />
      <Line 
        type="monotone" 
        dataKey="amount" 
        stroke="var(--primary)" 
        strokeWidth={3} 
        dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
        activeDot={{ r: 6, strokeWidth: 0 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const CategoryPieChart = ({ data }: { data: CategoryData[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#17171a', 
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}
        formatter={(value: any) => [`€ ${Number(value).toFixed(2)}`, 'Spending']}
      />
      <Legend verticalAlign="bottom" height={36}/>
    </PieChart>
  </ResponsiveContainer>
);
