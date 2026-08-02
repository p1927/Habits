import type { FoodTodayResponse } from '../lib/api';
import type { LogTabPanelsProps } from './logTabPanelsProps';
import type { LogFoodUndoRestore } from '../hooks/useLogFoodScan';
import type { useLogFoodScan } from '../hooks/useLogFoodScan';
import type { useLogRecipeScan } from '../hooks/useLogRecipeScan';
import type { useLogTypeTab } from '../hooks/useLogTypeTab';
import type { useMealPlanShell } from '../hooks/useMealPlanShell';
import type { useLogSectionData } from '../hooks/useLogSectionData';
import type { useOptimisticFoodLog } from '../hooks/useOptimisticFoodLog';
import type { SwipeDirection } from '../components/ui/SwipeStack';
import { buildFoodScanProps } from './logTabPanelsPropsBuilder.foodScan';
import { buildTypeTabProps } from './logTabPanelsPropsBuilder.typeTab';
import { buildRecipeScanProps } from './logTabPanelsPropsBuilder.recipeScan';
import { buildMealPlanQueueProps } from './logTabPanelsPropsBuilder.mealPlanQueue';

export type FoodScan = ReturnType<typeof useLogFoodScan>;
export type RecipeScan = ReturnType<typeof useLogRecipeScan>;
export type TypeTab = ReturnType<typeof useLogTypeTab>;
export type MealPlan = ReturnType<typeof useMealPlanShell>;
export type SectionData = ReturnType<typeof useLogSectionData>;
export type FoodLog = Pick<
  ReturnType<typeof useOptimisticFoodLog>,
  'pending' | 'logItem' | 'retry' | 'dismiss'
>;

export type OfferUndoFn = (
  summary: FoodTodayResponse,
  food: string,
  qty: number,
  restore?: LogFoodUndoRestore,
) => void;

export type RecipeScanSwipeHandler = (dir: SwipeDirection) => void;

export interface BuildLogTabPanelsPropsInput {
  loading: boolean;
  scrollToMealPlanQueue?: number;
  scrollToFoodQueue?: number;
  foodScan: FoodScan;
  recipeScan: RecipeScan;
  typeTab: TypeTab;
  mealPlanShell: MealPlan;
  sectionData: SectionData;
  foodLog: FoodLog;
  offerUndo: OfferUndoFn;
}

export interface AssembledLogTabPanelsPropsInput extends BuildLogTabPanelsPropsInput {
  onRecipeScanSwipe: RecipeScanSwipeHandler;
}

export function buildLogTabPanelsProps({
  loading,
  scrollToMealPlanQueue,
  scrollToFoodQueue,
  foodScan,
  recipeScan,
  typeTab,
  mealPlanShell,
  sectionData,
  foodLog,
  offerUndo,
  onRecipeScanSwipe,
}: AssembledLogTabPanelsPropsInput): Omit<LogTabPanelsProps, 'tab' | 'serverOnline'> {
  return {
    ...buildFoodScanProps({ foodScan, loading, scrollToFoodQueue }),
    ...buildTypeTabProps({
      typeTab,
      sectionData,
      foodLog,
      mealPlanShell,
      scrollToFoodQueue,
    }),
    ...buildRecipeScanProps({ recipeScan, foodLog, offerUndo, onRecipeScanSwipe }),
    scrollToMealPlanQueue,
    ...buildMealPlanQueueProps({ mealPlanShell, sectionData }),
  };
}
