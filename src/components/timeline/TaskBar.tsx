import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TaskBarProps, VerticalAlign } from '@/types';
import { CONFIG, THEMES } from '@/config';
import { getScaledCellWidth, clamp, shouldApplyGrayscale, doesBarSpanToday } from '@/utils';

interface DragState {
  x: number;
  startWeek: number;
  duration: number;
}

/**
 * Get vertical position styles based on alignment
 */
function getVerticalPosition(align: VerticalAlign): { top: string; transform: string } {
  switch (align) {
    case 'top':
      return { top: '8px', transform: 'none' };
    case 'bottom':
      return { top: 'calc(100% - 8px)', transform: 'translateY(-100%)' };
    case 'middle':
    default:
      return { top: '50%', transform: 'translateY(-50%)' };
  }
}

/**
 * Task Bar Component with Drag Support
 * Displays a task bar that can be moved and resized
 * Supports visual split for bars spanning today with grayscale past portion
 * Supports vertical alignment (top, middle, bottom) within swimlane
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
  todayPosition,
}: TaskBarProps) {
  const cellWidth = getScaledCellWidth(scale);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<DragState>({ x: 0, startWeek: 0, duration: 0 });
  const hasDraggedRef = useRef(false); // Track if actual movement occurred

  const left = bar.startWeek * cellWidth + CONFIG.BAR_MARGIN;
  const width = bar.duration * cellWidth - CONFIG.BAR_MARGIN * 2;

  // Get vertical position based on alignment (default to middle)
  const verticalAlign = bar.verticalAlign || 'middle';
  const { top: verticalTop, transform: verticalTransform } = getVerticalPosition(verticalAlign);

  // Determine if bar is in the past (ends before current week) - using old logic as fallback
  const barEndWeek = bar.startWeek + bar.duration;
  const isPastLegacy = currentWeekIndex >= 0 && barEndWeek <= currentWeekIndex;

  // New logic for grayscale and split bars
  const spansToday = doesBarSpanToday(bar, todayPosition ?? null);
  const fullyPast = todayPosition && barEndWeek <= todayPosition.totalWeeks;
  const shouldGrayscale = shouldApplyGrayscale(bar, todayPosition ?? null);
  const isOverdue = fullyPast && !bar.completed && !bar.ignoreGrayscale;

  // Fall back to legacy logic if todayPosition is not available
  const applyGrayscale = todayPosition ? shouldGrayscale : isPastLegacy;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: 'move' | 'resize') => {
      e.stopPropagation();
      e.preventDefault();

      dragStartRef.current = {
        x: e.clientX,
        startWeek: bar.startWeek,
        duration: bar.duration,
      };
      hasDraggedRef.current = false; // Reset drag tracking

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

      // Mark as dragged if there's any significant movement
      if (Math.abs(deltaX) > 3) {
        hasDraggedRef.current = true;
      }

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

  // Render split bar if it spans today and is not completed
  if (spansToday && todayPosition && !bar.completed) {
    const splitPoint = todayPosition.totalWeeks - bar.startWeek;
    const pastWidth = (splitPoint / bar.duration) * width;
    const futureWidth = width - pastWidth;
    const futureLeft = left + pastWidth;

    return (
      <>
        {/* Past portion (potentially grayscale) */}
        <div
          className="absolute flex items-center rounded-l cursor-pointer transition-shadow group"
          style={{
            left,
            width: Math.max(pastWidth, 10),
            top: verticalTop,
            transform: verticalTransform,
            height: 28,
            backgroundColor: bar.color || theme.taskDefault,
            boxShadow:
              isDragging || isResizing
                ? '0 4px 12px rgba(0,0,0,0.25)'
                : '0 1px 3px rgba(0,0,0,0.15)',
            zIndex: isDragging || isResizing ? 30 : 10,
            opacity: isDragging || isResizing ? 0.9 : bar.ignoreGrayscale ? 1 : 0.6,
            filter: bar.ignoreGrayscale ? 'none' : 'grayscale(100%)',
            pointerEvents: 'auto',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            boxDecorationBreak: 'clone',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
          onClick={(e) => {
            if (!hasDraggedRef.current && typeof onClick === 'function') {
              e.stopPropagation();
              onClick();
            }
          }}
        >
          {/* Bar content */}
          <div className="flex-1 px-2 truncate text-xs font-medium text-white select-none">
            {pastWidth > 60 ? bar.name : ''}
          </div>
        </div>

        {/* Future portion (full color) */}
        <div
          className="absolute flex items-center rounded-r cursor-pointer transition-shadow group"
          style={{
            left: futureLeft,
            width: Math.max(futureWidth, 10),
            top: verticalTop,
            transform: verticalTransform,
            height: 28,
            backgroundColor: bar.color || theme.taskDefault,
            boxShadow:
              isDragging || isResizing
                ? '0 4px 12px rgba(0,0,0,0.25)'
                : '0 1px 3px rgba(0,0,0,0.15)',
            zIndex: isDragging || isResizing ? 30 : 10,
            opacity: isDragging || isResizing ? 0.9 : 1,
            pointerEvents: 'auto',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
          onClick={(e) => {
            if (!hasDraggedRef.current && typeof onClick === 'function') {
              e.stopPropagation();
              onClick();
            }
          }}
        >
          {/* Bar content */}
          <div className="flex-1 px-2 truncate text-xs font-medium text-white select-none">
            {futureWidth > 60 && pastWidth <= 60 ? bar.name : ''}
          </div>

          {/* Resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
          />
        </div>
      </>
    );
  }

  // Regular single bar (not spanning today or completed)
  return (
    <div
      className="absolute flex items-center rounded cursor-pointer transition-shadow group"
      style={{
        left,
        width: Math.max(width, 20),
        top: verticalTop,
        transform: verticalTransform,
        height: 28,
        backgroundColor: bar.color || theme.taskDefault,
        boxShadow:
          isDragging || isResizing
            ? '0 4px 12px rgba(0,0,0,0.25)'
            : '0 1px 3px rgba(0,0,0,0.15)',
        zIndex: isDragging || isResizing ? 30 : 10,
        opacity: isDragging || isResizing ? 0.9 : applyGrayscale ? 0.6 : 1,
        filter: applyGrayscale ? 'grayscale(100%)' : 'none',
        pointerEvents: 'auto',
        outline: isOverdue ? '2px solid #ef4444' : 'none',
        outlineOffset: isOverdue ? '1px' : '0',
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onClick={(e) => {
        if (!hasDraggedRef.current && typeof onClick === 'function') {
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
