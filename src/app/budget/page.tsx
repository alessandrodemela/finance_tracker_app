'use client';

import { useState } from 'react';
import { useBudgetCategories, useTransactions, useBudgets } from '@/hooks/useData';
import { MonthSelector } from '@/components/MonthSelector';
import { Edit2, Check, X, Plus } from 'lucide-react';
import { useDate } from '@/context/DateContext';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

export default function BudgetPage() {
  const { currentDate, setCurrentDate, currentMonthStr } = useDate();
  
  const { budgetCategories, setBudgetCategories, loading: catLoading } = useBudgetCategories();
  const { transactions, loading: txLoading } = useTransactions(0, currentMonthStr);
  const { budgets, loading: bgtLoading, saveBudget } = useBudgets(currentMonthStr);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const spentByCategory = transactions
    .filter(m => m.type === 'expense')
    .reduce((acc: Record<string, number>, m) => {
      const catId = m.budget_category_id || 'unassigned';
      acc[catId] = (acc[catId] || 0) + Number(m.amount);
      return acc;
    }, {});

  const handleEdit = (id: string, currentBudget: number) => {
    setEditingId(id);
    setEditValue(currentBudget.toString());
  };

  const handleSave = async (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) {
      const { error } = await saveBudget(id, val);
      if (error) {
        alert('Error saving budget: ' + error.message);
      }
    }
    setEditingId(null);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsSavingCategory(true);
    const { data: newCat, error } = await supabase
      .from('budget_categories')
      .insert([{ name: newCategoryName.trim().toLowerCase() }])
      .select()
      .single();

    if (error) {
      alert('Error creating category: ' + error.message);
    } else if (newCat) {
      newCat.name = newCat.name.charAt(0).toUpperCase() + newCat.name.slice(1);
      setBudgetCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      setIsAddingCategory(false);
      setNewCategoryName('');
      
      // Auto enter edit mode for the new category
      setEditingId(newCat.id);
      setEditValue('0');
    }
    setIsSavingCategory(false);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className="gradient-text">Budget</h1>
      </header>

      <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

      {catLoading || txLoading || bgtLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : budgetCategories.length === 0 && !isAddingCategory ? (
        <div className={styles.empty}>No categories found</div>
      ) : (
        <div className={styles.budgetList}>
          {budgetCategories.map(cat => {
            const budgetAmt = budgets[cat.id] || 0;
            const spent = spentByCategory[cat.id] || 0;
            const remaining = budgetAmt - spent;
            const percent = budgetAmt > 0 ? Math.min((spent / budgetAmt) * 100, 100) : 0;
            const isEditing = editingId === cat.id;

            return (
              <div key={cat.id} className={styles.row}>
                <div className={styles.rowTop}>
                  <div className={styles.catInfo}>
                    <span className={styles.catName}>{cat.name}</span>
                    <span className={styles.spentText}>Spent: €{spent.toFixed(2)}</span>
                  </div>
                  
                  <div className={styles.budgetEditor}>
                    {isEditing ? (
                      <div className={styles.editMode}>
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          className={styles.input}
                          autoFocus
                          min="0"
                        />
                        <button className={styles.iconBtn} onClick={() => handleSave(cat.id)}>
                          <Check size={18} className={styles.successColor} />
                        </button>
                        <button className={styles.iconBtn} onClick={() => setEditingId(null)}>
                          <X size={18} className={styles.destructiveColor} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.viewMode}>
                        <div className={styles.budgetAmt}>Budget: €{budgetAmt.toFixed(2)}</div>
                        <button className={styles.iconBtn} onClick={() => handleEdit(cat.id, budgetAmt)}>
                          <Edit2 size={16}/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.rowBottom}>
                  <div className={styles.progressContainer}>
                    <div 
                      className={styles.progressBar} 
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: percent > 90 ? 'var(--destructive)' : 'var(--primary)'
                      }} 
                    />
                  </div>
                  <div className={`${styles.remaining} ${remaining < 0 ? styles.destructiveColor : styles.successColor}`}>
                    {remaining < 0 ? 'Over: ' : 'Remaining: '}
                    €{Math.abs(remaining).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}

          {isAddingCategory ? (
            <div className={`${styles.row} ${styles.newCategoryRow}`}>
              <div className={styles.newCategoryInputs}>
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className={styles.input}
                  placeholder="Category Name..."
                  autoFocus
                  disabled={isSavingCategory}
                />
                <button 
                  className={styles.iconBtn} 
                  onClick={handleCreateCategory}
                  disabled={isSavingCategory}
                >
                  <Check size={18} className={styles.successColor} />
                </button>
                <button 
                  className={styles.iconBtn} 
                  onClick={() => setIsAddingCategory(false)}
                  disabled={isSavingCategory}
                >
                  <X size={18} className={styles.destructiveColor} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              className={styles.addCategoryBtn}
              onClick={() => setIsAddingCategory(true)}
            >
              <Plus size={20} />
              <span>Add Budget Category</span>
            </button>
          )}
        </div>
      )}
    </main>
  );
}
