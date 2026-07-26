export interface OffProduct {
  barcode: string;
  name: string;
  brand?: string;
  quantityG: number;
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : 0;
}

function parseServingGrams(servingSize?: string, quantity?: string): number {
  const sources = [servingSize, quantity].filter(Boolean) as string[];
  for (const raw of sources) {
    const match = raw.match(/(\d+(?:[.,]\d+)?)\s*g\b/i);
    if (match) {
      return Math.max(1, Math.round(Number.parseFloat(match[1].replace(',', '.'))));
    }
  }
  return 100;
}

function productName(product: Record<string, unknown>): string {
  const name = String(product.product_name ?? product.product_name_en ?? '').trim();
  const generic = String(product.generic_name ?? product.generic_name_en ?? '').trim();
  return name || generic || 'Unknown product';
}

export async function lookupOpenFoodFacts(barcode: string): Promise<OffProduct | null> {
  const clean = barcode.replace(/\D/g, '');
  if (!clean) return null;

  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(clean)}?fields=product_name,product_name_en,generic_name,generic_name_en,brands,nutriments,serving_size,quantity`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'HabitsPWA/1.0 (personal health tracker)' },
  });
  if (!resp.ok) return null;

  const data = (await resp.json()) as {
    status?: number;
    product?: Record<string, unknown>;
  };
  if (data.status !== 1 || !data.product) return null;

  const product = data.product;
  const nutriments = (product.nutriments ?? {}) as Record<string, unknown>;
  let calories = num(nutriments['energy-kcal_100g']);
  if (calories <= 0) {
    const kj = num(nutriments.energy_100g);
    if (kj > 0) calories = Math.round(kj / 4.184);
  }

  const name = productName(product);
  if (name === 'Unknown product') return null;

  return {
    barcode: clean,
    name,
    brand: String(product.brands ?? '').trim() || undefined,
    quantityG: parseServingGrams(
      String(product.serving_size ?? ''),
      String(product.quantity ?? ''),
    ),
    per100g: {
      calories: Math.round(calories),
      protein: Math.round(num(nutriments.proteins_100g) * 10) / 10,
      carbs: Math.round(num(nutriments.carbohydrates_100g) * 10) / 10,
      fat: Math.round(num(nutriments.fat_100g) * 10) / 10,
    },
  };
}
