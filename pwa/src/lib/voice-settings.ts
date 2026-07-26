/** From local-voice-ai — sent when minting LiveKit token. */

export type STTPreset = 'whisper' | 'nemotron';
export type TTSPreset = 'kokoro';
export type LLMPreset = 'minimax' | 'gemma4' | 'llama';

export interface VoicePipelineSettings {
  stt: STTPreset;
  tts: TTSPreset;
  llm: LLMPreset;
}

export const VOICE_SETTINGS_STORAGE_KEY = 'habits-voice-pipeline-v1';

export const VOICE_SETTINGS_DEFAULTS: VoicePipelineSettings = {
  stt: 'whisper',
  tts: 'kokoro',
  llm: 'minimax',
};

export function loadVoiceSettings(): VoicePipelineSettings {
  try {
    const raw = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...VOICE_SETTINGS_DEFAULTS };
    const o = JSON.parse(raw) as Record<string, unknown>;
    return {
      stt: o.stt === 'nemotron' ? 'nemotron' : 'whisper',
      tts: 'kokoro',
      llm: o.llm === 'gemma4' ? 'gemma4' : o.llm === 'llama' ? 'llama' : 'minimax',
    };
  } catch {
    return { ...VOICE_SETTINGS_DEFAULTS };
  }
}

export function saveVoiceSettings(settings: VoicePipelineSettings): void {
  localStorage.setItem(VOICE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
