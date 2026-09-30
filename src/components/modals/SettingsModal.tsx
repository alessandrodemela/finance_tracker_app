''use client'';

import React, { useState, useEffect } from ''react'';
import { X, User, Eye, EyeOff, Lock, Save, Loader2 } from ''lucide-react'';
import { supabase } from ''@/lib/supabase'';
import { showToast } from ''@/components/ui/GlobalUI'';
import { cn } from ''@/lib/utils'';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [tab, setTab] = useState<''profile'' | ''password''>(''profile'');

  const [fullName, setFullName] = useState('''');
  const [email, setEmail] = useState('''');
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('''');
  const [confirmPassword, setConfirmPassword] = useState('''');
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setFullName(data.user.user_metadata?.full_name || '''');
        setEmail(data.user.email || '''');
      }
    });
  }, [isOpen]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    setSaving(false);
    if (error) showToast(''Error: '' + error.message, ''error'');
    else showToast(''Profile updated!'', ''success'');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showToast(''Passwords do not match'', ''error''); return; }
    if (newPassword.length < 8) { showToast(''Password must be at least 8 characters'', ''error''); return; }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPwd(false);
    if (error) showToast(''Error: '' + error.message, ''error'');
    else { showToast(''Password changed!'', ''success''); setNewPassword(''''); setConfirmPassword(''''); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--color-brand-card)] border border-white/10 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5 transition-all"><X size={20} /></button>
        </div>

        <div className="flex gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
          {([''profile'', ''password''] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn(''flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all'', tab === t ? ''bg-white text-black shadow-md'' : ''text-[var(--color-brand-secondary)] hover:text-white'')}>
              {t === ''profile'' ? ''Profile'' : ''Password''}
            </button>
          ))}
        </div>

        {tab === ''profile'' && (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase tracking-widest">Email</label>
              <input type="email" value={email} disabled className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-sm text-white/40 outline-none cursor-not-allowed" />
              <p className="text-[10px] text-[var(--color-brand-secondary)] pl-1">Email cannot be changed here.</p>
            </div>
            <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Profile
            </button>
          </form>
        )}

        {tab === ''password'' && (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase tracking-widest">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPwd ? ''text'' : ''password''} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[var(--color-brand-secondary)] uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPwd ? ''text'' : ''password''} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all" />
              </div>
            </div>
            <button type="submit" disabled={savingPwd} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50">
              {savingPwd ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Change Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
