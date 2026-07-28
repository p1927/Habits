import type { QueuedMealPlanLog } from './mealPlanQueue';
import type { MealPlanQueuePanelVariant } from './mealPlanQueuePanelCopy';

export type { MealPlanQueuePanelVariant } from './mealPlanQueuePanelCopy';

export interface MealPlanQueuePanelProps {
  serverOnline: boolean;
  queue: QueuedMealPlanLog[];
  syncing: boolean;
  syncProgress: { done: number; total: number } | null;
  failedIds: Set<string>;
  retryingId: string | null;
  variant?: MealPlanQueuePanelVariant;
  noPlanToday?: boolean;
  syncAllLabel?: string;
  clearAllLabel?: string;
  bannerSuffix?: string;
  syncActionHint?: string;
  onSyncAll: () => void;
  onRetryFailed?: () => void;
  onRetry: (item: QueuedMealPlanLog) => void;
  onDismissItem: (id: string) => void;
  onClearAll: () => void;
  scrollToQueueToken?: number;
}
