import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Formatta la data in formato locale italiano DD/MM/YYYY */
export function formatDateDDMMYYYY(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** Formatta un valore monetario esattamente in formato €#.###,## */
export function formatCurrency(amount: number | string | null | undefined, options?: { showSign?: boolean; signedType?: 'income' | 'expense' }): string {
  const num = Number(amount) || 0;
  const absFormatted = Math.abs(num).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (options?.signedType) {
    const sign = options.signedType === 'income' ? '+' : '-';
    return `${sign}€${absFormatted}`;
  }

  if (options?.showSign) {
    const sign = num > 0 ? '+' : num < 0 ? '-' : '';
    return `${sign}€${absFormatted}`;
  }

  const sign = num < 0 ? '-' : '';
  return `${sign}€${absFormatted}`;
}
