import type { PublicHolidays, HolidayWithDate } from '@/types';

/**
 * UK Public Holidays (Bank Holidays)
 */
export const PUBLIC_HOLIDAYS: Readonly<PublicHolidays> = Object.freeze({
  // 2024
  '2024-01-01': { name: "New Year's Day", type: 'bank' },
  '2024-03-29': { name: 'Good Friday', type: 'bank' },
  '2024-04-01': { name: 'Easter Monday', type: 'bank' },
  '2024-05-06': { name: 'Early May Bank Holiday', type: 'bank' },
  '2024-05-27': { name: 'Spring Bank Holiday', type: 'bank' },
  '2024-08-26': { name: 'Summer Bank Holiday', type: 'bank' },
  '2024-12-25': { name: 'Christmas Day', type: 'bank' },
  '2024-12-26': { name: 'Boxing Day', type: 'bank' },
  // 2025
  '2025-01-01': { name: "New Year's Day", type: 'bank' },
  '2025-04-18': { name: 'Good Friday', type: 'bank' },
  '2025-04-21': { name: 'Easter Monday', type: 'bank' },
  '2025-05-05': { name: 'Early May Bank Holiday', type: 'bank' },
  '2025-05-26': { name: 'Spring Bank Holiday', type: 'bank' },
  '2025-08-25': { name: 'Summer Bank Holiday', type: 'bank' },
  '2025-12-25': { name: 'Christmas Day', type: 'bank' },
  '2025-12-26': { name: 'Boxing Day', type: 'bank' },
  // 2026
  '2026-01-01': { name: "New Year's Day", type: 'bank' },
  '2026-04-03': { name: 'Good Friday', type: 'bank' },
  '2026-04-06': { name: 'Easter Monday', type: 'bank' },
  '2026-05-04': { name: 'Early May Bank Holiday', type: 'bank' },
  '2026-05-25': { name: 'Spring Bank Holiday', type: 'bank' },
  '2026-08-31': { name: 'Summer Bank Holiday', type: 'bank' },
  '2026-12-25': { name: 'Christmas Day', type: 'bank' },
  '2026-12-28': { name: 'Boxing Day (substitute)', type: 'bank' },
});

/**
 * Get holidays that fall within a specific week
 * @param startDate - Timeline start date
 * @param weekIndex - Zero-based week index
 * @returns Array of holiday objects within the week
 */
export function getHolidaysInWeek(startDate: Date, weekIndex: number): HolidayWithDate[] {
  if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return [];
  }

  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + weekIndex * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const holidays: HolidayWithDate[] = [];

  Object.entries(PUBLIC_HOLIDAYS).forEach(([dateStr, holiday]) => {
    const holidayDate = new Date(dateStr);
    if (holidayDate >= weekStart && holidayDate < weekEnd) {
      holidays.push({ ...holiday, date: holidayDate, dateStr });
    }
  });

  return holidays;
}
