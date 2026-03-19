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
        active_balance: initialBalance,
        currency
      }])
      .select();
    
    if (error) console.error('Error adding account:', error);
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

export function useTransactions(limit = 10, startDate?: string, endDate?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      if (limit > 0 && !startDate && !endDate) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (!error && data) setTransactions(data);
      setLoading(false);
    }
    fetchTransactions();
  }, [limit, startDate, endDate]);

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
    // 1. Check if budget already exists for this month/category
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('month', month)
      .eq('budget_category_id', budgetCategoryId)
      .single();
    
    let result;
    if (existing) {
      // 2a. Update
      result = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', existing.id);
    } else {
      // 2b. Insert
      result = await supabase
        .from('budgets')
        .insert({ 
          month, 
          budget_category_id: budgetCategoryId, 
          amount 
        });
    }
    
    const { error } = result;
    
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
  const [data, setData] = useState<{
    monthlyData: any[];
    categoryData: { name: string; value: number }[];
  }>({ monthlyData: [], categoryData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnualData() {
      setLoading(true);
      
      const { data: cats } = await supabase.from('categories').select('id, name');
      const { data: bgtCats } = await supabase.from('budget_categories').select('id, name');
      
      const excludeIds = new Set<string>();
      const tagKeywords = ['valutazione', 'investment', 'titoli', 'gain', 'loss', 'scalable'];
      
      const catMap: Record<string, string> = {};
      
      cats?.forEach(c => {
        if (tagKeywords.some(k => c.name.toLowerCase().includes(k))) excludeIds.add(c.id);
        catMap[c.id] = c.name;
      });
      bgtCats?.forEach(c => {
        if (tagKeywords.some(k => c.name.toLowerCase().includes(k))) excludeIds.add(c.id);
        catMap[c.id] = c.name;
      });

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

        const spendingMap: Record<string, number> = {};

        transactions.forEach((tx: Transaction) => {
          if (tx.category_id && excludeIds.has(tx.category_id)) return;
          if (tx.budget_category_id && excludeIds.has(tx.budget_category_id)) return;

          const m = new Date(tx.date).getMonth();
          const amount = Number(tx.amount);

          if (tx.type === 'income') {
            monthlyData[m].income += amount;
          } else if (tx.type === 'expense') {
            monthlyData[m].expense += amount;
            
            // Track category distribution
            const catId = tx.budget_category_id || tx.category_id || 'unassigned';
            const catName = catMap[catId] || 'Misc';
            spendingMap[catName] = (spendingMap[catName] || 0) + amount;
          }
        });

        monthlyData.forEach(m => {
          m.net = m.income - m.expense;
          m.savingsRate = m.income > 0 ? (m.net / m.income) * 100 : 0;
        });

        const categoryData = Object.entries(spendingMap)
          .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
          .sort((a, b) => b.value - a.value);

        setData({ monthlyData, categoryData });
      }
      setLoading(false);
    }
    fetchAnnualData();
  }, [year]);

  return { ...data, loading };
}

export function useAccountBalances(startDate: string = '2024-01-01') {
  const [data, setData] = useState<{
    history: any[];
    current: Record<string, number>;
  }>({ history: [], current: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateBalances() {
      setLoading(true);
      
      const { data: accountsData } = await supabase.from('accounts').select('*');

      // Fetch ALL transactions, newest first — walk backwards from today's known-correct active_balance
      const { data: allTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!error && allTransactions && accountsData) {
        const currentBalances: Record<string, number> = {};
        let netWorthToday = 0;

        accountsData.forEach(acc => {
          currentBalances[acc.id] = Number(acc.active_balance);
          netWorthToday += Number(acc.active_balance);
        });

        // Walk backwards through all transactions.
        // Record the net worth BEFORE undoing each transaction = state at start of that day.
        // This correctly handles multiple transactions on the same date.
        const balanceByDate: Record<string, number> = {};
        let runningTotal = netWorthToday;

        allTransactions.forEach((tx: Transaction) => {
          // Save state BEFORE undoing this transaction = balance at start of this day
          balanceByDate[tx.date] = runningTotal;
          
          const amt = Number(tx.amount);
          if (tx.type === 'income') {
            runningTotal -= amt;
          } else if (tx.type === 'expense') {
            runningTotal += amt;
          }
          // transfers: net worth conserved (from_account - to_account + = 0), skip
        });

        const dates = Object.keys(balanceByDate).sort();

        // Build history filtered from startDate onwards
        const history = dates
          .filter(date => date >= startDate)
          .map(date => ({
            name: date.slice(5),
            amount: balanceByDate[date],
            fullDate: date,
          }));

        // Always add today as last point with the real value
        const today = new Date().toISOString().split('T')[0];
        if (today >= startDate && !balanceByDate[today]) {
          history.push({ name: today.slice(5), amount: netWorthToday, fullDate: today });
        }

        // If no points in range, show the last known value before startDate
        if (history.length === 0) {
          const lastDateBefore = dates.filter(d => d < startDate).pop();
          const startBalance = lastDateBefore ? balanceByDate[lastDateBefore] : netWorthToday;
          history.push({ name: startDate.slice(5), amount: startBalance, fullDate: startDate });
        }

        setData({ history, current: currentBalances });
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
