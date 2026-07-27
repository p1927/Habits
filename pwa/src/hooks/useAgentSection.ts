import { useCallback, useRef, useState } from 'react';
import { getConfig } from '../lib/config';
import { toOrbVisual, type VoiceIframeStatus } from '../lib/voiceStatus';
import { type ChatResponse } from '../lib/api';
import { useAgentContext } from './useAgentContext';
import { useAgentChat } from './useAgentChat';
import { useAgentPhotoAttach } from './useAgentPhotoAttach';
import { toolResultsToActions } from '../lib/agentToolFeed';
import type { AgentAction } from '../components/AgentActionFeed';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface UseAgentSectionOptions {
  serverOnline: boolean;
}

export function useAgentSection({ serverOnline }: UseAgentSectionOptions) {
  const { voiceUiUrl } = getConfig();
  const context = useAgentContext(serverOnline, true);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceIframeStatus, setVoiceIframeStatus] = useState<VoiceIframeStatus | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolFeedActions, setToolFeedActions] = useState<AgentAction[]>([]);
  const [actionPollToken, setActionPollToken] = useState(0);

  const orbState = toOrbVisual(voiceIframeStatus, serverOnline);

  const refreshRef = useRef(context.refresh);
  refreshRef.current = context.refresh;

  const onToolResults = useCallback((results: ChatResponse['tool_results']) => {
    void refreshRef.current();
    const actions = toolResultsToActions(results);
    if (actions.length) setToolFeedActions(actions);
    setActionPollToken((t) => t + 1);
  }, []);

  const {
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
  } = useAgentChat({
    serverOnline,
    onToolResults,
  });

  const {
    cameraOpen,
    setCameraOpen,
    attachOpen,
    setAttachOpen,
    recentPhotos,
    scanning,
    handlePhotoCapture,
  } = useAgentPhotoAttach({ setAttachImage, setInput, setError });

  const composerVoiceOrbState = voiceOpen ? (orbState !== 'idle' ? orbState : 'active') : undefined;

  return {
    voiceUiUrl,
    context,
    voiceOpen,
    setVoiceOpen,
    setVoiceIframeStatus,
    toolsOpen,
    setToolsOpen,
    orbState,
    messages,
    input,
    setInput,
    loading,
    attachImage,
    error,
    listRef,
    send,
    clearAttach,
    cameraOpen,
    setCameraOpen,
    attachOpen,
    setAttachOpen,
    recentPhotos,
    scanning,
    handlePhotoCapture,
    composerVoiceOrbState,
    toolFeedActions,
    actionPollToken,
  };
}

export type AgentSectionContext = ReturnType<typeof useAgentSection>['context'];

export type AgentNavigateMealPlanSyncSource = (source: MealPlanSyncSource) => void;
