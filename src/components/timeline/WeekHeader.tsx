import React from 'react';
import { Calendar } from 'lucide-react';
import type { WeekHeaderProps } from '@/types';
import { THEMES, getHolidaysInWeek } from '@/config';
import { getScaledCellWidth, getWeekLabel, isCurrentWeek, isWeekBeforeToday } from '@/utils';

/**
 * Week Header Component
 * Individual week column header with date and week number
 * Applies grayscale filter to past weeks
 */
export const WeekHeader = React.memo(function WeekHeader({
  weekIndex,
  startDate,
  scale,
  theme = THEMES.light,
  showHolidays = false,
  todayPosition,
}: WeekHeaderProps) {
  const cellWidth = getScaledCellWidth(scale);
  const isToday = isCurrentWeek(startDate, weekIndex);
  const holidays = showHolidays ? getHolidaysInWeek(startDate, weekIndex) : [];
  const hasHoliday = holidays.length > 0;

  // Check if this week is in the past
  const isPast = isWeekBeforeToday(weekIndex, todayPosition ?? null);

  return (
    <div
      className="flex-shrink-0 text-center border-r relative transition-all"
      style={{
        width: cellWidth,
        borderColor: theme.gridLine,
        backgroundColor: isToday
          ? theme.todayBg
          : hasHoliday
            ? theme.holidayBg
            : theme.subHeaderBg,
        filter: isPast ? 'grayscale(100%)' : 'none',
        opacity: isPast ? 0.5 : 1,
      }}
    >
      {isToday && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-bold rounded"
          style={{ backgroundColor: theme.todayBg, color: '#fff' }}
        >
          TODAY
        </div>
      )}
      {hasHoliday && !isToday && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-xs font-medium rounded flex items-center gap-1"
          style={{ backgroundColor: theme.holidayBorder, color: '#fff' }}
          title={holidays.map((h) => h.name).join(', ')}
        >
          <Calendar size={10} />
          {cellWidth > 60 && (
            <span className="truncate max-w-16">{holidays[0]?.name?.split(' ')[0]}</span>
          )}
        </div>
      )}
      <div
        className="text-xs font-medium py-1"
        style={{
          color: isToday ? '#fff' : hasHoliday ? theme.holidayText : theme.headerText,
        }}
      >
        {getWeekLabel(startDate, weekIndex)}
      </div>
      <div
        className="text-xs py-0.5"
        style={{
          color: isToday
            ? 'rgba(255,255,255,0.8)'
            : hasHoliday
              ? theme.holidayText
              : theme.textMuted,
          fontSize: '10px',
        }}
      >
        W{weekIndex + 1}
      </div>
    </div>
  );
});
