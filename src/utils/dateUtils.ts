/**
 * Date utility functions for timeline calculations
 */

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
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + weekIndex * 7);
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
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + weekIndex * 7);
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
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + weekIndex * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return now >= weekStart && now < weekEnd;
}

/**
 * Get the start of the current week (Monday)
 * @returns Date object set to Monday of current week
 */
export function getStartOfCurrentWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1);
  return d;
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
