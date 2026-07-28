import { get, request } from './apiClient';
import type { FutureSelfCard, HabitsTodayResponse } from './apiTypes';

export const futureSelfApi = {
  getFutureSelfSummary: () =>
    get<{ summary: string; cards?: FutureSelfCard[]; tracker?: HabitsTodayResponse }>(
      '/api/future-self/summary',
    ),
  getFutureSelfCards: (images = false) =>
    get<{ cards: FutureSelfCard[]; summary: string }>(
      `/api/future-self/cards?images=${images}`,
    ),
  acceptFutureSelfCard: (card_id: string) =>
    request<{ summary: string }>('/api/future-self/accept', {
      method: 'POST',
      body: JSON.stringify({ card_id }),
    }),
  generateFutureSelfProjections: (photo_base64: string, habit_id = 'general') =>
    request<{
      decline_outcome: { label: string; image_url: string | null };
      accept_outcome: { label: string; image_url: string | null };
    }>('/api/future-self/projections', {
      method: 'POST',
      body: JSON.stringify({ photo_base64, habit_id }),
    }),
};
