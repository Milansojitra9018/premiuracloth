import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserCurrency() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Simple detection for India
  if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || navigator.language.includes('IN')) {
    return 'INR';
  }
  return 'USD';
}

export function formatCurrency(amount: number, currencyCode?: 'INR' | 'USD') {
  const currency = currencyCode || getUserCurrency();
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getProductPrice(product: { price: number; priceINR?: number; priceUSD?: number }) {
  const currency = getUserCurrency();
  if (currency === 'INR' && product.priceINR) return product.priceINR;
  if (currency === 'USD' && product.priceUSD) return product.priceUSD;
  return product.price; // Fallback
}

export function formatDate(date: any) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}
