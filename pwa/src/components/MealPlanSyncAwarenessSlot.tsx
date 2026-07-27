import { MealPlanQueuePendingBanner } from './MealPlanQueuePendingBanner';
import { MealPlanRemoteSyncBanner } from './MealPlanRemoteSyncBanner';
import { useMealPlanQueueCount } from '../hooks/useMealPlanQueueCount';
import { useMealPlanQueueRemoteSync, type MealPlanSyncViewer } from '../hooks/useMealPlanQueueRemoteSync';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

export interface MealPlanSyncAwarenessSlotProps {
  viewer: MealPlanSyncViewer;
  onNavigate?: (source: MealPlanSyncSource) => void;
  /** Hide remote banner while this tab syncs its own meal plan queue */
  localSyncing?: boolean;
  /** When false, render nothing (e.g. Log Plan sub-tab) */
  visible?: boolean;
  /** Log: show banner when sync originated on Plan tab */
  showOwnSource?: boolean;
  /** Cards: show pending queue banner when no remote sync in progress */
  showPendingWhenIdle?: boolean;
}

export function MealPlanSyncAwarenessSlot({
  viewer,
  onNavigate,
  localSyncing = false,
  visible = true,
  showOwnSource = false,
  showPendingWhenIdle = false,
}: MealPlanSyncAwarenessSlotProps) {
  const remoteSync = useMealPlanQueueRemoteSync(viewer, { showOwnSource });
  const { count, failedCount } = useMealPlanQueueCount();

  if (!visible || !onNavigate) return null;

  if (remoteSync && !localSyncing) {
    return <MealPlanRemoteSyncBanner sync={remoteSync} onGoToSource={onNavigate} />;
  }

  if (showPendingWhenIdle) {
    return (
      <MealPlanQueuePendingBanner
        count={count}
        failedCount={failedCount}
        onOpenHome={() => onNavigate('home')}
      />
    );
  }

  return null;
}
