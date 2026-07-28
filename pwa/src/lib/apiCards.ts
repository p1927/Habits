import { get, request } from './apiClient';
import type { KeepCard, SicknessTimelineEvent } from './apiTypes';

export const cardsApi = {
  getCards: (type?: string) =>
    get<{ cards: KeepCard[]; sheets_connected: boolean }>(
      `/api/cards${type ? `?type=${type}` : ''}`,
    ),
  getSicknessTimeline: () =>
    get<{ events: SicknessTimelineEvent[]; sheets_connected: boolean }>(
      '/api/cards/sickness/timeline',
    ),
  createCard: (card_type: string, title: string, body: string) =>
    request<{ cards: KeepCard[] }>('/api/cards', {
      method: 'POST',
      body: JSON.stringify({ card_type, title, body }),
    }),
  deleteCard: (card_type: string, row: number) =>
    request<{ cards: KeepCard[] }>(`/api/cards/${card_type}/${row}`, { method: 'DELETE' }),
};
