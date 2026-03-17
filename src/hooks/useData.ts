'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Account, Category, Transaction, BudgetCategory } from '@/types/database';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .is('deleted_at', null)
      .order('name');
    
    if (!error && data) setAccounts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const addAccount = async (name: string, initialBalance: number, currency: string = 'EUR') => {
    const { data, error } = await supabase
      .from('accounts')
      .insert([{
        name,
        initial_balance: initialBalance,
        currency
      }])
      .select();
    
    if (!error) fetchAccounts();
    return { data, error };
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (!error) fetchAccounts();
    return { data, error };
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase
      .from('accounts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (!error) fetchAccounts();
    return { error };
  };

  return { accounts, loading, addAccount, updateAccount, deleteAccount, refreshAccounts: fetchAccounts };
}

export function useCategories(type?: 'income' | 'expense') {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      let query = supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query;
      
      if (!error && data) {
        const formatted = data.map((cat: Category) => ({
          ...cat,
          name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
        }));
        setCategories(formatted);
      }
      setLoading(false);
    }
    fetchCategories();
  }, [type]);

  return { categories, loading };
}

export function useBudgetCategories() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBudgetCategories() {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('name');
      
      if (!error && data) {
        const formatted = data.map((cat: BudgetCategory) => ({
          ...cat,
          name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
        }));
        setBudgetCategories(formatted);
      }
      setLoading(false);
    }
    fetchBudgetCategories();
  }, []);

  return { budgetCategories, loading, setBudgetCategories };
}

export function useTransactions(limit = 10, month?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (month) {
        query = query
          .gte('date', `${month}-01`)
          .lt('date', getNextMonth(month));
      }

      if (limit > 0 && !month) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (!error && data) setTransactions(data);
      setLoading(false);
    }
    fetchTransactions();
  }, [limit, month]);

  return { transactions, loading };
}

export function useBudgets(month: string) {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBudgets() {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', month);
      
      if (!error && data) {
        const bMap: Record<string, number> = {};
        data.forEach((b: any) => {
          bMap[b.budget_category_id] = Number(b.amount);
        });
        setBudgets(bMap);
      } else {
        setBudgets({});
      }
      setLoading(false);
    }
    fetchBudgets();
  }, [month]);

  const saveBudget = async (budgetCategoryId: string, amount: number) => {
    // Upsert budget
    const { error } = await supabase
      .from('budgets')
      .upsert({ 
        month, 
        budget_category_id: budgetCategoryId, 
        amount: amount 
      }, { 
        onConflict: 'month,budget_category_id' 
      });
    
    if (error) {
      console.error('Error saving budget:', error);
    } else {
      setBudgets(prev => ({ ...prev, [budgetCategoryId]: amount }));
    }
    return { error };
  };

  return { budgets, loading, saveBudget };
}

export function useAnnualSummary(year: number) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnualData() {
      setLoading(true);
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);
      
      if (!error && transactions) {
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          monthName: new Date(year, i).toLocaleString('en-US', { month: 'long' }),
          income: 0,
          expense: 0,
          net: 0,
          savingsRate: 0
        }));

        transactions.forEach((tx: Transaction) => {
          const m = new Date(tx.date).getMonth();
          if (tx.type === 'income') {
            monthlyData[m].income += Number(tx.amount);
          } else if (tx.type === 'expense') {
            monthlyData[m].expense += Number(tx.amount);
          }
        });

        monthlyData.forEach(m => {
          m.net = m.income - m.expense;
          m.savingsRate = m.income > 0 ? (m.net / m.income) * 100 : 0;
        });

        setData(monthlyData);
      }
      setLoading(false);
    }
    fetchAnnualData();
  }, [year]);

  return { data, loading };
}

export function useAccountBalances(startDate: string = '2025-12-31') {
  const [data, setData] = useState<{
    history: any[];
    current: Record<string, number>;
  }>({ history: [], current: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateBalances() {
      setLoading(true);
      
      // Fetch accounts for initial balances
      const { data: accountsData } = await supabase.from('accounts').select('*');
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (!error && transactions && accountsData) {
        const initialBalances: Record<string, number> = {};
        accountsData.forEach(acc => {
          initialBalances[acc.id] = Number(acc.initial_balance);
        });

        const currentBalances = { ...initialBalances };
        const balanceByDate: Record<string, Record<string, number>> = {};

        // Initial state at startDate
        let total = Object.values(currentBalances).reduce((sum, b) => sum + b, 0);
        balanceByDate[startDate] = { ...currentBalances, total };

        transactions.forEach((tx: Transaction) => {
          const date = tx.date;
          const amt = Number(tx.amount);
          
          if (tx.type === 'income' && tx.account_id) {
            currentBalances[tx.account_id] = (currentBalances[tx.account_id] || 0) + amt;
          } else if (tx.type === 'expense' && tx.account_id) {
            currentBalances[tx.account_id] = (currentBalances[tx.account_id] || 0) - amt;
          } else if (tx.type === 'transfer' && tx.from_account_id && tx.to_account_id) {
            currentBalances[tx.from_account_id] = (currentBalances[tx.from_account_id] || 0) - amt;
            currentBalances[tx.to_account_id] = (currentBalances[tx.to_account_id] || 0) + amt;
          }
          
          total = Object.values(currentBalances).reduce((sum, b) => sum + b, 0);
          balanceByDate[date] = { ...currentBalances, total };
        });

        const sortedDates = Object.keys(balanceByDate).sort();
        const history = sortedDates.map(date => ({
          name: date.slice(5),
          amount: balanceByDate[date].total,
          fullDate: date,
          ...balanceByDate[date]
        }));

        setData({
          history,
          current: currentBalances
        });
      }
      setLoading(false);
    }
    calculateBalances();
  }, [startDate]);

  return { ...data, loading };
}

function getNextMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? year + 1 : year;
  return `${nextY}-${nextM.toString().padStart(2, '0')}-01`;
}
