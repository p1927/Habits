import { useMemo, useSyncExternalStore } from 'react';
import {
  getMealPlanQueueSyncStatus,
  type MealPlanQueueSyncStatus,
  type MealPlanSyncSource,
} from './mealPlanQueue';
import { subscribeMealPlanQueueBus } from './mealPlanQueueEventBus';

export type MealPlanSyncViewer = MealPlanSyncSource | 'external';

let rawSyncStatus: MealPlanQueueSyncStatus | null =
  typeof window !== 'undefined' ? getMealPlanQueueSyncStatus() : null;
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

function getRawSnapshot(): MealPlanQueueSyncStatus | null {
  return rawSyncStatus;
}

function getServerSnapshot(): MealPlanQueueSyncStatus | null {
  return null;
}

export function filterRemoteSyncForViewer(
  viewer: MealPlanSyncViewer,
  showOwnSource: boolean,
  status: MealPlanQueueSyncStatus | null = rawSyncStatus,
): MealPlanQueueSyncStatus | null {
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
  const raw = useSyncExternalStore(subscribe, getRawSnapshot, getServerSnapshot);
  return useMemo(
    () => filterRemoteSyncForViewer(viewer, showOwnSource, raw),
    [viewer, showOwnSource, raw],
  );
}
