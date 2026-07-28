import { getBearer, getConfig } from './config';
import type { ChatResponse } from './api';
import { ApiError } from './api';

function parseSseBlock(block: string): { event: string; data: string } | null {
  let event = 'message';
  let data = '';
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data += line.slice(5).trim();
  }
  if (!data) return null;
  return { event, data };
}

export interface AgentChatStreamHandlers {
  onToken: (text: string) => void;
  onToolStart?: (tool: string) => void;
  onToolEnd?: (tool: string) => void;
  onDone: (payload: ChatResponse) => void;
  onError: (message: string) => void;
}

export interface AgentChatStreamOptions {
  signal?: AbortSignal;
}

export async function agentChatStream(
  message: string,
  history: { role: string; content: string }[] | undefined,
  imageBase64: string | undefined,
  handlers: AgentChatStreamHandlers,
  options: AgentChatStreamOptions = {},
): Promise<void> {
  const { signal } = options;
  const { apiUrl } = getConfig();
  const bearer = getBearer();
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`);

  const base = apiUrl.replace(/\/$/, '');
  const resp = await fetch(`${base}/api/agent/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, history, image_base64: imageBase64 }),
    signal,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new ApiError(resp.status, text || resp.statusText);
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new ApiError(502, 'No response body');

  const onAbort = () => void reader.cancel();
  signal?.addEventListener('abort', onAbort);

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';

      for (const block of blocks) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const parsed = parseSseBlock(block.trim());
        if (!parsed) continue;
        const payload = JSON.parse(parsed.data) as Record<string, unknown>;
        if (parsed.event === 'token' && typeof payload.text === 'string') {
          handlers.onToken(payload.text);
        } else if (parsed.event === 'tool_start' && typeof payload.tool === 'string') {
          handlers.onToolStart?.(payload.tool);
        } else if (parsed.event === 'tool_end' && typeof payload.tool === 'string') {
          handlers.onToolEnd?.(payload.tool);
        } else if (parsed.event === 'done') {
          handlers.onDone({
            reply: String(payload.reply ?? ''),
            tool_results: (payload.tool_results as ChatResponse['tool_results']) ?? [],
          });
        } else if (parsed.event === 'error') {
          handlers.onError(String(payload.message ?? 'Stream failed'));
        }
      }
    }
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}
