import type { Themes } from '@/types';

/**
 * Theme definitions for light and dark modes
 */
export const THEMES: Readonly<Themes> = Object.freeze({
  light: Object.freeze({
    name: 'light' as const,

    // Header & Navigation - Off-white with grey text (Frappe style)
    headerBg: '#f8f8f8',
    headerText: '#383838',
    subHeaderBg: '#ededed',

    // Sidebar - Light grey
    sidebarBg: '#f8f8f8',
    sidebarText: '#525252',
    sidebarBorder: '#dedede',

    // Grid - Off-white
    gridBg: '#ffffff',
    gridAltBg: '#fafafa',
    gridLine: '#ededed',
    cellHover: '#f5f5f5',

    // Today Marker
    todayBg: '#525252',
    todayBgLight: 'rgba(82, 82, 82, 0.1)',

    // Task Bars - Muted professional tones
    taskDefault: '#525252', // Grey default
    taskActive: '#383838', // Darker grey
    taskComplete: '#b0b0b0', // Light grey for completed

    // Milestones
    milestoneDefault: '#d97706', // Amber diamond
    milestoneClient: '#dc2626', // Red for client
    milestoneDesign: '#2563eb', // Blue for design

    // Accents
    accent: '#171717', // Dark accent
    accentHover: '#383838',
    danger: '#dc2626',
    success: '#10b981',

    // Text - Grey tones
    textPrimary: '#383838',
    textSecondary: '#525252',
    textMuted: '#7c7c7c',

    // Modal - Off-white
    modalBg: '#ffffff',
    inputBg: '#fafafa',
    inputBorder: '#dedede',

    // Holidays
    holidayBg: 'rgba(156, 163, 175, 0.1)',
    holidayBorder: '#c9c9c9',
    holidayText: '#7c7c7c',
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
