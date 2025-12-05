import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TaskBarProps } from '@/types';
import { CONFIG, THEMES } from '@/config';
import { getScaledCellWidth, clamp } from '@/utils';

interface DragState {
  x: number;
  startWeek: number;
  duration: number;
}

/**
 * Task Bar Component with Drag Support
 * Displays a task bar that can be moved and resized
 */
export const TaskBar = React.memo(function TaskBar({
  bar,
  scale,
  onClick,
  onDragMove,
  onDragResize,
  totalWeeks,
  theme = THEMES.light,
  currentWeekIndex = -1,
}: TaskBarProps) {
  const cellWidth = getScaledCellWidth(scale);
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<DragState>({ x: 0, startWeek: 0, duration: 0 });

  const left = bar.startWeek * cellWidth + CONFIG.BAR_MARGIN;
  const width = bar.duration * cellWidth - CONFIG.BAR_MARGIN * 2;

  // Determine if bar is in the past (ends before current week)
  const barEndWeek = bar.startWeek + bar.duration;
  const isPast = currentWeekIndex >= 0 && barEndWeek <= currentWeekIndex;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: 'move' | 'resize') => {
      e.stopPropagation();
      e.preventDefault();

      dragStartRef.current = {
        x: e.clientX,
        startWeek: bar.startWeek,
        duration: bar.duration,
      };

      if (type === 'move') {
        setIsDragging(true);
      } else {
        setIsResizing(true);
      }
    },
    [bar.startWeek, bar.duration]
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaWeeks = Math.round(deltaX / cellWidth);

      if (isDragging && typeof onDragMove === 'function') {
        const newStart = clamp(
          dragStartRef.current.startWeek + deltaWeeks,
          0,
          totalWeeks - bar.duration
        );
        onDragMove(bar.id, newStart);
      } else if (isResizing && typeof onDragResize === 'function') {
        const newDuration = clamp(
          dragStartRef.current.duration + deltaWeeks,
          CONFIG.MIN_DURATION,
          Math.min(CONFIG.MAX_DURATION, totalWeeks - bar.startWeek)
        );
        onDragResize(bar.id, newDuration);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    cellWidth,
    bar.id,
    bar.duration,
    bar.startWeek,
    totalWeeks,
    onDragMove,
    onDragResize,
  ]);

  // Avoid unused variable warning
  void barRef;

  return (
    <div
      className="absolute flex items-center rounded cursor-pointer transition-shadow group"
      style={{
        left,
        width: Math.max(width, 20),
        top: '50%',
        transform: 'translateY(-50%)',
        height: 28,
        backgroundColor: bar.color || theme.taskDefault,
        boxShadow:
          isDragging || isResizing
            ? '0 4px 12px rgba(0,0,0,0.25)'
            : '0 1px 3px rgba(0,0,0,0.15)',
        zIndex: isDragging || isResizing ? 30 : 10,
        opacity: isDragging || isResizing ? 0.9 : isPast ? 0.7 : 1,
        filter: isPast ? 'grayscale(100%)' : 'none',
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onClick={(e) => {
        if (!isDragging && !isResizing && typeof onClick === 'function') {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {/* Bar content */}
      <div className="flex-1 px-2 truncate text-xs font-medium text-white select-none">
        {width > 60 ? bar.name : ''}
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
        onMouseDown={(e) => handleMouseDown(e, 'resize')}
      />
    </div>
  );
});
