import type { FutureSelfProjectionOutcome } from '../lib/futureSelfSectionShared';

interface FutureSelfProjectionGridProps {
  declineOutcome: FutureSelfProjectionOutcome | null;
  acceptOutcome: FutureSelfProjectionOutcome | null;
}

export function FutureSelfProjectionGrid({ declineOutcome, acceptOutcome }: FutureSelfProjectionGridProps) {
  if (!declineOutcome && !acceptOutcome) return null;

  return (
    <div className="projection-grid">
      <div className="projection-card future-self-card ui-card ui-card--default">
        <p className="section-eyebrow projection-card__eyebrow projection-card__eyebrow--decline">Decline path</p>
        <p className="projection-label-decline">{declineOutcome?.label ?? 'Decline path'}</p>
        {declineOutcome?.image_url ? (
          <img src={declineOutcome.image_url} alt="Decline future self" />
        ) : (
          <div className="future-self-swipe-card__image future-self-swipe-card__image--placeholder">No image</div>
        )}
      </div>
      <div className="projection-card future-self-card future-self-card--hinge ui-card ui-card--default">
        <p className="section-eyebrow projection-card__eyebrow projection-card__eyebrow--accept">Accept path</p>
        <p className="projection-label-accept">{acceptOutcome?.label ?? 'Accept path'}</p>
        {acceptOutcome?.image_url ? (
          <img src={acceptOutcome.image_url} alt="Accept future self" />
        ) : (
          <div className="future-self-swipe-card__image future-self-swipe-card__image--placeholder">No image</div>
        )}
      </div>
    </div>
  );
}
