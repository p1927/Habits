import { useCallback, useState } from 'react';
import { api, type FutureSelfCard, type HabitsTodayResponse } from '../lib/api';
import type { FutureSelfProjectionOutcome } from '../lib/futureSelfSectionShared';

interface UseFutureSelfSectionActionsOptions {
  cards: FutureSelfCard[];
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  setSummary: React.Dispatch<React.SetStateAction<string>>;
  setTracker: React.Dispatch<React.SetStateAction<HabitsTodayResponse | null>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export function useFutureSelfSectionActions({
  cards,
  index,
  setIndex,
  setSummary,
  setTracker,
  setError,
}: UseFutureSelfSectionActionsOptions) {
  const [loading, setLoading] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [baselinePhoto, setBaselinePhoto] = useState<string | null>(null);
  const [declineOutcome, setDeclineOutcome] = useState<FutureSelfProjectionOutcome | null>(null);
  const [acceptOutcome, setAcceptOutcome] = useState<FutureSelfProjectionOutcome | null>(null);
  const [generating, setGenerating] = useState(false);

  const clearProjections = useCallback(() => {
    setDeclineOutcome(null);
    setAcceptOutcome(null);
  }, []);

  const advanceCard = useCallback(() => {
    setIndex((i) => i + 1);
    setSwipeDir(null);
    clearProjections();
  }, [clearProjections, setIndex]);

  const updateMetric = useCallback(
    async (metric: string, value: string) => {
      const num = value === '' ? null : Number.parseFloat(value);
      try {
        const updated = await api.updateHabitMetric(metric, num);
        setTracker(updated);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Update failed');
      }
    },
    [setError, setTracker],
  );

  const handlePhotoCapture = useCallback(
    (dataUrl: string) => {
      setBaselinePhoto(dataUrl);
      clearProjections();
    },
    [clearProjections],
  );

  const generateProjections = useCallback(async () => {
    if (!baselinePhoto) return;
    const card = cards[index];
    setGenerating(true);
    setError('');
    try {
      const res = await api.generateFutureSelfProjections(
        baselinePhoto,
        card?.habit ?? card?.id ?? 'general',
      );
      setDeclineOutcome(res.decline_outcome);
      setAcceptOutcome(res.accept_outcome);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate projections');
    } finally {
      setGenerating(false);
    }
  }, [baselinePhoto, cards, index, setError]);

  const handleAccept = useCallback(async () => {
    const card = cards[index];
    if (!card) return;
    setSwipeDir('right');
    setLoading(true);
    try {
      const res = await api.acceptFutureSelfCard(card.id);
      setSummary(res.summary);
      setTimeout(advanceCard, 300);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Accept failed');
      setSwipeDir(null);
    } finally {
      setLoading(false);
    }
  }, [advanceCard, cards, index, setError, setSummary]);

  const handleDecline = useCallback(() => {
    setSwipeDir('left');
    setTimeout(advanceCard, 300);
  }, [advanceCard]);

  return {
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
  };
}
