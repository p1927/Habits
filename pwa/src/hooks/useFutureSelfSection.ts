import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, type FutureSelfCard, type HabitsTodayResponse } from '../lib/api';
import type { FutureSelfProjectionOutcome } from '../lib/futureSelfSectionShared';

interface UseFutureSelfSectionOptions {
  serverOnline: boolean;
}

export function useFutureSelfSection({ serverOnline }: UseFutureSelfSectionOptions) {
  const [cards, setCards] = useState<FutureSelfCard[]>([]);
  const [summary, setSummary] = useState('');
  const [tracker, setTracker] = useState<HabitsTodayResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [baselinePhoto, setBaselinePhoto] = useState<string | null>(null);
  const [declineOutcome, setDeclineOutcome] = useState<FutureSelfProjectionOutcome | null>(null);
  const [acceptOutcome, setAcceptOutcome] = useState<FutureSelfProjectionOutcome | null>(null);
  const [generating, setGenerating] = useState(false);

  const loadInFlightRef = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    if (!serverOnline) return;
    if (loadInFlightRef.current) {
      return loadInFlightRef.current;
    }

    const run = (async () => {
      setError('');
      try {
        const [data, habits] = await Promise.all([
          api.getFutureSelfCards(false),
          api.getHabitsToday(),
        ]);
        setCards(data.cards);
        setSummary(data.summary);
        setTracker(habits);
        setIndex(0);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return;
        setError(e instanceof Error ? e.message : 'Failed to load cards');
      }
    })();

    loadInFlightRef.current = run;
    try {
      await run;
    } finally {
      if (loadInFlightRef.current === run) {
        loadInFlightRef.current = null;
      }
    }
  }, [serverOnline]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearProjections = useCallback(() => {
    setDeclineOutcome(null);
    setAcceptOutcome(null);
  }, []);

  const advanceCard = useCallback(() => {
    setIndex((i) => i + 1);
    setSwipeDir(null);
    clearProjections();
  }, [clearProjections]);

  const updateMetric = useCallback(async (metric: string, value: string) => {
    const num = value === '' ? null : Number.parseFloat(value);
    try {
      const updated = await api.updateHabitMetric(metric, num);
      setTracker(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  }, []);

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
  }, [baselinePhoto, cards, index]);

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
  }, [advanceCard, cards, index]);

  const handleDecline = useCallback(() => {
    setSwipeDir('left');
    setTimeout(advanceCard, 300);
  }, [advanceCard]);

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
