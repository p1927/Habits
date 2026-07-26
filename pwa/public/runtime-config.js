// Dev fallback only — production uses VITE_HABITS_* baked at build time.
window.HABITS_CONFIG = window.HABITS_CONFIG || {
  apiUrl: '',
  voiceUiUrl: '',
};
