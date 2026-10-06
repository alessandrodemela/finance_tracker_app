'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthSelectorProps {
  currentDate: Date;
  onChange: (d: Date) => void;
  className?: string;
}

const MONTHS_IT = [
  { value: 0, label: 'Gennaio' },
  { value: 1, label: 'Febbraio' },
  { value: 2, label: 'Marzo' },
  { value: 3, label: 'Aprile' },
  { value: 4, label: 'Maggio' },
  { value: 5, label: 'Giugno' },
  { value: 6, label: 'Luglio' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Settembre' },
  { value: 9, label: 'Ottobre' },
  { value: 10, label: 'Novembre' },
  { value: 11, label: 'Dicembre' },
];

export function MonthSelector({ currentDate, onChange, className }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Dynamic years list around current year (e.g. 5 years back, 2 ahead)
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate);
  };

  const handleSelectMonth = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    onChange(newDate);
  };

  const handleSelectYear = (yearVal: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(yearVal);
    onChange(newDate);
  };

  const monthName = currentDate.toLocaleString('it-IT', { month: 'short', year: 'numeric' });

  return (
    <div ref={dropdownRef} className="relative">
      <div className={cn(
        "flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl p-1 backdrop-blur-md shadow-sm",
        className
      )}>
        <button 
          onClick={handlePrev} 
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-95"
          title="Mese precedente"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-white tracking-wider uppercase font-mono hover:bg-white/5 rounded-lg transition-colors min-w-[100px] justify-center"
        >
          <span>{monthName}</span>
          <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        <button 
          onClick={handleNext} 
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-95"
          title="Mese successivo"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dropdown Menu per Mese e Anno */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 p-3 bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Anno Selector */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-brand-secondary)]">Anno</span>
            <select
              value={currentYear}
              onChange={(e) => handleSelectYear(Number(e.target.value))}
              className="bg-white/5 border border-white/10 text-white font-mono text-xs rounded-lg px-2.5 py-1 outline-none focus:border-white/20 cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y} className="bg-[#0D0D0D] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Griglia Mesi */}
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_IT.map(m => {
              const isSelected = m.value === currentMonth;
              return (
                <button
                  key={m.value}
                  onClick={() => {
                    handleSelectMonth(m.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "py-1.5 text-xs rounded-xl font-medium transition-all text-center",
                    isSelected 
                      ? "bg-white text-black font-bold shadow-md" 
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {m.label.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
