import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { getConfig } from '../lib/config';

export type ServerStatus = 'checking' | 'online' | 'online-unauthorized' | 'offline' | 'no-config';

export function useServerStatus(pollMs = 30_000) {
  const [status, setStatus] = useState<ServerStatus>('checking');
  const [googleConnected, setGoogleConnected] = useState(false);

  const check = useCallback(async () => {
    const { apiUrl } = getConfig();
    if (!apiUrl && import.meta.env.PROD) {
      setStatus('no-config');
      return;
    }
    try {
      const h = await api.health();
      setStatus(h.ok ? 'online' : 'offline');
      setGoogleConnected(Boolean(h.google_connected));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setStatus('online-unauthorized');
        return;
      }
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    void check();
    const id = window.setInterval(() => void check(), pollMs);
    return () => window.clearInterval(id);
  }, [check, pollMs]);

  return { status, googleConnected, refresh: check };
}
