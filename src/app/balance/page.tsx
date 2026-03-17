'use client';

import { useState } from 'react';
import { useAccounts, useAccountBalances } from '@/hooks/useData';
import { BalanceTrendChart } from '@/components/DashboardCharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Edit3, X, Save } from 'lucide-react';
import styles from './page.module.css';

export default function BalancePage() {
  const { accounts, loading: accLoading, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { history, current, loading: balLoading } = useAccountBalances('2025-12-31');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', balance: '', currency: 'EUR' });

  const totalBalance = Object.values(current).reduce((sum, b) => sum + b, 0);

  const formatK = (val: number) => {
    if (Math.abs(val) >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return val.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(formData.balance) || 0;

    if (editingAccount) {
      const { error } = await updateAccount(editingAccount, {
        name: formData.name,
        active_balance: val,
        currency: formData.currency
      });
      if (error) alert('Error updating account: ' + error.message);
      else setEditingAccount(null);
    } else {
      const { error } = await addAccount(formData.name, val, formData.currency);
      if (error) alert('Error adding account: ' + error.message);
      else setShowAddForm(false);
    }
    setFormData({ name: '', balance: '', currency: 'EUR' });
  };

  const handleEdit = (acc: any) => {
    setEditingAccount(acc.id);
    setFormData({
      name: acc.name,
      balance: acc.active_balance.toString(),
      currency: acc.currency
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      await deleteAccount(id);
    }
  };

  if (accLoading || balLoading) {
    return <div className={styles.loading}>Loading balances...</div>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className="gradient-text">Balance</h1>
        <Button
          variant="ghost"
          className={styles.addBtn}
          onClick={() => { setShowAddForm(!showAddForm); setEditingAccount(null); setFormData({ name: '', balance: '', currency: 'EUR' }); }}
        >
          {showAddForm ? <X size={20} /> : <Plus size={24} />}
        </Button>
      </header>

      {showAddForm && (
        <Card className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.formTitle}>{editingAccount ? 'Edit Account' : 'New Account'}</h3>
            <Input
              label="Account Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label={editingAccount ? "Current Balance" : "Initial Balance"}
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={e => setFormData({ ...formData, balance: e.target.value })}
              required
            />
            <Button type="submit" fullWidth className={styles.submitBtn}>
              <Save size={18} />
              <span>{editingAccount ? 'Save Changes' : 'Create Account'}</span>
            </Button>
          </form>
        </Card>
      )}

      <div className={styles.totalCard}>
        <div className={styles.totalLabel}>Total Net Worth</div>
        <div className={styles.totalValue}>€{formatK(totalBalance)}</div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.sectionTitle}>Net Worth Trend</h3>
        <div className={styles.chartCard}>
          <div className={styles.chartContainer}>
            <BalanceTrendChart data={history} />
          </div>
        </div>
      </div>

      <div className={styles.accountsSection}>
        <h3 className={styles.sectionTitle}>Bank Accounts</h3>
        <div className={styles.accountList}>
          {accounts.map(acc => {
            const isEditing = editingAccount === acc.id;

            if (isEditing) {
              return (
                <Card key={acc.id} className={styles.inlineFormCard}>
                  <form onSubmit={handleSubmit} className={styles.inlineForm}>
                    <div className={styles.inlineInputs}>
                      <Input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Account Name"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.balance}
                        onChange={e => setFormData({ ...formData, balance: e.target.value })}
                        required
                        placeholder="Balance"
                      />
                    </div>
                    <div className={styles.inlineActions}>
                      <button type="submit" className={styles.saveBtn}><Save size={18} /></button>
                      <button type="button" onClick={() => setEditingAccount(null)} className={styles.cancelBtn}><X size={18} /></button>
                    </div>
                  </form>
                </Card>
              );
            }

            return (
              <div key={acc.id} className={styles.accountCard}>
                <div className={styles.accountInfo}>
                  <span className={styles.accountName}>{acc.name}</span>
                  <span className={styles.accountCurrency}>{acc.currency}</span>
                </div>
                <div className={styles.accountActions}>
                  <div className={`${styles.accountBalance} ${(current[acc.id] || 0) >= 0 ? styles.positive : styles.negative}`}>
                    €{formatK(current[acc.id] || 0)}
                  </div>
                  <div className={styles.actionBtns}>
                    <button onClick={() => handleEdit(acc)} className={styles.iconBtn}><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(acc.id)} className={styles.iconBtn}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
