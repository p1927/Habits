import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/agent-gemini.css'
import './styles/log-meal-plan.css'
import './index.css'
import App from './App.tsx'
import { ensureDevBearer } from './lib/config'

ensureDevBearer()

/** Stale production SW breaks Vite HMR and dynamic imports in local dev. */
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) void reg.unregister()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
