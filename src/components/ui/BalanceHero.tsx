import React from 'react';

interface BalanceHeroProps {
  totalBalance: number;
  isVisible?: boolean;
}

export function BalanceHero({ totalBalance, isVisible = true }: BalanceHeroProps) {
  return (
    <div className="glass-panel p-6 sm:p-8 flex flex-col items-center justify-center gap-3 border border-[rgba(255,255,255,0.05)] text-center transition-all duration-300">
      <span className="text-[12px] font-bold tracking-[0.2em] text-[var(--color-brand-secondary)] uppercase">
        Total Balance
      </span>
      <h2 className={`text-[40px] leading-tight text-white font-bold tracking-tight transition-all duration-500 ${!isVisible ? 'blur-md select-none opacity-50' : ''}`}>
        €{totalBalance.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </h2>
    </div>
  );
}
