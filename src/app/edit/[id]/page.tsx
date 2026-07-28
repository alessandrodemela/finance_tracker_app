'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import styles from './page.module.css';
import { MovementType, Transaction } from '@/types/database';
import { useAccounts, useCategories, useBudgetCategories } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { financeService } from '@/lib/financeService';
import { showToast, showConfirm } from '@/components/ui/GlobalUI';
import { triggerRefresh } from '@/hooks/useData';
import { useTransactionSubmit } from '@/hooks/useTransactionSubmit';

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
      oldTx
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

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="gradient-text">Edit</h1>
        <Button variant="danger" onClick={handleDelete} className={styles.deleteBtn}>
          <Trash2 size={18} />
        </Button>
      </header>

      <div className={styles.formContainer}>
        <Card>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.typeToggle}>
              {(['expense', 'income', 'transfer'] as MovementType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.toggleBtn} ${type === t ? styles.activeToggle : ''}`}
                  onClick={() => setType(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.formGrid}>
              <Input
                label="Amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />

              <Input
                label="Date"
                type="date"
                required
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
                  <Select
                    label="Category"
                    required
                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  />
                  <Select
                    label="Budget Category (Macro)"
                    required={false}
                    options={[
                      { value: '', label: '-- Nessuna --' },
                      ...budgetCategories.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    value={formData.budget_category_id}
                    onChange={(e) => setFormData({ ...formData, budget_category_id: e.target.value })}
                  />
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            <Input
              label="Note"
              placeholder="What was this for?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            {type === 'expense' && (
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_fixed}
                    onChange={(e) => setFormData({ ...formData, is_fixed: e.target.checked })}
                  />
                  <span>Fixed</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_split}
                    onChange={(e) => setFormData({ ...formData, is_split: e.target.checked })}
                  />
                  <span>Split</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_necessary}
                    onChange={(e) => setFormData({ ...formData, is_necessary: e.target.checked })}
                  />
                  <span>Necessary</span>
                </label>
              </div>
            )}

            <Button type="submit" fullWidth disabled={saving} className={styles.submitBtn}>
              <Save size={20} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
