import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Note: Using tailwind-merge even if not using full tailwind because 
// it's useful for class management, and we might add tailwind later if needed.
// However, the prompt asked for Vanilla CSS, so I'll mostly use standard CSS classes.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDateDDMMYYYY(dateString: string | Date): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

