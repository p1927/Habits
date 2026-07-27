import { useSyncExternalStore } from 'react';
import {
  getMealPlanFailedCount,
  getMealPlanQueue,
} from './mealPlanQueue';
import { subscribeMealPlanQueueBus } from './mealPlanQueueEventBus';

export type MealPlanQueueCountSnapshot = {
  count: number;
  failedCount: number;
  badgePulse: boolean;
};

const EMPTY_SNAPSHOT: MealPlanQueueCountSnapshot = { count: 0, failedCount: 0, badgePulse: false };

let snapshot: MealPlanQueueCountSnapshot = EMPTY_SNAPSHOT;
let prevCount = 0;
let prevFailed = 0;
let pulseTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
let busUnsub: (() => void) | null = null;

function readCounts(): Pick<MealPlanQueueCountSnapshot, 'count' | 'failedCount'> {
  const count = getMealPlanQueue().length;
  const failedCount = count === 0 ? 0 : getMealPlanFailedCount();
  return { count, failedCount };
}

function shouldPulseBadge(nextCount: number, nextFailed: number): boolean {
  return (
    nextCount > prevCount ||
    nextFailed > prevFailed ||
    (prevCount > 0 && nextCount === 0) ||
    (prevFailed > 0 && nextFailed === 0)
  );
}

function emit() {
  listeners.forEach((listener) => listener());
}

function refresh() {
  const { count, failedCount } = readCounts();
  const triggerPulse = shouldPulseBadge(count, failedCount);
  prevCount = count;
  prevFailed = failedCount;

  snapshot = {
    count,
    failedCount,
    badgePulse: triggerPulse ? true : snapshot.badgePulse,
  };

  if (triggerPulse) {
    if (pulseTimer) clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => {
      snapshot = { ...snapshot, badgePulse: false };
      emit();
      pulseTimer = null;
    }, 700);
  }

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

function getSnapshot(): MealPlanQueueCountSnapshot {
  return snapshot;
}

function getServerSnapshot(): MealPlanQueueCountSnapshot {
  return EMPTY_SNAPSHOT;
}

export function useMealPlanQueueCount(): MealPlanQueueCountSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
