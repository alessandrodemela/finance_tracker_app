'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Delete, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

const PIN_LENGTH = 8;

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [shake, setShake] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) {
            router.replace('/');
          } else {
            localStorage.removeItem('auth_token');
            setIsCheckingAuth(false);
          }
        })
        .catch(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleKeyPress = (value: string) => {
    if (isLoading || isCheckingAuth) return;
    setError('');

    if (pin.length < PIN_LENGTH) {
      setPin(pin + value);
    }
  };

  const handleBackspace = () => {
    if (isLoading || isCheckingAuth) return;
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleEnter = () => {
    if (pin.length === PIN_LENGTH) {
      submitPin(pin);
    }
  };

  const submitPin = async (finalPin: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: finalPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid PIN');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setPin(''); // Reset on error
        return;
      }

      localStorage.setItem('auth_token', data.token);
      router.replace('/');
    } catch {
      setError('Connection error');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-navy)]">
        <Loader2 className="w-8 h-8 text-[var(--color-brand-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-[var(--color-brand-navy)] px-6 font-['Inter',_sans-serif] transition-colors duration-300 ${shake ? 'bg-[#1a0606]' : ''}`}>
      {/* Background radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: shake
            ? 'radial-gradient(circle at 50% 50%, rgba(240, 90, 100, 0.1) 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 60%)'
        }}
      />

      <div className="w-full max-w-[320px] flex flex-col items-center z-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center mb-8 shadow-2xl transition-all duration-300">
            <Lock size={28} className={shake ? 'text-[var(--color-brand-danger)]' : 'text-black'} />
          </div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase mb-1">
            XXXXXXX
          </h1>
          <p className="text-[10px] text-[var(--color-brand-secondary)] font-bold tracking-[0.3em] uppercase">Private Access</p>
        </div>

        {/* PIN Entry Area (Dots + Arrow Button) */}
        <div className={`flex items-center gap-6 mb-8 transition-transform ${shake ? 'animate-shake' : ''}`}>
          {/* Dots Group */}
          <div className="flex gap-2.5">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${i < pin.length
                  ? shake
                    ? 'bg-[var(--color-brand-danger)] shadow-[0_0_12px_rgba(240,90,100,0.5)] scale-110'
                    : 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)] scale-110'
                  : 'bg-white/10'
                  }`}
              />
            ))}
          </div>

          {/* Submit Button next to pins */}
          <button
            onClick={handleEnter}
            disabled={isLoading || pin.length !== PIN_LENGTH}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all outline-none ${pin.length === PIN_LENGTH
              ? 'bg-white text-black shadow-2xl hover:scale-105 active:scale-95'
              : 'bg-white/5 border border-white/10 text-white/20'
              }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight size={22} />
            )}
          </button>
        </div>

        {/* Error Message */}
        <div className={`h-6 mb-6 transition-opacity duration-300 ${error ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-1.5 text-[var(--color-brand-danger)] text-xs font-bold uppercase tracking-wider">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        </div>

        {/* Numeric Keypad (Round Buttons) */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              disabled={isLoading}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 text-2xl font-bold text-white hover:bg-white/10 active:scale-95 transition-all outline-none mx-auto flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          <div className="w-16 h-16" /> {/* Spacer */}

          <button
            onClick={() => handleKeyPress('0')}
            disabled={isLoading}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 text-2xl font-bold text-white hover:bg-white/10 active:scale-95 transition-all outline-none mx-auto flex items-center justify-center"
          >
            0
          </button>

          {/* Backspace Button inside keypad */}
          <button
            onClick={handleBackspace}
            disabled={isLoading || pin.length === 0}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/10 active:scale-95 transition-all outline-none mx-auto disabled:opacity-20"
            aria-label="Delete"
          >
            <Delete size={20} />
          </button>
        </div>
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

