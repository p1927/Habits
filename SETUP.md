# Habits — setup & deploy

**Recommended:** PWA on Cloudflare Pages + Mac backend via Cloudflare Tunnel + Access (works when Tailscale/VPN is blocked).

**Legacy:** GitHub Pages + Tailscale Funnel — see [§ Tailscale Funnel](#4-tailscale-funnel-legacy).

## Prerequisites

- Node 24+, Python 3.11+, Docker
- [`../local-voice-ai`](../local-voice-ai) cloned beside this repo (for voice stack)
- Cloudflare account (reuse `CLOUDFLARE_API_TOKEN` from [`../LinkedInPost`](../LinkedInPost))
- FreeDNS subdomain (e.g. `app.osphere.*` / `api.osphere.*`) — CNAME to Cloudflare
- Google Cloud OAuth client (Sheets + Calendar scopes)

## 1. Environment

```bash
cp .env.example .env
# Fill: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MINIMAX_API_KEY
# After Cloudflare deploy: HABITS_PUBLIC_URL, HABITS_PWA_URL, GOOGLE_REDIRECT_URI
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

curl -X POST $API/api/issue \
  -H "X-Admin-Token: $ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"phone","label":"PWA"}'
```

Paste the bearer in PWA Settings after first login.

## 4. Cloudflare (Tunnel + Access + Pages)

```bash
cp deploy/cloudflare/env.example deploy/cloudflare/.env
# Edit hostnames + HABITS_CF_ALLOWED_EMAIL (your Gmail)
bash deploy/cloudflare/setup.sh
```

Uses `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` from `../LinkedInPost/.env` when not set locally.

After `setup.sh`:

1. **FreeDNS** — CNAME `api.*` → `<tunnel-id>.cfargotunnel.com` (printed by script)
2. **FreeDNS** — CNAME `app.*` → Pages target (Cloudflare dashboard → Pages → custom domain)
3. **Run tunnel:** `bash deploy/cloudflare/tunnel-run.sh` (keep running)
4. **Update `.env`** with printed `HABITS_PUBLIC_URL`, `HABITS_PWA_URL`, `GOOGLE_REDIRECT_URI`, CORS
5. **Google OAuth** — JS origin = app hostname; redirect = `https://api.*/auth/callback`

**Security layers:** Cloudflare Access on the **PWA hostname only** (email OTP) → bearer token in Settings → Google OAuth for Sheets. The API tunnel is bearer-protected (no Access on API, so cross-origin fetch works).

First visit to `https://app.*` prompts Cloudflare Access, then paste bearer in Settings.

## 4b. Tailscale Funnel (legacy)

```bash
./deploy/tailscale-funnel.sh
```

Requires Tailscale (not VPN-blocked). See previous Tailscale/GitHub Pages flow below if needed.

## 5. GitHub Pages (optional legacy)

1. Push repo to `p1927/Habits`
2. Settings → Pages → Source: **GitHub Actions**
3. Repository secrets: `VITE_HABITS_API_URL` (voice uses LiveKit token from API)

Push to `main` triggers [deploy-pages.yml](.github/workflows/deploy-pages.yml).

## 6. Local PWA dev

```bash
cd pwa && npm install && npm run dev
# http://localhost:5174/Habits/
```

## 7. Hermes Loop (autonomous workers)

Hermes Loop turns each `docs/window-instances/<id>/` into a scheduled tick driven by an external scheduler (cron / `hermes_loop` cron registry). Slice A ships the read-only MVP; Slice B wires a real LLM executor + cron entries for all five windows.

```bash
# one-off dry-run, no LLM cost
PYTHONPATH=tools/hermes-loop python -m hermes_loop tick worker-relay --dry-run

# status + per-worker heartbeat
PYTHONPATH=tools/hermes-loop python -m hermes_loop status

# tail a worker's scratchpad
PYTHONPATH=tools/hermes-loop python -m hermes_loop logs worker-relay --tail 20

# print cron entry for a worker (Slice B will automate this)
PYTHONPATH=tools/hermes-loop python -m hermes_loop install worker-relay

# doctor: non-zero exit if any heartbeat is stale
PYTHONPATH=tools/hermes-loop python -m hermes_loop doctor
```

See [docs/hermes-loop/PLAN.md](docs/hermes-loop/PLAN.md) and [tools/hermes-loop/README.md](tools/hermes-loop/README.md) for scope and Slice B/C plans. The legacy `tools/cursor-loop/` keeps working in parallel during the migration.

## Verification

- [ ] `GET https://api.*/healthz` returns `{"ok":true}` (after Access login in browser)
- [ ] PWA shows green status with bearer saved
- [ ] Google connect works; food log writes to Nutrition sheet
- [ ] Cloudflare Access blocks strangers before app loads
- [ ] `python -m hermes_loop status` (after Slice A deployment) lists all configured workers with fresh heartbeats
