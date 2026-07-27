import { SwipeStack, type SwipeDirection } from './ui/SwipeStack';
import { Card } from './ui/Card';
import type { FutureSelfCard } from '../lib/api';

export interface HomeDecisionCardProps {
  card: FutureSelfCard;
  onSwipe: (dir: SwipeDirection) => void;
  onOpenFutureSelf?: () => void;
}

export function HomeDecisionCard({ card, onSwipe, onOpenFutureSelf }: HomeDecisionCardProps) {
  return (
    <Card className="decision-card-wrap decision-card-wrap--elevated decision-card-wrap--hinge">
      <p className="decision-card-eyebrow">Future self · Today&apos;s prompt</p>
      {card.image_url ? (
        <img
          src={card.image_url}
          alt={card.title ? `Illustration for ${card.title}` : 'Decision card illustration'}
          className="decision-card-img"
        />
      ) : (
        <div className="decision-card-visual" aria-hidden="true">
          <div className="decision-card-visual-glow" />
          <svg className="decision-card-arc" viewBox="0 0 200 100" focusable="false">
            <defs>
              <linearGradient id="future-arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--ok)" />
              </linearGradient>
            </defs>
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="var(--surface2)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="url(#future-arc-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="251"
              strokeDashoffset="62"
              className="decision-card-arc-progress"
            />
          </svg>
          <span className="decision-card-visual-label">Your trajectory</span>
        </div>
      )}
      <SwipeStack
        label="Future self decision card"
        onSwipe={onSwipe}
        hintRight="Accept"
        hintLeft="Decline"
        hintUp="Skip"
      >
        <div className="decision-card-inner decision-card-inner--hinge">
          <p className="decision-card-prompt">
            {card.habit
              ? `How will you show up for ${card.habit} today?`
              : 'What choice moves you closer to your future self?'}
          </p>
          <div className="decision-card-answer">
            <h3>{card.title}</h3>
            {card.accept_action && <p className="decision-card-action">{card.accept_action}</p>}
          </div>
        </div>
      </SwipeStack>
      {onOpenFutureSelf && (
        <button
          type="button"
          className="decision-card-open-future-self muted"
          onClick={onOpenFutureSelf}
          aria-label="Open Future Self tab"
        >
          Open Future Self
        </button>
      )}
    </Card>
  );
}
