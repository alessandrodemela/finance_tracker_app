import { Transaction, Category } from '@/types/database';
import { ArrowUpRight, ArrowDownLeft, Repeat } from 'lucide-react';
import styles from './MovementList.module.css';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
}

export function TransactionList({ transactions, categories }: TransactionListProps) {
  if (transactions.length === 0) {
    return <div className={styles.empty}>No transactions found.</div>;
  }

  const getCategory = (id: string | null) => categories.find(c => c.id === id);

  return (
    <div className={styles.list}>
      {transactions.map((m) => {
        const category = getCategory(m.category_id);
        const Icon = m.type === 'income' ? ArrowUpRight : m.type === 'transfer' ? Repeat : ArrowDownLeft;
        const colorClass = m.type === 'income' ? styles.income : m.type === 'transfer' ? styles.transfer : styles.expense;

        return (
          <div key={m.id} className={styles.item}>
            <div className={`${styles.icon} ${colorClass}`}>
              <Icon size={18} />
            </div>
            <div className={styles.info}>
              <div className={styles.note}>{m.notes || category?.name || 'Transaction'}</div>
              <div className={styles.date}>{new Date(m.date).toLocaleDateString()}</div>
            </div>
            <div className={`${styles.amount} ${colorClass}`}>
              {m.type === 'expense' ? '-' : ''}€ {Number(m.amount).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
