import type { LogFoodUndoRestore } from '../hooks/useLogFoodScan';
import { api, type FoodSearchResult, type FoodTodayResponse } from './api';
import { resolveBarcodeLookup, type BarcodeLookupResult } from './logBarcodeLookup';
import { scaleOffMacros, type OffProduct } from './openFoodFacts';

export function applyBarcodeLookupResult(
  result: BarcodeLookupResult,
  setters: {
    setFoodName: (name: string) => void;
    setSearchResults: (results: FoodSearchResult[]) => void;
    setOffProduct: (product: OffProduct | null) => void;
    setOffQuantity: (qty: string) => void;
    setSuccess: (msg: string) => void;
  },
) {
  if (result.kind === 'sheet') {
    setters.setFoodName(result.name);
    setters.setSearchResults(result.results);
  } else if (result.kind === 'off') {
    setters.setOffProduct(result.product);
    setters.setOffQuantity(String(result.product.quantityG));
    setters.setFoodName(result.product.name);
    setters.setSearchResults(result.results);
  } else {
    setters.setFoodName(result.code);
    setters.setSearchResults(result.results);
  }
  setters.setSuccess(result.message);
}

export async function executeBarcodeLookup(
  code: string,
  serverOnline: boolean,
  setters: {
    setFoodName: (name: string) => void;
    setSearchResults: (results: FoodSearchResult[]) => void;
    setOffProduct: (product: OffProduct | null) => void;
    setOffQuantity: (qty: string) => void;
    setSuccess: (msg: string) => void;
    setError: (msg: string) => void;
    setLoading: (loading: boolean) => void;
  },
  onSwitchToTypeTab: () => void,
): Promise<void> {
  setters.setError('');
  setters.setSuccess('');
  setters.setOffProduct(null);
  onSwitchToTypeTab();
  setters.setLoading(true);
  try {
    const result = await resolveBarcodeLookup(code, serverOnline);
    applyBarcodeLookupResult(result, setters);
  } catch (e) {
    setters.setError(e instanceof Error ? e.message : 'Barcode lookup failed');
  } finally {
    setters.setLoading(false);
  }
}

export async function executeOffProductLog(
  offProduct: OffProduct,
  offQuantity: string,
  ctx: {
    logMacros: (
      food: string,
      qty: number,
      macros: { calories: number; carbs: number; protein: number; fat: number },
      onSuccess?: (summary: FoodTodayResponse) => void,
    ) => Promise<void>;
    offerUndo: (
      summary: FoodTodayResponse,
      food: string,
      qty: number,
      restore?: LogFoodUndoRestore,
    ) => void;
    setOffProduct: (product: OffProduct | null) => void;
    setFoodName: (name: string) => void;
    setSearchResults: (results: FoodSearchResult[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (msg: string) => void;
  },
): Promise<void> {
  const qty = Number.parseFloat(offQuantity);
  if (!qty || qty <= 0) return;
  const savedOff = offProduct;
  const savedQty = offQuantity;
  ctx.setLoading(true);
  ctx.setError('');
  try {
    const macros = scaleOffMacros(offProduct.per100g, qty);
    await ctx.logMacros(offProduct.name, qty, macros, (summary) => {
      ctx.setOffProduct(null);
      ctx.setFoodName('');
      ctx.setSearchResults([]);
      ctx.offerUndo(summary, savedOff.name, qty, {
        offProduct: savedOff,
        editName: savedOff.name,
        editQty: savedQty,
        offQuantity: savedQty,
      });
    });
  } catch (e) {
    ctx.setError(e instanceof Error ? e.message : 'Open Food Facts log failed');
  } finally {
    ctx.setLoading(false);
  }
}

export async function deleteFoodRowWithConfirm(
  row: number,
  setData: React.Dispatch<React.SetStateAction<FoodTodayResponse | null>>,
  setLoading: (loading: boolean) => void,
  setError: (msg: string) => void,
): Promise<void> {
  if (!window.confirm('Remove this entry?')) return;
  setLoading(true);
  try {
    setData(await api.deleteFoodRow(row));
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Delete failed');
  } finally {
    setLoading(false);
  }
}
