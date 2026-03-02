import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Vietnamese currency with dot separators
 * @param amount - The amount to format
 * @param includeCurrency - Whether to include "(VND)" suffix
 * @returns Formatted string like "1.000.000.000 (VND)"
 */
export function formatVND(amount: number | string, includeCurrency: boolean = true): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return includeCurrency ? "0 (VND)" : "0";
  }
  
  // Format with dot as thousands separator
  const formatted = numAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return includeCurrency ? `${formatted} (VND)` : formatted;
}
