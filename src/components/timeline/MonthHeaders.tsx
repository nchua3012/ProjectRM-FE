import React from 'react';
import type { MonthHeadersProps } from '@/types';
import { THEMES } from '@/config';
import { getScaledCellWidth, getMonthLabel } from '@/utils';

interface MonthData {
  label: string;
  width: number;
  start: number;
}

/**
 * Month Header Row Component
 * Displays month labels spanning multiple weeks
 */
export const MonthHeaders = React.memo(function MonthHeaders({
  totalWeeks,
  startDate,
  scale,
  theme = THEMES.light,
}: MonthHeadersProps) {
  const cellWidth = getScaledCellWidth(scale);
  const months: MonthData[] = [];
  let currentMonth = '';
  let monthStart = 0;
  let monthWidth = 0;

  for (let i = 0; i < totalWeeks; i++) {
    const month = getMonthLabel(startDate, i);
    if (month !== currentMonth) {
      if (currentMonth) {
        months.push({ label: currentMonth, width: monthWidth, start: monthStart });
      }
      currentMonth = month;
      monthStart = i;
      monthWidth = cellWidth;
    } else {
      monthWidth += cellWidth;
    }
  }
  if (currentMonth) {
    months.push({ label: currentMonth, width: monthWidth, start: monthStart });
  }

  return (
    <div className="flex" style={{ backgroundColor: theme.headerBg }}>
      {months.map((m, i) => (
        <div
          key={i}
          className="text-center py-2 border-r font-semibold text-sm uppercase tracking-wide"
          style={{
            width: m.width,
            borderColor: theme.subHeaderBg,
            color: theme.headerText,
          }}
        >
          {m.label}
        </div>
      ))}
    </div>
  );
});
