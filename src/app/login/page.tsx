'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Loader2, AlertCircle, ArrowRight, Mail, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        setError(error?.message || 'Invalid credentials');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setIsLoading(false); // Only stop loading on error
        return;
      }

      // We do not call router.replace('/') here to prevent a race condition.
      // AuthProvider will automatically redirect to '/' when it sees the session.
      // We also leave isLoading as true, so the button keeps spinning during the redirect.
    } catch {
      setError('Connection error');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setIsLoading(false); // Only stop loading on error
    }
  };



  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-[var(--color-brand-navy)] px-4 md:px-6 font-['Inter',_sans-serif] transition-colors duration-300 relative overflow-hidden",
      shake ? 'bg-[#1a0606]' : ''
    )}>
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none opacity-20 bg-gradient-to-br from-white/20 to-transparent transition-opacity" />

      <div className={cn(
        "relative w-full max-w-[420px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] p-8 md:p-12 flex flex-col z-10 transition-transform",
        shake && "animate-shake border-[var(--color-brand-danger)]/50 shadow-[0_0_50px_rgba(240,90,100,0.1)]"
      )}>
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-white/80 flex items-center justify-center mb-6 shadow-2xl transition-all duration-300 group hover:scale-105">
            <Lock size={28} className={cn("text-black transition-colors", shake && "text-[var(--color-brand-danger)]")} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-[10px] text-[var(--color-brand-secondary)] font-bold tracking-[0.2em] uppercase">
            Sign in to your dashboard
          </p>
        </div>

        {/* Error Message */}
        <div className={cn(
          "h-10 mb-2 flex items-center justify-center transition-all duration-300",
          error ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        )}>
          {error && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand-danger)]/10 border border-[var(--color-brand-danger)]/20 text-[var(--color-brand-danger)] text-[10px] font-black uppercase tracking-widest">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-[var(--color-brand-secondary)] uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="mt-4 w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-12px); }
          30% { transform: translateX(12px); }
          45% { transform: translateX(-10px); }
          60% { transform: translateX(10px); }
          75% { transform: translateX(-8px); }
          90% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
