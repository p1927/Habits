import type { TypeTab, SectionData, FoodLog, MealPlan } from './logTabPanelsPropsBuilder';

export interface BuildTypeTabPropsInput {
  typeTab: TypeTab;
  sectionData: SectionData;
  foodLog: FoodLog;
  mealPlanShell: MealPlan;
  scrollToFoodQueue?: number;
  // relay-232: Ask Coach handoff. Routed through to the type panel which
  // passes it to LogTypeTodayTotalsStrip. The caller (Log section, via
  // useLogSection) sources this from a navigation prop on the Log tab.
  onAskCoach?: (prompt: string) => void;
}

export function buildTypeTabProps({
  typeTab,
  sectionData,
  foodLog,
  mealPlanShell,
  scrollToFoodQueue,
  onAskCoach,
}: BuildTypeTabPropsInput) {
  const { pending } = foodLog;
  const { data, mealPlan } = sectionData;
  return {
    scrollToFoodQueue,
    onAskCoach,
    offProduct: typeTab.offProduct,
    offQuantity: typeTab.offQuantity,
    description: typeTab.description,
    mealType: typeTab.mealType,
    foodName: typeTab.foodName,
    quantity: typeTab.quantity,
    searchResults: typeTab.searchResults,
    pending,
    data,
    mealPlan,
    loggingMealKey: mealPlanShell.loggingMealKey,
    loggingMeals: mealPlanShell.loggingMeals,
    onLogMealPlanEntry: mealPlanShell.logMealPlanEntry,
    onBarcodeScan: (code: string) => void typeTab.handleBarcode(code),
    onOffQuantityChange: typeTab.setOffQuantity,
    onLogOffProduct: () => void typeTab.handleLogOffProduct(),
    onVoiceLog: typeTab.handleVoiceLog,
    onDescriptionChange: typeTab.setDescription,
    onMealTypeChange: typeTab.setMealType,
    onManualLog: typeTab.handleManualLog,
    onFoodNameChange: typeTab.setFoodName,
    onSelectSearchResult: typeTab.selectSearchResult,
    onQuantityChange: typeTab.setQuantity,
    onRetryPending: foodLog.retry,
    onDismissPending: foodLog.dismiss,
    onDeleteItem: (row: number) => void typeTab.handleDelete(row),
  };
}
