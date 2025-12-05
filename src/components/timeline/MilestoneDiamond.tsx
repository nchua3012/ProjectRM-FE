import React from 'react';
import { Diamond } from 'lucide-react';
import type { MilestoneDiamondProps } from '@/types';
import { THEMES, MILESTONE_TYPES } from '@/config';
import { getScaledCellWidth } from '@/utils';

/**
 * Milestone Diamond Component
 * Displays a milestone marker on the timeline
 * Applies grayscale filter to past milestones
 */
export const MilestoneDiamond = React.memo(function MilestoneDiamond({
  milestone,
  scale,
  onClick,
  theme = THEMES.light,
  currentWeekIndex = -1,
  todayPosition,
}: MilestoneDiamondProps) {
  const cellWidth = getScaledCellWidth(scale);
  const milestoneType =
    MILESTONE_TYPES[milestone.type?.toUpperCase() as keyof typeof MILESTONE_TYPES] ||
    MILESTONE_TYPES.GENERAL;

  // General milestones straddle the week boundary (end of week)
  // Client and Design meetings sit in the middle of the cell
  const isGeneralMilestone = milestone.type === 'general';
  const left = isGeneralMilestone
    ? milestone.week * cellWidth // End of week (straddles boundary)
    : (milestone.week - 1) * cellWidth + cellWidth / 2; // Middle of cell

  // Determine if milestone is in the past
  // milestone.week is 1-indexed
  // Use todayPosition if available, otherwise fall back to currentWeekIndex
  const isPast = todayPosition
    ? milestone.week <= todayPosition.weekIndex
    : currentWeekIndex >= 0 && milestone.week <= currentWeekIndex;

  // Avoid unused variable warning
  void theme;

  return (
    <div
      className="absolute cursor-pointer transition-all hover:scale-110"
      style={{
        left: left - 8, // Center the 16px diamond on the position
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        pointerEvents: 'auto',
        opacity: isPast ? 0.5 : 1,
        filter: isPast ? 'grayscale(100%)' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (typeof onClick === 'function') onClick();
      }}
      title={milestone.name}
    >
      <Diamond
        size={16}
        fill={milestoneType.color}
        color={milestoneType.color}
        style={{ filter: isPast ? 'none' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
      />
    </div>
  );
});
