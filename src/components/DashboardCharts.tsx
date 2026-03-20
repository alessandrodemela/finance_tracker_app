'use client';

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area, Treemap
} from 'recharts';

interface TrendData {
  name: string;
  amount: number;
}

interface CategoryData {
  name: string;
  value: number;
  [key: string]: any;
}

// Updated premium color palette
const COLORS = ['#00D2FF', '#10B981', '#F05A64', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const SpendingTrendChart = ({ data }: { data: TrendData[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#00D2FF" stopOpacity={0} />
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
          backgroundColor: '#0d0d12',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          fontSize: '12px',
          fontFamily: 'Inter'
        }}
        itemStyle={{ color: '#ffffff', fontWeight: 400 }}
        labelStyle={{ color: '#97989cff', marginBottom: '4px' }}
        formatter={(value: any) => [`€ ${Math.abs(Number(value)).toFixed(0)}`, '']}
      />
      <Area
        type="monotone"
        dataKey="amount"
        stroke="#00D2FF"
        strokeWidth={2}
        fillOpacity={1}
        fill="url(#colorAmount)"
        dot={{ fill: '#00D2FF', strokeWidth: 0, r: 3 }}
        activeDot={{ r: 5, strokeWidth: 0, fill: '#ffffff' }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

const BRAND_COLORS = [
  '#6366F1', // Indigo
  '#0EA5E9', // Sky
  '#10B981', // Emerald
  '#F43F5E', // Rose
  '#8B5CF6', // Violet
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
];

export const CategoryTreemap = ({ data }: { data: CategoryData[] }) => {
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, index, name, value } = props;
    if (width < 32 || height < 20) return null;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={6}
          ry={6}
          style={{
            fill: BRAND_COLORS[index % BRAND_COLORS.length],
            stroke: 'rgba(13, 13, 18, 0.4)',
            strokeWidth: 1.5,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#000"
          fontSize={Math.min(width / 7, 11)}
          fontWeight="400"
          style={{ pointerEvents: 'none', opacity: 0.9 }}
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(0,0,0,0.7)"
          fontSize={Math.min(width / 8, 9)}
          fontWeight="400"
          style={{ pointerEvents: 'none' }}
        >
          €{value.toFixed(0)}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="value"
        stroke="#fff"
        fill="#6366F1"
        isAnimationActive={true}
        content={<CustomizedContent />}
      >
        <Tooltip
          contentStyle={{
            backgroundColor: '#0d0d12',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '12px',
            fontFamily: 'Inter',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ display: 'none' }}
          formatter={(value: any, name: any, props: any) => {
            return [`€ ${Number(value).toLocaleString('it-IT')}`, props.payload.name];
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
};

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
          backgroundColor: '#0d0d12',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          borderRadius: '12px',
          fontSize: '12px',
          fontFamily: 'Inter'
        }}
        itemStyle={{ color: '#ffffff', fontWeight: 700 }}
        formatter={(value: any) => [`€ ${Number(value).toFixed(0)}`, '']}
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
export const BalanceTrendChart = ({ data }: { data: TrendData[] }) => {
  const minVal = data.length > 0 ? Math.min(...data.map(d => d.amount)) : 0;
  const yDomainMin = minVal * 0.8;

  return (
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
          domain={[yDomainMin, 'auto']}
          tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}
          width={25}
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
};

export const NetWorthChart = ({ data, isVisible = true }: { data: TrendData[], isVisible?: boolean }) => {
  const minVal = data.length > 0 ? Math.min(...data.map(d => d.amount)) : 0;
  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.amount)) : 0;
  
  // Add 10% buffer to min and max
  const yDomainMin = minVal - (Math.abs(minVal) * 0.1);
  const yDomainMax = maxVal + (Math.abs(maxVal) * 0.1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`bg-[#0d0d12] border border-[rgba(0,210,255,0.2)] rounded-xl p-3 shadow-2xl transition-all duration-300 ${!isVisible ? 'blur-[6px] select-none opacity-50' : ''}`}>
          <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-1 uppercase tracking-wider">
            {(!label || label === 'Today') 
              ? 'Today' 
              : new Date(label).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
          <p className="text-white font-bold text-xs">
            € {Number(payload[0].value).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00D2FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis dataKey="fullDate" hide={true} />
        <YAxis hide={true} domain={[yDomainMin, yDomainMax]} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#00D2FF"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorNetWorth)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: '#00D2FF' }}
        />
        <Tooltip content={<CustomTooltip />} />
      </AreaChart>
    </ResponsiveContainer>
  );
};
