import { supabase } from './supabase';
import { Transaction, MonthlySummary, BudgetVariance, Account } from '@/types/database';

export const financeService = {
  /**
   * Calculates the current balance for all accounts based on initial_balance and transactions.
   */
  async getAccountBalances(): Promise<(Account & { current_balance: number })[]> {
    const { data: accounts, error: accError } = await supabase.from('accounts').select('*');
    if (accError) throw accError;

    const { data: transactions, error: txError } = await supabase.from('transactions').select('*');
    if (txError) throw txError;

    return accounts.map(account => {
      let balance = Number(account.initial_balance);
      
      transactions.forEach(tx => {
        const amount = Number(tx.amount);
        if (tx.type === 'income' && tx.account_id === account.id) {
          balance += amount;
        } else if (tx.type === 'expense' && tx.account_id === account.id) {
          balance -= amount;
        } else if (tx.type === 'transfer') {
          if (tx.from_account_id === account.id) balance -= amount;
          if (tx.to_account_id === account.id) balance += amount;
        }
      });

      return { ...account, current_balance: balance };
    });
  },

  /**
   * Returns a summary for a specific month (YYYY-MM).
   */
  async getMonthlySummary(month: string): Promise<MonthlySummary> {
    const startDate = `${month}-01`;
    // End of month is tricky in SQL, but we can filter by date range
    const { data: txs, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .gte('date', startDate)
      .lt('date', this.nextMonth(month));

    if (error) throw error;

    let total_income = 0;
    let total_expenses = 0;

    txs.forEach(tx => {
      if (tx.type === 'income') total_income += Number(tx.amount);
      if (tx.type === 'expense') total_expenses += Number(tx.amount);
    });

    const net = total_income - total_expenses;
    const savings_rate = total_income > 0 ? (net / total_income) * 100 : 0;

    return { total_income, total_expenses, net, savings_rate };
  },

  /**
   * Compares budgeted amount vs actual spent for a specific month.
   */
  async getBudgetVsActual(month: string): Promise<BudgetVariance[]> {
    const { data: budgets, error: bError } = await supabase
      .from('budgets')
      .select('*, budget_categories(name)')
      .eq('month', month);

    if (bError) throw bError;

    const { data: txs, error: tError } = await supabase
      .from('transactions')
      .select('amount, budget_category_id')
      .eq('type', 'expense')
      .gte('date', `${month}-01`)
      .lt('date', this.nextMonth(month));

    if (tError) throw tError;

    // Aggregate actuals by category
    const actuals = txs.reduce((acc: any, tx) => {
      if (tx.budget_category_id) {
        acc[tx.budget_category_id] = (acc[tx.budget_category_id] || 0) + Number(tx.amount);
      }
      return acc;
    }, {});

    return budgets.map((b: any) => {
      const actual = actuals[b.budget_category_id] || 0;
      return {
        budget_category_id: b.budget_category_id,
        budget_category_name: b.budget_categories?.name || 'Unknown',
        budgeted: Number(b.amount),
        actual,
        variance: Number(b.amount) - actual
      };
    });
  },

  /**
   * Aggregate totals for a specific year.
   */
  async getAnnualSummary(year: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`);

    if (error) throw error;

    const months = Array.from({ length: 12 }, (_, i) => {
      const m = (i + 1).toString().padStart(2, '0');
      return `${year}-${m}`;
    });

    const summary: any = {};
    months.forEach(m => {
      summary[m] = { income: 0, expense: 0, net: 0 };
    });

    data.forEach(tx => {
      const m = tx.date.slice(0, 7);
      if (tx.type === 'income') summary[m].income += Number(tx.amount);
      if (tx.type === 'expense') summary[m].expense += Number(tx.amount);
      summary[m].net = summary[m].income - summary[m].expense;
    });

    return summary;
  },

  nextMonth(month: string): string {
    const [year, m] = month.split('-').map(Number);
    const nextM = m === 12 ? 1 : m + 1;
    const nextY = m === 12 ? year + 1 : year;
    return `${nextY}-${nextM.toString().padStart(2, '0')}-01`;
  }
};
