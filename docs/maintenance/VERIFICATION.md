# Maintenance Verification

## Build (required Mode A/C)

```bash
cd pwa && npm run build
```

## API (if server/ changed)

```bash
python3 -c "import habits_api.main"
```

## Live checks by area

| Area | Steps |
|------|-------|
| Home | Rings render; pull-to-refresh; decision card |
| Log | Swipe right=log; scan flow; offline queue banner |
| Day | Timeline + habit grid load |
| Cards | CRUD persists |
| Agent | Chat streams; voice sheet toggles |
| Settings | Server status |

## Mode C UI polish

- [ ] ui-ux-pro-max `--design-system` run noted in HISTORY
- [ ] 21st search logged (cache path or CLI)
- [ ] Visual check at 390px width
- [ ] `prefers-reduced-motion` not broken

## Health (optional)

```bash
curl -s http://127.0.0.1:8787/healthz
```
