import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { financeService } from '@/lib/financeService';
import { MovementType, Transaction } from '@/types/database';
import { showToast } from '@/components/ui/GlobalUI';

export interface SubmitTransactionParams {
  type: MovementType;
  formData: {
    amount: string | number;
    date: string;
    category_id: string;
    budget_category_id: string;
    account_id: string;
    from_account_id: string;
    to_account_id: string;
    notes: string;
    is_fixed: boolean;
    is_split: boolean;
    is_necessary: boolean;
  };
  isAddingCategory?: boolean;
  newCategoryName?: string;
  isAddingBudgetCategory?: boolean;
  newBudgetCategoryName?: string;
  oldTx?: Transaction;
}

export function useTransactionSubmit() {
  const [loading, setLoading] = useState(false);

  const submitTransaction = async (params: SubmitTransactionParams) => {
    setLoading(true);
    const { 
      type, 
      formData, 
      isAddingCategory, 
      newCategoryName, 
      isAddingBudgetCategory, 
      newBudgetCategoryName, 
      oldTx 
    } = params;
    
    try {
      const amountStr = typeof formData.amount === 'string' ? formData.amount : String(formData.amount);
      const amountNum = Math.round(Math.abs(parseFloat(amountStr.replace(',', '.'))) * 100) / 100;

      let categoryId = formData.category_id;
      let budgetCategoryId = formData.budget_category_id;

      if (type !== 'transfer' && isAddingCategory && newCategoryName?.trim()) {
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert([{ name: newCategoryName.trim().toLowerCase(), type: type as 'income' | 'expense' }])
          .select().single();
        if (catError) throw new Error(catError.message);
        categoryId = newCat.id;
      }

      if (type !== 'transfer' && isAddingBudgetCategory && newBudgetCategoryName?.trim()) {
        const { data: newCat, error: catError } = await supabase
          .from('budget_categories')
          .insert([{ name: newBudgetCategoryName.trim().toLowerCase() }])
          .select().single();
        if (catError) throw new Error(catError.message);
        budgetCategoryId = newCat.id;
      }

      const txData: any = {
        date: formData.date,
        amount: amountNum,
        type: type,
        notes: formData.notes,
        is_fixed: formData.is_fixed,
        is_split: formData.is_split,
        is_necessary: formData.is_necessary,
      };

      if (type === 'transfer') {
        txData.from_account_id = formData.from_account_id;
        txData.to_account_id = formData.to_account_id;
      } else {
        txData.account_id = formData.account_id;
        txData.category_id = categoryId;
        txData.budget_category_id = budgetCategoryId || null;
      }

      if (oldTx) {
        await financeService.updateTransaction(oldTx, txData);
      } else {
        await financeService.recordTransaction(txData);
      }
      
      return { success: true };
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { submitTransaction, loading };
}
