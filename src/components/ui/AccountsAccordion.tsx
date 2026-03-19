'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus, Building2 } from 'lucide-react';
import { Account } from '@/types/database';

interface AccountsAccordionProps {
  accounts: Account[];
  onAddClick: () => void;
  onEditClick: (account: Account) => void;
  onDeleteClick: (account: Account) => void;
}

export function AccountsAccordion({ accounts, onAddClick, onEditClick, onDeleteClick }: AccountsAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  
  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.active_balance) || 0), 0);

  return (
    <div className="glass-panel overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]">
      {/* Header */}
      <div 
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors active:bg-[rgba(255,255,255,0.04)]"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 text-white">
          <div className={`p-1 rounded-md transition-colors ${expanded ? 'bg-[rgba(0,210,255,0.1)] text-[var(--color-brand-accent)]' : 'bg-[rgba(255,255,255,0.05)] text-[var(--color-brand-secondary)]'}`}>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          <span className="font-bold tracking-wide text-base">Bank Accounts</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-brand-secondary)]">Total</span>
          <span className="font-bold text-white text-[15px]">
            €{totalBalance.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      <div 
        className={`transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          expanded ? 'max-h-[800px] opacity-100 border-t border-[rgba(255,255,255,0.05)]' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 flex flex-col gap-3 bg-[rgba(0,0,0,0.15)] inner-shadow">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className="group flex flex-col p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle accent line on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-brand-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-white drop-shadow-sm flex items-center gap-1.5">
                    <Building2 size={14} className="text-[var(--color-brand-secondary)]" />
                    {account.name}
                  </span>
                  <span className="text-[11px] font-medium tracking-wide text-[var(--color-brand-secondary)]">
                    {account.currency || 'EUR'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-white text-[15px]">
                    {account.currency === 'USD' ? '$' : '€'}
                    {Number(account.active_balance || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              {/* Actions slide in gracefully */}
              <div className="flex items-center justify-end gap-2 mt-0 max-h-0 opacity-0 group-hover:max-h-[40px] group-hover:opacity-100 group-hover:mt-3 transition-all duration-300">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEditClick(account); }}
                  className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-brand-secondary)] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteClick(account); }}
                  className="px-3 py-1.5 rounded-lg bg-[rgba(240,90,100,0.05)] hover:bg-[rgba(240,90,100,0.15)] text-[var(--color-brand-secondary)] hover:text-[#F05A64] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={onAddClick}
            className="w-full mt-2 py-4 rounded-xl border border-dashed border-[rgba(255,255,255,0.15)] text-[var(--color-brand-secondary)] hover:text-white hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.02)] transition-all duration-300 flex items-center justify-center gap-2 text-sm font-bold tracking-wide uppercase"
          >
            <Plus size={16} />
            <span>Add New Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
