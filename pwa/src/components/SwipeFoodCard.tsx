import { Card } from './ui/Card';
import { SwipeStack, type SwipeDirection } from './ui/SwipeStack';
import type { FoodScanResult } from '../lib/api';

interface SwipeFoodCardProps {
  scan: FoodScanResult;
  imageUrl?: string | null;
  overlay?: boolean;
  onAction: (action: SwipeDirection) => void;
  onEdit: () => void;
}

export function SwipeFoodCard({ scan, imageUrl, overlay = false, onAction, onEdit }: SwipeFoodCardProps) {
  const name = scan.matched_name ?? scan.detected_name;
  const macros = scan.macros;
  const tinderLayout = Boolean(imageUrl) || overlay;

  return (
    <SwipeStack
      className={tinderLayout ? 'ui-swipe-stack--tinder' : ''}
      label={`Food scan: ${name}`}
      onSwipe={(dir) => {
        if (dir === 'left') onEdit();
        else onAction(dir);
      }}
      hintRight="Log"
      hintLeft="Edit"
      hintUp="Skip"
    >
      <Card
        variant="elevated"
        className={`swipe-food-card ${tinderLayout ? 'swipe-food-card--tinder swipe-food-card--hinge' : ''} ${overlay ? 'swipe-food-card--overlay' : ''}`}
      >
        {imageUrl && !overlay && (
          <div className="swipe-food-hero">
            <img src={imageUrl} alt="" className="swipe-food-photo" />
            <div className="swipe-food-hero-shade" aria-hidden="true" />
          </div>
        )}
        <div className="swipe-food-body">
          <p className="swipe-food-prompt">Today&apos;s meal</p>
          <div className="swipe-food-confidence">
            <span className="swipe-food-confidence-dot" aria-hidden="true" />
            {Math.round(scan.confidence * 100)}% match
          </div>
          <h2 className="swipe-food-title">{name}</h2>
          <p className="swipe-food-sub">{scan.suggested_grams}g suggested portion</p>
          {macros && (
            <div className="swipe-food-macros">
              <span>{macros.calories.toFixed(0)} kcal</span>
              <span>{macros.protein.toFixed(1)}g protein</span>
              <span>{macros.carbs.toFixed(1)}g carbs</span>
              <span>{macros.fat.toFixed(1)}g fat</span>
            </div>
          )}
          {!scan.matched_name && (
            <p className="swipe-food-warn">Not in food DB — swipe Edit to adjust</p>
          )}
        </div>
      </Card>
    </SwipeStack>
  );
}
