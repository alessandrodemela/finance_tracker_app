'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, Save } from 'lucide-react';
import styles from './page.module.css';
import { MovementType } from '@/types/database';
import { useAccounts, useCategories, useBudgetCategories } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';

export default function AddTransaction() {
  const router = useRouter();
  const { accounts } = useAccounts();
  const [type, setType] = useState<MovementType>('expense');
  const { categories } = useCategories(type as 'income' | 'expense');
  const { budgetCategories } = useBudgetCategories();
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
    
    // Ensure amount is ALWAYS positive in DB as per requirement
    const amountNum = Math.abs(parseFloat(formData.amount));

    let categoryId = formData.category_id;
    let budgetCategoryId = formData.budget_category_id;

    // Handle new category creation
    if (type !== 'transfer' && isAddingCategory && newCategoryName.trim()) {
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert([{ 
          name: newCategoryName.trim().toLowerCase(), 
          type: type as 'income' | 'expense' 
        }])
        .select()
        .single();
      
      if (catError) {
        alert('Error creating category: ' + catError.message);
        setLoading(false);
        return;
      }
      categoryId = newCat.id;
    }

    // Handle new budget category creation
    if (type !== 'transfer' && isAddingBudgetCategory && newBudgetCategoryName.trim()) {
      const { data: newCat, error: catError } = await supabase
        .from('budget_categories')
        .insert([{ 
          name: newBudgetCategoryName.trim().toLowerCase()
        }])
        .select()
        .single();
      
      if (catError) {
        alert('Error creating budget category: ' + catError.message);
        setLoading(false);
        return;
      }
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

    const { error } = await supabase.from('transactions').insert([insertData]);

    if (error) {
      alert('Error saving transaction: ' + error.message);
      setLoading(false);
    } else {
      setLastAccountId(formData.account_id);
      setSubmitted(true);
      setLoading(false);
    }
  };

  const handleAddAnother = (sameAccount: boolean = false) => {
    setFormData({
      ...formData,
      amount: '',
      notes: '',
      account_id: sameAccount ? lastAccountId : '',
      is_fixed: false,
      is_split: false,
    });
    setSubmitted(false);
    setIsAddingCategory(false);
    setNewCategoryName('');
    setIsAddingBudgetCategory(false);
    setNewBudgetCategoryName('');
  };

  if (submitted) {
    return (
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className="gradient-text">Transaction Saved!</h1>
        </header>
        <div className={styles.successContainer}>
          <Card>
            <div className={styles.successActions}>
              <Button onClick={() => router.push('/')} variant="secondary" fullWidth>
                Back to Home
              </Button>
              <Button onClick={() => handleAddAnother(false)} fullWidth>
                New Transaction
              </Button>
              {lastAccountId && (
                <Button onClick={() => handleAddAnother(true)} variant="ghost" fullWidth>
                  New from Same Account
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </Button>
        <h1 className="gradient-text">New Transaction</h1>
      </header>

      <div className={styles.formContainer}>
        <Card>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Transaction Type Toggle */}
            <div className={styles.typeToggle}>
              {(['expense', 'income', 'transfer'] as MovementType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.toggleBtn} ${type === t ? styles.activeToggle : ''}`}
                  onClick={() => {
                    setType(t);
                    setIsAddingCategory(false);
                    setIsAddingBudgetCategory(false);
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.formGrid}>
              <Input
                label="Amount"
                type="number"
                step="0.01"
                placeholder="0.00"
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
                  {!isAddingCategory ? (
                    <div className={styles.categorySelectWrapper}>
                      <Select
                        label="Category"
                        required
                        options={[
                          ...categories.map(c => ({ value: c.id, label: c.name })),
                          { value: 'ADD_NEW', label: '+ New Category...' }
                        ]}
                        value={formData.category_id}
                        onChange={(e) => {
                          if (e.target.value === 'ADD_NEW') {
                            setIsAddingCategory(true);
                          } else {
                            setFormData({ ...formData, category_id: e.target.value });
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className={styles.newCategoryWrapper}>
                      <Input
                        label="New Category"
                        placeholder="Category name..."
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                      />
                      <button 
                        type="button" 
                        className={styles.cancelBtn}
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategoryName('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {!isAddingBudgetCategory ? (
                    <div className={styles.categorySelectWrapper}>
                      <Select
                        label="Budget Category (Macro)"
                        required={false}
                        options={[
                          { value: '', label: '-- Nessuna --' },
                          ...budgetCategories.map(c => ({ value: c.id, label: c.name })),
                          { value: 'ADD_NEW', label: '+ New Budget Category...' }
                        ]}
                        value={formData.budget_category_id}
                        onChange={(e) => {
                          if (e.target.value === 'ADD_NEW') {
                            setIsAddingBudgetCategory(true);
                          } else {
                            setFormData({ ...formData, budget_category_id: e.target.value });
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className={styles.newCategoryWrapper}>
                      <Input
                        label="New Budget Category"
                        placeholder="Budget Category name..."
                        required
                        value={newBudgetCategoryName}
                        onChange={(e) => setNewBudgetCategoryName(e.target.value)}
                        autoFocus
                      />
                      <button 
                        type="button" 
                        className={styles.cancelBtn}
                        onClick={() => {
                          setIsAddingBudgetCategory(false);
                          setNewBudgetCategoryName('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

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

            <Button type="submit" fullWidth disabled={loading} className={styles.submitBtn}>
              <Save size={20} />
              <span>{loading ? 'Saving...' : 'Save Transaction'}</span>
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
