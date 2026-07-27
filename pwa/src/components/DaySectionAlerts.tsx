import { StreakMilestoneToast } from './StreakMilestoneToast';
import { UndoToast } from './UndoToast';
import type { DaySectionAlertsProps } from '../lib/daySectionTypes';

export function DaySectionAlerts({
  mealSuccess,
  habitSyncMessage,
  error,
  streak,
  mealPlanUndo,
  mealPlanUndoing,
  onMealPlanUndo,
  onDismissMealPlanUndo,
}: DaySectionAlertsProps) {
  return (
    <>
      <div role="status" aria-live="polite">
        {mealSuccess && !mealPlanUndo && <div className="banner banner-ok banner-revolut">{mealSuccess}</div>}
        {habitSyncMessage && <div className="banner banner-ok banner-revolut">{habitSyncMessage}</div>}
      </div>
      {error && (
        <div className="banner banner-warn banner-revolut" role="alert">
          {error}
        </div>
      )}
      {streak.milestoneToast && (
        <StreakMilestoneToast message={streak.milestoneToast} onDismiss={streak.dismissMilestoneToast} />
      )}
      {mealPlanUndo && (
        <UndoToast
          message={`Logged ${mealPlanUndo.label}`}
          onUndo={onMealPlanUndo}
          onDismiss={onDismissMealPlanUndo}
          undoing={mealPlanUndoing}
        />
      )}
    </>
  );
}
