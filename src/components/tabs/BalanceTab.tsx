import { useState } from 'react';
import { useAccounts, useAccountBalances } from '@/hooks/useData';
import { BalanceTrendChart } from '@/components/DashboardCharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Edit3, X, Save } from 'lucide-react';

export function BalanceTab() {
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
    return <div className="text-center py-4">Loading balances...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-display-40">Balance</h1>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--surface-raised)] border border-[var(--border)] text-white hover:bg-white/10 transition-colors"
          onClick={() => { setShowAddForm(!showAddForm); setEditingAccount(null); setFormData({ name: '', balance: '', currency: 'EUR' }); }}
        >
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
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

      <div className="glass-panel text-center py-6">
        <div className="text-label mb-2">Total Net Worth</div>
        <div className="text-display-40">€{formatK(totalBalance)}</div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-heading-3">Net Worth Trend</h3>
        <div className="glass-panel h-[250px] w-full pt-4">
          <BalanceTrendChart data={history} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-heading-3">Bank Accounts</h3>
        <div className="flex flex-col gap-3">
          {accounts.map(acc => {
            const isEditing = editingAccount === acc.id;

            if (isEditing) {
              return (
                <Card key={acc.id}>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex gap-2">
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
                    <div className="flex justify-end gap-2 mt-2">
                      <button type="button" onClick={() => setEditingAccount(null)} className="p-2 bg-[var(--surface-raised)] rounded hover:bg-white/10"><X size={18} /></button>
                      <button type="submit" className="p-2 bg-[var(--color-brand-accent)] rounded hover:opacity-90"><Save size={18} /></button>
                    </div>
                  </form>
                </Card>
              );
            }

            return (
              <div key={acc.id} className="glass-panel p-4 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-white">{acc.name}</span>
                  <span className="text-xs text-[var(--color-brand-secondary)] uppercase">{acc.currency}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`font-semibold tracking-wide text-lg ${(current[acc.id] || 0) >= 0 ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-danger)]'}`}>
                    €{formatK(current[acc.id] || 0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(acc)} className="p-2 text-[var(--color-brand-secondary)] hover:text-white transition-colors rounded-full hover:bg-white/5"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(acc.id)} className="p-2 text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-danger)] transition-colors rounded-full hover:bg-[var(--color-brand-danger)]/10"><Trash2 size={16} /></button>
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
