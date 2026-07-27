import { useMemo } from 'react';
import type { LogStatusShellProps } from '../components/LogStatusShell';
import type { useLogFoodScan } from './useLogFoodScan';
import type { useLogFoodUndo } from './useLogFoodUndo';
import type { useLogRecipeScan } from './useLogRecipeScan';
import type { useMealPlanShell } from './useMealPlanShell';

type FoodScan = ReturnType<typeof useLogFoodScan>;
type RecipeScan = ReturnType<typeof useLogRecipeScan>;
type MealPlan = ReturnType<typeof useMealPlanShell>;
type FoodUndo = Pick<
  ReturnType<typeof useLogFoodUndo>,
  'undoLog' | 'undoing' | 'dismissUndo' | 'handleUndo'
>;

interface UseLogStatusShellPropsOptions {
  success: string;
  error: string;
  setSuccess: (msg: string) => void;
  foodScan: FoodScan;
  recipeScan: RecipeScan;
  mealPlanShell: MealPlan;
  foodUndo: FoodUndo;
}

export function useLogStatusShellProps({
  success,
  error,
  setSuccess,
  foodScan,
  recipeScan,
  mealPlanShell,
  foodUndo,
}: UseLogStatusShellPropsOptions) {
  const { undoLog, undoing, dismissUndo, handleUndo } = foodUndo;

  return useMemo(
    (): LogStatusShellProps => ({
      success,
      error,
      undoLog,
      undoing,
      onUndo: () => void handleUndo(),
      onDismissUndo: dismissUndo,
      mealPlanUndo: mealPlanShell.mealPlanUndo,
      mealPlanUndoing: mealPlanShell.mealPlanUndoing,
      onMealPlanUndo: () => void mealPlanShell.handleMealPlanUndo(() => setSuccess('Log undone')),
      onDismissMealPlanUndo: mealPlanShell.dismissMealPlanUndo,
      editOpen: foodScan.editOpen,
      editName: foodScan.editName,
      editQty: foodScan.editQty,
      onEditClose: () => foodScan.setEditOpen(false),
      onEditNameChange: foodScan.setEditName,
      onEditQtyChange: foodScan.setEditQty,
      onEditSubmit: () => {
        void foodScan.logScan(foodScan.editName, Number.parseFloat(foodScan.editQty));
        foodScan.setEditOpen(false);
      },
      recipeEditOpen: recipeScan.recipeEditOpen,
      recipeEditName: recipeScan.recipeEditName,
      recipeEditQty: recipeScan.recipeEditQty,
      onRecipeEditClose: () => recipeScan.setRecipeEditOpen(false),
      onRecipeEditNameChange: recipeScan.setRecipeEditName,
      onRecipeEditQtyChange: recipeScan.setRecipeEditQty,
      onRecipeEditSubmit: () => {
        void recipeScan.logRecipeScan(recipeScan.recipeEditName, Number.parseFloat(recipeScan.recipeEditQty));
        recipeScan.setRecipeEditOpen(false);
      },
    }),
    [success, error, undoLog, undoing, handleUndo, dismissUndo, mealPlanShell, foodScan, recipeScan, setSuccess],
  );
}
