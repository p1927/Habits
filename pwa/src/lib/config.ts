export type TabId = 'home' | 'log' | 'day' | 'cards' | 'agent' | 'settings' | 'futureself';

export interface HabitsConfig {
  apiUrl: string;
  voiceUiUrl: string;
}

declare global {
  interface Window {
    HABITS_CONFIG?: HabitsConfig;
  }
}

function envOrRuntime(key: 'apiUrl' | 'voiceUiUrl'): string {
  const envKey = key === 'apiUrl' ? 'VITE_HABITS_API_URL' : 'VITE_VOICE_UI_URL';
  const fromEnv = import.meta.env[envKey]?.trim();
  if (fromEnv) return fromEnv;
  const fromRuntime = window.HABITS_CONFIG?.[key]?.trim();
  if (fromRuntime && !fromRuntime.includes('127.0.0.1') && !fromRuntime.includes('localhost')) {
    return fromRuntime;
  }
  return fromRuntime || '';
}

export function getConfig(): HabitsConfig {
  const voiceUiUrl = envOrRuntime('voiceUiUrl') || 'http://localhost:8080';
  return {
    apiUrl: envOrRuntime('apiUrl'),
    voiceUiUrl,
  };
}

export function getBuildLabel(): string {
  return typeof __APP_BUILD_LABEL__ === 'string' ? __APP_BUILD_LABEL__ : 'local';
}

export const BEARER_STORAGE_KEY = 'habits.bearer';

export function getBearer(): string | null {
  return localStorage.getItem(BEARER_STORAGE_KEY);
}

export function setBearer(token: string): void {
  localStorage.setItem(BEARER_STORAGE_KEY, token);
}

/** Dev-only: prefill bearer from VITE_HABITS_DEV_BEARER when Settings has none saved. */
export function ensureDevBearer(): void {
  if (!import.meta.env.DEV) return;
  const devBearer = import.meta.env.VITE_HABITS_DEV_BEARER?.trim();
  if (!devBearer || getBearer()) return;
  setBearer(devBearer);
}
