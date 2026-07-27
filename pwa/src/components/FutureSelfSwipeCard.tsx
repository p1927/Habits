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
  return (
    <div className={`swipe-card card ${swipeDir ? `swipe-${swipeDir}` : ''}`}>
      {card.image_url ? (
        <img src={card.image_url} alt="" className="card-image" />
      ) : (
        <div className="card-image card-image-placeholder">✦</div>
      )}
      <h2>{card.title}</h2>
      {card.accept_action && <p className="muted">{card.accept_action}</p>}
      <div className="swipe-actions">
        <button type="button" className="btn-decline" onClick={onDecline} disabled={loading}>
          Decline
        </button>
        <button type="button" className="btn-accept" onClick={onAccept} disabled={loading}>
          Accept
        </button>
      </div>
    </div>
  );
}
