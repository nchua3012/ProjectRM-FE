import React, { useMemo, useState, useEffect } from 'react';
import type { TodayLineProps } from '@/types';
import { getScaledCellWidth, calculateTodayPosition } from '@/utils';

/**
 * Today Line Component
 * Vertical indicator through the timeline marking current date
 * Uses precise fractional position for accurate today marker placement
 * Auto-updates at midnight to stay synced with current day
 */
export const TodayLine = React.memo(function TodayLine({
  startDate,
  scale,
  totalWeeks,
}: TodayLineProps) {
  const cellWidth = getScaledCellWidth(scale);

  // State to force re-render when day changes
  const [currentDay, setCurrentDay] = useState(() => new Date().toDateString());

  // Set up interval to check for day change (every minute)
  // This ensures the today marker updates if the app stays open past midnight
  useEffect(() => {
    const checkDayChange = () => {
      const newDay = new Date().toDateString();
      if (newDay !== currentDay) {
        setCurrentDay(newDay);
      }
    };

    // Check every minute
    const interval = setInterval(checkDayChange, 60000);

    return () => clearInterval(interval);
  }, [currentDay]);

  // Calculate precise today position - recalculates when startDate or currentDay changes
  const todayPosition = useMemo(
    () => calculateTodayPosition(startDate),
    [startDate, currentDay]
  );

  // Don't render if today is outside the timeline
  if (!todayPosition || todayPosition.weekIndex < 0 || todayPosition.weekIndex >= totalWeeks) {
    return null;
  }

  // Calculate precise position using fractional weeks
  const leftPosition = todayPosition.totalWeeks * cellWidth;

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-40"
      style={{
        left: leftPosition,
        width: 2,
        backgroundColor: '#ef4444',
        boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
      }}
    >
      {/* TODAY label - vertical orientation at bottom left */}
      <div
        className="absolute bottom-2 px-1 py-2 rounded text-xs font-bold whitespace-nowrap"
        style={{
          left: 4,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
          backgroundColor: '#ef4444',
          color: '#fff',
          fontSize: Math.max(9, 10 * scale),
          letterSpacing: '0.05em',
        }}
      >
        TODAY
      </div>
    </div>
  );
});
