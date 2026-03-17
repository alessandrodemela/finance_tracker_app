'use client';

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

interface TrendData {
  name: string;
  amount: number;
}

interface CategoryData {
  name: string;
  value: number;
}

// Updated premium color palette
const COLORS = ['#3b6fff', '#22c55e', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const SpendingTrendChart = ({ data }: { data: TrendData[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b6fff" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#3b6fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
      <XAxis
        dataKey="name"
        stroke="#6272a4"
        fontSize={10}
        tickLine={false}
        axisLine={false}
        dy={10}
      />
      <YAxis
        stroke="#6272a4"
        fontSize={10}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `€${Math.abs(value)}`}
        width={35}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#131729',
          border: '1px solid rgba(59, 111, 255, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          fontSize: '12px',
          fontFamily: 'Outfit'
        }}
        itemStyle={{ color: '#ffffff', fontWeight: 400 }}
        labelStyle={{ color: '#97989cff', marginBottom: '4px' }}
        formatter={(value: any) => [`€ ${Math.abs(Number(value)).toFixed(2)}`, '']}
      />
      <Area
        type="monotone"
        dataKey="amount"
        stroke="#3b6fff"
        strokeWidth={1.5}
        fillOpacity={1}
        fill="url(#colorAmount)"
        dot={{ fill: '#3b6fff', strokeWidth: 0, r: 3 }}
        activeDot={{ r: 5, strokeWidth: 0, fill: '#ffffff' }}
      />
    </AreaChart>
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
        paddingAngle={8}
        dataKey="value"
        stroke="none"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: '#131729',
          border: '1px solid rgba(59, 111, 255, 0.2)',
          borderRadius: '12px',
          fontSize: '12px',
          fontFamily: 'Outfit'
        }}
        itemStyle={{ color: '#ffffff', fontWeight: 700 }}
        formatter={(value: any) => [`€ ${Number(value).toFixed(2)}`, '']}
      />
      <Legend
        verticalAlign="bottom"
        height={36}
        iconType="circle"
        formatter={(value) => <span style={{ color: '#8892b0', fontSize: '11px', fontWeight: 500 }}>{value}</span>}
      />
    </PieChart>
  </ResponsiveContainer>
);
export const BalanceTrendChart = ({ data }: { data: TrendData[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
      <XAxis
        dataKey="name"
        stroke="#6272a4"
        fontSize={10}
        tickLine={false}
        axisLine={false}
        dy={10}
      />
      <YAxis
        stroke="#6272a4"
        fontSize={10}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `€${value}`}
        width={40}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#131729',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          fontSize: '12px',
          fontFamily: 'Outfit'
        }}
        itemStyle={{ color: '#ffffff', fontWeight: 400 }}
        labelStyle={{ color: '#97989cff', marginBottom: '4px' }}
        formatter={(value: any) => [`€ ${Number(value).toFixed(2)}`, 'Balance']}
      />
      <Area
        type="monotone"
        dataKey="amount"
        stroke="#22c55e"
        strokeWidth={2}
        fillOpacity={1}
        fill="url(#colorBalance)"
        dot={{ fill: '#22c55e', strokeWidth: 0, r: 2 }}
        activeDot={{ r: 4, strokeWidth: 0, fill: '#ffffff' }}
      />
    </AreaChart>
  </ResponsiveContainer>
);
