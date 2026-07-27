export interface FoodFailedBannerProps {
  failedCount: number;
  onRetryAll: () => void;
}

export function FoodFailedBanner({ failedCount, onRetryAll }: FoodFailedBannerProps) {
  if (failedCount <= 0) return null;

  return (
    <div className="banner banner-warn banner-row banner-revolut" role="alert">
      <span>
        {failedCount} food log{failedCount === 1 ? '' : 's'} failed to save.
      </span>
      <button type="button" className="btn-small btn-pill" onClick={onRetryAll}>
        Retry all
      </button>
    </div>
  );
}
