import { format, differenceInDays } from 'date-fns';

/**
 * Calculate the number of days remaining until a target date
 * @param targetDate ISO string date or Date object
 * @returns number of days remaining, or 0 if the date is in the past
 */
export function calculateDaysRemaining(targetDate: string | Date | undefined): number {
  if (!targetDate) return 0;
  
  const targetDateObj = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const today = new Date();
  
  const daysRemaining = differenceInDays(targetDateObj, today);
  return daysRemaining > 0 ? daysRemaining : 0;
}

/**
 * Format a date into a readable string
 * @param date ISO string date or Date object
 * @param formatStr optional date-fns format string
 * @returns formatted date string
 */
export function formatDate(date: string | Date, formatStr = 'MMMM d, yyyy'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}