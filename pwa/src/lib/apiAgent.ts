import { request } from './apiClient';
import type { ChatResponse, VoiceTokenResponse } from './apiTypes';

export const agentApi = {
  agentChat: (
    message: string,
    history?: { role: string; content: string }[],
    imageBase64?: string,
  ) =>
    request<ChatResponse>('/api/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, image_base64: imageBase64 }),
    }),
  getVoiceToken: (room?: string) =>
    request<VoiceTokenResponse>('/api/voice/token', {
      method: 'POST',
      body: JSON.stringify(room ? { room } : {}),
    }),
};
