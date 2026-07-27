import { mealPlanSyncSourceLabel } from '../hooks/useMealPlanQueueRemoteSync';
import type { MealPlanQueueSyncStatus, MealPlanSyncSource } from '../lib/mealPlanQueue';

export interface MealPlanRemoteSyncBannerProps {
  sync: MealPlanQueueSyncStatus;
  onGoToSource: (source: MealPlanSyncSource) => void;
}

export function MealPlanRemoteSyncBanner({ sync, onGoToSource }: MealPlanRemoteSyncBannerProps) {
  const label = mealPlanSyncSourceLabel(sync.source);

  return (
    <button
      type="button"
      className="banner banner-warn meal-plan-remote-sync meal-plan-remote-sync--actionable"
      role="status"
      onClick={() => onGoToSource(sync.source)}
    >
      Syncing meal logs on {label} ({sync.done}/{sync.total})… — tap to open {label}
    </button>
  );
}
