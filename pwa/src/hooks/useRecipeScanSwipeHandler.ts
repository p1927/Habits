import { useCallback } from 'react';
import type { SwipeDirection } from '../components/ui/SwipeStack';
import type { RecipeScan } from '../lib/logTabPanelsPropsBuilder';

export function useRecipeScanSwipeHandler(recipeScan: RecipeScan) {
  return useCallback(
    (dir: SwipeDirection) => {
      if (dir === 'right') {
        void recipeScan.logRecipeScan(
          recipeScan.recipeEditName,
          Number.parseFloat(recipeScan.recipeEditQty) || recipeScan.recipeScanResult!.suggested_grams,
        );
      } else if (dir === 'up' || dir === 'left') {
        recipeScan.setRecipeScanResult(null);
        recipeScan.syncRecipeScanQueue();
        void recipeScan.processRecipeScanQueue();
      }
    },
    [recipeScan],
  );
}
