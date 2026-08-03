/**
 * End-to-end Open Food Facts journey.
 *
 * What this proves:
 *   - lookupOpenFoodFacts() issues the correct URL and parses the OFF response
 *     into a typed OffProduct.
 *   - scaleOffMacros() correctly scales calories/protein/carbs/fat when the
 *     user enters a serving size.
 *   - LogOffProductCard renders the product, the per-100g macros, and a
 *     scaled line when the user enters a serving quantity.
 *
 * Stubbed:
 *   - fetch (fake the OFF endpoint; the lib calls it directly).
 *
 * Stubbed at the panel boundary (not at the App level): LogOffProductCard
 * is heavy on parent state. Mounting <LogTypeTabPanel> directly with
 * fixture offProduct props is faster and more focused.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogOffProductCard } from '../components/LogOffProductCard';
import {
  scaleOffMacros,
  lookupOpenFoodFacts,
  type OffProduct,
} from '../lib/openFoodFacts';

// ---------- network stub ----------
const OFF_FIXTURE = {
  status: 1,
  product: {
    product_name: 'Greek Yogurt 2%',
    brands: 'TestBrand',
    serving_size: '170 g',
    nutriments: {
      'energy-kcal_100g': 73,
      proteins_100g: 9.9,
      carbohydrates_100g: 3.6,
      fat_100g: 1.9,
    },
  },
};
const originalFetch = globalThis.fetch;
beforeEach(() => {
  globalThis.fetch = vi.fn(async (url: RequestInfo | URL) => {
    const u = typeof url === 'string' ? url : (url as URL).toString();
    if (u.includes('world.openfoodfacts.org')) {
      return new Response(JSON.stringify(OFF_FIXTURE), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof globalThis.fetch;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ---------- helpers ----------
function renderOFF(product: OffProduct | null) {
  const props = {
    offProduct: product,
    offQuantity: '170',
    loading: false,
    onOffQuantityChange: vi.fn(),
    onLogOffProduct: vi.fn(),
  };
  return render(<LogOffProductCard {...props} />);
}

describe('Open Food Facts journey — barcode -> product -> scaled macros', () => {
  it('lookups a barcode and produces a typed OffProduct', async () => {
    const result = await lookupOpenFoodFacts('7622210449283');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Greek Yogurt 2%');
    expect(result!.brand).toBe('TestBrand');
    expect(result!.per100g.calories).toBe(73);
    expect(result!.per100g.protein).toBe(9.9);
    expect(result!.per100g.carbs).toBe(3.6);
    expect(result!.per100g.fat).toBe(1.9);
  });

  it('returns null for a missing product', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ status: 0 }), { status: 200 }),
    ) as typeof globalThis.fetch;
    const result = await lookupOpenFoodFacts('9999999999999');
    expect(result).toBeNull();
  });

  it('scaleOffMacros() scales macros by quantity', () => {
    const product: OffProduct = {
      barcode: '7622210449283',
      name: 'Greek Yogurt 2%',
      quantityG: 100,
      per100g: { calories: 73, protein: 9.9, carbs: 3.6, fat: 1.9 },
    };
    expect(scaleOffMacros(product.per100g, 100)).toEqual({
      calories: 73,
      protein: 9.9,
      carbs: 3.6,
      fat: 1.9,
    });
    expect(scaleOffMacros(product.per100g, 200)).toEqual({
      calories: 146,
      protein: 19.8,
      carbs: 7.2,
      fat: 3.8,
    });
    expect(scaleOffMacros(product.per100g, 50)).toEqual({
      calories: 36.5,
      protein: 4.95,
      carbs: 1.8,
      fat: 0.95,
    });
  });

  it('product card renders per-100g macros + scaled line + Log button', async () => {
    const product: OffProduct = {
      barcode: '7622210449283',
      name: 'Greek Yogurt 2%',
      brand: 'TestBrand',
      quantityG: 100,
      per100g: { calories: 73, protein: 9.9, carbs: 3.6, fat: 1.9 },
    };
    renderOFF(product);
    expect(await screen.findByText('Greek Yogurt 2%')).toBeTruthy();
    expect(screen.getByText(/TestBrand/)).toBeTruthy();
    expect(screen.getByText(/73\s*kcal/)).toBeTruthy();
    expect(screen.getByText(/9.9g protein/)).toBeTruthy();
    // 170g serving (default): kcal = 73 * 1.7 = 124.1 (rounded)
    expect(await screen.findByText(/124\.1 kcal/)).toBeTruthy();
    // Log button is reachable
    expect(screen.getByRole('button', { name: /log|save/i })).toBeTruthy();
  });
});
