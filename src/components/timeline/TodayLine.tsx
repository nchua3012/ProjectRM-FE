import React from 'react';
import type { TodayLineProps } from '@/types';
import { THEMES } from '@/config';
import { getScaledCellWidth, isCurrentWeek } from '@/utils';

/**
 * Today Line Component
 * Vertical indicator through the timeline marking current date
 */
export const TodayLine = React.memo(function TodayLine({
  startDate,
  scale,
  totalWeeks,
  theme = THEMES.light,
}: TodayLineProps) {
  const cellWidth = getScaledCellWidth(scale);

  // Find which week contains today
  let todayWeekIndex = -1;

  for (let i = 0; i < totalWeeks; i++) {
    if (isCurrentWeek(startDate, i)) {
      todayWeekIndex = i;
      break;
    }
  }

  // Don't render if today is not in the visible range
  if (todayWeekIndex === -1) return null;

  // Calculate position - center of the current week
  const leftPosition = todayWeekIndex * cellWidth + cellWidth / 2;

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{
        left: leftPosition,
        width: 2,
        backgroundColor: theme.todayBg,
        zIndex: 15,
        opacity: 0.8,
      }}
    >
      {/* Triangle flag at top */}
      <div
        className="absolute -top-1"
        style={{
          left: -5,
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${theme.todayBg}`,
        }}
      />
    </div>
  );
});
