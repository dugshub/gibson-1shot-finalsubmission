import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency amount
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format date to readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Calculate even split percentages
export function calculateEvenSplit(memberCount: number): number[] {
  if (memberCount <= 0) return [];
  
  const basePercentage = Math.floor((100 / memberCount) * 100) / 100;
  const remainder = 100 - (basePercentage * memberCount);
  
  // First member gets the remainder to ensure total is exactly 100%
  return Array(memberCount)
    .fill(basePercentage)
    .map((percentage, index) => 
      index === 0 ? percentage + remainder : percentage
    );
}