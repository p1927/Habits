import { useCallback, useEffect, useRef } from 'react';
import { agentChatStream } from '../lib/agentChatStream';
import type { AgentChatMessage } from '../lib/agentSectionShared';
import type { ChatResponse } from '../lib/api';

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}

interface UseAgentChatStreamOptions {
  onToolResults?: (results: ChatResponse['tool_results']) => void;
  setMessages: React.Dispatch<React.SetStateAction<AgentChatMessage[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export function useAgentChatStream({
  onToolResults,
  setMessages,
  setLoading,
  setError,
}: UseAgentChatStreamOptions) {
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamGenRef = useRef(0);

  useEffect(() => () => abortRef.current?.abort(), []);

  const runStream = useCallback(
    async (
      gen: number,
      message: string,
      imageUrl: string | undefined,
      history: { role: string; content: string }[],
    ) => {
      try {
        await agentChatStream(
          message,
          history,
          imageUrl,
          {
            onToken: (token) => {
              if (gen !== streamGenRef.current) return;
              setMessages((m) => {
                const copy = [...m];
                const last = copy[copy.length - 1];
                if (last?.role !== 'assistant') return m;
                copy[copy.length - 1] = { ...last, content: last.content + token };
                return copy;
              });
              requestAnimationFrame(() => {
                listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'auto' });
              });
            },
            onDone: (res) => {
              if (gen !== streamGenRef.current) return;
              setMessages((m) => {
                const copy = [...m];
                const last = copy[copy.length - 1];
                if (last?.role === 'assistant') {
                  copy[copy.length - 1] = { ...last, content: res.reply || last.content || 'Done.' };
                }
                return copy;
              });
              if (res.tool_results.length) onToolResults?.(res.tool_results);
            },
            onError: (msg) => {
              if (gen !== streamGenRef.current) return;
              setError(msg);
            },
          },
          { signal: abortRef.current?.signal },
        );
      } catch (e) {
        if (isAbortError(e) || gen !== streamGenRef.current) return;
        setMessages((m) =>
          m[m.length - 1]?.role === 'assistant' && !m[m.length - 1]?.content ? m.slice(0, -1) : m,
        );
        setError(e instanceof Error ? e.message : 'Chat failed');
      } finally {
        if (gen === streamGenRef.current) {
          setLoading(false);
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }
      }
    },
    [onToolResults, setMessages, setLoading, setError],
  );

  const beginStream = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return ++streamGenRef.current;
  }, []);

  return { listRef, runStream, beginStream };
}
