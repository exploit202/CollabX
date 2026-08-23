/**
 * Centralized Currency Formatting Utility for CollabX
 * Formats all monetary values into Indian Rupees (₹) using standard Indian numbering format (en-IN).
 */

export const formatCurrency = (
  amount: number | string,
  _targetCurrency = 'INR',
  _fromCurrency = 'INR'
): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export const convertCurrency = (
  amount: number | string,
  _fromCurrency = 'INR',
  _toCurrency = 'INR'
): number => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
  return num;
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '₹',
  EUR: '₹',
  GBP: '₹'
};

export const EXCHANGE_RATES_FROM_INR: Record<string, number> = {
  INR: 1.0,
  USD: 1.0,
  EUR: 1.0,
  GBP: 1.0
};
