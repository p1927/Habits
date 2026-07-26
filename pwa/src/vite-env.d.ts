/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HABITS_API_URL: string;
  readonly VITE_HABITS_LIVEKIT_URL: string;
  readonly VITE_BASE_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_BUILD_LABEL__: string;
