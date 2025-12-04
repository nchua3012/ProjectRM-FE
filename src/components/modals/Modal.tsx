import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from '@/types';
import { THEMES } from '@/config';

/**
 * Base Modal Component
 * Reusable modal wrapper with title and close button
 */
export function Modal({
  title,
  onClose,
  children,
  theme = THEMES.light,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && typeof onClose === 'function') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === 'function') onClose();
      }}
    >
      <div
        className="rounded-lg shadow-2xl w-full max-w-md"
        style={{ backgroundColor: theme.modalBg }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: theme.gridLine }}
        >
          <h3 className="font-semibold" style={{ color: theme.textPrimary }}>
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 transition-colors">
            <X size={18} style={{ color: theme.textSecondary }} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
