import { get, request } from './apiClient';

export const calendarApi = {
  getCalendarToday: () =>
    get<{ events: { id: string; summary: string; start: string; end?: string }[] }>(
      '/api/calendar/today',
    ),
  createCalendarEvent: (title: string, start: string, duration_minutes = 60) =>
    request<{ event: { summary: string; start: string } }>('/api/calendar/event', {
      method: 'POST',
      body: JSON.stringify({ title, start, duration_minutes }),
    }),
};
