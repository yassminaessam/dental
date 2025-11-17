/**
 * Currency formatting utilities for Egyptian Pounds (جم)
 */

/**
 * Format a number as Egyptian Pounds
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @param language - Language code ('ar' or 'en') for formatting (default: 'ar')
 * @returns Formatted currency string
 */
export function formatEGP(amount: number | string, showSymbol: boolean = true, language: string = 'ar'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    const symbol = language === 'ar' ? 'جم' : 'EGP';
    return showSymbol ? `0.00 ${symbol}` : '0.00';
  }
  
  // Use proper locale for number formatting
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const formatted = numAmount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  const symbol = language === 'ar' ? 'جم' : 'EGP';
  return showSymbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Format currency with thousands separator
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string with thousands separator
 */
export function formatEGPWithSeparator(amount: number | string, showSymbol: boolean = true): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return showSymbol ? '0.00 جم' : '0.00';
  }
  
  const formatted = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return showSymbol ? `${formatted} جم` : formatted;
}

/**
 * Currency symbol constant
 */
export const CURRENCY_SYMBOL = 'جم';
export const CURRENCY_NAME = 'Egyptian Pound';
export const CURRENCY_NAME_AR = 'جنيه مصري';
