/**
 * Centralized Currency Conversion & Formatting System
 * Maintains base stored currency as INR and converts to target display currency.
 */

export const EXCHANGE_RATES_FROM_INR: Record<string, number> = {
  INR: 1.0,
  USD: 0.012, // 1 USD ≈ 83.33 INR
  EUR: 0.011, // 1 EUR ≈ 90.91 INR
  GBP: 0.0094 // 1 GBP ≈ 106.38 INR
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

/**
 * Converts monetary amount from one currency to another.
 */
export const convertCurrency = (
  amount: number | string,
  fromCurrency = 'INR',
  toCurrency = 'INR'
): number => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
  if (!num) return 0;

  const cleanFrom = (fromCurrency || 'INR').toUpperCase();
  const cleanTo = (toCurrency || 'INR').toUpperCase();

  const fromRate = EXCHANGE_RATES_FROM_INR[cleanFrom] || 1.0;
  const toRate = EXCHANGE_RATES_FROM_INR[cleanTo] || 1.0;

  // Convert to base INR first, then to target currency
  const amountInINR = num / fromRate;
  const converted = amountInINR * toRate;

  return converted;
};

/**
 * Formats a monetary amount into the target display currency with symbol and formatting.
 */
export const formatCurrency = (
  amount: number | string,
  targetCurrency = 'INR',
  fromCurrency = 'INR'
): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
  const cleanTarget = (targetCurrency || 'INR').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[cleanTarget] || '₹';

  const converted = convertCurrency(num, fromCurrency, cleanTarget);

  if (cleanTarget === 'INR') {
    return `${symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  }

  return `${symbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
