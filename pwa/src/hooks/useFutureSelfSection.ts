import { useFutureSelfSectionActions } from './useFutureSelfSectionActions';
import { useFutureSelfSectionLoad } from './useFutureSelfSectionLoad';

interface UseFutureSelfSectionOptions {
  serverOnline: boolean;
}

export function useFutureSelfSection({ serverOnline }: UseFutureSelfSectionOptions) {
  const {
    cards,
    summary,
    tracker,
    index,
    error,
    setSummary,
    setTracker,
    setIndex,
    setError,
  } = useFutureSelfSectionLoad({ serverOnline });

  const {
    loading,
    swipeDir,
    baselinePhoto,
    declineOutcome,
    acceptOutcome,
    generating,
    handlePhotoCapture,
    generateProjections,
    handleAccept,
    handleDecline,
    updateMetric,
  } = useFutureSelfSectionActions({
    cards,
    index,
    setIndex,
    setSummary,
    setTracker,
    setError,
  });

  return {
    cards,
    summary,
    tracker,
    index,
    error,
    loading,
    swipeDir,
    baselinePhoto,
    declineOutcome,
    acceptOutcome,
    generating,
    card: cards[index],
    handlePhotoCapture,
    generateProjections,
    handleAccept,
    handleDecline,
    updateMetric,
  };
}
