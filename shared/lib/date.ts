/**
 * Date Utilities
 * 
 * Pure functions for date manipulation
 */

/**
 * Get start of day (00:00:00)
 */
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59)
 */
export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = startOfDay(new Date());
  const checkDate = startOfDay(date);
  return today.getTime() === checkDate.getTime();
}

/**
 * Check if date is same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() === startOfDay(date2).getTime();
}

/**
 * Get days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = startOfDay(date1);
  const d2 = startOfDay(date2);
  return Math.round(Math.abs((d1.getTime() - d2.getTime()) / oneDay));
}
