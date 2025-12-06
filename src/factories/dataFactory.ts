import type { Swimlane, TaskBar, Milestone, MilestoneTypeId } from '@/types';
import { CONFIG, TASK_COLOR_PRESETS, MILESTONE_TYPES } from '@/config';

/**
 * Factory functions for creating data objects
 */
export const DataFactory = {
  /**
   * Create a new swimlane
   */
  createSwimlane(id: number, name?: string, order?: number): Swimlane {
    return {
      id,
      name: name || `Workstream ${id}`,
      color: TASK_COLOR_PRESETS[0].color,
      order: typeof order === 'number' ? order : 0,
      bars: [],
      milestones: [],
    };
  },

  /**
   * Create a new task bar
   */
  createBar(id: number, weekIndex: number, color: string = TASK_COLOR_PRESETS[0].color): TaskBar {
    return {
      id,
      startWeek: Math.max(0, weekIndex),
      duration: CONFIG.DEFAULT_BAR_DURATION,
      name: 'New Task',
      notes: '',
      color: color || TASK_COLOR_PRESETS[0].color,
      completed: false,           // Track if task is finished
      ignoreGrayscale: false,     // Override for incomplete past tasks
      verticalAlign: 'middle',    // Default to middle alignment
    };
  },

  /**
   * Create a new milestone
   */
  createMilestone(id: number, weekIndex: number, type: MilestoneTypeId = 'general'): Milestone {
    const milestoneType = MILESTONE_TYPES[type?.toUpperCase() as keyof typeof MILESTONE_TYPES];
    return {
      id,
      week: Math.max(1, weekIndex + 1),
      name: milestoneType?.name || 'New Milestone',
      notes: '',
      type: type || 'general',
    };
  },
};
