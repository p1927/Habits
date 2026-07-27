import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, type FutureSelfCard, type HabitsTodayResponse } from '../lib/api';

interface UseFutureSelfSectionLoadOptions {
  serverOnline: boolean;
}

export function useFutureSelfSectionLoad({ serverOnline }: UseFutureSelfSectionLoadOptions) {
  const [cards, setCards] = useState<FutureSelfCard[]>([]);
  const [summary, setSummary] = useState('');
  const [tracker, setTracker] = useState<HabitsTodayResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');

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

  return {
    cards,
    setCards,
    summary,
    setSummary,
    tracker,
    setTracker,
    index,
    setIndex,
    error,
    setError,
    load,
  };
}
