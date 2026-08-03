/**
 * Journey: User creates a product manually in-app, then sees macros.
 *
 * STATUS: NOT BUILT.
 *
 * The user can scan a barcode (openfoodfacts-scan.journey), but
 * cannot enter a product + ingredients from scratch with all
 * macros / micros yet. The closest surface today is
 * LogOffProductCard (per-product OFF lookup) and the food-DB
 * text search. There is no "Add Product" UI in the Log tab.
 *
 * Until the missing feature ships, this file exists as a stub that
 * vitest loads cleanly without running any assertions. Once
 * feat-product-manual-entry lands (see docs/window-instances/ux-relay/
 * STATE.md ux-gap-product-manual-entry), replace the empty describe
 * with a real journey.
 */
import { describe, it, expect } from 'vitest';

describe('Manual product entry + micros journey', () => {
  it.skip('stub: awaits feat-product-manual-entry', () => {
    expect(true).toBe(true);
  });
});
