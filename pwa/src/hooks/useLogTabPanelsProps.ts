import { useMemo } from 'react';
import {
  buildLogTabPanelsProps,
  type BuildLogTabPanelsPropsInput,
  type OfferUndoFn,
} from '../lib/logTabPanelsPropsBuilder';
import { useRecipeScanSwipeHandler } from './useRecipeScanSwipeHandler';

export type { OfferUndoFn };

export function useLogTabPanelsProps(options: BuildLogTabPanelsPropsInput) {
  const onRecipeScanSwipe = useRecipeScanSwipeHandler(options.recipeScan);

  return useMemo(
    () => buildLogTabPanelsProps({ ...options, onRecipeScanSwipe }),
    [
      options.loading,
      options.scrollToMealPlanQueue,
      options.foodScan,
      options.typeTab,
      options.foodLog.pending,
      options.sectionData.data,
      options.sectionData.mealPlan,
      options.mealPlanShell,
      options.foodLog.retry,
      options.foodLog.dismiss,
      options.recipeScan,
      onRecipeScanSwipe,
      options.foodLog.logItem,
      options.offerUndo,
      options.sectionData.history?.days,
    ],
  );
}
