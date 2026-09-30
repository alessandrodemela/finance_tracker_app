import { useState } from 'react';
import { useBudgetCategories, useTransactions, useBudgets } from '@/hooks/useData';
import { MonthSelector } from '@/components/MonthSelector';
import { Edit2, Check, X, Plus, Copy, Loader2 } from 'lucide-react';
import { useDate } from '@/context/DateContext';
import { supabase } from '@/lib/supabase';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { showToast, showConfirm } from '@/components/ui/GlobalUI';

export function BudgetTab() {
  const { currentDate, setCurrentDate, currentMonthStr } = useDate();
  
  const { budgetCategories, setBudgetCategories, loading: catLoading } = useBudgetCategories();
  const { transactions, loading: txLoading } = useTransactions(0, currentMonthStr);
  const { budgets, loading: bgtLoading, saveBudget } = useBudgets(currentMonthStr);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  /** Returns YYYY-MM for the month before currentMonthStr */
  const getPrevMonth = () => {
    const [y, m] = currentMonthStr.split('-').map(Number);
    const prevM = m === 1 ? 12 : m - 1;
    const prevY = m === 1 ? y - 1 : y;
    return `${prevY}-${prevM.toString().padStart(2, '0')}`;
  };

  const handleCopyPreviousMonth = () => {
    showConfirm(
      `Copy budget from ${getPrevMonth()} to ${currentMonthStr}? Existing values will not be overwritten.`,
      async () => {
        setIsCopying(true);
        try {
          const prevMonth = getPrevMonth();
          const { data: prevBudgets, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('month', prevMonth);

          if (error) throw error;
          if (!prevBudgets || prevBudgets.length === 0) {
            showToast(`No budget found for ${prevMonth}`, 'error');
            return;
          }

          let copied = 0;
          let skipped = 0;

          for (const b of prevBudgets) {
            // Only copy if current month has no entry for this category
            if (budgets[b.budget_category_id] === undefined) {
              const { error: saveErr } = await saveBudget(b.budget_category_id, Number(b.amount));
              if (!saveErr) copied++;
            } else {
              skipped++;
            }
          }

          showToast(
            `Copied ${copied} budgets${skipped > 0 ? ` (${skipped} skipped — already set)` : ''}.`,
            'success'
          );
        } catch (err: any) {
          showToast('Error copying budget: ' + err.message, 'error');
        } finally {
          setIsCopying(false);
        }
      }
    );
  };

  const totalSpent = transactions
    .filter(m => m.type === 'expense')
    .reduce((sum, m) => sum + Number(m.amount), 0);
  
  const totalBudget = Object.values(budgets).reduce((sum, b) => sum + Number(b), 0);

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
    const val = parseFloat(editValue.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      const { error } = await saveBudget(id, val);
      if (error) {
        showToast('Error saving budget: ' + error.message, 'error');
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
      showToast('Error creating category: ' + error.message, 'error');
    } else if (newCat) {
      newCat.name = newCat.name.charAt(0).toUpperCase() + newCat.name.slice(1);
      setBudgetCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      setIsAddingCategory(false);
      setNewCategoryName('');
      
      setEditingId(newCat.id);
      setEditValue('0');
    }
    setIsSavingCategory(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
        <button
          onClick={handleCopyPreviousMonth}
          disabled={isCopying || bgtLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all text-xs font-bold uppercase tracking-widest shrink-0 disabled:opacity-40"
          title={`Copy budget from ${getPrevMonth()}`}
        >
          {isCopying ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
          <span className="hidden sm:inline">Copy Prev.</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel text-center p-3">
          <div className="text-label mb-1">Budget</div>
          <div className="text-heading-3">€{totalBudget.toFixed(0)}</div>
        </div>
        <div className="glass-panel text-center p-3">
          <div className="text-label mb-1">Spent</div>
          <div className="text-heading-3">€{totalSpent.toFixed(0)}</div>
        </div>
        <div className="glass-panel text-center p-3">
          <div className="text-label mb-1">Left</div>
          <div className={`text-heading-3 ${(totalBudget - totalSpent) >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]"}`}>
            €{(totalBudget - totalSpent).toFixed(0)}
          </div>
        </div>
      </div>

      {catLoading || txLoading || bgtLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : budgetCategories.length === 0 && !isAddingCategory ? (
        <div className="text-center py-4 opacity-50 text-small">No categories found</div>
      ) : (
        <div className="flex flex-col gap-3">
          {budgetCategories.map(cat => {
            const budgetAmt = budgets[cat.id] || 0;
            const spent = spentByCategory[cat.id] || 0;
            const remaining = budgetAmt - spent;
            const percent = budgetAmt > 0 ? (spent / budgetAmt) * 100 : 0;
            const isEditing = editingId === cat.id;

            return (
              <div key={cat.id} className="glass-panel p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[var(--color-brand-primary)]">{cat.name}</span>
                    <span className="text-small text-[var(--color-brand-secondary)]">Spent: €{spent.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          inputMode="decimal"
                          step="0.01"
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 bg-[var(--surface-raised)] border border-[var(--border)] rounded px-2 py-1 text-white text-sm outline-none focus:border-[var(--color-brand-accent)]"
                          autoFocus
                          min="0"
                        />
                        <button className="text-[var(--color-brand-success)] p-1 hover:bg-white/10 rounded" onClick={() => handleSave(cat.id)}>
                          <Check size={18} />
                        </button>
                        <button className="text-[var(--color-brand-danger)] p-1 hover:bg-white/10 rounded" onClick={() => setEditingId(null)}>
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-small font-medium">Budget: €{budgetAmt.toFixed(2)}</div>
                        <button className="text-[var(--color-brand-secondary)] p-1 hover:text-white rounded transition-colors" onClick={() => handleEdit(cat.id, budgetAmt)}>
                          <Edit2 size={16}/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <ProgressBar 
                    value={percent} 
                    indicatorColor={percent > 90 ? 'var(--color-brand-danger)' : 'var(--color-brand-accent)'}
                  />
                  <div className={`text-xs mt-1 text-right ${remaining < 0 ? 'text-[var(--color-brand-danger)]' : 'text-[var(--color-brand-success)]'}`}>
                    {remaining < 0 ? 'Over: ' : 'Remaining: '}
                    €{Math.abs(remaining).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}

          {isAddingCategory ? (
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-[var(--surface-raised)] border border-[var(--border)] rounded px-3 py-2 text-white outline-none focus:border-[var(--color-brand-accent)]"
                  placeholder="Category Name..."
                  autoFocus
                  disabled={isSavingCategory}
                />
                <button 
                  className="text-[var(--color-brand-success)] p-2 hover:bg-white/10 rounded" 
                  onClick={handleCreateCategory}
                  disabled={isSavingCategory}
                >
                  <Check size={20} />
                </button>
                <button 
                  className="text-[var(--color-brand-danger)] p-2 hover:bg-white/10 rounded" 
                  onClick={() => setIsAddingCategory(false)}
                  disabled={isSavingCategory}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="flex items-center justify-center gap-2 w-full py-4 text-[var(--color-brand-accent)] hover:bg-[rgba(99,102,241,0.05)] rounded-2xl border border-dashed border-[rgba(99,102,241,0.3)] transition-colors mt-2"
              onClick={() => setIsAddingCategory(true)}
            >
              <Plus size={20} />
              <span className="font-medium">Add Budget Category</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
