/**
 * Core type definitions for the ProjectFlow Gantt Chart
 */

// ==================== THEME TYPES ====================

export interface Theme {
  name: 'light' | 'dark';

  // Header & Navigation
  headerBg: string;
  headerText: string;
  subHeaderBg: string;

  // Sidebar
  sidebarBg: string;
  sidebarText: string;
  sidebarBorder: string;

  // Grid
  gridBg: string;
  gridAltBg: string;
  gridLine: string;
  cellHover: string;

  // Today Marker
  todayBg: string;
  todayBgLight: string;

  // Task Bars
  taskDefault: string;
  taskActive: string;
  taskComplete: string;

  // Milestones
  milestoneDefault: string;
  milestoneClient: string;
  milestoneDesign: string;

  // Accents
  accent: string;
  accentHover: string;
  danger: string;
  success: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Modal
  modalBg: string;
  inputBg: string;
  inputBorder: string;

  // Holidays
  holidayBg: string;
  holidayBorder: string;
  holidayText: string;
}

export type ThemeMode = 'light' | 'dark';

export interface Themes {
  light: Theme;
  dark: Theme;
}

// ==================== HOLIDAY TYPES ====================

export interface Holiday {
  name: string;
  type: 'bank' | 'public';
}

export interface HolidayWithDate extends Holiday {
  date: Date;
  dateStr: string;
}

export type PublicHolidays = Record<string, Holiday>;

// ==================== MILESTONE TYPES ====================

export type MilestoneTypeId = 'general' | 'client' | 'design';
export type MilestonePosition = 'boundary' | 'center';

export interface MilestoneType {
  id: MilestoneTypeId;
  name: string;
  color: string;
  position: MilestonePosition;
}

export type MilestoneTypes = Record<Uppercase<MilestoneTypeId>, MilestoneType>;

// ==================== TASK/BAR TYPES ====================

export interface TaskBar {
  id: number;
  startWeek: number;
  duration: number;
  name: string;
  notes: string;
  color: string;
}

export interface Milestone {
  id: number;
  week: number;
  name: string;
  notes: string;
  type: MilestoneTypeId;
}

// ==================== SWIMLANE TYPES ====================

export interface Swimlane {
  id: number;
  name: string;
  color: string;
  order: number;
  bars: TaskBar[];
  milestones: Milestone[];
  heightMultiplier?: number; // 1 (default), 2, 4, or 6
}

// ==================== COLOR PRESET TYPES ====================

export interface ColorPreset {
  name: string;
  color: string;
}

// ==================== CONFIG TYPES ====================

export interface Config {
  // Cell dimensions
  CELL_WIDTH: number;
  BAR_MARGIN: number;
  ROW_HEIGHT: number;
  HEADER_HEIGHT: number;
  SIDEBAR_WIDTH: number;

  // Milestone
  MILESTONE_OFFSET: number;

  // Timeline limits
  DEFAULT_WEEKS: number;
  MIN_WEEKS: number;
  MAX_WEEKS: number;

  // Task bar limits
  DEFAULT_BAR_DURATION: number;
  MIN_DURATION: number;
  MAX_DURATION: number;

  // Zoom limits
  MIN_SCALE: number;
  MAX_SCALE: number;
  DEFAULT_SCALE: number;
  ZOOM_STEP: number;
}

// ==================== PROJECT DATA TYPES ====================

export interface ProjectData {
  projectName: string;
  swimlanes: Swimlane[];
  totalWeeks: number;
  startDate: string;
  savedAt: string;
}

// ==================== EDITING STATE TYPES ====================

export interface EditingBarState {
  swimlaneId: number;
  barId: number;
}

export interface EditingMilestoneState {
  swimlaneId: number;
  milestoneId: number;
}

// ==================== COMPONENT PROP TYPES ====================

export interface WeekHeaderProps {
  weekIndex: number;
  startDate: Date;
  scale: number;
  isFirstOfMonth?: boolean;
  monthLabel?: string;
  theme?: Theme;
  showHolidays?: boolean;
}

export interface MonthHeadersProps {
  totalWeeks: number;
  startDate: Date;
  scale: number;
  theme?: Theme;
}

export interface TodayLineProps {
  startDate: Date;
  scale: number;
  totalWeeks: number;
  theme?: Theme;
}

export interface MilestoneDiamondProps {
  milestone: Milestone;
  scale: number;
  onClick?: () => void;
  theme?: Theme;
}

export interface TaskBarProps {
  bar: TaskBar;
  scale: number;
  onClick?: () => void;
  onDragMove?: (barId: number, newStart: number) => void;
  onDragResize?: (barId: number, newDuration: number) => void;
  totalWeeks: number;
  theme?: Theme;
}

export interface SwimlaneRowProps {
  swimlane: Swimlane;
  totalWeeks: number;
  onCellClick?: (weekIndex: number) => void;
  onCellDrop?: (e: React.DragEvent, weekIndex: number, type: string) => void;
  onBarClick?: (barId: number) => void;
  onMilestoneClick?: (milestoneId: number) => void;
  onBarDragMove?: (barId: number, newStart: number) => void;
  onBarDragResize?: (barId: number, newDuration: number) => void;
  onHeightChange?: (newMultiplier: number) => void;
  scale: number;
  isEven?: boolean;
  theme?: Theme;
  showHolidays?: boolean;
  startDate: Date;
}

export interface SidebarRowProps {
  swimlane: Swimlane;
  onEdit?: (name: string) => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isEven?: boolean;
  theme?: Theme;
}

export interface MilestoneSelectorProps {
  onSelect?: (type: MilestoneTypeId) => void;
  theme?: Theme;
}

export interface ModalProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  theme?: Theme;
}

export interface EditBarModalProps {
  bar: TaskBar | null;
  totalWeeks: number;
  onClose?: () => void;
  onUpdate?: (field: keyof TaskBar, value: string | number) => void;
  onDelete?: () => void;
  theme?: Theme;
}

export interface EditMilestoneModalProps {
  milestone: Milestone | null;
  totalWeeks: number;
  onClose?: () => void;
  onUpdate?: (field: keyof Milestone, value: string | number) => void;
  onDelete?: () => void;
  onCreateRecurring?: (milestone: Milestone, interval: number, count: number) => void;
  theme?: Theme;
}

export interface SettingsPanelProps {
  totalWeeks: number;
  startDate: Date;
  onUpdateWeeks?: (weeks: number) => void;
  onUpdateStartDate?: (date: Date) => void;
  onClose?: () => void;
  theme: Theme;
  onToggleTheme?: () => void;
  showHolidays: boolean;
  onToggleHolidays?: () => void;
}
