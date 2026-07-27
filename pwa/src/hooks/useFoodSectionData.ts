import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type FoodTodayResponse } from '../lib/api';

export function useFoodSectionData(serverOnline: boolean) {
  const [data, setData] = useState<FoodTodayResponse | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!serverOnline) return;
    setError('');
    try {
      setData(await api.getFoodToday());
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setError(e instanceof Error ? e.message : 'Failed to load food log');
    }
  }, [serverOnline]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return {
    data,
    setData,
    error,
    setError,
    success,
    setSuccess,
    loading,
    setLoading,
  };
}

export type FoodSectionDataState = ReturnType<typeof useFoodSectionData>;
