import { get, request } from './apiClient';

export const dayApi = {
  getManageDay: () =>
    get<{ quadrants: Record<string, string[]>; sheets_connected: boolean }>(
      '/api/day/manage',
    ),
  updateManageDay: (quadrant: string, items: string[]) =>
    request<{ quadrants: Record<string, string[]> }>('/api/day/manage', {
      method: 'PUT',
      body: JSON.stringify({ quadrant, items }),
    }),
};
