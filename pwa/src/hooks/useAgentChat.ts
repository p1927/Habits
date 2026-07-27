import { useCallback, useRef, useState } from 'react';
import { agentChatStream } from '../lib/agentChatStream';
import type { AgentChatMessage } from '../lib/agentSectionShared';

interface UseAgentChatOptions {
  serverOnline: boolean;
  onToolResults?: () => void;
}

export function useAgentChat({ serverOnline, onToolResults }: UseAgentChatOptions) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachImage, setAttachImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if ((!text && !attachImage) || !serverOnline) return;
    const message = text || 'What is in this photo?';
    setInput('');
    setLoading(true);
    setError('');
    const imageUrl = attachImage ?? undefined;
    setAttachImage(null);
    const userMsg: AgentChatMessage = { role: 'user', content: message, imageUrl };
    setMessages((m) => [...m, userMsg, { role: 'assistant', content: '' }]);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      await agentChatStream(message, history, imageUrl, {
        onToken: (text) => {
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last?.role !== 'assistant') return m;
            copy[copy.length - 1] = { ...last, content: last.content + text };
            return copy;
          });
        },
        onDone: (res) => {
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
        onError: (msg) => setError(msg),
      });
    } catch (e) {
      setMessages((m) => (m[m.length - 1]?.role === 'assistant' && !m[m.length - 1]?.content ? m.slice(0, -1) : m));
      setError(e instanceof Error ? e.message : 'Chat failed');
    } finally {
      setLoading(false);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
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
