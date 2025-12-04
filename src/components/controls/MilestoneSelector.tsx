import React, { useState, useRef, useEffect } from 'react';
import { Diamond } from 'lucide-react';
import type { MilestoneSelectorProps, MilestoneTypeId } from '@/types';
import { THEMES, MILESTONE_TYPES } from '@/config';

/**
 * Milestone Type Selector Component
 * Dropdown for selecting and dragging milestone types
 */
export const MilestoneSelector = React.memo(function MilestoneSelector({
  onSelect,
  theme = THEMES.light,
}: MilestoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragStart = (e: React.DragEvent, typeId: string) => {
    e.dataTransfer.setData('text/plain', typeId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors"
        style={{ backgroundColor: theme.accent, color: '#fff' }}
      >
        <Diamond size={14} />
        Add Milestone
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 rounded shadow-lg border z-50 min-w-48"
          style={{
            backgroundColor: theme.modalBg,
            borderColor: theme.gridLine,
          }}
        >
          <div
            className="px-3 py-1.5 text-xs border-b"
            style={{ color: theme.textMuted, borderColor: theme.gridLine }}
          >
            Click to add or drag to timeline
          </div>
          {Object.values(MILESTONE_TYPES).map((type) => (
            <div
              key={type.id}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors cursor-grab active:cursor-grabbing"
              style={{ color: theme.textPrimary }}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, type.id)}
              onDragEnd={handleDragEnd}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.backgroundColor = theme.cellHover)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent')
              }
              onClick={() => {
                if (typeof onSelect === 'function') onSelect(type.id as MilestoneTypeId);
                setIsOpen(false);
              }}
            >
              <Diamond size={12} fill={type.color} color={type.color} />
              {type.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
