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
      <div className="min-h-screen flex items-center justify-center bg-[#04060c]">
        <Loader2 className="w-8 h-8 text-[#00D2FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-[#04060c] px-6 font-['Inter',_sans-serif] transition-colors duration-300 ${shake ? 'bg-[#1a0606]' : ''}`}>
      {/* Background radial glow */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: shake 
            ? 'radial-gradient(circle at 50% 50%, rgba(240, 90, 100, 0.15) 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.05) 0%, transparent 60%)'
        }}
      />

      <div className="w-full max-w-[320px] flex flex-col items-center z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#090a10] border border-[rgba(255,255,255,0.05)] flex items-center justify-center mb-6 shadow-2xl transition-colors duration-300">
            <Lock size={28} className={shake ? 'text-[#F05A64]' : 'text-[#00D2FF]'} />
          </div>
          <h1 className="text-[18px] font-['Outfit',_sans-serif] font-light text-[#5A6B8F] tracking-[5px] uppercase mb-2">
            FINANCE TRACKER
          </h1>
          <p className="text-xs text-[#5A6B8F] opacity-60 tracking-wider">SECURE ACCESS</p>
        </div>

        {/* PIN Entry Area (Dots + Arrow Button) */}
        <div className={`flex items-center gap-6 mb-8 transition-transform ${shake ? 'animate-shake' : ''}`}>
          {/* Dots Group */}
          <div className="flex gap-2.5">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < pin.length 
                    ? shake 
                      ? 'bg-[#F05A64] shadow-[0_0_12px_rgba(240,90,100,0.5)] scale-110'
                      : 'bg-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.5)] scale-110' 
                    : 'bg-[rgba(255,255,255,0.1)]'
                }`}
              />
            ))}
          </div>

          {/* Submit Button next to pins */}
          <button
            onClick={handleEnter}
            disabled={isLoading || pin.length !== PIN_LENGTH}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all outline-none ${
              pin.length === PIN_LENGTH 
                ? 'bg-[#00D2FF] text-[#04060c] shadow-[0_0_20px_rgba(0,210,255,0.3)] hover:scale-105 active:scale-95' 
                : 'bg-[#090a10] border border-[rgba(255,255,255,0.05)] text-[#5A6B8F] opacity-40'
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
          <div className="flex items-center gap-1.5 text-[#F05A64] text-xs">
            <AlertCircle size={14} />
            <span className="tracking-wide">{error}</span>
          </div>
        </div>

        {/* Numeric Keypad (Round Buttons) */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-[#090a10] border border-[rgba(255,255,255,0.05)] text-[22px] font-['Outfit',_sans-serif] text-[#E8EBF4] hover:bg-[rgba(255,255,255,0.03)] active:scale-95 transition-all outline-none mx-auto flex items-center justify-center box-content"
            >
              {num}
            </button>
          ))}
          
          <div className="w-16 h-16" /> {/* Spacer */}
          
          <button
            onClick={() => handleKeyPress('0')}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-[#090a10] border border-[rgba(255,255,255,0.05)] text-[22px] font-['Outfit',_sans-serif] text-[#E8EBF4] hover:bg-[rgba(255,255,255,0.03)] active:scale-95 transition-all outline-none mx-auto flex items-center justify-center box-content"
          >
            0
          </button>

          {/* Backspace Button inside keypad */}
          <button
            onClick={handleBackspace}
            disabled={isLoading || pin.length === 0}
            className="w-16 h-16 rounded-full bg-[#090a10] border border-[rgba(0,0,0,0.4)] flex items-center justify-center text-[#5A6B8F] hover:text-[#E8EBF4] hover:bg-[rgba(255,255,255,0.03)] active:scale-95 transition-all outline-none mx-auto disabled:opacity-20 disabled:scale-100"
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

