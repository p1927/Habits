import type { FutureSelfCard } from '../lib/api';

interface FutureSelfSwipeCardProps {
  card: FutureSelfCard;
  swipeDir: 'left' | 'right' | null;
  loading: boolean;
  onDecline: () => void;
  onAccept: () => void;
}

export function FutureSelfSwipeCard({
  card,
  swipeDir,
  loading,
  onDecline,
  onAccept,
}: FutureSelfSwipeCardProps) {
  const prompt = card.habit
    ? `How will you show up for ${card.habit} today?`
    : 'What choice moves you closer to your future self?';

  return (
    <div
      className={`future-self-swipe-card future-self-card future-self-card--hinge ui-card ui-card--default swipe-card ${swipeDir ? `swipe-${swipeDir}` : ''}`}
    >
      <p className="section-eyebrow future-self-swipe-card__eyebrow">Today&apos;s prompt</p>
      {card.image_url ? (
        <img src={card.image_url} alt="" className="future-self-swipe-card__image" />
      ) : (
        <div className="future-self-swipe-card__image future-self-swipe-card__image--placeholder" aria-hidden="true">
          ✦
        </div>
      )}
      <p className="future-self-swipe-card__prompt">{prompt}</p>
      <div className="future-self-swipe-card__answer">
        <h2>{card.title}</h2>
        {card.accept_action && <p className="muted">{card.accept_action}</p>}
      </div>
      <div className="future-self-swipe-card__actions">
        <button
          type="button"
          className="btn-pill btn-pill-outline future-self-swipe-card__decline"
          onClick={onDecline}
          disabled={loading}
        >
          Decline
        </button>
        <button
          type="button"
          className="btn-pill future-self-swipe-card__accept"
          onClick={onAccept}
          disabled={loading}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
