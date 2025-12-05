import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { SwimlaneRowProps } from '@/types';
import { THEMES, getHolidaysInWeek, CONFIG, HEIGHT_CONFIG } from '@/config';
import { getScaledCellWidth, getCurrentWeekIndex } from '@/utils';
import { TaskBar } from './TaskBar';
import { MilestoneDiamond } from './MilestoneDiamond';
import { GripHorizontal } from 'lucide-react';

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
  onHeightChange,
  scale,
  isEven,
  theme = THEMES.light,
  showHolidays = false,
  startDate,
}: SwimlaneRowProps) {
  const cellWidth = getScaledCellWidth(scale);
  const rowRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef<number>(0);
  const startMultiplier = useRef<number>(1);

  // Calculate actual row height based on multiplier
  const heightMultiplier = swimlane.heightMultiplier || HEIGHT_CONFIG.DEFAULT_MULTIPLIER;
  const rowHeight = CONFIG.ROW_HEIGHT * heightMultiplier;

  // Calculate current week index for greyscale past items
  const currentWeekIndex = useMemo(
    () => getCurrentWeekIndex(startDate, totalWeeks),
    [startDate, totalWeeks]
  );

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

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStartY.current = e.clientY;
      startMultiplier.current = heightMultiplier;
    },
    [heightMultiplier]
  );

  // Handle resize move - calculate new multiplier based on drag distance
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !onHeightChange) return;

      const deltaY = e.clientY - resizeStartY.current;
      const cellsMoved = Math.round(deltaY / CONFIG.ROW_HEIGHT);

      // Find the current index in multipliers array
      const currentIndex = HEIGHT_CONFIG.MULTIPLIERS.indexOf(
        startMultiplier.current as 1 | 2 | 4 | 6
      );
      const newIndex = Math.max(
        0,
        Math.min(HEIGHT_CONFIG.MULTIPLIERS.length - 1, currentIndex + cellsMoved)
      );
      const newMultiplier = HEIGHT_CONFIG.MULTIPLIERS[newIndex];

      if (newMultiplier !== heightMultiplier) {
        onHeightChange(newMultiplier);
      }
    },
    [isResizing, onHeightChange, heightMultiplier]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove global mouse event listeners for resize
  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return (
    <div
      ref={rowRef}
      className="flex relative border-b group"
      style={{
        height: rowHeight,
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
            currentWeekIndex={currentWeekIndex}
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
            currentWeekIndex={currentWeekIndex}
          />
        ))}

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-ns-resize z-10"
        style={{
          height: HEIGHT_CONFIG.RESIZE_HANDLE_HEIGHT,
          backgroundColor: isResizing ? theme.accent : 'transparent',
        }}
        onMouseDown={handleResizeStart}
        title={`Height: ${heightMultiplier}x (Drag to resize: 1x, 2x, 4x, or 6x)`}
      >
        <GripHorizontal
          size={16}
          style={{
            color: isResizing ? '#fff' : theme.textMuted,
          }}
        />
      </div>
    </div>
  );
});
