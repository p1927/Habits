import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH || '/Habits/'

/** GitHub Pages has no server fallback for client-side routes. */
function spaGithubPages404(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-github-pages-404',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const indexHtml = path.resolve(process.cwd(), outDir, 'index.html')
      const notFoundHtml = path.resolve(process.cwd(), outDir, '404.html')
      if (!fs.existsSync(indexHtml)) return
      fs.copyFileSync(indexHtml, notFoundHtml)
    },
  }
}

function gitShortSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function appBuildLabel(): string {
  const rawSha = (process.env.VITE_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '').trim()
  const sha = rawSha ? rawSha.slice(0, 7) : gitShortSha()
  const run = (process.env.GITHUB_RUN_NUMBER || '').trim()
  const parts: string[] = []
  if (sha) parts.push(sha)
  if (run) parts.push(`#${run}`)
  return parts.join(' · ') || 'local'
}

export default defineConfig({
  base,
  define: {
    __APP_BUILD_LABEL__: JSON.stringify(appBuildLabel()),
  },
  plugins: [
    react(),
    spaGithubPages404(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['runtime-config.js'],
      manifest: {
        name: 'Habits',
        short_name: 'Habits',
        description: 'Personal habit coach — Future Self, voice agent, food tracker',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  server: {
    port: 5174,
    /** Fail fast so the URL matches Google Cloud "Authorized JavaScript origins". */
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      '/auth': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      '/healthz': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
})
