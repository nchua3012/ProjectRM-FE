import type { EditBarModalProps } from '@/types';
import { CONFIG, THEMES, TASK_COLOR_PRESETS } from '@/config';
import { clamp } from '@/utils';
import { Modal } from './Modal';

/**
 * Edit Bar Modal Component
 * Modal for editing task bar properties
 */
export function EditBarModal({
  bar,
  totalWeeks,
  onClose,
  onUpdate,
  onDelete,
  theme = THEMES.light,
}: EditBarModalProps) {
  if (!bar) return null;

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
