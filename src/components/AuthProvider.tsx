'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setIsAuthenticated(!!session);
          setIsLoading(false);
          
          if (!session && pathname !== '/login') {
            router.replace('/login');
          } else if (session && pathname === '/login') {
            router.replace('/');
          }
        }
      } catch (err) {
        console.error('Session check error', err);
        if (mounted) setIsLoading(false);
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);
        setIsLoading(false); // Ensure loader is cleared when auth state is known
        if (session && pathname === '/login') {
          router.replace('/');
        } else if (!session && pathname !== '/login') {
          router.replace('/login');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]); // Removed router from dependencies to avoid infinite re-renders

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-navy)]">
        <Loader2 className="w-8 h-8 text-[var(--color-brand-accent)] animate-spin" />
      </div>
    );
  }

  // Prevent rendering protected content if not authenticated (unless on login page)
  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
