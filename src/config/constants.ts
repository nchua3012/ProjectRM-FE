import type { Config } from '@/types';

/**
 * Application-wide configuration constants
 */
export const CONFIG: Readonly<Config> = Object.freeze({
  // Cell dimensions
  CELL_WIDTH: 80,
  BAR_MARGIN: 2,
  ROW_HEIGHT: 52,
  HEADER_HEIGHT: 64,
  SIDEBAR_WIDTH: 256,

  // Milestone
  MILESTONE_OFFSET: 14,

  // Timeline limits
  DEFAULT_WEEKS: 24,
  MIN_WEEKS: 4,
  MAX_WEEKS: 52,

  // Task bar limits
  DEFAULT_BAR_DURATION: 2,
  MIN_DURATION: 1,
  MAX_DURATION: 20,

  // Zoom limits
  MIN_SCALE: 0.3,
  MAX_SCALE: 1.5,
  DEFAULT_SCALE: 1,
  ZOOM_STEP: 0.1,
});

/**
 * Swimlane height configuration
 * Allows for modular height adjustments (1x, 2x, 4x, 6x base height)
 */
export const HEIGHT_CONFIG = Object.freeze({
  MULTIPLIERS: [1, 2, 4, 6] as const,
  DEFAULT_MULTIPLIER: 1,
  RESIZE_HANDLE_HEIGHT: 8, // Height of the draggable resize handle
});

/**
 * Timeline header heights for alignment
 */
export const HEADER_HEIGHTS = Object.freeze({
  MONTH_HEADER: 36, // MonthHeaders row height
  WEEK_HEADER: 44,  // WeekHeaders row height
  get TOTAL() {
    return this.MONTH_HEADER + this.WEEK_HEADER;
  },
});

/**
 * Sidebar configuration for resizable width
 */
export const SIDEBAR_CONFIG = Object.freeze({
  DEFAULT_WIDTH: 256,
  MIN_WIDTH: 60,   // Minimum collapsed width (just shows color bars)
  MAX_WIDTH: 400,  // Maximum expanded width
  RESIZE_HANDLE_WIDTH: 6, // Width of the draggable resize handle
});
