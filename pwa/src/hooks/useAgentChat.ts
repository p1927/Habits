import { useCallback, useRef, useState } from 'react';
import type { AgentChatMessage } from '../lib/agentSectionShared';
import type { ChatResponse } from '../lib/api';
import { useAgentChatStream } from './useAgentChatStream';

interface UseAgentChatOptions {
  serverOnline: boolean;
  onToolResults?: (results: ChatResponse['tool_results']) => void;
}

export function useAgentChat({ serverOnline, onToolResults }: UseAgentChatOptions) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachImage, setAttachImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const { listRef, runStream, beginStream } = useAgentChatStream({
    onToolResults,
    setMessages,
    setLoading,
    setError,
  });

  const send = useCallback(async () => {
    const text = input.trim();
    if ((!text && !attachImage) || !serverOnline) return;

    const gen = beginStream();
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

    await runStream(gen, message, imageUrl, history);
  }, [input, attachImage, serverOnline, messages, runStream, beginStream]);

  const regenerateLastReply = useCallback(async () => {
    if (loading || !serverOnline) return;

    const current = messagesRef.current;
    if (current.length < 2 || current[current.length - 1]?.role !== 'assistant') return;

    let lastUserIdx = -1;
    for (let i = current.length - 2; i >= 0; i -= 1) {
      if (current[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx < 0) return;

    const userMsg = current[lastUserIdx];
    const history = current
      .slice(0, lastUserIdx)
      .map((m) => ({ role: m.role, content: m.content }));

    const gen = beginStream();
    setLoading(true);
    setError('');
    setMessages((m) => [...m.slice(0, -1), { role: 'assistant', content: '' }]);

    await runStream(gen, userMsg.content, userMsg.imageUrl, history);
  }, [loading, serverOnline, runStream, beginStream]);

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
    regenerateLastReply,
    clearAttach,
  };
}
