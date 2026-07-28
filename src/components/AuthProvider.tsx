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

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setIsAuthenticated(!!session);
        setIsLoading(false);
        if (!session && pathname !== '/login') {
          router.replace('/login');
        } else if (session && pathname === '/login') {
          router.replace('/');
        }
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);
        setIsLoading(false);
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
  // We explicitly DO NOT include pathname in the dependency array
  // so that we don't re-subscribe on every route change, which can cause race conditions.
  // The router.replace calls inside the listener will use the closure's pathname, 
  // which might be stale, but the onAuthStateChange only fires on actual auth events!
  // Wait, if it's stale, it's bad. Let's handle routing in a separate effect that depends on pathname and isAuthenticated!
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle routing in a separate effect that reacts to pathname and auth state changes
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.replace('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.replace('/');
      }
    }
  }, [pathname, isAuthenticated, isLoading, router]);

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

