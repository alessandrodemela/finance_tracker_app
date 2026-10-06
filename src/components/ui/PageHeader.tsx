'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  controls?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, controls, actions }: PageHeaderProps) {
  return (
    <header className="h-auto min-h-[4.5rem] sm:min-h-[5.5rem] py-3 sm:py-4 border-b border-white/5 bg-black/80 backdrop-blur-md flex flex-row items-center justify-between px-3 sm:px-6 lg:px-10 sticky top-0 z-10 w-full gap-2 sm:gap-4">
      {/* Title section with fixed width on desktop so controls don't jump around */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-8 min-w-0 flex-1">
        <div className="md:w-64 shrink-0 min-w-0">
          <h1 className="text-base sm:text-2xl font-bold text-[var(--color-brand-primary)] tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-[var(--color-brand-secondary)] mt-0.5 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
        {controls && (
          <div className="flex items-center gap-2 shrink-0">
            {controls}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
