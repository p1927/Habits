import { useState } from 'react';
import { VoiceSession } from '../voice/VoiceSession';
import {
  loadVoiceSettings,
  saveVoiceSettings,
  type LLMPreset,
  type STTPreset,
  type VoicePipelineSettings,
} from '../lib/voice-settings';

interface AgentProps {
  serverOnline: boolean;
}

export function Agent({ serverOnline }: AgentProps) {
  const [pipeline, setPipeline] = useState<VoicePipelineSettings>(loadVoiceSettings);

  function update(partial: Partial<VoicePipelineSettings>) {
    const next = { ...pipeline, ...partial };
    setPipeline(next);
    saveVoiceSettings(next);
  }

  return (
    <section className="section">
      <h1>Voice Agent</h1>
      <p className="muted">
        Realtime voice — Whisper STT, MiniMax LLM, Kokoro TTS over LiveKit.
      </p>

      <div className="card">
        <h2>Pipeline</h2>
        <label className="field">
          STT
          <select
            value={pipeline.stt}
            onChange={(e) => update({ stt: e.target.value as STTPreset })}
          >
            <option value="whisper">Whisper</option>
            <option value="nemotron">Nemotron</option>
          </select>
        </label>
        <label className="field">
          LLM
          <select
            value={pipeline.llm}
            onChange={(e) => update({ llm: e.target.value as LLMPreset })}
          >
            <option value="minimax">MiniMax</option>
            <option value="gemma4">Gemma 4</option>
            <option value="llama">Llama</option>
          </select>
        </label>
        <p className="muted">TTS: Kokoro (fixed)</p>
      </div>

      <VoiceSession enabled={serverOnline} />
    </section>
  );
}
