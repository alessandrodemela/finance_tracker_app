'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ChevronLeft, Save, Plus, X, ArrowDown, ArrowUp, Repeat } from 'lucide-react';
import { MovementType } from '@/types/database';
import { useAccounts, useCategories, useBudgetCategories } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { financeService } from '@/lib/financeService';
import { cn } from '@/lib/utils';

export default function AddTransaction() {
  const router = useRouter();
  const { accounts } = useAccounts();
  const [type, setType] = useState<MovementType>('expense');
  const { categories } = useCategories(type as 'income' | 'expense');
  const { budgetCategories, setBudgetCategories } = useBudgetCategories();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastAccountId, setLastAccountId] = useState<string>('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;

    setLoading(true);
    const amountNum = Math.round(Math.abs(parseFloat(formData.amount.replace(',', '.'))) * 100) / 100;

    let categoryId = formData.category_id;
    let budgetCategoryId = formData.budget_category_id;

    if (type !== 'transfer' && isAddingCategory && newCategoryName.trim()) {
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim().toLowerCase(), type: type as 'income' | 'expense' }])
        .select().single();
      if (catError) { alert('Error: ' + catError.message); setLoading(false); return; }
      categoryId = newCat.id;
    }

    if (type !== 'transfer' && isAddingBudgetCategory && newBudgetCategoryName.trim()) {
      const { data: newCat, error: catError } = await supabase
        .from('budget_categories')
        .insert([{ name: newBudgetCategoryName.trim().toLowerCase() }])
        .select().single();
      if (catError) { alert('Error: ' + catError.message); setLoading(false); return; }
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

    try {
      await financeService.recordTransaction(insertData);
      setLastAccountId(formData.account_id);
      setSubmitted(true);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = (sameAccount: boolean = false) => {
    setFormData({ ...formData, amount: '', notes: '', account_id: sameAccount ? lastAccountId : '', is_fixed: false, is_split: false });
    setSubmitted(false);
    setIsAddingCategory(false);
    setNewCategoryName('');
    setIsAddingBudgetCategory(false);
    setNewBudgetCategoryName('');
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[var(--color-brand-navy)] flex flex-col items-center justify-center p-6 text-center gap-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-[var(--color-brand-success)]/20 text-[var(--color-brand-success)] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <Save size={32} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Transaction Saved!</h1>
          <p className="text-[var(--color-brand-secondary)]">Your balance has been updated successfully.</p>
        </div>
        <div className="w-full max-w-sm flex flex-col gap-5">
          <div className="relative group w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-accent)] to-[#10B981] rounded-2xl blur opacity-30 group-hover:opacity-60 transition-all duration-500" />
            <Button onClick={() => handleAddAnother(false)} fullWidth className="relative py-4 rounded-2xl font-bold text-base bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)] shadow-xl transition-all duration-300 backdrop-blur-sm">
              Add Another Transaction
            </Button>
          </div>
          <Button onClick={() => router.push('/')} variant="ghost" fullWidth className="py-4 rounded-2xl font-bold text-base border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.03)] text-[var(--color-brand-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.08)]">
            Back to Dashboard
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-brand-navy)] pb-12 animate-in slide-in-from-bottom-[20px] fade-in duration-500">
      <div className="max-w-xl mx-auto px-6">

        {/* Header */}
        <header className="flex items-center justify-between pt-8 mb-10">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] text-[var(--color-brand-secondary)] hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-light text-white tracking-wide uppercase">New Transaction</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* Type Segmented Picker */}
          <div className="bg-[rgba(255,255,255,0.04)] p-1.5 rounded-[22px] flex items-center border border-[rgba(255,255,255,0.05)] shadow-inner">
            {[
              { id: 'expense', icon: <ArrowDown size={14} />, color: 'text-[#F05A64]' },
              { id: 'income', icon: <ArrowUp size={14} />, color: 'text-[#10B981]' },
              { id: 'transfer', icon: <Repeat size={14} />, color: 'text-[var(--color-brand-accent)]' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] text-xs font-bold tracking-widest uppercase transition-all duration-300",
                  type === t.id
                    ? "bg-white text-[var(--color-brand-navy)] shadow-xl scale-[1.02]"
                    : "text-[var(--color-brand-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                )}
                onClick={() => setType(t.id as MovementType)}
              >
                <span className={cn("transition-colors", type === t.id ? t.color : "text-current")}>{t.icon}</span>
                {t.id}
              </button>
            ))}
          </div>

          {/* Large Amount Input */}
          <div className="flex flex-col items-center justify-center gap-2 py-8 group">
            <div className="text-xs font-bold text-[var(--color-brand-secondary)] uppercase tracking-[0.2em] mb-2 opacity-60 group-focus-within:opacity-100 transition-opacity">Amount</div>
            <div className="flex items-center gap-2 relative">
              <span className="text-4xl font-light text-[var(--color-brand-secondary)]">€</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0.00"
                autoFocus
                required
                className="bg-transparent text-6xl font-bold text-white text-center w-full max-w-[280px] outline-none placeholder-[rgba(255,255,255,0.1)] focus:placeholder-transparent transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          {/* Form Fields Glass Card */}
          <div className="glass-panel p-6 flex flex-col gap-6 border-[rgba(255,255,255,0.05)] shadow-2xl">

            <Input
              label="Date"
              type="date"
              required
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] focus:bg-[rgba(255,255,255,0.05)] rounded-2xl py-4"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            {type !== 'transfer' ? (
              <>
                <Select
                  label="Account"
                  required
                  options={accounts.map(a => ({ value: a.id, label: a.name }))}
                  value={formData.account_id}
                  onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                />

                <div className="flex flex-col gap-2">
                  <Select
                    label="Category (Macro)"
                    required={false}
                    options={[
                      { value: '', label: '-- None --' },
                      ...budgetCategories.map(c => ({ value: c.id, label: c.name })),
                      { value: 'ADD_NEW', label: '+ New Macro Category...' }
                    ]}
                    value={formData.budget_category_id}
                    onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') setIsAddingBudgetCategory(true);
                      else setFormData({ ...formData, budget_category_id: e.target.value });
                    }}
                  />
                  {isAddingBudgetCategory && (
                    <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-1 fade-in">
                      <Input
                        placeholder="New Macro Name..."
                        value={newBudgetCategoryName}
                        onChange={(e) => setNewBudgetCategoryName(e.target.value)}
                        className="flex-1"
                      />
                      <button onClick={() => setIsAddingBudgetCategory(false)} className="p-3 text-[var(--color-brand-danger)]"><X size={20} /></button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Select
                    label="Sub-Category"
                    required
                    options={[
                      ...categories.map(c => ({ value: c.id, label: c.name })),
                      { value: 'ADD_NEW', label: '+ New Sub-Category...' }
                    ]}
                    value={formData.category_id}
                    onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') setIsAddingCategory(true);
                      else setFormData({ ...formData, category_id: e.target.value });
                    }}
                  />
                  {isAddingCategory && (
                    <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-1 fade-in">
                      <Input
                        placeholder="New Sub-Category..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1"
                      />
                      <button onClick={() => setIsAddingCategory(false)} className="p-3 text-[var(--color-brand-danger)]"><X size={20} /></button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="From Account"
                  required
                  options={accounts.map(a => ({ value: a.id, label: a.name }))}
                  value={formData.from_account_id}
                  onChange={(e) => setFormData({ ...formData, from_account_id: e.target.value })}
                />
                <Select
                  label="To Account"
                  required
                  options={accounts.map(a => ({ value: a.id, label: a.name }))}
                  value={formData.to_account_id}
                  onChange={(e) => setFormData({ ...formData, to_account_id: e.target.value })}
                />
              </div>
            )}

            <Input
              label="Note"
              placeholder="What was this for?"
              className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] focus:bg-[rgba(255,255,255,0.05)] rounded-2xl py-4"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            {type === 'expense' && (
              <div className="flex items-center justify-between px-2 pt-2">
                {[
                  { id: 'is_fixed', label: 'Fixed' },
                  { id: 'is_split', label: 'Split' },
                  { id: 'is_necessary', label: 'Necessary' }
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                      (formData as any)[opt.id]
                        ? "bg-[var(--color-brand-accent)] border-[var(--color-brand-accent)]"
                        : "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] group-hover:border-[rgba(255,255,255,0.3)]"
                    )}>
                      {(formData as any)[opt.id] && <Plus size={14} className="text-white" />}
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={(formData as any)[opt.id]}
                        onChange={(e) => setFormData({ ...formData, [opt.id]: e.target.checked })}
                      />
                    </div>
                    <span className="text-xs font-bold text-[var(--color-brand-secondary)] uppercase tracking-wider">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="w-full relative group mt-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-accent)] to-[#10B981] rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
            <Button 
              type="submit" 
              fullWidth 
              disabled={loading} 
              className="relative py-5 rounded-2xl font-bold text-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)] shadow-2xl transition-all duration-300 backdrop-blur-sm group-active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Record Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
