import { Card } from './ui/Card';
import { scaleOffMacros, type OffProduct } from '../lib/openFoodFacts';

export interface LogOffProductCardProps {
  offProduct: OffProduct;
  offQuantity: string;
  loading: boolean;
  onOffQuantityChange: (value: string) => void;
  onLogOffProduct: () => void;
}

export function LogOffProductCard({
  offProduct,
  offQuantity,
  loading,
  onOffQuantityChange,
  onLogOffProduct,
}: LogOffProductCardProps) {
  const offQty = Number.parseFloat(offQuantity);
  const offScaled = offQty > 0 ? scaleOffMacros(offProduct.per100g, offQty) : null;

  return (
    <Card className="log-type-card home-export-card--health off-product-card">
      <p className="section-eyebrow">Lookup</p>
      <h2>Open Food Facts</h2>
      <p className="off-product-name">{offProduct.name}</p>
      {offProduct.brand && <p className="muted">{offProduct.brand}</p>}
      <p className="muted">Per 100g · barcode {offProduct.barcode}</p>
      <div className="off-product-macros">
        <span>{offProduct.per100g.calories} kcal</span>
        <span>{offProduct.per100g.protein}g protein</span>
        <span>{offProduct.per100g.carbs}g carbs</span>
        <span>{offProduct.per100g.fat}g fat</span>
      </div>
      <label className="field">
        Serving (g)
        <input
          type="number"
          min="1"
          step="1"
          value={offQuantity}
          onChange={(e) => onOffQuantityChange(e.target.value)}
          disabled={loading}
        />
      </label>
      {offScaled && (
        <p className="muted">
          For {offQty}g: {offScaled.calories} kcal · {offScaled.protein}g protein
        </p>
      )}
      <button type="button" className="btn-pill" disabled={loading} onClick={onLogOffProduct}>
        Log from Open Food Facts
      </button>
      <p className="muted">Or pick a matching food from your sheet below</p>
    </Card>
  );
}
