'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDown, ArrowUp, Repeat, Plus, Save, Calendar, Wallet, Tag, FileText, ChevronRight, Trash2, List, Grid, Copy } from 'lucide-react';
import { MovementType } from '@/types/database';
import { useAccounts, useCategories, useBudgetCategories } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { financeService } from '@/lib/financeService';
import { cn, getLocalDateString } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { showToast } from '@/components/ui/GlobalUI';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface BulkRow {
  id: string;
  type: MovementType;
  date: string;
  amount: string;
  account_id: string;
  from_account_id: string;
  to_account_id: string;
  category_id: string;
  budget_category_id: string;
  notes: string;
  is_fixed: boolean;
  is_split: boolean;
  is_necessary: boolean;
  _ui_checked?: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function NewTransactionModal({ isOpen, onClose, onSuccess }: NewTransactionModalProps) {
  const { accounts } = useAccounts();
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [type, setType] = useState<MovementType>('expense');
  const { categories: expenseCategories } = useCategories('expense');
  const { categories: incomeCategories } = useCategories('income');
  const { budgetCategories } = useBudgetCategories();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state (Single)
  const [formData, setFormData] = useState({
    amount: '',
    date: getLocalDateString(),
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

  // Bulk state
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingBudgetCategory, setIsAddingBudgetCategory] = useState(false);
  const [newBudgetCategoryName, setNewBudgetCategoryName] = useState('');

  const addBulkRow = () => {
    const lastRow = bulkRows[bulkRows.length - 1];
    setBulkRows([...bulkRows, {
      id: generateId(),
      type: lastRow ? lastRow.type : 'expense',
      date: lastRow ? lastRow.date : getLocalDateString(),
      amount: '',
      account_id: lastRow ? lastRow.account_id : '',
      from_account_id: lastRow ? lastRow.from_account_id : '',
      to_account_id: lastRow ? lastRow.to_account_id : '',
      category_id: '',
      budget_category_id: '',
      notes: '',
      is_fixed: false,
      is_split: false,
      is_necessary: true,
      _ui_checked: false,
    }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const duplicateBulkRow = (id: string) => {
    const rowToDuplicate = bulkRows.find(r => r.id === id);
    if (!rowToDuplicate) return;
    
    const newRow = { ...rowToDuplicate, id: generateId(), _ui_checked: false };
    
    setBulkRows([...bulkRows, newRow].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const updateBulkRow = (id: string, field: keyof BulkRow, value: any) => {
    let newRows = bulkRows.map(r => r.id === id ? { ...r, [field]: value } : r);
    if (field === 'date') {
      newRows = newRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    setBulkRows(newRows);
  };

  const deleteBulkRow = (id: string) => {
    setBulkRows(bulkRows.filter(r => r.id !== id));
  };

  const handleReset = () => {
    setFormData({
      amount: '',
      date: getLocalDateString(),
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
    setBulkRows([{
      id: generateId(),
      type: 'expense',
      date: getLocalDateString(),
      amount: '',
      account_id: '',
      from_account_id: '',
      to_account_id: '',
      category_id: '',
      budget_category_id: '',
      notes: '',
      is_fixed: false,
      is_split: false,
      is_necessary: true,
      _ui_checked: false,
    }]);
    setSubmitted(false);
    setMode('bulk');
    setIsAddingCategory(false);
    setNewCategoryName('');
    setIsAddingBudgetCategory(false);
    setNewBudgetCategoryName('');
  };

  useEffect(() => {
    if (isOpen) {
      handleReset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'single') {
        if (!formData.amount) throw new Error("Amount is required");
        const amountNum = Math.round(Math.abs(parseFloat(formData.amount.replace(',', '.'))) * 100) / 100;

        let categoryId = formData.category_id;
        let budgetCategoryId = formData.budget_category_id;

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
      } else {
        // Bulk Submit
        const validRows = bulkRows.filter(r => r.amount && parseFloat(r.amount) > 0);
        if (validRows.length === 0) throw new Error("No valid rows to save");

        for (const row of validRows) {
          const amountNum = Math.round(Math.abs(parseFloat(row.amount.replace(',', '.'))) * 100) / 100;
          const insertData: any = {
            date: row.date,
            amount: amountNum,
            type: row.type,
            notes: row.notes,
            is_fixed: row.is_fixed,
            is_split: row.is_split,
            is_necessary: row.is_necessary,
          };

          if (row.type === 'transfer') {
            insertData.from_account_id = row.from_account_id;
            insertData.to_account_id = row.to_account_id;
          } else {
            insertData.account_id = row.account_id;
            insertData.category_id = row.category_id || null;
            insertData.budget_category_id = row.budget_category_id || null;
          }
          await financeService.recordTransaction(insertData);
        }
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
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

      {/* Modal Card */}
      <div className={cn(
        "relative w-full bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col transition-all duration-300",
        mode === 'single' ? "max-w-5xl md:flex-row min-h-[500px]" : "max-w-[95vw] md:h-[80vh]",
        submitted && "items-center justify-center py-20 px-10 text-center !max-w-5xl !flex-col"
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
            {/* Header / Mode Switcher */}
            <div className="absolute top-8 right-10 z-20 flex items-center gap-3">
              <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                <button 
                  onClick={() => setMode('single')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    mode === 'single' ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  <Grid size={12} /> Single
                </button>
                <button 
                  onClick={() => { setMode('bulk'); if(bulkRows.length === 0) addBulkRow(); }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    mode === 'bulk' ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  <List size={12} /> Bulk
                </button>
              </div>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10">
                <X size={20} />
              </button>
            </div>

            {mode === 'single' ? (
              <>
                {/* LEFT PANEL: Amount & Type & Date */}
                <div className="md:w-[38%] bg-white/[0.02] border-r border-white/5 p-10 flex flex-col justify-between pt-24">
                  <div>
                    <h2 className="text-white font-black text-lg uppercase tracking-tighter mb-12">New Movement</h2>
                    
                    <div className="flex flex-col gap-4 mb-16">
                      <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.4em]">Transaction Amount</span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-light text-[var(--color-brand-secondary)]">€</span>
                        <input
                          type="number" step="0.01" inputMode="decimal" placeholder="0.00" autoFocus required
                          className="bg-transparent text-7xl font-black text-white w-full outline-none placeholder-white/[0.03] transition-all font-mono tracking-tighter"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-12">
                      <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.4em]">Movement Category</span>
                      <div className="grid grid-cols-3 gap-3">
                        {['expense', 'income', 'transfer'].map((t) => (
                          <button
                            key={t} type="button"
                            className={cn(
                              "flex flex-col items-center justify-center gap-3 py-5 rounded-2xl text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-300 border",
                              type === t ? "bg-white border-white text-black shadow-xl scale-[1.05] z-10" : "bg-black/40 border-white/5 text-[var(--color-brand-secondary)] hover:text-white hover:border-white/20"
                            )}
                            onClick={() => setType(t as MovementType)}
                          >
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", type === t ? "bg-black/10" : "bg-white/5")}>
                              {t === 'expense' ? <ArrowDown size={14} /> : t === 'income' ? <ArrowUp size={14} /> : <Repeat size={14} />}
                            </div>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.4em]">Execution Date</span>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                      <input
                        type="date" required value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-white/20 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL: Form Details */}
                <form onSubmit={handleSubmit} className="md:w-[62%] p-10 flex flex-col justify-between overflow-y-auto custom-scrollbar pt-24">
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {type !== 'transfer' ? (
                        <>
                          <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em] flex items-center gap-2"><Wallet size={12} /> Source Account</span>
                            <select required value={formData.account_id} onChange={(e) => setFormData({ ...formData, account_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer">
                              <option value="" disabled className="bg-[#0D0D0D]">Select Account</option>
                              {accounts.map(a => <option key={a.id} value={a.id} className="bg-[#0D0D0D]">{a.name}</option>)}
                            </select>
                          </div>
                          {type === 'expense' && (
                            <div className="flex flex-col gap-4">
                              <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em] flex items-center gap-2"><Tag size={12} /> Macro Category</span>
                              <select value={formData.budget_category_id} onChange={(e) => { if (e.target.value === 'ADD_NEW') setIsAddingBudgetCategory(true); else setFormData({ ...formData, budget_category_id: e.target.value }); }} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer">
                                <option value="" className="bg-[#0D0D0D]">None</option>
                                {budgetCategories.map(c => <option key={c.id} value={c.id} className="bg-[#0D0D0D]">{c.name}</option>)}
                                <option value="ADD_NEW" className="bg-[#0D0D0D] font-bold text-[var(--color-brand-success)]">+ Add New...</option>
                              </select>
                              {isAddingBudgetCategory && <div className="flex items-center gap-2"><input placeholder="New Macro" value={newBudgetCategoryName} onChange={(e) => setNewBudgetCategoryName(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold text-white outline-none"/><button onClick={() => setIsAddingBudgetCategory(false)} className="text-red-400 p-1"><X size={16}/></button></div>}
                            </div>
                          )}
                          <div className="flex flex-col gap-4 md:col-span-2">
                            <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em] flex items-center gap-2"><ChevronRight size={12} /> Sub-Category</span>
                            <select required value={formData.category_id} onChange={(e) => { if (e.target.value === 'ADD_NEW') setIsAddingCategory(true); else setFormData({ ...formData, category_id: e.target.value }); }} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer">
                              <option value="" disabled className="bg-[#0D0D0D]">Select Sub-Category</option>
                              {(type === 'expense' ? expenseCategories : incomeCategories).map(c => <option key={c.id} value={c.id} className="bg-[#0D0D0D]">{c.name}</option>)}
                              <option value="ADD_NEW" className="bg-[#0D0D0D] font-bold text-[var(--color-brand-success)]">+ Add New...</option>
                            </select>
                            {isAddingCategory && <div className="flex items-center gap-2"><input placeholder="New Sub" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold text-white outline-none"/><button onClick={() => setIsAddingCategory(false)} className="text-red-400 p-1"><X size={16}/></button></div>}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em]">From Account</span>
                            <select required value={formData.from_account_id} onChange={(e) => setFormData({ ...formData, from_account_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer">
                              <option value="" disabled className="bg-[#0D0D0D]">Select Account</option>
                              {accounts.map(a => <option key={a.id} value={a.id} className="bg-[#0D0D0D]">{a.name}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em]">To Account</span>
                            <select required value={formData.to_account_id} onChange={(e) => setFormData({ ...formData, to_account_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm font-bold text-white outline-none appearance-none cursor-pointer">
                              <option value="" disabled className="bg-[#0D0D0D]">Select Account</option>
                              {accounts.map(a => <option key={a.id} value={a.id} className="bg-[#0D0D0D]">{a.name}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.3em] flex items-center gap-2"><FileText size={12} /> Notes</span>
                      <input placeholder="Brief description..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none focus:border-white/20 transition-all" />
                    </div>

                    {type === 'expense' && (
                      <div className="flex items-center gap-6 pt-4">
                        {[{ id: 'is_fixed', label: 'Fixed' }, { id: 'is_split', label: 'Split' }, { id: 'is_necessary', label: 'Necessary' }].map(opt => (
                          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group select-none">
                            <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-all", (formData as any)[opt.id] ? "bg-white border-white" : "bg-white/5 border-white/10 group-hover:border-white/20")}>
                              {(formData as any)[opt.id] && <Plus size={14} className="text-black" />}
                              <input type="checkbox" className="hidden" checked={(formData as any)[opt.id]} onChange={(e) => setFormData({ ...formData, [opt.id]: e.target.checked })} />
                            </div>
                            <span className="text-[10px] font-black text-[var(--color-brand-secondary)] group-hover:text-white uppercase tracking-[0.2em] transition-colors">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-16 flex gap-4">
                    <button type="button" onClick={onClose} className="flex-1 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-xl">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-white text-black hover:bg-white/90 shadow-2xl active:scale-[0.98]">{loading ? 'Processing...' : 'Confirm'}</button>
                  </div>
                </form>
              </>
            ) : (
              /* BULK MODE VIEW */
              <div className="flex-1 p-10 flex flex-col pt-24 overflow-hidden">
                <div className="flex items-center justify-between mb-8 shrink-0">
                  <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Bulk Entry</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={handleSubmit} disabled={loading || bulkRows.length === 0} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-black text-xs uppercase tracking-[0.2em] disabled:opacity-50"><Save size={16} /> {loading ? 'Saving...' : 'Confirm All'}</button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto rounded-2xl border border-white/5 bg-black/40 shadow-2xl custom-scrollbar">
                  <table className="w-full text-left text-[11px] text-white border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#0D0D0D]">
                      <tr className="border-b border-white/10">
                        <th className="p-4 w-8 text-center text-white/40 font-black">✔</th>
                        <th className="p-4 font-black text-[var(--color-brand-secondary)] uppercase tracking-wider w-[120px]">Type</th>
                        <th className="p-4 font-black text-[var(--color-brand-secondary)] uppercase tracking-wider w-[130px]">Date</th>
                        <th className="p-4 font-black text-[var(--color-brand-secondary)] uppercase tracking-wider w-[120px]">Amount</th>
                        <th className="p-4 font-black text-[var(--color-brand-secondary)] uppercase tracking-wider w-[160px]">Account</th>
                        <th className="p-4 font-black text-[var(--color-brand-secondary)] uppercase tracking-wider w-[150px]">Category</th>
                        <th className="p-4 font-black text-[var(--color-brand-secondary)] uppercase tracking-wider w-[150px]">Macro</th>
                        <th className="p-4 font-black text-[var(--color-brand-secondary)] uppercase tracking-wider w-[100px]">Notes</th>
                        <th className="p-4 font-black text-[var(--color-brand-secondary)] uppercase tracking-wider w-[120px]">Options</th>
                        <th className="p-4 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkRows.map((row) => (
                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-2 text-center">
                            <input type="checkbox" checked={!!row._ui_checked} onChange={e => updateBulkRow(row.id, '_ui_checked', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/5 accent-white cursor-pointer" />
                          </td>
                          <td className="p-2">
                            <select value={row.type} onChange={e => updateBulkRow(row.id, 'type', e.target.value)} className="w-full bg-white/5 border-none rounded-lg p-2 text-white outline-none cursor-pointer appearance-none font-bold uppercase tracking-widest text-[9px]">
                              <option value="expense" className="bg-[#0D0D0D]">Expense</option>
                              <option value="income" className="bg-[#0D0D0D]">Income</option>
                              <option value="transfer" className="bg-[#0D0D0D]">Transfer</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input type="date" value={row.date} onChange={e => updateBulkRow(row.id, 'date', e.target.value)} className="w-full bg-white/5 border-none rounded-lg p-2 text-white outline-none text-[10px] font-bold" />
                          </td>
                          <td className="p-2 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">€</span>
                            <input type="number" step="0.01" placeholder="0.00" value={row.amount} onChange={e => updateBulkRow(row.id, 'amount', e.target.value)} className="w-full bg-white/5 border-none rounded-lg py-2 pr-2 pl-6 text-white outline-none font-mono font-bold" />
                          </td>
                          <td className="p-2">
                            {row.type === 'transfer' ? (
                              <div className="flex flex-col gap-1">
                                <select value={row.from_account_id} onChange={e => updateBulkRow(row.id, 'from_account_id', e.target.value)} className="w-full bg-white/5 border-none rounded-md p-1.5 text-white outline-none text-[9px] font-bold appearance-none"><option value="" className="bg-[#0D0D0D]">From...</option>{accounts.map(a => <option key={a.id} value={a.id} className="bg-[#0D0D0D]">{a.name}</option>)}</select>
                                <select value={row.to_account_id} onChange={e => updateBulkRow(row.id, 'to_account_id', e.target.value)} className="w-full bg-white/5 border-none rounded-md p-1.5 text-white outline-none text-[9px] font-bold appearance-none"><option value="" className="bg-[#0D0D0D]">To...</option>{accounts.map(a => <option key={a.id} value={a.id} className="bg-[#0D0D0D]">{a.name}</option>)}</select>
                              </div>
                            ) : (
                              <select value={row.account_id} onChange={e => updateBulkRow(row.id, 'account_id', e.target.value)} className="w-full bg-white/5 border-none rounded-lg p-2 text-white outline-none appearance-none font-bold text-[10px]"><option value="" className="bg-[#0D0D0D]">Select...</option>{accounts.map(a => <option key={a.id} value={a.id} className="bg-[#0D0D0D]">{a.name}</option>)}</select>
                            )}
                          </td>
                          <td className="p-2">
                            {row.type !== 'transfer' && (
                              <select value={row.category_id} onChange={e => updateBulkRow(row.id, 'category_id', e.target.value)} className="w-full bg-white/5 border-none rounded-lg p-2 text-white outline-none appearance-none font-bold text-[10px]"><option value="" className="bg-[#0D0D0D]">Category...</option>{(row.type === 'expense' ? expenseCategories : incomeCategories).map(c => <option key={c.id} value={c.id} className="bg-[#0D0D0D]">{c.name}</option>)}</select>
                            )}
                          </td>
                          <td className="p-2">
                            {row.type === 'expense' && (
                              <select value={row.budget_category_id} onChange={e => updateBulkRow(row.id, 'budget_category_id', e.target.value)} className="w-full bg-white/5 border-none rounded-lg p-2 text-white outline-none appearance-none font-bold text-[10px]"><option value="" className="bg-[#0D0D0D]">Macro...</option>{budgetCategories.map(c => <option key={c.id} value={c.id} className="bg-[#0D0D0D]">{c.name}</option>)}</select>
                            )}
                          </td>
                          <td className="p-2">
                            <input type="text" placeholder="Notes..." value={row.notes} onChange={e => updateBulkRow(row.id, 'notes', e.target.value)} className="w-full bg-white/5 border-none rounded-lg p-2 text-white outline-none text-[10px] font-medium" />
                          </td>
                          <td className="p-2">
                            {row.type === 'expense' && (
                              <div className="flex items-center gap-2">
                                {[{ id: 'is_fixed', label: 'F' }, { id: 'is_split', label: 'S' }, { id: 'is_necessary', label: 'N' }].map(opt => (
                                  <button
                                    key={opt.id}
                                    onClick={() => updateBulkRow(row.id, opt.id as keyof BulkRow, !(row as any)[opt.id])}
                                    className={cn(
                                      "w-6 h-6 rounded flex items-center justify-center text-[8px] font-black border transition-all",
                                      (row as any)[opt.id] ? "bg-white border-white text-black" : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                                    )}
                                    title={opt.label === 'F' ? 'Fixed' : opt.label === 'S' ? 'Split' : 'Necessary'}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-2 flex items-center justify-center gap-1">
                            <button onClick={() => duplicateBulkRow(row.id)} className="text-white/20 hover:text-white p-2 transition-colors" title="Duplicate Row"><Copy size={16} /></button>
                            <button onClick={() => deleteBulkRow(row.id)} className="text-white/20 hover:text-red-400 p-2 transition-colors" title="Delete Row"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bulkRows.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                      <p className="text-[var(--color-brand-secondary)] mb-6 text-sm uppercase tracking-widest font-bold">No entries added</p>
                      <button onClick={addBulkRow} className="px-8 py-3 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl">Add First Row</button>
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-t border-white/5 bg-[#0a0a0a] gap-4">
                      <button onClick={addBulkRow} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest shrink-0"><Plus size={16} /> Add Row</button>
                      
                      {(() => {
                        const stats = bulkRows.reduce((acc, r) => {
                          const amt = parseFloat(r.amount.replace(',', '.')) || 0;
                          if (r.type === 'expense') { acc.expAmt += amt; acc.expCnt++; }
                          if (r.type === 'income') { acc.incAmt += amt; acc.incCnt++; }
                          if (r.type === 'transfer') { acc.traAmt += amt; acc.traCnt++; }
                          return acc;
                        }, { expAmt: 0, expCnt: 0, incAmt: 0, incCnt: 0, traAmt: 0, traCnt: 0 });

                        return (
                          <div className="flex items-center gap-6 md:gap-10">
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase tracking-widest text-[var(--color-brand-secondary)] font-bold mb-1">Expenses ({stats.expCnt})</span>
                              <span className="text-sm font-mono font-bold text-[var(--color-brand-danger)]">€ {stats.expAmt.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase tracking-widest text-[var(--color-brand-secondary)] font-bold mb-1">Incomes ({stats.incCnt})</span>
                              <span className="text-sm font-mono font-bold text-[var(--color-brand-success)]">€ {stats.incAmt.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase tracking-widest text-[var(--color-brand-secondary)] font-bold mb-1">Transfers ({stats.traCnt})</span>
                              <span className="text-sm font-mono font-bold text-white">€ {stats.traAmt.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

