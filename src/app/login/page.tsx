''use client'';

import { useState } from ''react'';
import { useRouter } from ''next/navigation'';
import { supabase } from ''@/lib/supabase'';
import { Lock, Loader2, AlertCircle, ArrowRight, Mail, KeyRound, User, CheckCircle } from ''lucide-react'';
import { cn } from ''@/lib/utils'';

type AuthMode = ''login'' | ''register'' | ''forgot'';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(''login'');
  const [email, setEmail] = useState('''');
  const [password, setPassword] = useState('''');
  const [fullName, setFullName] = useState('''');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('''');
  const [successMsg, setSuccessMsg] = useState('''');
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true); setError('''');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) { setError(error?.message || ''Invalid credentials''); triggerShake(); setIsLoading(false); return; }
    } catch { setError(''Connection error''); triggerShake(); setIsLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    if (password.length < 8) { setError(''Password must be at least 8 characters''); triggerShake(); return; }
    setIsLoading(true); setError('''');
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) { setError(error.message); triggerShake(); setIsLoading(false); return; }
      setSuccessMsg(''Account created! Check your email to confirm, then log in.'');
      setIsLoading(false);
    } catch { setError(''Connection error''); triggerShake(); setIsLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true); setError('''');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
      if (error) { setError(error.message); triggerShake(); setIsLoading(false); return; }
      setSuccessMsg(''Password reset link sent! Check your email.'');
      setIsLoading(false);
    } catch { setError(''Connection error''); triggerShake(); setIsLoading(false); }
  };

  const switchMode = (m: AuthMode) => { setMode(m); setError(''''); setSuccessMsg(''''); setPassword(''''); };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder:text-white/20";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors";

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-[var(--color-brand-navy)] px-4 md:px-6 relative overflow-hidden", shake ? ''bg-[#1a0606]'' : '')}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none opacity-20 bg-gradient-to-br from-white/20 to-transparent" />
      <div className={cn("relative w-full max-w-[420px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] p-8 md:p-12 flex flex-col z-10", shake && "animate-shake border-[var(--color-brand-danger)]/50")}>
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-white/80 flex items-center justify-center mb-6 shadow-2xl">
            <Lock size={28} className={cn("text-black transition-colors", shake && "text-[var(--color-brand-danger)]")} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            {mode === ''login'' ? ''Welcome Back'' : mode === ''register'' ? ''Create Account'' : ''Reset Password''}
          </h1>
          <p className="text-[10px] text-[var(--color-brand-secondary)] font-bold tracking-[0.2em] uppercase">
            {mode === ''login'' ? ''Sign in to your dashboard'' : mode === ''register'' ? ''Start tracking your finances'' : ''We will send you a reset link''}
          </p>
        </div>

        {/* Mode toggle */}
        {mode !== ''forgot'' && (
          <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 mb-6">
            {([''login'', ''register''] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)} className={cn(''flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all'', mode === m ? ''bg-white text-black shadow-md'' : ''text-[var(--color-brand-secondary)] hover:text-white'')}>
                {m === ''login'' ? ''Sign In'' : ''Register''}
              </button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {error && <div className="flex items-center gap-2 px-4 py-2 mb-4 rounded-xl bg-[var(--color-brand-danger)]/10 border border-[var(--color-brand-danger)]/20 text-[var(--color-brand-danger)] text-[10px] font-black uppercase tracking-widest"><AlertCircle size={14} /><span>{error}</span></div>}
        {successMsg && <div className="flex items-center gap-2 px-4 py-2 mb-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest"><CheckCircle size={14} /><span>{successMsg}</span></div>}

        {/* LOGIN */}
        {mode === ''login'' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-1">Email</label>
              <div className="relative group"><Mail className={iconClass} /><input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} className={inputClass} /></div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-1">Password</label>
              <div className="relative group"><KeyRound className={iconClass} /><input type="password" required autoComplete="current-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} className={inputClass} /></div>
              <button type="button" onClick={() => switchMode(''forgot'')} className="text-[10px] text-[var(--color-brand-secondary)] hover:text-white transition-colors text-right mt-1 self-end uppercase tracking-widest font-bold">Forgot password?</button>
            </div>
            <button type="submit" disabled={isLoading || !email || !password} className="mt-2 w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* REGISTER */}
        {mode === ''register'' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group"><User className={iconClass} /><input type="text" required placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} disabled={isLoading} className={inputClass} /></div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-1">Email</label>
              <div className="relative group"><Mail className={iconClass} /><input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} className={inputClass} /></div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-1">Password</label>
              <div className="relative group"><KeyRound className={iconClass} /><input type="password" required minLength={8} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} className={inputClass} /></div>
            </div>
            <button type="submit" disabled={isLoading || !email || !password || !fullName} className="mt-2 w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === ''forgot'' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-1">Your Email</label>
              <div className="relative group"><Mail className={iconClass} /><input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} className={inputClass} /></div>
            </div>
            <button type="submit" disabled={isLoading || !email} className="mt-2 w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Send Reset Link</span><ArrowRight size={16} /></>}
            </button>
            <button type="button" onClick={() => switchMode(''login'')} className="text-[10px] text-[var(--color-brand-secondary)] hover:text-white transition-colors text-center uppercase tracking-widest font-bold">Back to Sign In</button>
          </form>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-12px)} 30%{transform:translateX(12px)} 45%{transform:translateX(-10px)} 60%{transform:translateX(10px)} 75%{transform:translateX(-8px)} 90%{transform:translateX(8px)} }
        .animate-shake { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
}
