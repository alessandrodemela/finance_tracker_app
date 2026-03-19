'use client';

import React from 'react';
import { NetWorthChart } from '@/components/DashboardCharts';

export type TimeRange = '7D' | '1M' | 'YTD' | '1A' | 'MAX';

interface TrendData {
  name: string;
  fullDate: string;
  amount: number;
}

interface NetWorthTimeRangeProps {
  chartData: TrendData[];
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const RANGES: TimeRange[] = ['7D', '1M', 'YTD', '1A', 'MAX'];

export function NetWorthTimeRange({ chartData, selectedRange, onRangeChange }: NetWorthTimeRangeProps) {
  return (
    <div className="glass-panel flex flex-col gap-5 p-5">
      <div className="flex justify-between items-center bg-[rgba(255,255,255,0.03)] p-1 rounded-full border border-[rgba(255,255,255,0.05)] shadow-inner">
        {RANGES.map((range) => (
          <button
            key={range}
            onClick={() => onRangeChange(range)}
            className={`flex-1 py-1.5 text-[11px] font-bold tracking-wider rounded-full transition-all duration-300
              ${selectedRange === range 
                ? 'bg-[var(--color-brand-accent)] text-[#0d0d12] shadow-[0_4px_12px_rgba(0,210,255,0.4)]' 
                : 'text-[var(--color-brand-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
              }`}
          >
            {range}
          </button>
        ))}
      </div>
      
      <div className="h-[200px] w-full mt-2 relative">
        {chartData && chartData.length > 0 ? (
          <NetWorthChart data={chartData} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-brand-secondary)] text-sm font-medium">
            No data available for this range
          </div>
        )}
      </div>
    </div>
  );
}
