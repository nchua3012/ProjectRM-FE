/**
 * Date utility functions for timeline calculations
 */

import type { TodayPosition, TaskBar } from '@/types';

/**
 * Normalize a date to midnight in local timezone
 * This ensures consistent date comparisons
 * @param date - Date to normalize
 * @returns New Date object at midnight local time
 */
export function normalizeToLocalMidnight(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Parse a date string (YYYY-MM-DD) to a local date at midnight
 * Avoids timezone issues when parsing date input values
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object at midnight local time, or null if invalid
 */
export function parseDateString(dateString: string): Date | null {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Add days to a date, returning a new date at midnight local time
 * This avoids DST issues by working with date components directly
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New Date at midnight local time
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return result;
}

/**
 * Format a week's start date as a label
 * @param startDate - Timeline start date
 * @param weekIndex - Zero-based week index
 * @returns Formatted date label (e.g., "01 Jan")
 */
export function getWeekLabel(startDate: Date, weekIndex: number): string {
  if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return `W${weekIndex + 1}`;
  }
  const weekStart = addDays(startDate, weekIndex * 7);
  return weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

/**
 * Get month label for a specific week
 * @param startDate - Timeline start date
 * @param weekIndex - Zero-based week index
 * @returns Month and year label (e.g., "Jan 25")
 */
export function getMonthLabel(startDate: Date, weekIndex: number): string {
  if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return '';
  }
  const weekStart = addDays(startDate, weekIndex * 7);
  return weekStart.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

/**
 * Check if a week contains today's date
 * @param startDate - Timeline start date
 * @param weekIndex - Zero-based week index
 * @returns True if current week
 */
export function isCurrentWeek(startDate: Date, weekIndex: number): boolean {
  if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return false;
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekStart = addDays(startDate, weekIndex * 7);
  const weekEnd = addDays(startDate, (weekIndex + 1) * 7);
  return now >= weekStart && now < weekEnd;
}

/**
 * Get the Monday of the week for any given date
 * @param date - Any date
 * @returns Date object set to Monday of that week at midnight
 */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // If Sunday (0), go back 6 days; otherwise go back (day - 1) days
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

/**
 * Get the start of the current week (Monday) at midnight local time
 * @returns Date object set to Monday of current week at 00:00:00
 */
export function getStartOfCurrentWeek(): Date {
  return getMondayOfWeek(new Date());
}

/**
 * Get the current week index relative to the timeline start date
 * @param startDate - Timeline start date
 * @param totalWeeks - Total weeks in timeline
 * @returns Zero-based week index, or -1 if today is outside the timeline
 */
export function getCurrentWeekIndex(startDate: Date, totalWeeks: number): number {
  if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return -1;
  }
  for (let i = 0; i < totalWeeks; i++) {
    if (isCurrentWeek(startDate, i)) {
      return i;
    }
  }
  return -1;
}

/**
 * Calculate today's precise position in the timeline
 * @param startDate - Timeline start date
 * @returns TodayPosition object or null if invalid date
 */
export function calculateTodayPosition(startDate: Date): TodayPosition | null {
  if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return null;
  }

  // Create today at midnight using date components to avoid timezone issues
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Create start date at midnight using date components to avoid timezone issues
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  const diffTime = today.getTime() - start.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const diffWeeks = diffDays / 7;

  return {
    weekIndex: Math.floor(diffWeeks),
    fractionalOffset: diffWeeks % 1,  // 0.5 = middle of week
    totalWeeks: diffWeeks,
  };
}

/**
 * Check if a week is before today
 * @param weekIndex - Zero-indexed week to check
 * @param todayPosition - Today's position in the timeline
 * @returns True if the week is entirely before today
 */
export function isWeekBeforeToday(weekIndex: number, todayPosition: TodayPosition | null): boolean {
  if (!todayPosition) return false;
  return weekIndex < todayPosition.weekIndex;
}

/**
 * Determine if bar should have grayscale applied
 * @param bar - Task bar to check
 * @param todayPosition - Today's position in the timeline
 * @returns True if grayscale should be applied
 */
export function shouldApplyGrayscale(bar: TaskBar, todayPosition: TodayPosition | null): boolean {
  if (!todayPosition) return false;

  const barEndWeek = (bar?.startWeek ?? 0) + (bar?.duration ?? 1);

  // Future bars: never grayscale
  if ((bar?.startWeek ?? 0) >= todayPosition.totalWeeks) return false;

  // Completed bars: always grayscale if in past
  if (bar?.completed && barEndWeek <= todayPosition.totalWeeks) return true;

  // Incomplete past bars: only if not overridden
  if (barEndWeek <= todayPosition.totalWeeks) {
    return !bar?.ignoreGrayscale;
  }

  return false;
}

/**
 * Check if bar spans across today (needs visual split)
 * @param bar - Task bar to check
 * @param todayPosition - Today's position in the timeline
 * @returns True if bar spans today
 */
export function doesBarSpanToday(bar: TaskBar, todayPosition: TodayPosition | null): boolean {
  if (!todayPosition || !bar) return false;

  const barStart = bar.startWeek ?? 0;
  const barEnd = barStart + (bar.duration ?? 1);

  return barStart < todayPosition.totalWeeks && barEnd > todayPosition.totalWeeks;
}
