'use client';

import React from 'react';
import { BudgetTab } from '@/components/tabs/BudgetTab';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function BudgetPage() {
  return (
    <div className="bg-[var(--color-brand-navy)] min-h-screen text-[var(--color-brand-primary)] pb-12">
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <header className="flex items-center gap-4 mb-8">
          <Link 
            href="/" 
            className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-brand-secondary)] hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-display-40 font-bold tracking-tight text-white">Edit Budgeting</h1>
        </header>
        
        <BudgetTab />
      </div>
    </div>
  );
}
