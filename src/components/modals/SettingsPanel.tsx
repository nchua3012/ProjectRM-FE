import { Moon, Sun, Calendar } from 'lucide-react';
import type { SettingsPanelProps } from '@/types';
import { CONFIG } from '@/config';
import { clamp, parseDateString, getMondayOfWeek } from '@/utils';
import { Modal } from './Modal';

/**
 * Settings Panel Component
 * Modal for configuring timeline settings
 */
export function SettingsPanel({
  totalWeeks,
  startDate,
  onUpdateWeeks,
  onUpdateStartDate,
  onClose,
  theme,
  onToggleTheme,
  showHolidays,
  onToggleHolidays,
}: SettingsPanelProps) {
  return (
    <Modal title="Timeline Settings" onClose={onClose} theme={theme}>
      <div className="space-y-4">
        {/* Theme Toggle */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
            Appearance
          </label>
          <div
            className="flex items-center justify-between p-3 rounded border"
            style={{
              borderColor: theme.inputBorder,
              backgroundColor: theme.inputBg,
            }}
          >
            <div className="flex items-center gap-3">
              {theme.name === 'dark' ? (
                <Moon size={20} style={{ color: theme.textPrimary }} />
              ) : (
                <Sun size={20} style={{ color: theme.textPrimary }} />
              )}
              <span style={{ color: theme.textPrimary }}>
                {theme.name === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <button
              onClick={onToggleTheme}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: theme.name === 'dark' ? theme.accent : theme.gridLine,
              }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full transition-transform"
                style={{
                  backgroundColor: '#fff',
                  left: theme.name === 'dark' ? '28px' : '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Public Holidays Toggle */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
            Public Holidays
          </label>
          <div
            className="flex items-center justify-between p-3 rounded border"
            style={{
              borderColor: theme.inputBorder,
              backgroundColor: theme.inputBg,
            }}
          >
            <div className="flex items-center gap-3">
              <Calendar
                size={20}
                style={{ color: showHolidays ? theme.holidayBorder : theme.textPrimary }}
              />
              <div>
                <span style={{ color: theme.textPrimary }}>Show UK Bank Holidays</span>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Highlight weeks containing public holidays
                </p>
              </div>
            </div>
            <button
              onClick={onToggleHolidays}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: showHolidays ? theme.holidayBorder : theme.gridLine,
              }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full transition-transform"
                style={{
                  backgroundColor: '#fff',
                  left: showHolidays ? '28px' : '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
            Total Weeks
          </label>
          <input
            type="number"
            min={CONFIG.MIN_WEEKS}
            max={CONFIG.MAX_WEEKS}
            value={totalWeeks}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && typeof onUpdateWeeks === 'function') {
                onUpdateWeeks(clamp(val, CONFIG.MIN_WEEKS, CONFIG.MAX_WEEKS));
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
          <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
            Start Date (Week Commencing Monday)
          </label>
          <input
            type="date"
            value={
              startDate instanceof Date && !isNaN(startDate.getTime())
                ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
                : ''
            }
            onChange={(e) => {
              // Use parseDateString to avoid timezone issues
              const newDate = parseDateString(e.target.value);
              if (newDate && typeof onUpdateStartDate === 'function') {
                // Automatically adjust to Monday of the selected week
                const monday = getMondayOfWeek(newDate);
                onUpdateStartDate(monday);
              }
            }}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:outline-none"
            style={{
              borderColor: theme.inputBorder,
              color: theme.textPrimary,
              backgroundColor: theme.inputBg,
            }}
          />
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
            Date will be adjusted to the Monday of the selected week
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{ backgroundColor: theme.accent, color: '#fff' }}
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
