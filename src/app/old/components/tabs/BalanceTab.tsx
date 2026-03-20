'use client';

import { useState, useMemo } from 'react';
import { useAccounts, useAccountBalances } from '@/hooks/useData';
import { NetWorthChart } from '@/components/DashboardCharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Edit3, X, Save, Wallet } from 'lucide-react';

type TimeRange = '7D' | '1M' | 'MTD' | 'YTD' | '1Y' | 'MAX';

export function BalanceTab() {
  const { accounts, loading: accLoading, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { history, current, loading: balLoading } = useAccountBalances('2000-01-01'); // Full history so MAX range shows all time

  const [activeRange, setActiveRange] = useState<TimeRange>('YTD');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', balance: '', currency: 'EUR' });

  const totalBalance = useMemo(() => Object.values(current).reduce((sum, b) => sum + b, 0), [current]);

  // Combine history with latest real balance
  const processedData = useMemo(() => {
    if (history.length === 0) return [];
    const base = [...history];
    const lastPoint = base[base.length - 1];
    if (Math.abs(lastPoint.amount - totalBalance) > 1) {
      base.push({
        ...lastPoint,
        name: 'Today',
        fullDate: new Date().toISOString().split('T')[0],
        amount: totalBalance,
      });
    }
    return base;
  }, [history, totalBalance]);

  const chartData = useMemo(() => {
    if (processedData.length === 0) return [];
    const now = new Date();
    let filterDate: Date;

    switch (activeRange) {
      case '7D': filterDate = new Date(new Date().setDate(now.getDate() - 7)); break;
      case '1M': filterDate = new Date(new Date().setMonth(now.getMonth() - 1)); break;
      case '1A': filterDate = new Date(new Date().setFullYear(now.getFullYear() - 1)); break;
      case 'YTD': filterDate = new Date(now.getFullYear(), 0, 1); break;
      case 'MAX': return processedData;
      default: return processedData;
    }
    return processedData.filter(d => new Date(d.fullDate || d.name) >= filterDate);
  }, [processedData, activeRange]);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this account?')) {
      await deleteAccount(id);
    }
  };

  const formatK = (val: number) => {
    if (Math.abs(val) >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return val.toLocaleString('it-IT', { maximumFractionDigits: 0 });
  };

  if (accLoading || balLoading) {
    return <div className="text-center py-10 text-[var(--color-brand-secondary)]">Loading balances...</div>;
  }

  const ranges: TimeRange[] = ['7D', '1M', 'YTD', '1A', 'MAX'];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-display-40 font-bold">Balance</h1>
        <button
          className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--surface-raised)] border border-[var(--border)] text-white hover:bg-white/10 transition-colors"
          onClick={() => { setShowAddForm(!showAddForm); setEditingAccount(null); setFormData({ name: '', balance: '', currency: 'EUR' }); }}
        >
          {showAddForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </header>

      {showAddForm && (
        <Card className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h3 className="text-heading-3">{editingAccount ? 'Edit Account' : 'New Account'}</h3>
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
            <Button type="submit" fullWidth>
              {editingAccount ? 'Save Changes' : 'Create Account'}
            </Button>
          </form>
        </Card>
      )}

      {/* Main Net Worth Card */}
      <div className="glass-panel p-0 overflow-hidden relative flex flex-col h-[340px]">
        <div className="p-2 pb-4">
          <div className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase mb-2">TOTAL NET WORTH</div>
          <div className="text-display-40 text-white font-bold tracking-tight">
            €{totalBalance.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>

          <div className="flex items-center gap-2 mt-6">
            {ranges.map(range => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-[rgba(255,255,255,0.4)] hover:bg-white/5 hover:text-white'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto h-[160px] w-full">
          <NetWorthChart data={chartData} />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2 mb-10">
        <h3 className="text-[10px] font-bold tracking-widest text-[var(--color-brand-secondary)] px-4 uppercase">BANK ACCOUNTS</h3>
        <div className="flex flex-col gap-3 px-1">
          {accounts.map(acc => {
            const isEditing = editingAccount === acc.id;

            if (isEditing) {
              return (
                <div key={acc.id} className="glass-panel p-4">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                      <Input
                        label="Account Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                      <Input
                        label="Balance"
                        type="number"
                        step="0.01"
                        value={formData.balance}
                        onChange={e => setFormData({ ...formData, balance: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" type="button" onClick={() => setEditingAccount(null)}>
                        <X size={16} className="mr-2" /> Cancel
                      </Button>
                      <Button size="sm" type="submit">
                        <Save size={16} className="mr-2" /> Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              );
            }

            return (
              <div key={acc.id} className="glass-panel p-5 flex flex-col gap-1 group relative transition-all hover:translate-x-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-xl tracking-tight">{acc.name}</span>
                  <span className="text-[var(--color-brand-success)] font-bold text-xl tracking-tight">
                    €{formatK(current[acc.id] || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-end mt-1">
                  <span className="text-xs text-[var(--color-brand-secondary)] font-semibold uppercase tracking-wider">{acc.currency}</span>
                  <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(acc)} className="text-white/60 hover:text-white transition-colors">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={(e) => handleDelete(acc.id, e)} className="text-white/60 hover:text-[var(--color-brand-danger)] transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

  );
}
