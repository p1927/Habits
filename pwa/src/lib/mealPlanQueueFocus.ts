import type { QueuedMealPlanLog } from './mealPlanQueue';

export function mealPlanQueueItemId(itemId: string): string {
  return `meal-plan-queue-item-${itemId}`;
}

export interface FocusMealPlanQueueScrollTargetOptions {
  queue: QueuedMealPlanLog[];
  failedIds: Set<string>;
  panel: HTMLElement | null;
  syncButton: HTMLButtonElement | null;
  serverOnline: boolean;
  syncing: boolean;
  retrying: boolean;
  reducedMotion: boolean;
}

export function focusMealPlanQueueScrollTarget({
  queue,
  failedIds,
  panel,
  syncButton,
  serverOnline,
  syncing,
  retrying,
  reducedMotion,
}: FocusMealPlanQueueScrollTargetOptions): void {
  const scrollBehavior = reducedMotion ? 'auto' : 'smooth';
  const firstFailed = queue.find((item) => failedIds.has(item.id));

  if (firstFailed) {
    const row = document.getElementById(mealPlanQueueItemId(firstFailed.id));
    if (row) {
      row.scrollIntoView({ block: 'nearest', behavior: scrollBehavior });
      const retryBtn = row.querySelector<HTMLButtonElement>('[data-meal-plan-retry]');
      if (retryBtn) {
        retryBtn.focus({ preventScroll: true });
        return;
      }
      row.focus({ preventScroll: true });
      return;
    }
  }

  panel?.scrollIntoView({ block: 'nearest', behavior: scrollBehavior });
  if (serverOnline && syncButton && !syncing && !retrying) {
    syncButton.focus({ preventScroll: true });
  } else {
    panel?.focus({ preventScroll: true });
  }
}
