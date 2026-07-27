import type { HabitsStreaksResponse, HabitsTodayResponse } from './api';
import type { QueuedHabitEntry } from '../hooks/useOptimisticHabitLog';

export interface DayHabitHoursCardProps {
  habits: HabitsTodayResponse | null;
  streaks: HabitsStreaksResponse | null;
  saving: string | null;
  streakLegendOpen: boolean;
  pending: QueuedHabitEntry[];
  onToggleLegend: () => void;
  onUpdateMetric: (key: string, value: string) => void;
  onRetryPending: (entry: QueuedHabitEntry) => void;
  onDismissPending: (id: string) => void;
  metricLabel: (key: string) => string;
}

export interface DayStreakTierLegendProps {
  open: boolean;
  onToggle: () => void;
}

export interface DayHabitMetricGridProps {
  habits: HabitsTodayResponse | null;
  streaks: HabitsStreaksResponse | null;
  saving: string | null;
  onUpdateMetric: (key: string, value: string) => void;
}

export interface DayHabitFailedSyncListProps {
  failed: QueuedHabitEntry[];
  metricLabel: (key: string) => string;
  onRetryPending: (entry: QueuedHabitEntry) => void;
  onDismissPending: (id: string) => void;
}
