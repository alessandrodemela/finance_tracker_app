'use client';
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ui-toast', { detail: { message, type } }));
  }
};

export const showConfirm = (message: string, onConfirm: () => void) => {
  if (typeof window !== 'undefined') {
    (window as any)._pendingConfirm = onConfirm;
    window.dispatchEvent(new CustomEvent('ui-confirm', { detail: { message } }));
  }
};

export function GlobalUI() {
  const [toast, setToast] = useState<{message: string, type: string} | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleToast = (e: any) => {
      setToast(e.detail);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setToast(null), 3000);
    };
    const handleConfirm = (e: any) => {
      setConfirmMsg(e.detail.message);
    };

    window.addEventListener('ui-toast', handleToast);
    window.addEventListener('ui-confirm', handleConfirm);
    return () => {
      window.removeEventListener('ui-toast', handleToast);
      window.removeEventListener('ui-confirm', handleConfirm);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <div className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300",
        toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"
      )}>
        {toast && (
          <div className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold uppercase tracking-widest shadow-2xl",
            toast.type === 'error' ? "bg-[var(--color-brand-danger)]/10 border-[var(--color-brand-danger)]/20 text-[var(--color-brand-danger)]" 
                                   : "bg-[var(--color-brand-success)]/10 border-[var(--color-brand-success)]/20 text-[var(--color-brand-success)]"
          )}>
            {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} 
            {toast.message}
          </div>
        )}
      </div>

      {confirmMsg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setConfirmMsg(null)} />
          <div className="relative w-full max-w-sm bg-[#0D0D0D] border border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6 text-center animate-in zoom-in-95">
            <h3 className="text-white font-bold text-lg">{confirmMsg}</h3>
            <div className="flex gap-4">
              <button onClick={() => setConfirmMsg(null)} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => {
                const cb = (window as any)._pendingConfirm;
                if (cb) cb();
                setConfirmMsg(null);
              }} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-[var(--color-brand-danger)] text-white hover:bg-[var(--color-brand-danger)]/90 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
