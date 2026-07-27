import type { FutureSelfProjectionOutcome } from '../lib/futureSelfSectionShared';

interface FutureSelfProjectionGridProps {
  declineOutcome: FutureSelfProjectionOutcome | null;
  acceptOutcome: FutureSelfProjectionOutcome | null;
}

export function FutureSelfProjectionGrid({ declineOutcome, acceptOutcome }: FutureSelfProjectionGridProps) {
  if (!declineOutcome && !acceptOutcome) return null;

  return (
    <div className="projection-grid">
      <div className="projection-card card">
        <p className="projection-label-decline">{declineOutcome?.label ?? 'Decline path'}</p>
        {declineOutcome?.image_url ? (
          <img src={declineOutcome.image_url} alt="Decline future self" />
        ) : (
          <div className="card-image-placeholder">No image</div>
        )}
      </div>
      <div className="projection-card card">
        <p className="projection-label-accept">{acceptOutcome?.label ?? 'Accept path'}</p>
        {acceptOutcome?.image_url ? (
          <img src={acceptOutcome.image_url} alt="Accept future self" />
        ) : (
          <div className="card-image-placeholder">No image</div>
        )}
      </div>
    </div>
  );
}
