'use client';

import { useState } from 'react';
import { useCategories, useTransactions, useBudgets } from '@/hooks/useData';
import { MonthSelector } from '@/components/MonthSelector';
import { Edit2, Check, X } from 'lucide-react';
import styles from './page.module.css';

export default function BudgetPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonthStr = currentDate.toISOString().slice(0, 7);
  
  const { categories, loading: catLoading } = useCategories('expense');
  const { transactions, loading: txLoading } = useTransactions(0, currentMonthStr);
  const { budgets, loading: bgtLoading, saveBudget } = useBudgets(currentMonthStr);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const spentByCategory = transactions
    .filter(m => m.type === 'expense')
    .reduce((acc: Record<string, number>, m) => {
      const catId = m.category_id || 'unassigned';
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
      await saveBudget(id, val);
    }
    setEditingId(null);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className="gradient-text">Budget</h1>
      </header>

      <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

      {catLoading || txLoading || bgtLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : categories.length === 0 ? (
        <div className={styles.empty}>No categories found</div>
      ) : (
        <div className={styles.budgetList}>
          {categories.map(cat => {
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
        </div>
      )}
    </main>
  );
}
