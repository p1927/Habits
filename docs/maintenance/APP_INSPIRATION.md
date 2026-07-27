# App Inspiration Matrix

Steal **interaction patterns**, not pixel clones. Each Mode B UX session audits one row.

| Reference | Habits surface | Patterns to evaluate | Gap / opportunity |
|-----------|----------------|----------------------|-------------------|
| **Tinder** | Log — `SwipeFoodCard` | Card stack, swipe physics, undo, quick edit | Shipped ui-002; refine haptic + card photo layout |
| **Hinge** | Log / `FutureSelf.tsx` | Prompt cards, “most compatible” framing, rich prompts | Food cards lack personality prompts; Future Self flat |
| **Gemini** | Agent — `Agent.tsx` | Streaming chat, tool feed, voice sheet, context panel | Shipped ui-003; refine voice sheet + context panel |
| **Google Translate** | Log scan / voice | Camera OCR overlay, instant result, history | Shipped ui-007; add scan history pill |
| **Google Calendar** | Day — `Day.tsx` | Timeline density, color blocks, week affordance | Shipped ui-004; no month view / drag reschedule |
| **Google Keep** | Cards — `Cards.tsx` | Pin grid, quick capture, labels, search | Shipped ui-005; label color dots weak |
| **Apple Health** | Home — rings, `Food.tsx` summary | Activity rings, summary cards, trend sparklines | Rings exist; summary cards + trend charts missing |
| **Revolut** | Home widgets / `Settings.tsx` | Dashboard tiles, crisp numerals, card elevation | Home lacks widget tiles; Settings not Revolut-tier |
| **Future visualization** | Home — decision card, Future Self | Aspirational timeline, motivational framing | Shipped ui-006; add Hinge-style prompts |

## Per-tab audit template

```markdown
### [Tab name] — [date]
- Reference app:
- What works in Habits:
- Gap (severity H/M/L):
- Proposed item ID (ux-XXX or ui-XXX):
- Acceptance criteria:
```

## UI polish acceptance criteria examples

**ui-001 Home rings hero**
- ui-ux-pro-max design-system run logged
- 21st component searched before hand-write
- Rings readable at 390px; loading skeleton present
- Live visual check passed

**ui-002 Log swipe stack**
- Card stack depth ≥ 3 visible
- Swipe undo within 5s (Tinder pattern)
- Haptic on commit (pairs relay-040)
- `prefers-reduced-motion` respected

**ui-003 Agent Gemini layout**
- Streaming indicator during chat
- Tool/action chips visible above input
- Voice sheet collapsible without layout jump
