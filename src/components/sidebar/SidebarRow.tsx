import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Trash2, Check } from 'lucide-react';
import type { SidebarRowProps } from '@/types';
import { THEMES } from '@/config';

/**
 * Sidebar Row Component
 * Displays a single swimlane in the sidebar with edit/delete functionality
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

  return (
    <div
      className="flex items-center px-3 border-b group transition-colors"
      style={{
        height: 52,
        backgroundColor: isEven ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderColor: theme.sidebarBorder,
      }}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <GripVertical
        size={14}
        className="mr-2 cursor-grab opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ color: theme.sidebarText }}
      />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 px-2 py-1 text-sm rounded border"
            style={{
              backgroundColor: theme.inputBg,
              borderColor: theme.accent,
              color: theme.textPrimary,
            }}
          />
          <button
            onClick={handleSave}
            className="p-1 rounded hover:bg-green-600 transition-colors"
            style={{ backgroundColor: theme.success }}
          >
            <Check size={14} color="#fff" />
          </button>
        </div>
      ) : (
        <>
          <div
            className="flex-1 text-sm font-medium truncate cursor-pointer hover:underline"
            style={{ color: theme.sidebarText }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {swimlane?.name || 'Unnamed'}
          </div>
          <button
            onClick={() => {
              if (typeof onDelete === 'function') onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all hover:bg-red-600"
            style={{ backgroundColor: 'transparent' }}
          >
            <Trash2 size={14} style={{ color: theme.danger }} />
          </button>
        </>
      )}
    </div>
  );
});
