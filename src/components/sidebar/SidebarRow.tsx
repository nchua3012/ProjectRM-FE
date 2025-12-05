import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Trash2, Check, X } from 'lucide-react';
import type { SidebarRowProps } from '@/types';
import { THEMES, CONFIG, HEIGHT_CONFIG } from '@/config';

/**
 * Sidebar Row Component
 * Displays a single swimlane in the sidebar with vertical text and swimlane color accent
 */
export const SidebarRow = React.memo(function SidebarRow({
  swimlane,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isEven,
  theme = THEMES.light,
}: SidebarRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(swimlane?.name || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate row height based on multiplier
  const heightMultiplier = swimlane?.heightMultiplier || HEIGHT_CONFIG.DEFAULT_MULTIPLIER;
  const rowHeight = CONFIG.ROW_HEIGHT * heightMultiplier;

  // Get swimlane color for accent
  const swimlaneColor = swimlane?.color || theme.accent;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (typeof onEdit === 'function' && editName.trim()) {
      onEdit(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(swimlane?.name || '');
    setIsEditing(false);
  };

  return (
    <div
      className="flex border-b group transition-colors relative"
      style={{
        height: rowHeight,
        backgroundColor: isEven ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderColor: theme.sidebarBorder,
      }}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Color accent bar on left */}
      <div
        className="w-1 flex-shrink-0"
        style={{ backgroundColor: swimlaneColor }}
      />

      {/* Main content area */}
      <div className="flex-1 flex items-center px-2 min-w-0">
        {/* Drag handle */}
        <GripVertical
          size={14}
          className="flex-shrink-0 cursor-grab opacity-40 group-hover:opacity-100 transition-opacity"
          style={{ color: theme.sidebarText }}
        />

        {isEditing ? (
          <div className="flex-1 flex items-center gap-1 ml-2">
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              className="flex-1 px-2 py-1 text-sm rounded border min-w-0"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: swimlaneColor,
                color: theme.textPrimary,
              }}
            />
            <button
              onClick={handleSave}
              className="p-1 rounded transition-colors flex-shrink-0"
              style={{ backgroundColor: theme.success }}
              title="Save"
            >
              <Check size={14} color="#fff" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 rounded transition-colors flex-shrink-0"
              style={{ backgroundColor: theme.danger }}
              title="Cancel"
            >
              <X size={14} color="#fff" />
            </button>
          </div>
        ) : (
          <>
            {/* Vertical text container */}
            <div
              className="flex-1 flex items-center justify-center overflow-hidden ml-1"
              style={{ height: rowHeight - 8 }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
                style={{
                  color: theme.sidebarText,
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)',
                  maxHeight: rowHeight - 16,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onDoubleClick={() => setIsEditing(true)}
                title={`${swimlane?.name || 'Unnamed'} (double-click to edit)`}
              >
                {swimlane?.name || 'Unnamed'}
              </span>
            </div>

            {/* Delete button */}
            <button
              onClick={() => {
                if (typeof onDelete === 'function') onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all flex-shrink-0"
              style={{ color: theme.danger }}
              title="Delete workstream"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
});
