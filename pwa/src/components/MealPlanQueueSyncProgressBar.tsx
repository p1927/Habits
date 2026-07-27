interface MealPlanQueueSyncProgressBarProps {
  className: string;
  syncProgress: { done: number; total: number };
  announceSyncProgress: boolean;
}

export function MealPlanQueueSyncProgressBar({
  className,
  syncProgress,
  announceSyncProgress,
}: MealPlanQueueSyncProgressBarProps) {
  if (syncProgress.total <= 0) return null;

  return (
    <div
      className={className}
      role="progressbar"
      aria-live={announceSyncProgress ? 'polite' : undefined}
      aria-atomic={announceSyncProgress ? 'true' : undefined}
      aria-valuenow={syncProgress.done}
      aria-valuemin={0}
      aria-valuemax={syncProgress.total}
      aria-valuetext={`Syncing meal logs, ${syncProgress.done} of ${syncProgress.total} complete`}
      aria-label="Meal plan sync progress"
    >
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(syncProgress.done / syncProgress.total) * 100}%` }}
        />
      </div>
    </div>
  );
}
