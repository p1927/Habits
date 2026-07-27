# Maintenance Charter

> **Read this file first on every maintenance tick.**

## User prompt (verbatim — original)

Use slap slash loop with a ticker of like 3-4 minutes so that you keep on running maintenance again and again making sure the quality of this software is great. I want you to run loop and the idea behind is that we have a checklist and your task is to for about maintenance so you make sure in all the relays you add quality improvement items in the backlog and also design decisions that should be taken by the agent as it is moving forward in the relay and also your task is to. Constantly maintain the application making sure it's bug free you constantly do mistakes prevention checks multiple times and you also follow a similar pattern to. To what we have already have like roadmap relay history in progress bug fixes you have your own document set of documents for entirely for maintenance and quality purposes and then use these documents to go on a loop where you look at parts of code find bugs put them down on a document and then fix them and update the document that it has been done. And then again if there is no bugs then you try to scan more code for bugs and as you find them you enter them into this list and then continue and if you find some better design decisions code quality you also put those things in that document and. In each bug fixing approach you have to do brainstorming and then critically evaluating is this the best design is this over engineered. And then do a pros and cons of your approach and then try to mitigate the cons and then you implement the fix then you verify if everything compiles properly then you test it out live and that's when you declare that the bug is done. It's very important that you should not miss any word that I spoke in this prompt and save this prompt in the document as well so that it as the loop continues you read this prompt again and again to understand what you're supposed to do.

## User prompt (verbatim — addendum)

I want to add in the plan that it should have a dedicated brainstorming session as well that evaluates the backlog and things from a user experience perspective as a business user perspective and as a product owner perspective. Find first skills on the Internet for each of these rules and then use those skills to find out how great of a product can be made for this. And based on that, so I want features from different kind of apps like Tinder from visualizing future from Gemini from Google Calendar from notes from Google Translate. So like I want all these features. So from a business owner perspective, how it should look like and from a user user experience designer, how should it look like. So add or refine items that are present in the backlog according to that if you think that some requirement is not useful, you modify it to into a useful requirement. And then a second stage would be to refine the UI. The UI should be refined as per the best modern UIs out there. And they have to be refined. So the backlog task have to be created for the UI to look very polished, very refined, very modern based on 21st day UI/UX pro skills only. Also add this as a rule.Do not miss any step here multiple brainstorming sessions that refine backlog that add more items to the backlog that polish the UI

## User prompt (verbatim — interval update)

Okay, update the /loop to run every 2 minutes instead of 4 minutes so that we are faster implementation and brainstorming and thinking

## User prompt (verbatim — UX relay agent, 2026-07-27)

Let's set up a /loop maintenance task where you constantly work at all look at all the UI elements you work as a UI designer you do web research on the best UI UX skills and Upgrade all the UI components that we have so that all UI looks very modern We already have some rules. We already have some content in the docs regarding maintenance Read them go through them and then Every Five minutes keep on working on improving our UI UX so that it looks similar to Exactly the same as the apps we already know in terms of colors the theme the fonts the sizes the alignments of Tinder hinge Gemini app Google translate app Google Calendar app Google keep app Apple Health app Revolute app So learn from all these apps the designs the pages and implement those pages here With similar UX so it's like just copying those elements there like for Google Calendar copy the calendar the way things are Apple Health copy that the UI different pages do web research for all of these and actively push the items to backlog and also simultaneously then keep on working on themSave these instructions as a document for yourself like a UX relay agent maintenance so that every time the tick gets fired you read this document and get back on trackAnd then you can constantly make progress by reading the backlog and injecting your items there and working on them.

## Mission

Four **independent chat windows** — see [`LOOPS.md`](LOOPS.md). This folder (`docs/maintenance/`) is the **PO window** (product owner / business brainstorm).

| Window | Sentinel | This folder? |
|--------|----------|--------------|
| Worker (features) | `AGENT_LOOP_TICK_HABITS` | Feeds [`RELAY.md`](../RELAY.md) only |
| UX (UI polish) | `AGENT_LOOP_TICK_UX_RELAY` | [`UX_RELAY_AGENT.md`](UX_RELAY_AGENT.md) |
| Code (health) | `AGENT_LOOP_TICK_CODE_HEALTH` | [`docs/code-health/`](../code-health/) |
| **PO (brainstorm)** | **`AGENT_LOOP_TICK_MAINTENANCE`** | **This folder — [`PO_RELAY_AGENT.md`](PO_RELAY_AGENT.md)** |

PO window: **`AGENT_LOOP_TICK_MAINTENANCE`** (2m) — 3-lens backlog refinement, design decisions, no UI shipping.

**UX polish** runs on **`AGENT_LOOP_TICK_UX_RELAY`** (5m) — [`UX_RELAY_AGENT.md`](UX_RELAY_AGENT.md). One PID per window; never stack loops in one chat.

| PO tick focus |
|------|
| 3-lens brainstorm (UX, PO, business) |
| Mutate backlogs + `DESIGN_DECISIONS` |
| Cross-feed [`RELAY.md`](../RELAY.md) |

## Document index

| File | Purpose |
|------|---------|
| [LOOPS.md](LOOPS.md) | **Four windows** — Worker / UX / Code / PO + PID rules |
| [PO_RELAY_AGENT.md](PO_RELAY_AGENT.md) | PO window wake (read first here) |
| [SESSION.md](SESSION.md) | PO tick ritual |
| [STATE.md](STATE.md) | Canonical maintenance relay |
| [BRAINSTORM.md](BRAINSTORM.md) | Skill map + lens checklists |
| [UX_RELAY_AGENT.md](UX_RELAY_AGENT.md) | UX designer loop instructions (read first) |
| [APP_INSPIRATION.md](APP_INSPIRATION.md) | Tinder / Hinge / Gemini / Calendar / Keep / Translate / Health / Revolut |
| [CHECKLIST.md](CHECKLIST.md) | Mistake prevention (2 passes) |
| [VERIFICATION.md](VERIFICATION.md) | Build + live test matrix |

Cross-feed quality items to [`docs/RELAY.md`](../RELAY.md).
