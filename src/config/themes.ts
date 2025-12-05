import type { Themes } from '@/types';

/**
 * Theme definitions for light and dark modes
 */
export const THEMES: Readonly<Themes> = Object.freeze({
  light: Object.freeze({
    name: 'light' as const,

    // Header & Navigation
    headerBg: '#374151',
    headerText: '#ffffff',
    subHeaderBg: '#4b5563',

    // Sidebar
    sidebarBg: '#1f2937',
    sidebarText: '#f3f4f6',
    sidebarBorder: '#374151',

    // Grid
    gridBg: '#ffffff',
    gridAltBg: '#f9fafb',
    gridLine: '#e5e7eb',
    cellHover: '#f3f4f6',

    // Today Marker
    todayBg: '#10b981',
    todayBgLight: 'rgba(16, 185, 129, 0.15)',

    // Task Bars - Muted professional tones
    taskDefault: '#d97706', // Amber/gold
    taskActive: '#f59e0b', // Lighter amber
    taskComplete: '#6b7280', // Grey for completed

    // Milestones
    milestoneDefault: '#d97706', // Amber diamond
    milestoneClient: '#dc2626', // Red for client
    milestoneDesign: '#2563eb', // Blue for design

    // Accents
    accent: '#d97706', // Amber accent
    accentHover: '#b45309',
    danger: '#dc2626',
    success: '#10b981',

    // Text
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',

    // Modal
    modalBg: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#e5e7eb',

    // Holidays
    holidayBg: 'rgba(156, 163, 175, 0.15)',
    holidayBorder: '#9ca3af',
    holidayText: '#6b7280',
  }),

  dark: Object.freeze({
    name: 'dark' as const,

    // Header & Structure
    headerBg: '#000000', // Pure black
    headerText: '#f9fafb',
    subHeaderBg: '#141414', // Very dark grey

    // Sidebar
    sidebarBg: '#000000', // Pure black
    sidebarText: '#e5e7eb',
    sidebarBorder: '#262626',

    // Grid & Background
    gridBg: '#0a0a0a', // Near black
    gridAltBg: '#141414', // Very dark grey rows
    gridLine: '#262626',
    cellHover: '#1a1a1a',

    // Today Marker
    todayBg: '#10b981', // Green (same)
    todayBgLight: 'rgba(16, 185, 129, 0.2)',

    // Task Bars - Slightly brighter for contrast
    taskDefault: '#f59e0b', // Brighter amber
    taskActive: '#fbbf24', // Even brighter
    taskComplete: '#9ca3af', // Lighter grey

    // Milestones
    milestoneDefault: '#f59e0b', // Brighter amber
    milestoneClient: '#ef4444', // Brighter red
    milestoneDesign: '#3b82f6', // Brighter blue

    // Accents
    accent: '#f59e0b', // Brighter amber
    accentHover: '#d97706',
    danger: '#ef4444',
    success: '#10b981',

    // Text
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#737373',

    // Modal
    modalBg: '#141414',
    inputBg: '#0a0a0a',
    inputBorder: '#262626',

    // Holidays
    holidayBg: 'rgba(115, 115, 115, 0.15)',
    holidayBorder: '#737373',
    holidayText: '#d1d5db',
  }),
});
