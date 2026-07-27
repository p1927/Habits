import { LogFoodEditSheet } from './LogFoodEditSheet';
import { UndoToast } from './UndoToast';
import type { FoodLogUndoEntry } from '../hooks/useLogFoodUndo';
import type { MealPlanUndoState } from '../hooks/useMealPlanUndo';

interface LogStatusShellProps {
  success: string;
  error: string;
  undoLog: FoodLogUndoEntry | null;
  undoing: boolean;
  onUndo: () => void;
  onDismissUndo: () => void;
  mealPlanUndo: MealPlanUndoState | null;
  mealPlanUndoing: boolean;
  onMealPlanUndo: () => void;
  onDismissMealPlanUndo: () => void;
  editOpen: boolean;
  editName: string;
  editQty: string;
  onEditClose: () => void;
  onEditNameChange: (value: string) => void;
  onEditQtyChange: (value: string) => void;
  onEditSubmit: () => void;
  recipeEditOpen: boolean;
  recipeEditName: string;
  recipeEditQty: string;
  onRecipeEditClose: () => void;
  onRecipeEditNameChange: (value: string) => void;
  onRecipeEditQtyChange: (value: string) => void;
  onRecipeEditSubmit: () => void;
}

export function LogStatusShell({
  success,
  error,
  undoLog,
  undoing,
  onUndo,
  onDismissUndo,
  mealPlanUndo,
  mealPlanUndoing,
  onMealPlanUndo,
  onDismissMealPlanUndo,
  editOpen,
  editName,
  editQty,
  onEditClose,
  onEditNameChange,
  onEditQtyChange,
  onEditSubmit,
  recipeEditOpen,
  recipeEditName,
  recipeEditQty,
  onRecipeEditClose,
  onRecipeEditNameChange,
  onRecipeEditQtyChange,
  onRecipeEditSubmit,
}: LogStatusShellProps) {
  const showSuccess = Boolean(success && !undoLog && !mealPlanUndo);

  return (
    <>
      <LogFoodEditSheet
        open={recipeEditOpen}
        title="Edit recipe scan"
        name={recipeEditName}
        quantity={recipeEditQty}
        onClose={onRecipeEditClose}
        onNameChange={onRecipeEditNameChange}
        onQuantityChange={onRecipeEditQtyChange}
        onSubmit={onRecipeEditSubmit}
      />

      <LogFoodEditSheet
        open={editOpen}
        title="Edit scan"
        name={editName}
        quantity={editQty}
        onClose={onEditClose}
        onNameChange={onEditNameChange}
        onQuantityChange={onEditQtyChange}
        onSubmit={onEditSubmit}
      />

      <div role="status" aria-live="polite">
        {showSuccess && <div className="banner banner-ok banner-revolut">{success}</div>}
      </div>
      {error && <div className="banner banner-warn banner-revolut" role="alert">{error}</div>}

      {undoLog && (
        <UndoToast
          message={`Logged ${undoLog.food}`}
          onUndo={onUndo}
          onDismiss={onDismissUndo}
          undoing={undoing}
        />
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
