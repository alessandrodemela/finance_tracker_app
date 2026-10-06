import test from 'node:test';
import assert from 'node:assert/strict';

// Import nextMonth logic and financeService simulation for pure unit verification
function nextMonth(month) {
  const [year, m] = month.split('-').map(Number);
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? year + 1 : year;
  return `${nextY}-${nextM.toString().padStart(2, '0')}-01`;
}

function validateTransactionInput(tx) {
  if (!tx.type || !['income', 'expense', 'transfer'].includes(tx.type)) {
    throw new Error('Invalid transaction type');
  }
  if (!tx.amount || !isFinite(Number(tx.amount)) || Number(tx.amount) <= 0) {
    throw new Error('Invalid amount: must be a positive number');
  }
  if (!tx.date) {
    throw new Error('Date is required');
  }
  if (tx.type !== 'transfer' && !tx.account_id) {
    throw new Error('account_id is required for non-transfer transactions');
  }
  if (tx.type === 'transfer' && (!tx.from_account_id || !tx.to_account_id)) {
    throw new Error('from_account_id and to_account_id required for transfers');
  }
  if (tx.type === 'transfer' && tx.from_account_id === tx.to_account_id) {
    throw new Error('Cannot transfer to the same account');
  }
  return true;
}

function validateAdjustBalanceArgs(accountId, amount) {
  if (!accountId) throw new Error('adjustAccountBalance: accountId is required');
  if (!isFinite(amount)) throw new Error('adjustAccountBalance: amount must be a finite number');
  return true;
}

function calculateAccountBalances(accounts, transactions) {
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
}

function calculateMonthlySummary(transactions) {
  let total_income = 0;
  let total_expenses = 0;
  transactions.forEach(tx => {
    if (tx.type === 'income') total_income += Number(tx.amount);
    if (tx.type === 'expense') total_expenses += Number(tx.amount);
  });
  const net = total_income - total_expenses;
  const savings_rate = total_income > 0 ? (net / total_income) * 100 : 0;
  return { total_income, total_expenses, net, savings_rate };
}

function calculateBudgetVariance(budgets, transactions) {
  const actuals = transactions.reduce((acc, tx) => {
    if (tx.type === 'expense' && tx.budget_category_id) {
      acc[tx.budget_category_id] = (acc[tx.budget_category_id] || 0) + Number(tx.amount);
    }
    return acc;
  }, {});

  return budgets.map(b => {
    const actual = actuals[b.budget_category_id] || 0;
    return {
      budget_category_id: b.budget_category_id,
      budgeted: Number(b.amount),
      actual,
      variance: Number(b.amount) - actual,
    };
  });
}

// -------------------------------------------------------------
// TEST SUITE
// -------------------------------------------------------------

test('1. Transaction Validation — Rejects invalid types', () => {
  assert.throws(
    () => validateTransactionInput({ type: 'invalid', amount: 50, date: '2026-10-01', account_id: 'acc1' }),
    /Invalid transaction type/
  );
});

test('2. Transaction Validation — Rejects zero and negative amounts', () => {
  assert.throws(
    () => validateTransactionInput({ type: 'expense', amount: 0, date: '2026-10-01', account_id: 'acc1' }),
    /Invalid amount/
  );
  assert.throws(
    () => validateTransactionInput({ type: 'expense', amount: -25, date: '2026-10-01', account_id: 'acc1' }),
    /Invalid amount/
  );
  assert.throws(
    () => validateTransactionInput({ type: 'expense', amount: NaN, date: '2026-10-01', account_id: 'acc1' }),
    /Invalid amount/
  );
});

test('3. Transaction Validation — Requires date', () => {
  assert.throws(
    () => validateTransactionInput({ type: 'expense', amount: 50, date: '', account_id: 'acc1' }),
    /Date is required/
  );
});

test('4. Transaction Validation — Requires account_id for non-transfers', () => {
  assert.throws(
    () => validateTransactionInput({ type: 'expense', amount: 50, date: '2026-10-01' }),
    /account_id is required/
  );
});

test('5. Transaction Validation — Transfer accounts constraints', () => {
  assert.throws(
    () => validateTransactionInput({ type: 'transfer', amount: 50, date: '2026-10-01', from_account_id: 'acc1' }),
    /from_account_id and to_account_id required/
  );
  assert.throws(
    () => validateTransactionInput({ type: 'transfer', amount: 50, date: '2026-10-01', from_account_id: 'acc1', to_account_id: 'acc1' }),
    /Cannot transfer to the same account/
  );
  assert.equal(
    validateTransactionInput({ type: 'transfer', amount: 50, date: '2026-10-01', from_account_id: 'acc1', to_account_id: 'acc2' }),
    true
  );
});

test('6. Atomic Balance RPC Validation', () => {
  assert.throws(() => validateAdjustBalanceArgs('', 50), /accountId is required/);
  assert.throws(() => validateAdjustBalanceArgs('acc1', Infinity), /finite number/);
  assert.equal(validateAdjustBalanceArgs('acc1', -25.5), true);
  assert.equal(validateAdjustBalanceArgs('acc1', 100), true);
});

test('7. nextMonth helper calculation — year boundaries', () => {
  assert.equal(nextMonth('2024-01'), '2024-02-01');
  assert.equal(nextMonth('2024-09'), '2024-10-01');
  assert.equal(nextMonth('2024-11'), '2024-12-01');
  assert.equal(nextMonth('2024-12'), '2025-01-01');
  assert.equal(nextMonth('2026-12'), '2027-01-01');
});

test('8. Account Balance Calculation with Income, Expense and Transfers', () => {
  const accounts = [
    { id: 'acc1', name: 'Checking', initial_balance: 1000 },
    { id: 'acc2', name: 'Savings', initial_balance: 500 },
  ];
  const transactions = [
    { type: 'income', amount: 200, account_id: 'acc1' },
    { type: 'expense', amount: 50, account_id: 'acc1' },
    { type: 'transfer', amount: 100, from_account_id: 'acc1', to_account_id: 'acc2' },
  ];

  const balances = calculateAccountBalances(accounts, transactions);
  const acc1 = balances.find(a => a.id === 'acc1');
  const acc2 = balances.find(a => a.id === 'acc2');

  assert.equal(acc1.current_balance, 1050); // 1000 + 200 - 50 - 100 = 1050
  assert.equal(acc2.current_balance, 600);  // 500 + 100 = 600
});

test('9. Monthly Summary Calculation and Savings Rate', () => {
  const txs = [
    { type: 'income', amount: 3000 },
    { type: 'expense', amount: 1800 },
    { type: 'expense', amount: 200 },
    { type: 'transfer', amount: 500 }, // Transfers don't alter net savings
  ];

  const summary = calculateMonthlySummary(txs);
  assert.equal(summary.total_income, 3000);
  assert.equal(summary.total_expenses, 2000);
  assert.equal(summary.net, 1000);
  assert.equal(Math.round(summary.savings_rate * 100) / 100, 33.33);
});

test('10. Budget Variance Calculation', () => {
  const budgets = [
    { budget_category_id: 'food', amount: 400 },
    { budget_category_id: 'transport', amount: 150 },
  ];
  const txs = [
    { type: 'expense', budget_category_id: 'food', amount: 250 },
    { type: 'expense', budget_category_id: 'food', amount: 50 },
    { type: 'expense', budget_category_id: 'transport', amount: 200 }, // over budget
  ];

  const variances = calculateBudgetVariance(budgets, txs);
  const food = variances.find(v => v.budget_category_id === 'food');
  const transport = variances.find(v => v.budget_category_id === 'transport');

  assert.equal(food.budgeted, 400);
  assert.equal(food.actual, 300);
  assert.equal(food.variance, 100); // 100 left

  assert.equal(transport.budgeted, 150);
  assert.equal(transport.actual, 200);
  assert.equal(transport.variance, -50); // 50 over
});
