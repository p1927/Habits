import { useSyncExternalStore } from 'react';
import {
  getMealPlanQueueSyncStatus,
  type MealPlanQueueSyncStatus,
  type MealPlanSyncSource,
} from './mealPlanQueue';
import { subscribeMealPlanQueueBus } from './mealPlanQueueEventBus';

export type MealPlanSyncViewer = MealPlanSyncSource | 'external';

let rawSyncStatus: MealPlanQueueSyncStatus | null = null;
const listeners = new Set<() => void>();
let busUnsub: (() => void) | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function refresh() {
  rawSyncStatus = getMealPlanQueueSyncStatus();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!busUnsub) {
    busUnsub = subscribeMealPlanQueueBus(refresh);
    refresh();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && busUnsub) {
      busUnsub();
      busUnsub = null;
    }
  };
}

export function filterRemoteSyncForViewer(
  viewer: MealPlanSyncViewer,
  showOwnSource: boolean,
): MealPlanQueueSyncStatus | null {
  const status = rawSyncStatus ?? getMealPlanQueueSyncStatus();
  if (!status) return null;
  if (viewer === 'external') return status;
  if (status.source === viewer && !showOwnSource) return null;
  return status;
}

export function useMealPlanQueueRemoteSync(
  viewer: MealPlanSyncViewer,
  opts?: { showOwnSource?: boolean },
): MealPlanQueueSyncStatus | null {
  const showOwnSource = opts?.showOwnSource ?? false;
  return useSyncExternalStore(
    subscribe,
    () => filterRemoteSyncForViewer(viewer, showOwnSource),
    () => null,
  );
}
