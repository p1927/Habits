import { useCallback, useEffect, useRef, useState } from 'react';
import { agentChatStream } from '../lib/agentChatStream';
import type { AgentChatMessage } from '../lib/agentSectionShared';

interface UseAgentChatOptions {
  serverOnline: boolean;
  onToolResults?: () => void;
}

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}

export function useAgentChat({ serverOnline, onToolResults }: UseAgentChatOptions) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachImage, setAttachImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamGenRef = useRef(0);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async () => {
    const text = input.trim();
    if ((!text && !attachImage) || !serverOnline) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const gen = ++streamGenRef.current;

    const message = text || 'What is in this photo?';
    setInput('');
    setLoading(true);
    setError('');
    const imageUrl = attachImage ?? undefined;
    setAttachImage(null);
    const userMsg: AgentChatMessage = { role: 'user', content: message, imageUrl };

    setMessages((m) => {
      const base = m[m.length - 1]?.role === 'assistant' ? m.slice(0, -1) : m;
      return [...base, userMsg, { role: 'assistant', content: '' }];
    });

    const history = messages
      .filter((m, i, arr) => !(i === arr.length - 1 && m.role === 'assistant'))
      .map((m) => ({ role: m.role, content: m.content }));

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
            if (res.tool_results.length) onToolResults?.();
          },
          onError: (msg) => {
            if (gen !== streamGenRef.current) return;
            setError(msg);
          },
        },
        { signal: controller.signal },
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
  }, [input, attachImage, serverOnline, messages, onToolResults]);

  const clearAttach = useCallback(() => {
    setAttachImage(null);
    setInput('');
  }, []);

  return {
    messages,
    input,
    setInput,
    loading,
    attachImage,
    setAttachImage,
    error,
    setError,
    listRef,
    send,
    clearAttach,
  };
}
