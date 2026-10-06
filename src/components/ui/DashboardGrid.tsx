'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: DashboardGridProps) {
  return (
    <div className={cn("px-4 lg:px-10 py-6 space-y-6 w-full max-w-[1600px] mx-auto", className)}>
      {children}
    </div>
  );
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6 w-full", className)}>
      {children}
    </div>
  );
}

interface GridColProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  className?: string;
}

export function GridCol({ children, span = 12, className }: GridColProps) {
  const spanClasses: Record<number, string> = {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
    7: 'lg:col-span-7',
    8: 'lg:col-span-8',
    9: 'lg:col-span-9',
    10: 'lg:col-span-10',
    11: 'lg:col-span-11',
    12: 'lg:col-span-12',
  };

  return (
    <div className={cn("col-span-1", spanClasses[span], className)}>
      {children}
    </div>
  );
}
