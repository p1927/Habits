import type { FoodScanResult, FoodTodayResponse } from './api';
import type { LogFoodUndoRestore } from '../hooks/useLogFoodScan';

export async function logRecipeScanFlow(
  name: string,
  qty: number,
  ctx: {
    recipeScanResult: FoodScanResult | null;
    recipeEditName: string;
    recipeEditQty: string;
    setRecipeScanResult: (result: FoodScanResult | null) => void;
    logItem: (
      food: string,
      qty: number,
      onSuccess?: (summary: FoodTodayResponse) => void,
    ) => Promise<void>;
    offerUndo: (
      summary: FoodTodayResponse,
      food: string,
      qty: number,
      restore?: LogFoodUndoRestore,
    ) => void;
    syncRecipeScanQueue: () => void;
    processRecipeScanQueue: () => Promise<void>;
  },
): Promise<void> {
  const savedScan = ctx.recipeScanResult;
  const savedName = ctx.recipeEditName;
  const savedQty = ctx.recipeEditQty;
  ctx.setRecipeScanResult(null);
  await ctx.logItem(name, qty, (summary) => {
    ctx.offerUndo(summary, name, qty, {
      recipeScan: savedScan,
      editName: savedName,
      editQty: savedQty,
    });
  });
  ctx.syncRecipeScanQueue();
  void ctx.processRecipeScanQueue();
}
