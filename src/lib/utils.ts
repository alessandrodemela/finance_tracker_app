import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Note: Using tailwind-merge even if not using full tailwind because 
// it's useful for class management, and we might add tailwind later if needed.
// However, the prompt asked for Vanilla CSS, so I'll mostly use standard CSS classes.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
