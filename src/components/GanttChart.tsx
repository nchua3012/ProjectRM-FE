/**
 * ProjectFlow - Gantt Chart Component
 * A professional project timeline management tool with:
 * - Drag & drop task bars and milestones
 * - Recurring meeting support
 * - Light/Dark theme support
 * - UK public holiday highlighting
 * - Zoom controls
 * - Today indicator
 * @version 2.0.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Plus,
  ArrowLeft,
  Save,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import type {
  Swimlane,
  TaskBar,
  Milestone,
  ThemeMode,
  EditingBarState,
  EditingMilestoneState,
  MilestoneTypeId,
} from '@/types';
import { CONFIG, THEMES, HEADER_HEIGHTS, SIDEBAR_CONFIG } from '@/config';
import { DataFactory } from '@/factories';
import { getScaledCellWidth, generateId, getStartOfCurrentWeek } from '@/utils';
import {
  WeekHeader,
  MonthHeaders,
  TodayLine,
  SwimlaneRow,
  SidebarRow,
  MilestoneSelector,
  EditBarModal,
  EditMilestoneModal,
  SettingsPanel,
} from '@/components';

/**
 * Main Gantt Chart Component
 */
export function GanttChart() {
  // ==================== STATE ====================
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isEditingName, setIsEditingName] = useState(false);
  const [swimlanes, setSwimlanes] = useState<Swimlane[]>([
    DataFactory.createSwimlane(1, 'Planning & Discovery', 0),
    DataFactory.createSwimlane(2, 'Design Development', 1),
    DataFactory.createSwimlane(3, 'Implementation', 2),
  ]);
  const [totalWeeks, setTotalWeeks] = useState(CONFIG.DEFAULT_WEEKS);
  const [startDate, setStartDate] = useState<Date>(() => getStartOfCurrentWeek());
  const [scale, setScale] = useState(CONFIG.DEFAULT_SCALE);
  const [editingBar, setEditingBar] = useState<EditingBarState | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<EditingMilestoneState | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [draggedSwimlane, setDraggedSwimlane] = useState<number | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [showHolidays, setShowHolidays] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(SIDEBAR_CONFIG.DEFAULT_WIDTH);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  // ==================== REFS ====================
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const sidebarResizeStartX = useRef<number>(0);
  const sidebarStartWidth = useRef<number>(SIDEBAR_CONFIG.DEFAULT_WIDTH);

  // ==================== DERIVED STATE ====================
  const theme = THEMES[themeMode];

  // Memoize sorted swimlanes to avoid re-sorting on every render
  const sortedSwimlanes = useMemo(
    () => [...swimlanes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [swimlanes]
  );

  const cellWidth = getScaledCellWidth(scale);

  // ==================== SWIMLANE OPERATIONS ====================
  const swimlaneOps = {
    add: useCallback(() => {
      const newId = generateId(swimlanes);
      const newOrder = Math.max(0, ...swimlanes.map((s) => s.order ?? 0)) + 1;
      setSwimlanes((prev) => [
        ...prev,
        DataFactory.createSwimlane(newId, `Workstream ${newId}`, newOrder),
      ]);
    }, [swimlanes]),

    delete: useCallback((id: number) => {
      setSwimlanes((prev) => prev.filter((s) => s.id !== id));
    }, []),

    rename: useCallback((id: number, newName: string) => {
      setSwimlanes((prev) => prev.map((s) => (s.id === id ? { ...s, name: newName } : s)));
    }, []),

    reorder: useCallback((draggedId: number, targetId: number) => {
      if (draggedId === targetId) return;

      setSwimlanes((prev) => {
        const draggedIndex = prev.findIndex((s) => s.id === draggedId);
        const targetIndex = prev.findIndex((s) => s.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return prev;

        const updated = [...prev];
        const [dragged] = updated.splice(draggedIndex, 1);
        updated.splice(targetIndex, 0, dragged);

        return updated.map((s, i) => ({ ...s, order: i }));
      });
    }, []),

    updateHeight: useCallback((id: number, heightMultiplier: number) => {
      setSwimlanes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, heightMultiplier } : s))
      );
    }, []),
  };

  // ==================== BAR OPERATIONS ====================
  const barOps = {
    add: useCallback((swimlaneId: number, weekIndex: number) => {
      setSwimlanes((prev) =>
        prev.map((s) => {
          if (s.id !== swimlaneId) return s;
          const newId = Math.max(0, ...(s.bars || []).map((b) => b.id), 0) + 1;
          return {
            ...s,
            bars: [...(s.bars || []), DataFactory.createBar(newId, weekIndex, s.color)],
          };
        })
      );
    }, []),

    update: useCallback(
      (swimlaneId: number, barId: number, field: keyof TaskBar, value: string | number) => {
        setSwimlanes((prev) =>
          prev.map((s) => {
            if (s.id !== swimlaneId) return s;
            return {
              ...s,
              bars: (s.bars || []).map((b) => (b.id === barId ? { ...b, [field]: value } : b)),
            };
          })
        );
      },
      []
    ),

    updateDirect: useCallback((swimlaneId: number, barId: number, field: keyof TaskBar, value: number) => {
      setSwimlanes((prev) =>
        prev.map((s) => {
          if (s.id !== swimlaneId) return s;
          return {
            ...s,
            bars: (s.bars || []).map((b) => (b.id === barId ? { ...b, [field]: value } : b)),
          };
        })
      );
    }, []),

    delete: useCallback((swimlaneId: number, barId: number) => {
      setSwimlanes((prev) =>
        prev.map((s) => {
          if (s.id !== swimlaneId) return s;
          return { ...s, bars: (s.bars || []).filter((b) => b.id !== barId) };
        })
      );
      setEditingBar(null);
    }, []),

    getForEdit: useCallback((): TaskBar | null => {
      if (!editingBar) return null;
      const swim = swimlanes.find((s) => s.id === editingBar.swimlaneId);
      return swim?.bars?.find((b) => b.id === editingBar.barId) || null;
    }, [editingBar, swimlanes]),
  };

  // ==================== MILESTONE OPERATIONS ====================
  const milestoneOps = {
    add: useCallback((swimlaneId: number, weekIndex: number, type: MilestoneTypeId) => {
      setSwimlanes((prev) =>
        prev.map((s) => {
          if (s.id !== swimlaneId) return s;
          const newId = Math.max(0, ...(s.milestones || []).map((m) => m.id), 0) + 1;
          return {
            ...s,
            milestones: [
              ...(s.milestones || []),
              DataFactory.createMilestone(newId, weekIndex, type),
            ],
          };
        })
      );
    }, []),

    update: useCallback(
      (
        swimlaneId: number,
        milestoneId: number,
        field: keyof Milestone,
        value: string | number
      ) => {
        setSwimlanes((prev) =>
          prev.map((s) => {
            if (s.id !== swimlaneId) return s;
            return {
              ...s,
              milestones: (s.milestones || []).map((m) =>
                m.id === milestoneId ? { ...m, [field]: value } : m
              ),
            };
          })
        );
      },
      []
    ),

    delete: useCallback((swimlaneId: number, milestoneId: number) => {
      setSwimlanes((prev) =>
        prev.map((s) => {
          if (s.id !== swimlaneId) return s;
          return { ...s, milestones: (s.milestones || []).filter((m) => m.id !== milestoneId) };
        })
      );
      setEditingMilestone(null);
    }, []),

    getForEdit: useCallback((): Milestone | null => {
      if (!editingMilestone) return null;
      const swim = swimlanes.find((s) => s.id === editingMilestone.swimlaneId);
      return swim?.milestones?.find((m) => m.id === editingMilestone.milestoneId) || null;
    }, [editingMilestone, swimlanes]),
  };

  // ==================== HANDLERS ====================
  const handlers = {
    milestoneDrop: useCallback(
      (_e: React.DragEvent, swimlaneId: number, weekIndex: number, type: string) => {
        if (type) {
          setSwimlanes((prev) =>
            prev.map((s) => {
              if (s.id !== swimlaneId) return s;
              const newId = Math.max(0, ...(s.milestones || []).map((m) => m.id), 0) + 1;
              return {
                ...s,
                milestones: [
                  ...(s.milestones || []),
                  DataFactory.createMilestone(newId, weekIndex, type as MilestoneTypeId),
                ],
              };
            })
          );
        }
      },
      []
    ),

    save: useCallback(() => {
      const data = {
        projectName,
        swimlanes,
        totalWeeks,
        startDate: startDate?.toISOString(),
        savedAt: new Date().toISOString(),
      };
      console.log('Project saved:', data);
      setTimeout(() => alert('Project saved! Check console for data.'), 0);
    }, [projectName, swimlanes, totalWeeks, startDate]),

    zoomIn: useCallback(() => {
      setScale((prev) => Math.min(prev + 0.1, CONFIG.MAX_SCALE));
    }, []),

    zoomOut: useCallback(() => {
      setScale((prev) => Math.max(prev - 0.1, CONFIG.MIN_SCALE));
    }, []),

    resetZoom: useCallback(() => {
      setScale(1);
    }, []),

    toggleTheme: useCallback(() => {
      setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []),

    toggleHolidays: useCallback(() => {
      setShowHolidays((prev) => !prev);
    }, []),

    createRecurringMilestones: useCallback(
      (milestone: Milestone, interval: number, count: number) => {
        if (!editingMilestone) return;

        setSwimlanes((prev) =>
          prev.map((s) => {
            if (s.id !== editingMilestone.swimlaneId) return s;
            const existingMaxId = Math.max(0, ...(s.milestones || []).map((m) => m.id), 0);
            const newMilestones: Milestone[] = [];
            for (let i = 1; i <= count; i++) {
              const newWeek = milestone.week + i * interval;
              if (newWeek <= totalWeeks) {
                newMilestones.push({
                  id: existingMaxId + i,
                  week: newWeek,
                  name: milestone.name,
                  notes: milestone.notes || '',
                  type: milestone.type,
                });
              }
            }
            return {
              ...s,
              milestones: [...(s.milestones || []), ...newMilestones],
            };
          })
        );
      },
      [editingMilestone, totalWeeks]
    ),
  };

  // ==================== SIDEBAR RESIZE HANDLERS ====================
  const handleSidebarResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizingSidebar(true);
      sidebarResizeStartX.current = e.clientX;
      sidebarStartWidth.current = sidebarWidth;
    },
    [sidebarWidth]
  );

  const handleSidebarResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizingSidebar) return;

      const deltaX = e.clientX - sidebarResizeStartX.current;
      const newWidth = Math.max(
        SIDEBAR_CONFIG.MIN_WIDTH,
        Math.min(SIDEBAR_CONFIG.MAX_WIDTH, sidebarStartWidth.current + deltaX)
      );
      setSidebarWidth(newWidth);
    },
    [isResizingSidebar]
  );

  const handleSidebarResizeEnd = useCallback(() => {
    setIsResizingSidebar(false);
  }, []);

  // Add/remove global mouse event listeners for sidebar resize
  useEffect(() => {
    if (isResizingSidebar) {
      window.addEventListener('mousemove', handleSidebarResizeMove);
      window.addEventListener('mouseup', handleSidebarResizeEnd);
      // Add cursor style to body during resize
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      return () => {
        window.removeEventListener('mousemove', handleSidebarResizeMove);
        window.removeEventListener('mouseup', handleSidebarResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizingSidebar, handleSidebarResizeMove, handleSidebarResizeEnd]);

  // Focus name input when editing
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: theme.gridBg }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: theme.headerBg, borderColor: theme.subHeaderBg }}
      >
        <div className="flex items-center gap-4">
          <button className="p-2 rounded hover:bg-gray-700 transition-colors">
            <ArrowLeft size={20} style={{ color: theme.headerText }} />
          </button>

          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              className="text-xl font-semibold px-2 py-1 rounded border"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.accent,
                color: theme.textPrimary,
              }}
            />
          ) : (
            <h1
              className="text-xl font-semibold cursor-pointer hover:underline"
              style={{ color: theme.headerText }}
              onClick={() => setIsEditingName(true)}
            >
              {projectName}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded"
            style={{ backgroundColor: theme.subHeaderBg }}
          >
            <button
              onClick={handlers.zoomOut}
              className="p-1 rounded hover:bg-gray-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={18} style={{ color: theme.headerText }} />
            </button>
            <span
              className="text-sm px-2 min-w-12 text-center"
              style={{ color: theme.headerText }}
            >
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handlers.zoomIn}
              className="p-1 rounded hover:bg-gray-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={18} style={{ color: theme.headerText }} />
            </button>
            <button
              onClick={handlers.resetZoom}
              className="p-1 rounded hover:bg-gray-600 transition-colors"
              title="Reset Zoom"
            >
              <Maximize2 size={16} style={{ color: theme.headerText }} />
            </button>
          </div>

          <MilestoneSelector
            onSelect={(type) => {
              if (swimlanes.length === 0) {
                setTimeout(() => alert('Add a workstream first'), 0);
                return;
              }
              milestoneOps.add(swimlanes[0].id, 0, type);
            }}
            theme={theme}
          />

          <button
            onClick={swimlaneOps.add}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme.subHeaderBg,
              color: theme.headerText,
            }}
          >
            <Plus size={16} />
            Add Workstream
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <Settings size={20} style={{ color: theme.headerText }} />
          </button>

          <button
            onClick={handlers.save}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme.success,
              color: '#fff',
            }}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with Resize Handle */}
        <div className="flex-shrink-0 flex relative">
          {/* Sidebar Content */}
          <div
            className="flex flex-col border-r"
            style={{
              width: sidebarWidth,
              backgroundColor: theme.sidebarBg,
              borderColor: theme.sidebarBorder,
            }}
          >
            {/* Sidebar Header */}
            <div
              className="px-3 border-b font-semibold text-sm"
              style={{
                height: HEADER_HEIGHTS.TOTAL,
                borderColor: theme.sidebarBorder,
                color: theme.sidebarText,
              }}
            >
              <div className="flex items-center justify-between h-full">
                <span
                  className="truncate"
                  style={{ opacity: sidebarWidth < 120 ? 0 : 1 }}
                >
                  WORKSTREAMS
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                  style={{ backgroundColor: theme.subHeaderBg }}
                >
                  {swimlanes.length}
                </span>
              </div>
            </div>

            {/* Swimlane List */}
            <div className="flex-1 overflow-y-auto">
              {sortedSwimlanes.map((swim, index) => (
                <SidebarRow
                  key={swim.id}
                  swimlane={swim}
                  isEven={index % 2 === 0}
                  onEdit={(name) => swimlaneOps.rename(swim.id, name)}
                  onDelete={() => swimlaneOps.delete(swim.id)}
                  onDragStart={(e) => {
                    setDraggedSwimlane(swim.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedSwimlane && draggedSwimlane !== swim.id) {
                      swimlaneOps.reorder(draggedSwimlane, swim.id);
                    }
                    setDraggedSwimlane(null);
                  }}
                  theme={theme}
                />
              ))}
            </div>
          </div>

          {/* Sidebar Resize Handle */}
          <div
            className="absolute top-0 bottom-0 cursor-ew-resize z-20 flex items-center justify-center group"
            style={{
              right: -SIDEBAR_CONFIG.RESIZE_HANDLE_WIDTH / 2,
              width: SIDEBAR_CONFIG.RESIZE_HANDLE_WIDTH,
            }}
            onMouseDown={handleSidebarResizeStart}
            title="Drag to resize sidebar"
          >
            {/* Visual indicator line */}
            <div
              className="h-full w-0.5 transition-colors"
              style={{
                backgroundColor: isResizingSidebar
                  ? theme.accent
                  : 'transparent',
              }}
            />
            {/* Hover indicator */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                backgroundColor: `${theme.accent}40`,
              }}
            />
          </div>
        </div>

        {/* Timeline Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-auto">
          <div style={{ minWidth: totalWeeks * cellWidth }}>
            {/* Month Headers */}
            <MonthHeaders
              totalWeeks={totalWeeks}
              startDate={startDate}
              scale={scale}
              theme={theme}
            />

            {/* Week Headers */}
            <div
              className="flex"
              style={{ backgroundColor: theme.subHeaderBg, height: HEADER_HEIGHTS.WEEK_HEADER }}
            >
              {Array.from({ length: totalWeeks }).map((_, weekIndex) => (
                <WeekHeader
                  key={weekIndex}
                  weekIndex={weekIndex}
                  startDate={startDate}
                  scale={scale}
                  theme={theme}
                  showHolidays={showHolidays}
                />
              ))}
            </div>

            {/* Swimlane Rows with Today Line */}
            <div className="relative">
              <TodayLine
                startDate={startDate}
                scale={scale}
                totalWeeks={totalWeeks}
                theme={theme}
              />
              {sortedSwimlanes.map((swim, index) => (
                <SwimlaneRow
                  key={swim.id}
                  swimlane={swim}
                  totalWeeks={totalWeeks}
                  isEven={index % 2 === 0}
                  onCellClick={(weekIndex) => barOps.add(swim.id, weekIndex)}
                  onCellDrop={(e, weekIndex, type) =>
                    handlers.milestoneDrop(e, swim.id, weekIndex, type)
                  }
                  onBarClick={(barId) => setEditingBar({ swimlaneId: swim.id, barId })}
                  onMilestoneClick={(milestoneId) =>
                    setEditingMilestone({ swimlaneId: swim.id, milestoneId })
                  }
                  onBarDragMove={(barId, newStart) =>
                    barOps.updateDirect(swim.id, barId, 'startWeek', newStart)
                  }
                  onBarDragResize={(barId, newDuration) =>
                    barOps.updateDirect(swim.id, barId, 'duration', newDuration)
                  }
                  onHeightChange={(newMultiplier) =>
                    swimlaneOps.updateHeight(swim.id, newMultiplier)
                  }
                  scale={scale}
                  theme={theme}
                  showHolidays={showHolidays}
                  startDate={startDate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingBar && (
        <EditBarModal
          bar={barOps.getForEdit()}
          totalWeeks={totalWeeks}
          onClose={() => setEditingBar(null)}
          onUpdate={(field, value) =>
            barOps.update(editingBar.swimlaneId, editingBar.barId, field, value)
          }
          onDelete={() => barOps.delete(editingBar.swimlaneId, editingBar.barId)}
          theme={theme}
        />
      )}

      {editingMilestone && (
        <EditMilestoneModal
          milestone={milestoneOps.getForEdit()}
          totalWeeks={totalWeeks}
          onClose={() => setEditingMilestone(null)}
          onUpdate={(field, value) =>
            milestoneOps.update(
              editingMilestone.swimlaneId,
              editingMilestone.milestoneId,
              field,
              value
            )
          }
          onDelete={() =>
            milestoneOps.delete(editingMilestone.swimlaneId, editingMilestone.milestoneId)
          }
          onCreateRecurring={handlers.createRecurringMilestones}
          theme={theme}
        />
      )}

      {showSettings && (
        <SettingsPanel
          totalWeeks={totalWeeks}
          startDate={startDate}
          onUpdateWeeks={setTotalWeeks}
          onUpdateStartDate={setStartDate}
          onClose={() => setShowSettings(false)}
          theme={theme}
          onToggleTheme={handlers.toggleTheme}
          showHolidays={showHolidays}
          onToggleHolidays={handlers.toggleHolidays}
        />
      )}
    </div>
  );
}

export default GanttChart;
