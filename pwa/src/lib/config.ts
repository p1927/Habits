export type TabId = 'future' | 'agent' | 'food' | 'settings';

export interface HabitsConfig {
  apiUrl: string;
  livekitUrl: string;
}

declare global {
  interface Window {
    HABITS_CONFIG?: HabitsConfig;
  }
}

function envOrRuntime(key: 'apiUrl' | 'livekitUrl'): string {
  const envKey = key === 'apiUrl' ? 'VITE_HABITS_API_URL' : 'VITE_HABITS_LIVEKIT_URL';
  const fromEnv = import.meta.env[envKey]?.trim();
  if (fromEnv) return fromEnv;
  const fromRuntime = window.HABITS_CONFIG?.[key]?.trim();
  if (fromRuntime && !fromRuntime.includes('127.0.0.1') && !fromRuntime.includes('localhost')) {
    return fromRuntime;
  }
  return fromRuntime || '';
}

export function getConfig(): HabitsConfig {
  return {
    apiUrl: envOrRuntime('apiUrl'),
    livekitUrl: envOrRuntime('livekitUrl'),
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
