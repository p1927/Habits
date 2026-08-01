import { useCallback } from 'react';

interface UseLogSectionDismissOptions {
  queuedCount: number;
  dismissAllQueued: () => void;
  setSuccess: (msg: string) => void;
}

export function useLogSectionDismiss({
  queuedCount,
  dismissAllQueued,
  setSuccess,
}: UseLogSectionDismissOptions) {
  return useCallback(() => {
    if (!window.confirm(`Discard ${queuedCount} queued food log${queuedCount === 1 ? '' : 's'}? They will not sync.`)) return;
    dismissAllQueued();
    setSuccess('Offline food log queue cleared');
  }, [queuedCount, dismissAllQueued, setSuccess]);
}