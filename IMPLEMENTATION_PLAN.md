# Implementation Plan: View Modes & Task Dependencies

## Overview

This document outlines the implementation plan for adding two key features to ProjectFlow:

1. **Multiple View Modes** - Day, Week (current), Month, Year views
2. **Task Dependencies** - Arrow connections between tasks with visual indicators

**Estimated Total Effort:** 6-8 weeks

---

## Table of Contents

1. [Feature 1: Multiple View Modes](#feature-1-multiple-view-modes)
2. [Feature 2: Task Dependencies](#feature-2-task-dependencies)
3. [Implementation Phases](#implementation-phases)
4. [Technical Details](#technical-details)
5. [Files to Modify](#files-to-modify)

---

## Feature 1: Multiple View Modes

### Current State
- Week-based timeline only
- Cell width: 80px (scaled by zoom 0.3-1.5)
- Date utilities assume week granularity
- `startWeek` and `duration` are week-indexed integers

### Target State
- Four view modes: Day, Week, Month, Year
- Dynamic cell width per view mode
- Seamless transitions between views
- Maintain all existing features in each view

### View Mode Specifications

| View Mode | Cell Represents | Default Cell Width | Header Format | Use Case |
|-----------|-----------------|-------------------|---------------|----------|
| **Day** | 1 day | 40px | "Mon 01" | Detailed daily planning |
| **Week** | 1 week | 80px (current) | "01 Jan" | Standard view |
| **Month** | 1 month | 120px | "Jan 2025" | Quarterly overview |
| **Year** | 1 year | 150px | "2025" | Multi-year roadmap |

### Data Model Changes

```typescript
// New type for view modes
type ViewMode = 'day' | 'week' | 'month' | 'year';

// Update CONFIG to include view mode settings
interface ViewModeConfig {
  cellWidth: number;
  headerFormat: string;
  subHeaderFormat?: string;
  unitsPerWeek: number;  // For conversion: day=7, week=1, month=0.25, year=1/52
}

// TaskBar changes - store dates instead of week indices
interface TaskBar {
  id: number;
  startDate: string;      // 'YYYY-MM-DD' - NEW (replaces startWeek)
  endDate: string;        // 'YYYY-MM-DD' - NEW (replaces duration)
  // ... existing fields remain

  // Computed (not stored)
  // startWeek, duration derived from dates + view mode
}
```

### Implementation Tasks

#### Phase 1A: Data Model Migration (Week 1)

- [ ] **1.1** Add `ViewMode` type to `src/types/index.ts`
- [ ] **1.2** Add `ViewModeConfig` interface and configurations to `src/config/constants.ts`
- [ ] **1.3** Update `TaskBar` interface to use `startDate`/`endDate` strings
- [ ] **1.4** Create migration utility to convert existing `startWeek`/`duration` to dates
- [ ] **1.5** Update `DataFactory.createBar()` to accept dates
- [ ] **1.6** Add `viewMode` state to `GanttChart.tsx`

#### Phase 1B: Date Utility Updates (Week 1-2)

- [ ] **1.7** Create `src/utils/viewModeUtils.ts` with:
  - `getUnitsInRange(startDate, endDate, viewMode)` - count cells needed
  - `getUnitStartDate(date, viewMode)` - snap to unit boundary
  - `addUnits(date, count, viewMode)` - add days/weeks/months/years
  - `getPositionInUnit(date, viewMode)` - fractional position (0-1)
  - `dateToCellIndex(date, timelineStart, viewMode)` - convert date to cell
  - `cellIndexToDate(index, timelineStart, viewMode)` - convert cell to date
- [ ] **1.8** Update `calculateTodayPosition()` to be view-mode aware
- [ ] **1.9** Update `getWeekLabel()` → `getCellLabel(date, viewMode)`
- [ ] **1.10** Update `getMonthLabel()` to work with all view modes

#### Phase 1C: Component Updates (Week 2-3)

- [ ] **1.11** Update `WeekHeader.tsx` → `CellHeader.tsx`
  - Rename component
  - Accept `viewMode` prop
  - Render appropriate label format
- [ ] **1.12** Update `MonthHeaders.tsx`
  - Group headers dynamically based on view mode
  - Day view: show weeks, Week view: show months, Month view: show quarters/years
- [ ] **1.13** Update `TaskBar.tsx`
  - Calculate `left` and `width` from dates + viewMode
  - Handle fractional positioning in day view
- [ ] **1.14** Update `MilestoneDiamond.tsx`
  - Position based on date + viewMode
- [ ] **1.15** Update `SwimlaneRow.tsx`
  - Pass viewMode to children
  - Update cell click handling for date calculation
- [ ] **1.16** Update `TodayLine.tsx`
  - Position calculation per view mode

#### Phase 1D: UI Controls (Week 3)

- [ ] **1.17** Create `ViewModeSelector.tsx` component
  ```typescript
  // Segmented control with Day | Week | Month | Year
  interface ViewModeSelectorProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
    theme: Theme;
  }
  ```
- [ ] **1.18** Add ViewModeSelector to header in `GanttChart.tsx`
- [ ] **1.19** Update zoom controls to work with view mode
- [ ] **1.20** Add keyboard shortcuts (D, W, M, Y for view modes)

#### Phase 1E: Polish & Edge Cases (Week 3-4)

- [ ] **1.21** Handle view mode transitions (smooth scroll position)
- [ ] **1.22** Update drag/drop calculations for all view modes
- [ ] **1.23** Update resize calculations for all view modes
- [ ] **1.24** Test holiday highlighting in day view
- [ ] **1.25** Update grayscale/split bar logic for date-based calculations
- [ ] **1.26** Update save/load to persist viewMode preference
- [ ] **1.27** Comprehensive testing across all view modes

---

## Feature 2: Task Dependencies

### Current State
- Tasks are independent entities
- No visual connections between tasks
- No dependency validation

### Target State
- Tasks can depend on other tasks (finish-to-start)
- SVG arrows connect dependent tasks
- Visual feedback for dependency chains
- Circular dependency prevention
- Cross-swimlane dependencies supported

### Dependency Types

| Type | Abbreviation | Meaning | Visual |
|------|--------------|---------|--------|
| Finish-to-Start | FS | B starts when A finishes | A ──→ B |
| Start-to-Start | SS | B starts when A starts | (future) |
| Finish-to-Finish | FF | B finishes when A finishes | (future) |
| Start-to-Finish | SF | B finishes when A starts | (future) |

**Initial Implementation:** Finish-to-Start (FS) only - most common type

### Data Model Changes

```typescript
// New dependency type
interface TaskDependency {
  fromTaskId: string;      // "{swimlaneId}-{barId}" format
  toTaskId: string;        // "{swimlaneId}-{barId}" format
  type: 'FS';              // Finish-to-Start (expandable later)
}

// Update TaskBar to reference dependencies
interface TaskBar {
  // ... existing fields
  dependencies?: string[]; // Array of "{swimlaneId}-{barId}" task IDs this depends on
}

// Global dependency state (alternative to storing in tasks)
// Store at project level for easier cross-swimlane management
interface ProjectData {
  // ... existing fields
  dependencies: TaskDependency[];
}
```

### Implementation Tasks

#### Phase 2A: Data Model & State (Week 4)

- [ ] **2.1** Add `TaskDependency` interface to `src/types/index.ts`
- [ ] **2.2** Add `dependencies` field to `TaskBar` interface
- [ ] **2.3** Add `dependencies` array to project state in `GanttChart.tsx`
- [ ] **2.4** Create `generateTaskId(swimlaneId, barId)` utility
- [ ] **2.5** Create `parseTaskId(taskId)` utility
- [ ] **2.6** Update `DataFactory.createBar()` with empty dependencies
- [ ] **2.7** Add dependency operations to `GanttChart.tsx`:
  - `addDependency(fromId, toId)`
  - `removeDependency(fromId, toId)`
  - `getDependenciesForTask(taskId)`
  - `getDependentsOfTask(taskId)`

#### Phase 2B: Dependency Validation (Week 4-5)

- [ ] **2.8** Create `src/utils/dependencyUtils.ts` with:
  - `detectCircularDependency(dependencies, newDep)` - returns boolean
  - `getTaskOrder(dependencies)` - topological sort
  - `validateDependency(fromTask, toTask)` - check if valid
  - `getEarliestStartDate(taskId, dependencies, tasks)` - based on deps
- [ ] **2.9** Add validation when creating dependencies
- [ ] **2.10** Show error toast for invalid dependencies

#### Phase 2C: Arrow Rendering (Week 5-6)

- [ ] **2.11** Create `src/components/timeline/DependencyArrows.tsx`
  ```typescript
  interface DependencyArrowsProps {
    dependencies: TaskDependency[];
    swimlanes: Swimlane[];
    scale: number;
    viewMode: ViewMode;
    timelineStart: Date;
    theme: Theme;
  }
  ```
- [ ] **2.12** Implement SVG path calculation:
  - Get source task end position (right edge, vertical center)
  - Get target task start position (left edge, vertical center)
  - Calculate bezier curve path with proper routing
  - Handle same-swimlane vs cross-swimlane arrows
- [ ] **2.13** Add arrow styling:
  - Color based on theme
  - Arrowhead marker
  - Hover highlight
  - Selected state
- [ ] **2.14** Position SVG layer correctly in timeline
- [ ] **2.15** Handle arrows for collapsed/expanded swimlanes

#### Phase 2D: Dependency Creation UI (Week 6-7)

- [ ] **2.16** Add "Link" mode to toolbar
  ```typescript
  type InteractionMode = 'select' | 'link';
  ```
- [ ] **2.17** Implement dependency creation flow:
  1. User clicks "Link" button (enters link mode)
  2. User clicks source task (highlights it)
  3. User clicks target task (creates dependency)
  4. Exit link mode
- [ ] **2.18** Add visual feedback during linking:
  - Source task highlight
  - Temporary line following cursor
  - Valid/invalid target indication
- [ ] **2.19** Add right-click context menu on tasks:
  - "Add dependency from..."
  - "Add dependency to..."
  - "Remove dependencies"
- [ ] **2.20** Update `EditBarModal.tsx` with dependency section:
  - List current dependencies
  - Remove dependency button
  - "Add dependency" dropdown

#### Phase 2E: Dependency Interaction (Week 7)

- [ ] **2.21** Click on arrow to select dependency
- [ ] **2.22** Delete key to remove selected dependency
- [ ] **2.23** Hover on arrow shows tooltip with task names
- [ ] **2.24** Click on task highlights all its dependencies
- [ ] **2.25** Optional: Drag task auto-adjusts dependents (cascade mode)

#### Phase 2F: Polish & Edge Cases (Week 7-8)

- [ ] **2.26** Handle task deletion (remove associated dependencies)
- [ ] **2.27** Handle swimlane deletion (remove dependencies for tasks)
- [ ] **2.28** Update save/load for dependencies
- [ ] **2.29** Performance optimization for many dependencies
- [ ] **2.30** Arrow routing to avoid overlapping tasks
- [ ] **2.31** Keyboard navigation for dependencies
- [ ] **2.32** Comprehensive testing

---

## Implementation Phases

### Phase Overview

```
Week 1    Week 2    Week 3    Week 4    Week 5    Week 6    Week 7    Week 8
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ VIEW MODES                            │ TASK DEPENDENCIES                     │
│ ┌─────────────────────────────────┐   │ ┌─────────────────────────────────────┤
│ │ 1A: Data Model Migration        │   │ │ 2A: Data Model & State              │
│ │ 1B: Date Utilities        ──────┼───┤ │ 2B: Validation           ───────────┤
│ │ 1C: Component Updates     ──────┼───┤ │ 2C: Arrow Rendering      ───────────┤
│ │ 1D: UI Controls                 │   │ │ 2D: Creation UI          ───────────┤
│ │ 1E: Polish                      │   │ │ 2E: Interaction                     │
│ └─────────────────────────────────┘   │ │ 2F: Polish                          │
│                                       │ └─────────────────────────────────────┘
```

### Milestones

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| M1 | End of Week 2 | View modes working (Day/Week/Month/Year) |
| M2 | End of Week 4 | View modes polished, Dependencies data model ready |
| M3 | End of Week 6 | Dependency arrows rendering |
| M4 | End of Week 8 | Full dependency management UI complete |

### Dependencies Between Features

```
View Modes ────────────────────┐
    │                          │
    ▼                          ▼
Date-based positioning ───► Arrow position calculations
    │                          │
    ▼                          ▼
Cell calculations ────────► Dependency validation
```

**Note:** View Modes should be implemented first as Dependencies rely on date-based positioning.

---

## Technical Details

### View Mode Cell Width Calculations

```typescript
// src/config/constants.ts
export const VIEW_MODE_CONFIG: Record<ViewMode, ViewModeConfig> = {
  day: {
    cellWidth: 40,
    headerFormat: 'EEE dd',      // "Mon 01"
    subHeaderFormat: 'MMM yyyy', // "Jan 2025"
    snapUnit: 'day',
  },
  week: {
    cellWidth: 80,
    headerFormat: 'dd MMM',      // "01 Jan"
    subHeaderFormat: 'MMM yy',   // "Jan 25"
    snapUnit: 'week',
  },
  month: {
    cellWidth: 120,
    headerFormat: 'MMM',         // "Jan"
    subHeaderFormat: 'yyyy',     // "2025"
    snapUnit: 'month',
  },
  year: {
    cellWidth: 150,
    headerFormat: 'yyyy',        // "2025"
    subHeaderFormat: null,
    snapUnit: 'year',
  },
};
```

### Arrow Path Calculation

```typescript
// src/utils/dependencyUtils.ts
export function calculateArrowPath(
  fromTask: { x: number; y: number; width: number; height: number },
  toTask: { x: number; y: number; width: number; height: number },
  options: { curveRadius: number }
): string {
  const startX = fromTask.x + fromTask.width;  // Right edge of source
  const startY = fromTask.y + fromTask.height / 2;  // Vertical center

  const endX = toTask.x;  // Left edge of target
  const endY = toTask.y + toTask.height / 2;  // Vertical center

  const midX = (startX + endX) / 2;

  // Bezier curve for smooth connection
  return `M ${startX} ${startY}
          C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}
```

### Circular Dependency Detection

```typescript
// src/utils/dependencyUtils.ts
export function detectCircularDependency(
  dependencies: TaskDependency[],
  newDep: TaskDependency
): boolean {
  const graph = buildDependencyGraph([...dependencies, newDep]);
  return hasCycle(graph, newDep.toTaskId, new Set());
}

function hasCycle(
  graph: Map<string, string[]>,
  current: string,
  visited: Set<string>
): boolean {
  if (visited.has(current)) return true;
  visited.add(current);

  const dependsOn = graph.get(current) || [];
  for (const dep of dependsOn) {
    if (hasCycle(graph, dep, new Set(visited))) return true;
  }

  return false;
}
```

---

## Files to Modify

### New Files

| File | Purpose |
|------|---------|
| `src/utils/viewModeUtils.ts` | View mode date calculations |
| `src/utils/dependencyUtils.ts` | Dependency validation and graph utilities |
| `src/components/controls/ViewModeSelector.tsx` | View mode toggle UI |
| `src/components/timeline/DependencyArrows.tsx` | SVG arrow rendering |
| `src/components/timeline/DependencyLine.tsx` | Single arrow component |

### Modified Files

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add ViewMode, TaskDependency, update TaskBar |
| `src/config/constants.ts` | Add VIEW_MODE_CONFIG |
| `src/factories/dataFactory.ts` | Update createBar for dates |
| `src/utils/dateUtils.ts` | Update for view mode awareness |
| `src/utils/index.ts` | Export new utilities |
| `src/components/GanttChart.tsx` | Add viewMode state, dependency operations |
| `src/components/timeline/TaskBar.tsx` | Date-based positioning |
| `src/components/timeline/SwimlaneRow.tsx` | Pass viewMode, render arrows |
| `src/components/timeline/WeekHeader.tsx` | Rename to CellHeader, dynamic labels |
| `src/components/timeline/MonthHeaders.tsx` | Dynamic grouping |
| `src/components/timeline/TodayLine.tsx` | View mode positioning |
| `src/components/timeline/MilestoneDiamond.tsx` | Date-based positioning |
| `src/components/modals/EditBarModal.tsx` | Add dependency section |
| `src/components/modals/SettingsPanel.tsx` | Add view mode setting |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing week-based logic | Create adapter functions, extensive testing |
| Performance with many arrows | SVG optimization, virtualization if needed |
| Complex arrow routing | Start simple (straight/bezier), iterate |
| Date timezone issues | Use date-fns with consistent timezone handling |
| State complexity with dependencies | Consider using a graph library (graphlib) |

---

## Success Criteria

### View Modes
- [ ] Can switch between Day/Week/Month/Year views
- [ ] Tasks display correctly in all views
- [ ] Drag/drop works in all views
- [ ] Today marker positions correctly
- [ ] Zoom works with all view modes
- [ ] No regression in existing features

### Dependencies
- [ ] Can create dependencies between tasks
- [ ] Arrows render correctly (same and cross-swimlane)
- [ ] Circular dependencies prevented
- [ ] Can delete dependencies
- [ ] Dependencies persist in save/load
- [ ] Visual feedback during dependency creation

---

*Document created: December 2025*
*Target completion: 8 weeks from start*
