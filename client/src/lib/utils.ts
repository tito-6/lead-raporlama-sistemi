import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency with proper locale formatting
 * @param amount - The amount to format
 * @param currency - Currency code (TRY, USD, etc.)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "TRY"
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format a number with commas as thousand separators using Turkish formatting
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumberWithCommas(num: number | string): string {
  const numValue = typeof num === "string" ? parseFloat(num) : num;
  return new Intl.NumberFormat("tr-TR").format(numValue);
}

/**
 * Calculate cost per sale for a given time period
 * @param totalExpense - Total expenses in the period
 * @param salesCount - Number of sales in the period
 * @returns Cost per sale or 0 if no sales
 */
export function calculateCostPerSale(
  totalExpense: number,
  salesCount: number
): number {
  if (salesCount <= 0) return 0;
  return totalExpense / salesCount;
}
