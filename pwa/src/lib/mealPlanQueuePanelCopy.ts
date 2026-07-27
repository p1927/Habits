export type MealPlanQueuePanelVariant = 'home' | 'default';

export function countFailedMealPlanQueueItems(
  queue: { id: string }[],
  failedIds: Set<string>,
): number {
  return queue.filter((item) => failedIds.has(item.id)).length;
}

export function mealPlanQueuePanelClasses(
  variant: MealPlanQueuePanelVariant,
  opts: { syncing: boolean; noPlanToday: boolean; failedCount: number },
): string {
  const isHome = variant === 'home';
  const panelClass = isHome ? 'home-meal-plan-queue-panel' : 'meal-plan-queue-panel';
  return [
    panelClass,
    opts.syncing ? `${panelClass}--syncing` : '',
    isHome && opts.noPlanToday ? `${panelClass}--no-plan` : '',
    opts.failedCount > 0 ? `${panelClass}--has-failed` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function mealPlanQueueProgressClass(variant: MealPlanQueuePanelVariant): string {
  return variant === 'home' ? 'home-meal-plan-sync-progress' : 'meal-plan-sync-progress';
}

export function mealPlanQueueShortcutHint(
  failedCount: number,
  onRetryFailed: (() => void) | undefined,
  syncActionHint: string,
): string {
  return failedCount > 0 && onRetryFailed
    ? ` · press S or ${syncActionHint} · R retry failed`
    : ` · press S or ${syncActionHint}`;
}

export function mealPlanQueueBannerText(
  queueLength: number,
  failedCount: number,
  serverOnline: boolean,
  syncing: boolean,
  syncProgress: { done: number; total: number } | null,
  bannerSuffix: string,
  shortcutHint: string,
): string {
  if (syncing && syncProgress) {
    return `Syncing meal logs (${syncProgress.done}/${syncProgress.total})…`;
  }
  return `${queueLength} meal log${queueLength === 1 ? '' : 's'} queued${
    failedCount > 0 ? ` · ${failedCount} failed` : ''
  }${bannerSuffix}${serverOnline ? shortcutHint : ' — will sync when online'}.`;
}
