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
    <header className="h-auto min-h-[5.5rem] py-4 border-b border-white/5 bg-black/80 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between px-4 lg:px-10 sticky top-0 z-10 w-full gap-4">
      {/* Title section with fixed width on desktop so controls don't jump around */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 min-w-0">
        <div className="md:w-64 shrink-0">
          <h1 className="text-2xl font-bold text-[var(--color-brand-primary)] tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--color-brand-secondary)] mt-0.5 truncate">
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
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          {actions}
        </div>
      )}
    </header>
  );
}
