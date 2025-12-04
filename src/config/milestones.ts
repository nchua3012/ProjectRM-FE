import type { MilestoneTypes, ColorPreset } from '@/types';

/**
 * Milestone type definitions
 */
export const MILESTONE_TYPES: Readonly<MilestoneTypes> = Object.freeze({
  GENERAL: {
    id: 'general',
    name: 'General Milestone',
    color: '#d97706',
    position: 'boundary', // Straddles week boundary
  },
  CLIENT: {
    id: 'client',
    name: 'Client Meeting',
    color: '#dc2626',
    position: 'center', // Center of cell
  },
  DESIGN: {
    id: 'design',
    name: 'Design Team Meeting',
    color: '#2563eb',
    position: 'center',
  },
});

/**
 * Task colour presets - muted, professional
 */
export const TASK_COLOR_PRESETS: readonly ColorPreset[] = Object.freeze([
  { name: 'Amber', color: '#d97706' },
  { name: 'Gold', color: '#ca8a04' },
  { name: 'Orange', color: '#ea580c' },
  { name: 'Stone', color: '#78716c' },
  { name: 'Slate', color: '#64748b' },
  { name: 'Grey', color: '#6b7280' },
  { name: 'Red', color: '#dc2626' },
  { name: 'Rose', color: '#e11d48' },
  { name: 'Green', color: '#16a34a' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Teal', color: '#0d9488' },
  { name: 'Blue', color: '#2563eb' },
  { name: 'Indigo', color: '#4f46e5' },
  { name: 'Violet', color: '#7c3aed' },
  { name: 'Purple', color: '#9333ea' },
  { name: 'Fuchsia', color: '#c026d3' },
  { name: 'Pink', color: '#db2777' },
  { name: 'Cyan', color: '#0891b2' },
]);
