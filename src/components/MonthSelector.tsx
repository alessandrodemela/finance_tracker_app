'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './MonthSelector.module.css';

interface MonthSelectorProps {
  currentDate: Date;
  onChange: (d: Date) => void;
}

export function MonthSelector({ currentDate, onChange }: MonthSelectorProps) {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate);
  };

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.container}>
      <button onClick={handlePrev} className={styles.btn}><ChevronLeft size={24} /></button>
      <h2 className={styles.month}>{monthName}</h2>
      <button onClick={handleNext} className={styles.btn}><ChevronRight size={24} /></button>
    </div>
  );
}
