import { Card } from './ui/Card';
import { SwipeStack, type SwipeDirection } from './ui/SwipeStack';
import type { FoodScanResult } from '../lib/api';

interface SwipeFoodCardProps {
  scan: FoodScanResult;
  onAction: (action: SwipeDirection) => void;
  onEdit: () => void;
}

export function SwipeFoodCard({ scan, onAction, onEdit }: SwipeFoodCardProps) {
  const name = scan.matched_name ?? scan.detected_name;
  const macros = scan.macros;

  return (
    <SwipeStack
      label={`Food scan: ${name}`}
      onSwipe={(dir) => {
        if (dir === 'left') onEdit();
        else onAction(dir);
      }}
      hintRight="Log"
      hintLeft="Edit"
      hintUp="Skip"
    >
      <Card variant="elevated" className="swipe-food-card">
        <div className="swipe-food-confidence">
          {Math.round(scan.confidence * 100)}% match
        </div>
        <h2>{name}</h2>
        <p className="muted">{scan.suggested_grams}g suggested</p>
        {macros && (
          <div className="swipe-food-macros">
            <span>{macros.calories.toFixed(0)} kcal</span>
            <span>{macros.protein.toFixed(1)}g protein</span>
            <span>{macros.carbs.toFixed(1)}g carbs</span>
            <span>{macros.fat.toFixed(1)}g fat</span>
          </div>
        )}
        {!scan.matched_name && (
          <p className="banner banner-warn">Not in food DB — swipe Edit to adjust name</p>
        )}
      </Card>
    </SwipeStack>
  );
}
