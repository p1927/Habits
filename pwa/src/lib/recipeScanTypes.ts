export type SavedRecipe = {
  name: string;
  items: { food: string; quantity_g: number; calories: number; protein: number }[];
  totals: { calories: number; protein: number } | null;
};

export type SavedRecipeLoadResult = {
  recipe: SavedRecipe | null;
  sheetsConnected: boolean | null;
};

export interface RecipeScanResultHandlers {
  setRecipePhoto: (url: string) => void;
  setRecipeScanResult: (result: import('./api').FoodScanResult | null) => void;
  setRecipeEditName: (name: string) => void;
  setRecipeEditQty: (qty: string) => void;
  setSuccess: (msg: string) => void;
}

export interface RecipePhotoCaptureContext extends RecipeScanResultHandlers {
  serverOnline: boolean;
  syncRecipeScanQueue: () => void;
  setRecipePhoto: (url: string | null) => void;
  setRecipeScanning: (scanning: boolean) => void;
  setError: (msg: string) => void;
}
