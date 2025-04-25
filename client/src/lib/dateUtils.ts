import { differenceInDays, format, parseISO, addMonths, isBefore } from 'date-fns';

/**
 * Calculate the number of days remaining until the wedding date
 * @param weddingDate The wedding date
 * @returns Number of days remaining
 */
export function calculateDaysRemaining(weddingDate: Date | string | null | undefined): number {
  if (!weddingDate) return 0;
  
  const dateObj = typeof weddingDate === 'string' ? new Date(weddingDate) : weddingDate;
  const today = new Date();
  
  if (isBefore(dateObj, today)) return 0;
  
  return differenceInDays(dateObj, today);
}

/**
 * Format a date in a consistent way
 * @param date Date to format
 * @param formatString Format string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null | undefined, formatString: string = 'MMMM d, yyyy'): string {
  if (!date) return 'Not set';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
}

/**
 * Calculate months before the wedding date from another date
 * @param weddingDate The wedding date
 * @param otherDate The date to compare
 * @returns Number of months before the wedding
 */
export function calculateMonthsBefore(weddingDate: Date | string | null | undefined, otherDate: Date | string): number {
  if (!weddingDate) return 0;
  
  const weddingDateObj = typeof weddingDate === 'string' ? new Date(weddingDate) : weddingDate;
  const otherDateObj = typeof otherDate === 'string' ? new Date(otherDate) : otherDate;
  
  let months = 0;
  let testDate = otherDateObj;
  
  while (isBefore(testDate, weddingDateObj)) {
    testDate = addMonths(otherDateObj, months + 1);
    months++;
  }
  
  return months;
}

/**
 * Calculate the percentage of planning completed based on completed tasks
 * @param totalTasks Total number of tasks
 * @param completedTasks Number of completed tasks
 * @returns Percentage completed
 */
export function calculateProgress(totalTasks: number, completedTasks: number): number {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}
