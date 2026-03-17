export type MovementType = 'income' | 'expense' | 'transfer';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  is_budgetable: boolean;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  initial_balance: number;
  currency: string;
  deleted_at?: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: MovementType;
  category_id: string | null;
  budget_category_id?: string | null;
  account_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  notes: string | null;
  is_fixed: boolean;
  is_split: boolean;
  is_necessary: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  category_id?: string | null;
  budget_category_id: string;
  amount: number;
  created_at: string;
}

export interface MonthlySummary {
  total_income: number;
  total_expenses: number;
  net: number;
  savings_rate: number;
}

export interface BudgetVariance {
  budget_category_id: string;
  budget_category_name: string;
  budgeted: number;
  actual: number;
  variance: number;
}
