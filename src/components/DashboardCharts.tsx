'use client';

import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, Cell, TooltipProps
} from 'recharts';

// Figma Brand Colors (True Dark)
const COLORS = {
  background: '#000000',
  card: '#0D0D0D',
  accent: '#E2E8F0',
  income: '#10B981',
  expense: '#F05A64',
  text: '#FFFFFF',
  secondaryText: '#71717A',
};

const CHART_COLORS = [
  '#FFFFFF', // White
  '#71717A', // Zinc
  '#E2E8F0', // Slate/Silver
  '#10B981', // Green
  '#F05A64', // Red
  '#3F3F46', // Zinc-700
  '#A1A1AA', // Zinc-400
];

const CustomTooltip = ({ active, payload, label, isVisible = true }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`bg-[#0D0D0D] border border-white/10 p-4 rounded-xl shadow-2xl min-w-[160px] ${!isVisible ? 'blur-md' : ''}`}>
        <p className="text-[var(--color-brand-secondary)] text-xs font-bold uppercase tracking-widest mb-3">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={entry.name || index} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
            <span className="text-[#E8EBF4] text-sm flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color || entry.payload.fill || COLORS.accent }} 
              />
              {entry.name}
            </span>
            <span className="text-[#E8EBF4] font-medium font-mono text-sm">
              €{entry.value?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const NetWorthChart = ({ data, isVisible = true }: { data: any[], isVisible?: boolean }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.25} />
            <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.secondaryText} strokeOpacity={0.2} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: COLORS.secondaryText, fontSize: 12 }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: COLORS.secondaryText, fontSize: 12 }} 
          tickFormatter={(val) => `€${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} 
        />
        <Tooltip content={<CustomTooltip isVisible={isVisible} />} />
        <Area
          type="monotone"
          dataKey="amount"
          name="Balance"
          stroke={COLORS.accent}
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorBalance)"
          activeDot={{ r: 6, fill: COLORS.accent, stroke: COLORS.background, strokeWidth: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const MonthlyBreakdownChart = ({ data, isVisible = true }: { data: any[], isVisible?: boolean }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={8}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.secondaryText} strokeOpacity={0.2} />
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: COLORS.secondaryText, fontSize: 12 }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: COLORS.secondaryText, fontSize: 12 }} 
          tickFormatter={(val) => `€${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} 
        />
        <Tooltip content={<CustomTooltip isVisible={isVisible} />} cursor={{ fill: COLORS.secondaryText, opacity: 0.1 }} />
        <Bar dataKey="income" name="Income" fill={COLORS.income} radius={[4, 4, 0, 0]} barSize={12} />
        <Bar dataKey="expenses" name="Expenses" fill={COLORS.expense} radius={[4, 4, 0, 0]} barSize={12} />
        <Bar dataKey="net" name="Net" fill={COLORS.accent} radius={[4, 4, 0, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const CategoryBarChart = ({ data, isVisible = true }: { data: any[], isVisible?: boolean }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={COLORS.secondaryText} strokeOpacity={0.2} />
        <XAxis type="number" hide />
        <YAxis 
          type="category" 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: COLORS.secondaryText, fontSize: 12 }} 
          width={80}
        />
        <Tooltip content={<CustomTooltip isVisible={isVisible} />} cursor={{ fill: COLORS.secondaryText, opacity: 0.1 }} />
        <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.accent : COLORS.secondaryText} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};// --- ORIGINAL COMPONENTS (RESTORED FOR COMPATIBILITY) ---

export const CategoryTreemap = ({ data }: { data: any[] }) => {
  const BRAND_COLORS = [
    '#1d1d2cff', // Indigo
    '#0e445dff', // Sky
    '#10B981', // Emerald
    '#2b234eff', // Rose
    '#8B5CF6', // Violet
    '#03282eff', // Amber
    '#06B6D4', // Cyan
  ];

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
          fill="#000000"
          fontSize={Math.min(width / 8, 11)}
          fontWeight="50"
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
          fontWeight="150"
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
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
};

export const CategoryPieChart = ({ data }: { data: any[] }) => (
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
        {data.map((entry: any, index: number) => (
          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
    </PieChart>
  </ResponsiveContainer>
);

export const SpendingTrendChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
          <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
      <XAxis
        dataKey="name"
        stroke={COLORS.secondaryText}
        fontSize={10}
        tickLine={false}
        axisLine={false}
        dy={10}
      />
      <YAxis
        stroke={COLORS.secondaryText}
        fontSize={10}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `€${Math.abs(value)}`}
        width={35}
      />
      <Tooltip content={<CustomTooltip />} />
      <Area
        type="monotone"
        dataKey="amount"
        stroke={COLORS.accent}
        strokeWidth={2}
        fillOpacity={1}
        fill="url(#colorAmount)"
        dot={{ fill: COLORS.accent, strokeWidth: 0, r: 3 }}
        activeDot={{ r: 5, strokeWidth: 0, fill: '#ffffff' }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

import { Pie, PieChart, Treemap } from 'recharts';

