'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ChevronLeft, Save, Trash2, Plus, X, ArrowDown, ArrowUp, Repeat } from 'lucide-react';
import { MovementType, Transaction } from '@/types/database';
import { useAccounts, useCategories, useBudgetCategories } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { financeService } from '@/lib/financeService';
import { showToast, showConfirm } from '@/components/ui/GlobalUI';
import { triggerRefresh } from '@/hooks/useData';
import { useTransactionSubmit } from '@/hooks/useTransactionSubmit';
import { cn } from '@/lib/utils';

export default function EditTransaction({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { accounts } = useAccounts();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<MovementType>('expense');
  const { categories } = useCategories(type as 'income' | 'expense');
  const { budgetCategories } = useBudgetCategories();
  const { submitTransaction } = useTransactionSubmit();
  const [oldTx, setOldTx] = useState<Transaction | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
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

  useEffect(() => {
    async function fetchTransaction() {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setFormData({
          amount: Math.abs(data.amount).toString(),
          date: data.date,
          category_id: data.category_id || '',
          budget_category_id: data.budget_category_id || '',
          account_id: data.account_id || '',
          from_account_id: data.from_account_id || '',
          to_account_id: data.to_account_id || '',
          notes: data.notes || '',
          is_fixed: data.is_fixed,
          is_split: data.is_split,
          is_necessary: data.is_necessary,
        });
        setType(data.type);
        setOldTx(data);
      }
      setLoading(false);
    }
    fetchTransaction();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !oldTx) return;

    setSaving(true);
    
    const result = await submitTransaction({
      type,
      formData,
      oldTx,
      isAddingCategory,
      newCategoryName,
      isAddingBudgetCategory,
      newBudgetCategoryName
    });

    if (result.success) {
      triggerRefresh();
      router.push('/transactions');
      router.refresh();
    } else {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    showConfirm('Are you sure you want to delete this transaction?', async () => {
      setSaving(true);
      try {
        const { data: tx, error: fetchError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;

        await financeService.deleteTransaction(tx);
        triggerRefresh();
        router.push('/transactions');
        router.refresh();
      } catch (error: any) {
        showToast('Error deleting: ' + error.message, 'error');
        setSaving(false);
      }
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-brand-navy)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-brand-navy)] pb-12 animate-in slide-in-from-bottom-[20px] fade-in duration-500">
      <div className="max-w-xl mx-auto px-6">

        <header className="flex items-center justify-between pt-8 mb-10">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] text-[var(--color-brand-secondary)] hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-light text-white tracking-wide uppercase">Edit Transaction</h1>
          <button
            onClick={handleDelete}
            className="p-3 rounded-full bg-[var(--color-brand-danger)]/10 text-[var(--color-brand-danger)] hover:bg-[var(--color-brand-danger)]/20 transition-all hover:scale-105 active:scale-95"
            title="Delete transaction"
          >
            <Trash2 size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* Type Segmented Picker */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'expense', icon: <ArrowDown size={14} />, color: 'text-[#F05A64]', activeBg: 'bg-[#F05A64]' },
              { id: 'income', icon: <ArrowUp size={14} />, color: 'text-[#10B981]', activeBg: 'bg-[#10B981]' },
              { id: 'transfer', icon: <Repeat size={14} />, color: 'text-[var(--color-brand-accent)]', activeBg: 'bg-[var(--color-brand-accent)]' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={cn(
                  "flex flex-col items-center justify-center gap-3 py-6 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 border",
                  type === t.id
                    ? "bg-white border-white text-black shadow-xl scale-[1.05] z-10"
                    : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.05)] text-[var(--color-brand-secondary)] hover:text-white"
                )}
                onClick={() => setType(t.id as MovementType)}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-inner",
                  type === t.id ? t.activeBg + "/10" : "bg-white/5"
                )}>
                  <span className={cn(type === t.id ? t.color : "text-white/40")}>{t.icon}</span>
                </div>
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

                {type === 'expense' && (
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
                        <button type="button" onClick={() => setIsAddingBudgetCategory(false)} className="p-3 text-[var(--color-brand-danger)]"><X size={20} /></button>
                      </div>
                    )}
                  </div>
                )}

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
                      <button type="button" onClick={() => setIsAddingCategory(false)} className="p-3 text-[var(--color-brand-danger)]"><X size={20} /></button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="From Account"
                  required
                  options={[
                    { value: '', label: 'Select...' },
                    ...accounts.map(a => ({ value: a.id, label: a.name }))
                  ]}
                  value={formData.from_account_id}
                  onChange={(e) => setFormData({ ...formData, from_account_id: e.target.value })}
                />
                <Select
                  label="To Account"
                  required
                  options={[
                    { value: '', label: 'Select...' },
                    ...accounts.map(a => ({ value: a.id, label: a.name }))
                  ]}
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
              disabled={saving} 
              className="relative py-5 rounded-2xl font-bold text-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white active:bg-[rgba(255,255,255,0.1)] shadow-2xl transition-all duration-300 backdrop-blur-sm active:scale-[0.98] touch-manipulation"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
