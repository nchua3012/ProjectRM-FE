import { useState } from 'react';
import { Diamond, Repeat } from 'lucide-react';
import type { EditMilestoneModalProps, MilestoneTypeId } from '@/types';
import { THEMES, MILESTONE_TYPES } from '@/config';
import { clamp } from '@/utils';
import { Modal } from './Modal';

/**
 * Edit Milestone Modal Component
 * Modal for editing milestone properties with recurring meeting support
 */
export function EditMilestoneModal({
  milestone,
  totalWeeks,
  onClose,
  onUpdate,
  onDelete,
  onCreateRecurring,
  theme = THEMES.light,
}: EditMilestoneModalProps) {
  const [showRecurring, setShowRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [recurringCount, setRecurringCount] = useState(4);

  if (!milestone) return null;

  const isMeeting = milestone.type === 'client' || milestone.type === 'design';
  const milestoneType =
    MILESTONE_TYPES[milestone.type?.toUpperCase() as keyof typeof MILESTONE_TYPES] ||
    MILESTONE_TYPES.GENERAL;

  const handleCreateRecurring = () => {
    if (typeof onCreateRecurring === 'function') {
      onCreateRecurring(milestone, recurringInterval, recurringCount);
    }
    setShowRecurring(false);
    if (typeof onClose === 'function') onClose();
  };

  return (
    <Modal title="Edit Milestone" onClose={onClose} theme={theme}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
            Milestone Name
          </label>
          <input
            type="text"
            value={milestone.name || ''}
            onChange={(e) => {
              if (typeof onUpdate === 'function') onUpdate('name', e.target.value);
            }}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:outline-none"
            style={{
              borderColor: theme.inputBorder,
              color: theme.textPrimary,
              backgroundColor: theme.inputBg,
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
            Week
          </label>
          <input
            type="number"
            min={1}
            max={totalWeeks}
            value={milestone.week || 1}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && typeof onUpdate === 'function') {
                onUpdate('week', clamp(val, 1, totalWeeks));
              }
            }}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:outline-none"
            style={{
              borderColor: theme.inputBorder,
              color: theme.textPrimary,
              backgroundColor: theme.inputBg,
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
            Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {Object.values(MILESTONE_TYPES).map((type) => (
              <button
                key={type.id}
                className="flex items-center gap-2 px-3 py-2 rounded border transition-colors"
                style={{
                  borderColor: milestone.type === type.id ? type.color : theme.inputBorder,
                  backgroundColor: milestone.type === type.id ? `${type.color}15` : theme.inputBg,
                  color: theme.textPrimary,
                }}
                onClick={() => {
                  if (typeof onUpdate === 'function') onUpdate('type', type.id as MilestoneTypeId);
                }}
              >
                <Diamond size={12} fill={type.color} color={type.color} />
                <span className="text-sm">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recurring Section - Only for meetings */}
        {isMeeting && (
          <div
            className="border rounded p-3"
            style={{ borderColor: theme.inputBorder, backgroundColor: theme.gridAltBg }}
          >
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setShowRecurring(!showRecurring)}
            >
              <div className="flex items-center gap-2">
                <Repeat size={16} style={{ color: milestoneType.color }} />
                <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                  Create Recurring Meetings
                </span>
              </div>
              <span style={{ color: theme.textMuted }}>{showRecurring ? '−' : '+'}</span>
            </button>

            {showRecurring && (
              <div
                className="mt-3 pt-3 border-t space-y-3"
                style={{ borderColor: theme.inputBorder }}
              >
                <div className="flex items-center gap-2">
                  <label className="text-sm" style={{ color: theme.textSecondary }}>
                    Every
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={recurringInterval}
                    onChange={(e) =>
                      setRecurringInterval(
                        Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1))
                      )
                    }
                    className="w-16 px-2 py-1 border rounded text-sm focus:outline-none"
                    style={{
                      borderColor: theme.inputBorder,
                      color: theme.textPrimary,
                      backgroundColor: theme.inputBg,
                    }}
                  />
                  <span className="text-sm" style={{ color: theme.textSecondary }}>
                    week(s)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm" style={{ color: theme.textSecondary }}>
                    For
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={recurringCount}
                    onChange={(e) =>
                      setRecurringCount(
                        Math.max(1, Math.min(52, parseInt(e.target.value, 10) || 1))
                      )
                    }
                    className="w-16 px-2 py-1 border rounded text-sm focus:outline-none"
                    style={{
                      borderColor: theme.inputBorder,
                      color: theme.textPrimary,
                      backgroundColor: theme.inputBg,
                    }}
                  />
                  <span className="text-sm" style={{ color: theme.textSecondary }}>
                    additional meeting(s)
                  </span>
                </div>

                <div
                  className="text-xs p-2 rounded"
                  style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}
                >
                  Starting from week {milestone.week}, this will add {recurringCount} more meeting
                  {recurringCount > 1 ? 's' : ''} at weeks:{' '}
                  {Array.from(
                    { length: Math.min(recurringCount, 5) },
                    (_, i) => milestone.week + (i + 1) * recurringInterval
                  )
                    .filter((w) => w <= totalWeeks)
                    .join(', ')}
                  {recurringCount > 5 ? '...' : ''}
                </div>

                <button
                  onClick={handleCreateRecurring}
                  className="w-full px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: milestoneType.color, color: '#fff' }}
                >
                  <Repeat size={14} />
                  Create {recurringCount} Additional Meeting{recurringCount > 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
            Notes
          </label>
          <textarea
            value={milestone.notes || ''}
            onChange={(e) => {
              if (typeof onUpdate === 'function') onUpdate('notes', e.target.value);
            }}
            rows={3}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:outline-none resize-none"
            style={{
              borderColor: theme.inputBorder,
              color: theme.textPrimary,
              backgroundColor: theme.inputBg,
            }}
          />
        </div>

        <div className="flex justify-between pt-2">
          <button
            onClick={() => {
              if (typeof onDelete === 'function') onDelete();
            }}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: theme.danger, color: '#fff' }}
          >
            Delete Milestone
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: theme.accent, color: '#fff' }}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
