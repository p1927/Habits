import { useCallback, useRef, useState } from 'react';
import { api } from '../lib/api';
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
    setMessages((m) => [...m, userMsg]);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.agentChat(message, history);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply || 'Done.' }]);
      if (res.tool_results.length) onToolResults?.();
    } catch (e) {
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
