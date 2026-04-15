'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDown, ArrowUp, Repeat, Plus, Save, Calendar, Wallet, Tag, FileText, ChevronRight } from 'lucide-react';
import { MovementType } from '@/types/database';
import { useAccounts, useCategories, useBudgetCategories } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { financeService } from '@/lib/financeService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewTransactionModal({ isOpen, onClose, onSuccess }: NewTransactionModalProps) {
  const { accounts } = useAccounts();
  const [type, setType] = useState<MovementType>('expense');
  const { categories } = useCategories(type as 'income' | 'expense');
  const { budgetCategories } = useBudgetCategories();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    budget_category_id: '',
    account_id: '',
    from_account_id: '',
    to_account_id: '',
    notes: '',
    is_fixed: false,
    is_split: false,
    is_necessary: true,
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingBudgetCategory, setIsAddingBudgetCategory] = useState(false);
  const [newBudgetCategoryName, setNewBudgetCategoryName] = useState('');



  const handleReset = () => {
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category_id: '',
      budget_category_id: '',
      account_id: '',
      from_account_id: '',
      to_account_id: '',
      notes: '',
      is_fixed: false,
      is_split: false,
      is_necessary: true,
    });
    setSubmitted(false);
    setIsAddingCategory(false);
    setNewCategoryName('');
    setIsAddingBudgetCategory(false);
    setNewBudgetCategoryName('');
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;

    setLoading(true);
    const amountNum = Math.round(Math.abs(parseFloat(formData.amount.replace(',', '.'))) * 100) / 100;

    let categoryId = formData.category_id;
    let budgetCategoryId = formData.budget_category_id;

    try {
      if (type !== 'transfer' && isAddingCategory && newCategoryName.trim()) {
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert([{ name: newCategoryName.trim().toLowerCase(), type: type as 'income' | 'expense' }])
          .select().single();
        if (catError) throw catError;
        categoryId = newCat.id;
      }

      if (type !== 'transfer' && isAddingBudgetCategory && newBudgetCategoryName.trim()) {
        const { data: newCat, error: catError } = await supabase
          .from('budget_categories')
          .insert([{ name: newBudgetCategoryName.trim().toLowerCase() }])
          .select().single();
        if (catError) throw catError;
        budgetCategoryId = newCat.id;
      }

      const insertData: any = {
        date: formData.date,
        amount: amountNum,
        type: type,
        notes: formData.notes,
        is_fixed: formData.is_fixed,
        is_split: formData.is_split,
        is_necessary: formData.is_necessary,
      };

      if (type === 'transfer') {
        insertData.from_account_id = formData.from_account_id;
        insertData.to_account_id = formData.to_account_id;
      } else {
        insertData.account_id = formData.account_id;
        insertData.category_id = categoryId;
        insertData.budget_category_id = budgetCategoryId || null;
      }

      await financeService.recordTransaction(insertData);
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };






  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Card - HORIZONTAL RESTYLE */}
      <div className={cn(
        "relative w-full max-w-5xl bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row min-h-[500px]",
        submitted && "items-center justify-center py-20 px-10 text-center"
      )}>

        {submitted ? (
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="w-24 h-24 bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)] border border-[var(--color-brand-success)]/20">
              <Save size={40} />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black text-white tracking-tight">TRANSACTION SAVED</h1>
              <p className="text-[var(--color-brand-secondary)] text-sm uppercase tracking-[0.2em] font-bold">Successfully updated your ledger</p>
            </div>
            <div className="flex gap-4 w-full max-w-md">
              <Button onClick={handleReset} fullWidth className="py-5 rounded-2xl font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-2xl transition-all">
                Add Another
              </Button>
              <Button onClick={onClose} variant="ghost" fullWidth className="py-5 rounded-2xl font-black uppercase tracking-widest border border-white/10 text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* LEFT PANEL: Amount & Type & Date (35%) */}
            <div className="md:w-[38%] bg-white/[0.02] border-r border-white/5 p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-white font-black text-lg uppercase tracking-tighter">New Movement</h2>
                  <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Amount Section */}
                <div className="flex flex-col gap-4 mb-16">
                  <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.4em]">Transaction Amount</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-light text-[var(--color-brand-secondary)]">€</span>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="0.00"
                      autoFocus
                      required
                      className="bg-transparent text-7xl font-black text-white w-full outline-none placeholder-white/[0.03] transition-all font-mono tracking-tighter"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                {/* Type Selector */}
                <div className="flex flex-col gap-4 mb-12">
                  <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.4em]">Movement Category</span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'expense', icon: <ArrowDown size={14} />, color: 'text-[var(--color-brand-danger)]', activeBg: 'bg-[var(--color-brand-danger)]', label: 'Expense' },
                      { id: 'income', icon: <ArrowUp size={14} />, color: 'text-[var(--color-brand-success)]', activeBg: 'bg-[var(--color-brand-success)]', label: 'Income' },
                      { id: 'transfer', icon: <Repeat size={14} />, color: 'text-[var(--color-brand-accent)]', activeBg: 'bg-[var(--color-brand-accent)]', label: 'Transfer' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 py-5 rounded-2xl text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-300 border",
                          type === t.id
                            ? "bg-white border-white text-black shadow-xl scale-[1.05] z-10"
                            : "bg-black/40 border-white/5 text-[var(--color-brand-secondary)] hover:text-white hover:border-white/20"
                        )}
                        onClick={() => setType(t.id as MovementType)}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                          type === t.id ? t.activeBg + "/10" : "bg-white/5"
                        )}>
                          <span className={cn(type === t.id ? t.color : "text-white/40")}>{t.icon}</span>
                        </div>
                        {t.id}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* Date Selector */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.4em]">Execution Date</span>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-white/20 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Form Details (62%) */}
            <form onSubmit={handleSubmit} className="md:w-[62%] p-10 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-10">
                {/* Account & Categories Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {type !== 'transfer' ? (
                    <>
                      <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em] flex items-center gap-2">
                          <Wallet size={12} /> Source Account
                        </span>
                        <select
                          required
                          value={formData.account_id}
                          onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-white/20 appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#0D0D0D]">Select Account</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id} className="bg-[#0D0D0D]">{a.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em] flex items-center gap-2">
                          <Tag size={12} /> Macro Category
                        </span>
                        <select
                          value={formData.budget_category_id}
                          onChange={(e) => {
                            if (e.target.value === 'ADD_NEW') setIsAddingBudgetCategory(true);
                            else setFormData({ ...formData, budget_category_id: e.target.value });
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-white/20 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0D0D0D]">None</option>
                          {budgetCategories.map(c => (
                            <option key={c.id} value={c.id} className="bg-[#0D0D0D]">{c.name}</option>
                          ))}
                          <option value="ADD_NEW" className="bg-[#0D0D0D] font-bold text-[var(--color-brand-success)]">+ Add New...</option>
                        </select>
                        {isAddingBudgetCategory && (
                          <div className="flex items-center gap-2 animate-in slide-in-from-top-1">
                            <input
                              placeholder="New Macro Name"
                              value={newBudgetCategoryName}
                              onChange={(e) => setNewBudgetCategoryName(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold text-white outline-none"
                            />
                            <button onClick={() => setIsAddingBudgetCategory(false)} className="text-red-400 p-1"><X size={16} /></button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-4 md:col-span-2">
                        <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em] flex items-center gap-2">
                          <ChevronRight size={12} /> Specific Sub-Category
                        </span>
                        <select
                          required
                          value={formData.category_id}
                          onChange={(e) => {
                            if (e.target.value === 'ADD_NEW') setIsAddingCategory(true);
                            else setFormData({ ...formData, category_id: e.target.value });
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none focus:border-white/20 appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#0D0D0D]">Select Sub-Category</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id} className="bg-[#0D0D0D]">{c.name}</option>
                          ))}
                          <option value="ADD_NEW" className="bg-[#0D0D0D] font-bold text-[var(--color-brand-success)]">+ Add New...</option>
                        </select>
                        {isAddingCategory && (
                          <div className="flex items-center gap-2 animate-in slide-in-from-top-1">
                            <input
                              placeholder="New Sub-Category Name"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold text-white outline-none"
                            />
                            <button onClick={() => setIsAddingCategory(false)} className="text-red-400 p-1"><X size={16} /></button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em]">From Account</span>
                        <select
                          required
                          value={formData.from_account_id}
                          onChange={(e) => setFormData({ ...formData, from_account_id: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#0D0D0D]">Select Account</option>
                          {accounts.map(a => <option key={a.id} value={a.id} className="bg-[#0D0D0D]">{a.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em]">To Account</span>
                        <select
                          required
                          value={formData.to_account_id}
                          onChange={(e) => setFormData({ ...formData, to_account_id: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#0D0D0D]">Select Account</option>
                          {accounts.map(a => <option key={a.id} value={a.id} className="bg-[#0D0D0D]">{a.name}</option>)}
                        </select>
                      </div>

                    </>
                  )}
                </div>

                {/* Notes Input */}
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em] flex items-center gap-2">
                    <FileText size={12} /> Transaction Notes
                  </span>
                  <input
                    placeholder="Brief description of the movement..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none focus:border-white/20 transition-all"
                  />
                </div>

                {/* Status Toggles (Only for Expense) */}
                {type === 'expense' && (
                  <div className="flex items-center gap-6 pt-4">
                    {[
                      { id: 'is_fixed', label: 'Fixed' },
                      { id: 'is_split', label: 'Split' },
                      { id: 'is_necessary', label: 'Necessary' }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-3 cursor-pointer group select-none">
                        <div className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                          (formData as any)[opt.id]
                            ? "bg-white border-white"
                            : "bg-white/5 border-white/10 group-hover:border-white/20"
                        )}>
                          {(formData as any)[opt.id] && <Plus size={14} className="text-black" />}
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={(formData as any)[opt.id]}
                            onChange={(e) => setFormData({ ...formData, [opt.id]: e.target.checked })}
                          />
                        </div>
                        <span className="text-[10px] font-black text-[var(--color-brand-secondary)] group-hover:text-white uppercase tracking-[0.2em] transition-colors">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-16 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all shadow-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-white text-black hover:bg-white/90 shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition-all active:scale-[0.98]"
                >
                  {loading ? 'Processing...' : 'Confirm Transaction'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
