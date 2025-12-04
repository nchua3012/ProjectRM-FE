import React, { useState, useRef, useCallback } from 'react';
import type { SwimlaneRowProps } from '@/types';
import { THEMES, getHolidaysInWeek } from '@/config';
import { getScaledCellWidth } from '@/utils';
import { TaskBar } from './TaskBar';
import { MilestoneDiamond } from './MilestoneDiamond';

/**
 * Swimlane Row Component
 * Displays a single row in the timeline with tasks and milestones
 */
export const SwimlaneRow = React.memo(function SwimlaneRow({
  swimlane,
  totalWeeks,
  onCellClick,
  onCellDrop,
  onBarClick,
  onMilestoneClick,
  onBarDragMove,
  onBarDragResize,
  scale,
  isEven,
  theme = THEMES.light,
  showHolidays = false,
  startDate,
}: SwimlaneRowProps) {
  const cellWidth = getScaledCellWidth(scale);
  const rowRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set false if we're leaving the row entirely
    if (rowRef.current && !rowRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const type = e.dataTransfer?.getData('text/plain');
      if (type && typeof onCellDrop === 'function' && rowRef.current) {
        const rect = rowRef.current.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const weekIndex = Math.floor(dropX / cellWidth);
        onCellDrop(e, Math.max(0, Math.min(weekIndex, totalWeeks - 1)), type);
      }
    },
    [onCellDrop, cellWidth, totalWeeks]
  );

  return (
    <div
      ref={rowRef}
      className="flex relative border-b"
      style={{
        height: 52,
        borderColor: theme.gridLine,
        backgroundColor: isEven ? theme.gridAltBg : theme.gridBg,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Grid cells - visual only now, drop handled by row */}
      {Array.from({ length: totalWeeks }).map((_, weekIndex) => {
        const holidays = showHolidays ? getHolidaysInWeek(startDate, weekIndex) : [];
        const hasHoliday = holidays.length > 0;

        return (
          <div
            key={weekIndex}
            className="flex-shrink-0 border-r transition-colors"
            style={{
              width: cellWidth,
              borderColor: theme.gridLine,
              backgroundColor: hasHoliday
                ? theme.holidayBg
                : isDragOver
                  ? theme.cellHover
                  : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!hasHoliday && !isDragOver)
                (e.currentTarget as HTMLDivElement).style.backgroundColor = theme.cellHover;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = hasHoliday
                ? theme.holidayBg
                : 'transparent';
            }}
            onClick={() => {
              if (typeof onCellClick === 'function') onCellClick(weekIndex);
            }}
            title={hasHoliday ? holidays.map((h) => h.name).join(', ') : ''}
          />
        );
      })}

      {/* Task bars */}
      {Array.isArray(swimlane?.bars) &&
        swimlane.bars.map((bar) => (
          <TaskBar
            key={bar.id}
            bar={bar}
            scale={scale}
            totalWeeks={totalWeeks}
            onClick={() => {
              if (typeof onBarClick === 'function') onBarClick(bar.id);
            }}
            onDragMove={onBarDragMove}
            onDragResize={onBarDragResize}
            theme={theme}
          />
        ))}

      {/* Milestones */}
      {Array.isArray(swimlane?.milestones) &&
        swimlane.milestones.map((milestone) => (
          <MilestoneDiamond
            key={milestone.id}
            milestone={milestone}
            scale={scale}
            onClick={() => {
              if (typeof onMilestoneClick === 'function') onMilestoneClick(milestone.id);
            }}
            theme={theme}
          />
        ))}
    </div>
  );
});
