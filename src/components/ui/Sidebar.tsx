'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LogOut, Settings, Wallet } from 'lucide-react';
import { SettingsModal } from '@/components/modals/SettingsModal';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, label, isActive, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 w-full text-left",
        isActive
          ? "bg-white text-black shadow-lg"
          : "text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5"
      )}
    >
      <div className={cn(
        "shrink-0",
        isActive ? "text-black" : "text-[var(--color-brand-secondary)] group-hover:text-white"
      )}>
        {icon}
      </div>
      <span className="font-bold text-sm hidden lg:block tracking-wide uppercase">{label}</span>
    </button>
  );
}

export interface SidebarProps {
  items: Array<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }>;
  onLogout: () => void;
  className?: string;
}

export function Sidebar({ items, onLogout, className }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <aside className={cn(
        "hidden lg:flex flex-col w-24 lg:w-72 h-screen fixed left-0 top-0 bg-black border-r border-white/5 py-8 z-50 transition-all",
        className
      )}>
        {/* Logo */}
        <div className="flex items-center gap-4 px-8 mb-16">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-xl">
            <Wallet className="w-6 h-6 text-black" />
          </div>
          <span className="font-black text-xl hidden lg:block tracking-tighter text-white">Finance</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-3 px-4">
          {items.map((item, index) => (
            <SidebarItem key={index} {...item} />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-4 flex flex-col gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5 transition-all w-full text-left"
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm hidden lg:block tracking-wide uppercase">Settings</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-danger)] hover:bg-[var(--color-brand-danger)]/5 transition-all w-full text-left"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm hidden lg:block tracking-wide uppercase">Log Out</span>
          </button>
        </div>
      </aside>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
