import { Check, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from 'lucide-react';
import type { EditBarModalProps, VerticalAlign } from '@/types';
import { CONFIG, THEMES, TASK_COLOR_PRESETS } from '@/config';
import { clamp } from '@/utils';
import { Modal } from './Modal';

const VERTICAL_ALIGN_OPTIONS: { value: VerticalAlign; label: string; icon: typeof AlignVerticalJustifyStart }[] = [
  { value: 'top', label: 'Top', icon: AlignVerticalJustifyStart },
  { value: 'middle', label: 'Middle', icon: AlignVerticalJustifyCenter },
  { value: 'bottom', label: 'Bottom', icon: AlignVerticalJustifyEnd },
];

/**
 * Edit Bar Modal Component
 * Modal for editing task bar properties including completion status
 */
export function EditBarModal({
  bar,
  totalWeeks,
  onClose,
  onUpdate,
  onDelete,
  theme = THEMES.light,
  todayPosition,
}: EditBarModalProps) {
  if (!bar) return null;

  // Check if bar is in the past
  const barEndWeek = bar.startWeek + bar.duration;
  const isInPast = todayPosition && barEndWeek <= todayPosition.totalWeeks;

  return (
    <Modal title="Edit Task" onClose={onClose} theme={theme}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
            Task Name
          </label>
          <input
            type="text"
            value={bar.name || ''}
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

        {/* Task Status Section */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
            Task Status
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (typeof onUpdate === 'function') onUpdate('completed', true);
              }}
              className="flex-1 px-4 py-2 rounded border transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: bar.completed ? theme.success : theme.inputBg,
                color: bar.completed ? '#fff' : theme.textPrimary,
                borderColor: bar.completed ? theme.success : theme.inputBorder,
              }}
            >
              <Check size={16} />
              Completed
            </button>
            <button
              onClick={() => {
                if (typeof onUpdate === 'function') onUpdate('completed', false);
              }}
              className="flex-1 px-4 py-2 rounded border transition-all"
              style={{
                backgroundColor: !bar.completed ? theme.accent : theme.inputBg,
                color: !bar.completed ? '#fff' : theme.textPrimary,
                borderColor: !bar.completed ? theme.accent : theme.inputBorder,
              }}
            >
              In Progress
            </button>
          </div>
        </div>

        {/* Override Grayscale Option (only for incomplete past tasks) */}
        {!bar.completed && isInPast && (
          <div
            className="rounded-lg p-3"
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
            }}
          >
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="ignoreGrayscale"
                checked={bar.ignoreGrayscale || false}
                onChange={(e) => {
                  if (typeof onUpdate === 'function') onUpdate('ignoreGrayscale', e.target.checked);
                }}
                className="mt-1"
              />
              <label
                htmlFor="ignoreGrayscale"
                className="text-sm cursor-pointer flex-1"
                style={{ color: '#92400e' }}
              >
                <div className="font-semibold">Keep Highlighted (Overdue Task)</div>
                <div className="text-xs" style={{ color: '#b45309' }}>
                  This task is past its deadline. Check to keep it visible in color instead of
                  greyed out.
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.textSecondary }}
            >
              Start Week
            </label>
            <input
              type="number"
              min={1}
              max={totalWeeks - (bar.duration || 1) + 1}
              value={(bar.startWeek || 0) + 1}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && typeof onUpdate === 'function') {
                  onUpdate('startWeek', Math.max(0, val - 1));
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
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.textSecondary }}
            >
              Duration (weeks)
            </label>
            <input
              type="number"
              min={CONFIG.MIN_DURATION}
              max={CONFIG.MAX_DURATION}
              value={bar.duration || 1}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && typeof onUpdate === 'function') {
                  onUpdate('duration', clamp(val, CONFIG.MIN_DURATION, CONFIG.MAX_DURATION));
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
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
            Colour
          </label>
          <div className="flex flex-wrap gap-2">
            {TASK_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.color}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: preset.color,
                  borderColor: bar.color === preset.color ? theme.textPrimary : 'transparent',
                }}
                onClick={() => {
                  if (typeof onUpdate === 'function') onUpdate('color', preset.color);
                }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Vertical Alignment */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
            Vertical Position
          </label>
          <div className="flex gap-2">
            {VERTICAL_ALIGN_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = (bar.verticalAlign || 'middle') === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (typeof onUpdate === 'function') onUpdate('verticalAlign', option.value);
                  }}
                  className="flex-1 px-3 py-2 rounded border transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: isSelected ? theme.accent : theme.inputBg,
                    color: isSelected ? '#fff' : theme.textPrimary,
                    borderColor: isSelected ? theme.accent : theme.inputBorder,
                  }}
                  title={option.label}
                >
                  <Icon size={16} />
                  <span className="text-xs">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
            Notes
          </label>
          <textarea
            value={bar.notes || ''}
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
            Delete Task
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
