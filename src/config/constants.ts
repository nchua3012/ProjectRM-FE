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
