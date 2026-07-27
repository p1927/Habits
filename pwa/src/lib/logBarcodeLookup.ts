import { api, type FoodSearchResult } from './api';
import { lookupOpenFoodFacts, type OffProduct } from './openFoodFacts';

export type BarcodeLookupResult =
  | { kind: 'sheet'; name: string; results: FoodSearchResult[]; message: string }
  | { kind: 'off'; product: OffProduct; results: FoodSearchResult[]; message: string }
  | { kind: 'unknown'; code: string; results: FoodSearchResult[]; message: string };

export async function resolveBarcodeLookup(
  code: string,
  serverOnline: boolean,
): Promise<BarcodeLookupResult> {
  if (serverOnline) {
    const res = await api.searchFood(code);
    if (res.results[0]) {
      return {
        kind: 'sheet',
        name: res.results[0].name,
        results: res.results,
        message: `Found in your database: ${res.results[0].name}`,
      };
    }
  }

  const off = await lookupOpenFoodFacts(code);
  if (off) {
    let results: FoodSearchResult[] = [];
    if (serverOnline) {
      const local = await api.searchFood(off.name.split(/\s+/)[0] ?? off.name);
      results = local.results;
    }
    return {
      kind: 'off',
      product: off,
      results,
      message: `Open Food Facts: ${off.name}${off.brand ? ` (${off.brand})` : ''} — log directly or pick a sheet match`,
    };
  }

  let results: FoodSearchResult[] = [];
  if (serverOnline) {
    const res = await api.searchFood(code);
    results = res.results;
  }
  return {
    kind: 'unknown',
    code,
    results,
    message: `Barcode ${code} — not found in Open Food Facts or your database`,
  };
}
