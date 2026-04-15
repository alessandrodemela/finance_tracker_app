'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Wallet, Euro, Type, CircleDollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewAccountModal({ isOpen, onClose, onSuccess }: NewAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    initial_balance: '',
    currency: 'EUR',
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        initial_balance: '',
        currency: 'EUR',
      });
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.initial_balance) return;

    setLoading(true);
    const balanceNum = Math.round(parseFloat(formData.initial_balance.replace(',', '.')) * 100) / 100;

    try {
      const { error } = await supabase
        .from('accounts')
        .insert([{ 
          name: formData.name, 
          initial_balance: balanceNum,
          active_balance: balanceNum, // Initial active_balance matches initial_balance
          currency: formData.currency
        }]);

      if (error) throw error;
      
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className={cn(
        "relative w-full max-w-xl bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500",
        submitted && "py-20 px-10 text-center"
      )}>

        {submitted ? (
          <div className="flex flex-col items-center gap-8">
            <div className="w-24 h-24 bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)] border border-[var(--color-brand-success)]/20">
              <Save size={40} />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">ACCOUNT CREATED</h1>
              <p className="text-[var(--color-brand-secondary)] text-sm uppercase tracking-[0.2em] font-bold">New financial source added</p>
            </div>
            <Button onClick={onClose} fullWidth className="py-5 rounded-2xl font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 shadow-2xl transition-all">
              Close
            </Button>
          </div>
        ) : (
          <div className="p-10">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Wallet size={20} className="text-white" />
                </div>
                <h2 className="text-white font-black text-lg uppercase tracking-tighter">New Account</h2>
              </div>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Account Name */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.4em] flex items-center gap-2">
                  <Type size={12} /> Account Name
                </span>
                <input
                  type="text"
                  placeholder="e.g. Revolut, Main Bank, Cash"
                  autoFocus
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-lg font-bold text-white outline-none focus:border-white/20 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Initial Balance */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.4em] flex items-center gap-2">
                  <Euro size={12} /> Opening Balance
                </span>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pl-12 text-lg font-mono font-bold text-white outline-none focus:border-white/20 transition-all"
                    value={formData.initial_balance}
                    onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value })}
                  />
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                </div>
              </div>

              {/* Currency Selector (Visual only for now as per schema) */}
              <div className="flex flex-col gap-4 opacity-50 pointer-events-none">
                <span className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-[0.4em] flex items-center gap-2">
                  <CircleDollarSign size={12} /> Currency
                </span>
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white">
                  EUR - Euro
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all shadow-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-white text-black hover:bg-white/90 shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition-all active:scale-[0.98]"
                >
                  {loading ? 'Processing...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
