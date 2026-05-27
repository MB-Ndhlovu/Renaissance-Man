# Renaissance Man — Project Agents

## Project Overview

Renaissance Man is a premium dark-themed habit tracker built for the modern polymath. It tracks 18 default habits across 6 pillars (Mind, Body, Spirit, Network, Portfolio, Wealth) with streak tracking, progress visualization, and a premium Apple-style UI.

**Stack:** React + TypeScript (Vite) + Bun + Hono + SQLite
**Live:** https://renaissance-man-autoprime.zocomputer.io
**GitHub:** https://github.com/MB-Ndhlovu/Renaissance-Man

---

## Code Owners

| File | Owner | Responsibility |
|------|-------|---------------|
| `server.ts` | Ben (JARVIS) | API, DB, auth, default habits |
| `src/pages/index.tsx` | Ben (JARVIS) | Full UI, styles, state |
| `db.ts` | Ben (JARVIS) | DB helpers |
| `README.md` | Ben (JARVIS) | Documentation |

---

## Key Design Decisions

1. **No external UI library** — All styles are pure inline CSS for zero-dependency portability
2. **Username-only auth** — No passwords; auto-creates account on signup. Change for production.
3. **SQLite via `bun:sqlite`** — Single file DB, zero-config persistence
4. **Auto-populate habits on signup** — 18 default habits inserted immediately on account creation
5. **Per-habit data per date** — Uses `logs` table with unique constraint on `(habit_id, date)`

---

## Workflow for Changes

1. Read `README.md` first
2. Make changes in `src/` or `server.ts`
3. Run `bun run build` to verify
4. Test at `http://localhost:3000` in dev
5. Commit and push to `main`
6. Zo Sites auto-republishes on push to `main`

---

## Default Habits (do not remove from server.ts without user consent)

All 18 habits are hardcoded in `server.ts` `DEFAULT_HABITS` array. They represent the 6-pillar system. Adding, removing, or reordering habits requires updating both:
- `server.ts` → `DEFAULT_HABITS`
- `src/pages/index.tsx` → `DEFAULT_HABITS` (frontend mirror)