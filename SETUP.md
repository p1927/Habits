# Habits — setup & deploy

PWA on GitHub Pages (`https://p1927.github.io/Habits/`) + Mac backend via Tailscale Funnel.

## Prerequisites

- Node 24+, Python 3.11+, Docker
- [`../local-voice-ai`](../local-voice-ai) cloned beside this repo (for voice stack)
- Tailscale on your Mac
- Google Cloud OAuth client (Sheets + Calendar scopes)

## 1. Environment

```bash
cp .env.example .env
# Fill: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MINIMAX_API_KEY
# After Tailscale Funnel: HABITS_PUBLIC_URL, GOOGLE_REDIRECT_URI, NEXT_PUBLIC_LIVEKIT_URL
```

Rotate `HABITS_ADMIN_SECRET` before exposing the API publicly.

## 2. Start backend

```bash
# API only
cd server && python -m venv .venv && .venv/bin/pip install -e . && .venv/bin/habits-api

# Full voice stack
./scripts/up-with-voice.sh
```

## 3. Issue bearer tokens

```bash
ADMIN=your-admin-secret
API=http://127.0.0.1:8787

# Phone PWA — paste in Settings
curl -X POST $API/api/issue \
  -H "X-Admin-Token: $ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"phone","label":"PWA"}'

# Voice agent — set as HABITS_INTERNAL_BEARER in .env
curl -X POST $API/api/issue \
  -H "X-Admin-Token: $ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"livekit-agent","label":"Voice agent"}'
```

## 4. Tailscale Funnel

```bash
./deploy/tailscale-funnel.sh
```

Updates needed in `.env`:

- `HABITS_PUBLIC_URL=https://<machine>.<tailnet>.ts.net`
- `GOOGLE_REDIRECT_URI=https://<machine>.<tailnet>.ts.net/auth/callback`
- `NEXT_PUBLIC_LIVEKIT_URL=wss://<machine>.<tailnet>.ts.net:7880`

Google Cloud OAuth:

- Authorized JavaScript origins: `https://p1927.github.io`
- Redirect URI: your funnel `/auth/callback`

## 5. GitHub Pages

1. Push repo to `p1927/Habits`
2. Settings → Pages → Source: **GitHub Actions**
3. Repository secrets:

| Secret | Value |
|--------|--------|
| `VITE_HABITS_API_URL` | `https://<machine>.<tailnet>.ts.net` |
| `VITE_HABITS_LIVEKIT_URL` | `wss://<machine>.<tailnet>.ts.net:7880` |

Push to `main` triggers [deploy-pages.yml](.github/workflows/deploy-pages.yml).

## 6. Local PWA dev

```bash
cd pwa && npm install && npm run dev
# http://localhost:5173/Habits/
```

Uses `pwa/.env.development` for API URL.

## Verification

- [ ] `GET /healthz` returns `{"ok":true}`
- [ ] PWA shows green status with bearer saved
- [ ] Google connect works; food log writes to Nutrition sheet
- [ ] Voice connects from phone (both API and LiveKit funneled)
