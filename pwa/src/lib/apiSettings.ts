import { get, request } from './apiClient';
import type { HealthResponse, SettingsResponse } from './apiTypes';

export const settingsApi = {
  health: () => get<HealthResponse>('/healthz'),
  getSettings: () => get<SettingsResponse>('/api/settings'),
  updateSettings: (payload: Partial<SettingsResponse>) =>
    request<SettingsResponse>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  disconnectGoogle: () =>
    request<{ ok: boolean }>('/auth/google', { method: 'DELETE' }),
};
