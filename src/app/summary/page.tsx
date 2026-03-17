'use client';

import { useState } from 'react';
import { useAnnualSummary } from '@/hooks/useData';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Target } from 'lucide-react';
import styles from './page.module.css';

export default function SummaryPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading } = useAnnualSummary(year);

  const annualIncome = data.reduce((sum, m) => sum + m.income, 0);
  const annualExpense = data.reduce((sum, m) => sum + m.expense, 0);
  const annualNet = annualIncome - annualExpense;
  const annualSavingsRate = annualIncome > 0 ? (annualNet / annualIncome) * 100 : 0;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className="gradient-text">Annual Summary</h1>
      </header>

      <div className={styles.yearSelector}>
        <button onClick={() => setYear(y => y - 1)} className={styles.yearBtn}>
          <ChevronLeft size={24} />
        </button>
        <h2 className={styles.yearDisplay}>{year}</h2>
        <button onClick={() => setYear(y => y + 1)} className={styles.yearBtn}>
          <ChevronRight size={24} />
        </button>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <TrendingUp className={styles.incomeIcon} size={20} />
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Income</span>
            <span className={styles.kpiValuePositive}>€{annualIncome.toFixed(0)}</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <TrendingDown className={styles.expenseIcon} size={20} />
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Expense</span>
            <span className={styles.kpiValueNegative}>€{annualExpense.toFixed(0)}</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <Target className={styles.netIcon} size={20} />
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Net Savings</span>
            <span className={`${styles.kpiValue} ${annualNet >= 0 ? styles.positiveText : styles.negativeText}`}>
              €{annualNet.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.savingsSash}>
        <span>Annual Savings Rate: </span>
        <span className={annualSavingsRate >= 0 ? styles.positiveText : styles.negativeText}>
          {annualSavingsRate.toFixed(2)}%
        </span>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading annual data...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expense</th>
                <th>Net</th>
                <th>Savings</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.month}>
                  <td className={styles.monthName}>{m.monthName}</td>
                  <td className={styles.incomeCol}>€{m.income.toFixed(0)}</td>
                  <td className={styles.expenseCol}>€{m.expense.toFixed(0)}</td>
                  <td className={`${styles.netCol} ${m.net >= 0 ? styles.positiveText : styles.negativeText}`}>
                    €{m.net.toFixed(0)}
                  </td>
                  <td className={styles.rateCol}>
                    <span className={`${styles.rateTag} ${m.savingsRate >= 0 ? styles.ratePositive : styles.rateNegative}`}>
                      {m.savingsRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
