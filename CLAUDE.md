# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProjectRM-FE (ProjectFlow) is a Gantt chart application for project timeline management. It's a React + TypeScript + Vite application using Tailwind CSS for styling.

**Key Features:**
- Drag & drop task bars and milestones across swimlanes
- Recurring milestone creation
- Light/dark theme support
- UK public holiday highlighting
- Zoom controls for timeline
- Today indicator line

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Path Aliases

The project uses `@/` as an alias for the `src/` directory (configured in vite.config.ts and tsconfig.json).

### Core Architecture Patterns

**State Management:**
- All state is managed in the main `GanttChart` component using React hooks
- Operations are organized into logical groupings (swimlaneOps, barOps, milestoneOps, handlers)
- State updates use immutable patterns with spread operators

**Component Organization:**
```
src/
├── components/
│   ├── GanttChart.tsx         # Main orchestrator component
│   ├── controls/              # User input controls
│   ├── modals/                # Edit dialogs and panels
│   ├── sidebar/               # Left sidebar swimlane list
│   └── timeline/              # Timeline visualization components
├── config/                    # Constants, themes, holidays, milestones
├── factories/                 # DataFactory for creating entities
├── types/                     # All TypeScript type definitions
└── utils/                     # Date calculations and helpers
```

**Key Data Structures:**
- `Swimlane`: Horizontal workstream rows containing bars and milestones
- `TaskBar`: Rectangular task representations with start week and duration
- `Milestone`: Diamond-shaped markers at specific weeks with types (general/client/design)
- `Theme`: Color scheme definitions for light/dark modes

### Configuration System

All configuration lives in `src/config/`:
- `constants.ts`: Layout dimensions, limits, and zoom settings in the `CONFIG` object
- `themes.ts`: Light/dark theme color definitions in the `THEMES` object
- `holidays.ts`: UK public holidays with bank/public type distinction
- `milestones.ts`: Milestone type definitions (general/client/design) with colors and positioning

### Factory Pattern

The `DataFactory` (src/factories/dataFactory.ts) provides centralized functions for creating entities:
- `createSwimlane(id, name?, order?)`: Creates new swimlane with default values
- `createBar(id, weekIndex, color?)`: Creates task bar at specified week
- `createMilestone(id, weekIndex, type?)`: Creates milestone with appropriate type

### Date Calculations

Date utilities (src/utils/dateUtils.ts) handle timeline calculations:
- Week-based system where weeks are zero-indexed
- Timeline starts on Monday of configured start week
- All date formatting uses 'en-GB' locale

### Component Communication

The GanttChart component passes callbacks down to child components:
- Bar/milestone creation via cell clicks
- Editing via click handlers that set editing state
- Drag operations update state directly through callbacks
- No prop drilling beyond one level (props are passed to immediate children)

## Important Implementation Notes

**Week Indexing:**
- Task bars use `startWeek` (zero-indexed)
- Milestones use `week` (one-indexed, for user-facing display)

**Drag & Drop:**
- Swimlanes can be reordered in sidebar via drag & drop
- Task bars support both move (drag entire bar) and resize (drag edges)
- Milestones are dragged from selector and dropped on cells

**Styling Approach:**
- Uses inline styles with theme object for dynamic theming
- Tailwind classes for layout and spacing
- No CSS modules or styled-components

**Type Safety:**
- Strict TypeScript mode enabled
- All types defined in src/types/index.ts
- Component props have explicit type definitions
