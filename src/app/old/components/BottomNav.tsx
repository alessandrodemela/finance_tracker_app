'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListOrdered, PiggyBank, BarChart3, TrendingUp } from 'lucide-react';
import styles from './BottomNav.module.css';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link href="/transactions" className={`${styles.link} ${pathname === '/transactions' ? styles.active : ''}`}>
        <ListOrdered size={24} />
        <span>History</span>
      </Link>
      <Link href="/budget" className={`${styles.link} ${pathname === '/budget' ? styles.active : ''}`}>
        <PiggyBank size={24} />
        <span>Budget</span>
      </Link>
      <Link href="/balance" className={`${styles.link} ${pathname === '/balance' ? styles.active : ''}`}>
        <BarChart3 size={24} />
        <span>Balance</span>
      </Link>
      <Link href="/summary" className={`${styles.link} ${pathname === '/summary' ? styles.active : ''}`}>
        <TrendingUp size={24} />
        <span>Summary</span>
      </Link>
    </nav>
  );
}
