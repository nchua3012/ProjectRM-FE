import { CONFIG } from '@/config';

/**
 * Calculate scaled cell width based on zoom level
 * @param scale - Current zoom scale
 * @returns Scaled cell width in pixels
 */
export function getScaledCellWidth(scale: number): number {
  return Math.round(CONFIG.CELL_WIDTH * (scale || 1));
}

/**
 * Clamp a value between min and max bounds
 * @param value - Value to clamp
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique ID based on existing IDs
 * @param items - Array of items with id property
 * @returns New unique ID
 */
export function generateId<T extends { id: number }>(items: T[]): number {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
}
