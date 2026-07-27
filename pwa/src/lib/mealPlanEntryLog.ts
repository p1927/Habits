import { api, type FoodTodayResponse } from './api';
import {
  enqueueMealPlanLog,
  isOfflineError,
  type MealPlanSyncSource,
} from './mealPlanQueue';

export type MealPlanEntryLogRequest =
  | {
      kind: 'item';
      meal: string;
      label: string;
      description: string;
      queueMessage: string;
    }
  | {
      kind: 'all';
      label: string;
      queueMessage: string;
    };

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

interface ExecuteMealPlanEntryLogOptions {
  serverOnline: boolean;
  syncSource: MealPlanSyncSource;
  request: MealPlanEntryLogRequest;
  syncMealPlanQueue: () => void;
  dismissMealPlanUndo: () => void;
  snapshotFoodRows: (summary: FoodTodayResponse | null) => Set<number>;
  offerUndoFromSummary: (
    beforeRows: Set<number>,
    afterSummary: FoodTodayResponse,
    label: string,
  ) => boolean;
  setMessage: (msg: string) => void;
  setError: (msg: string) => void;
  resolveFoodBefore: () => Promise<FoodTodayResponse>;
  onFoodUpdated?: (summary: FoodTodayResponse) => void;
  onAfterLog?: () => void;
}

export async function executeMealPlanEntryLog({
  serverOnline,
  syncSource,
  request,
  syncMealPlanQueue,
  dismissMealPlanUndo,
  snapshotFoodRows,
  offerUndoFromSummary,
  setMessage,
  setError,
  resolveFoodBefore,
  onFoodUpdated,
  onAfterLog,
}: ExecuteMealPlanEntryLogOptions): Promise<void> {
  setMessage('');
  setError('');
  dismissMealPlanUndo();

  const queueOffline = () => {
    if (request.kind === 'item') {
      enqueueMealPlanLog(
        {
          kind: 'item',
          meal: request.meal,
          label: request.label,
          description: request.description,
        },
        { source: syncSource },
      );
    } else {
      enqueueMealPlanLog({ kind: 'all' }, { source: syncSource });
    }
    syncMealPlanQueue();
    setMessage(request.queueMessage);
  };

  if (!serverOnline || isOffline()) {
    queueOffline();
    return;
  }

  try {
    const before = await resolveFoodBefore();
    const res =
      request.kind === 'item'
        ? await api.logMealPlanItem(request.meal)
        : await api.logMealPlanToday();
    onFoodUpdated?.(res.summary);
    if (!offerUndoFromSummary(snapshotFoodRows(before), res.summary, request.label)) {
      setMessage(res.message);
    }
    onAfterLog?.();
  } catch (e) {
    if (isOfflineError(e)) {
      queueOffline();
      return;
    }
    setError(e instanceof Error ? e.message : 'Meal log failed');
  }
}
