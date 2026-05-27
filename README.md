# Renaissance Man — Daily Habit Tracker

> *"A modern polymath doesn't leave habit to chance."*

**Live App:** [https://renaissance-man-autoprime.zocomputer.io](https://renaissance-man-autoprime.zocomputer.io)
**GitHub:** [github.com/MB-Ndhlovu/Renaissance-Man](https://github.com/MB-Ndhlovu/Renaissance-Man)

---

## What is Renaissance Man?

Renaissance Man is a premium daily habit tracker designed for the modern polymath — entrepreneurs, traders, creators, and builders who refuse to leave growth to chance. It frames habit around six interconnected pillars that define a fully-lived life:

| Pillar | Purpose |
|--------|---------|
| **Mind** | Learning, thinking, intellectual growth |
| **Body** | Physical health, movement, vitality |
| **Spirit** | Emotional depth, gratitude, inner stillness |
| **Network** | Relationships, community, mentorship |
| **Portfolio** | Creative output, building in public, craft |
| **Wealth** | Financial intelligence, income, investing |

Every pillar carries exactly three habits. Every completed habit advances a daily score. Every day maintained builds a streak. The goal: full completion — 100%.

---

## Design Philosophy

The UI is built with premium dark aesthetics — reminiscent of high-end fintech and Apple's design language — to signal that this is not just another habit tracker. It's a command centre for a serious life.

- **Typography**: Cinzel (headers) for gravitas + Barlow Condensed (body) for density
- **Colors**: Deep charcoal backgrounds, category-coded accent colors (blue/green/purple/amber/red/pink)
- **Animations**: `fadeUp` on load, `checkPop` on completion, `glowPulse` on 100% completion
- **Mobile**: Fully responsive, optimized for on-the-go logging

---

## Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript, Vite, Pure inline styles |
| Backend | Bun + Hono, `bun:sqlite` for persistence |
| Database | SQLite (`renaissance.db`) — file-based, zero config |
| Hosting | Zo Sites (Bun runtime, managed service) |
| Auth | Username-based sessions (auto-created, no passwords for MVP) |

### File Structure

```
renaissance-man/
├── server.ts          # Bun + Hono server + API routes
├── db.ts              # SQLite schema + helper functions
├── src/
│   ├── index.tsx      # React entry (Vite)
│   ├── main.tsx       # App mount
│   ├── App.tsx        # (optional router)
│   ├── styles.css     # Global CSS
│   ├── lib/           # Shared utilities
│   │   └── db.ts      # DB helpers (client-side)
│   └── pages/
│       └── index.tsx  # Main application UI (522 lines)
├── public/            # Static assets
├── site.json          # Zo deployment config
├── zosite.json        # Zo runtime config
├── package.json
└── vite.config.ts
```

### Database Schema

```sql
users (id, username, created_at)
habits (id, user_id, label, category, skill_key)
logs (id, habit_id, date, completed, created_at)
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/signup` | Create user + auto-populate 18 default habits |
| `GET` | `/api/user/:username` | Get user profile + all habits + today logs |
| `POST` | `/api/log` | Toggle habit completion for a date |
| `GET` | `/api/progress/:username` | Get progress stats + streak + 12-week history |
| `GET` | `/api/categories` | Get all 6 pillars with color codes |
| `GET` | `/api/health` | Health check |

---

## Default Habits (18 Total)

### Mind (Blue)
1. Study/practice for my craft
2. Read/Listening time (30 min+)
3. Learn new tool or concept

### Body (Green)
4. Exercise/movement (30 min+)
5. Eat cleanly (no junk/processing)
6. Proper sleep (7–8 hrs)

### Spirit (Purple)
7. Gratitude practice
8. Meditation/prayer/reflection
9. Positive affirmation

### Network (Amber)
10. Connect with 1 person (message/call)
11. Help someone without expectation
12. Expand my network (event/meeting)

### Portfolio (Red)
13. Create something tangible (build/write/design)
14. Share knowledge publicly
15. Work on a side project

### Wealth (Pink)
16. Financial education (15 min+)
17. Review income/investments
18. Execute 1 income action

---

## Deployment

### Local Development

```bash
bun install
bun run dev
# → http://localhost:3000
```

### Production (Zo Sites)

```bash
bun run build
# Zo Sites auto-builds and serves via bun run prod
```

### Database Reset

```bash
rm renaissance.db
# Server recreates on next request (stateless init)
```

---

## Customization

### Change Default Habits
Edit the `DEFAULT_HABITS` array in `server.ts`:

```typescript
const DEFAULT_HABITS = [
  { label: "Your habit here", category: "mind", skillKey: "your_skill" },
  // ...
];
```

### Change Categories / Colors
Edit the `CATEGORIES` constant in `src/pages/index.tsx`:

```typescript
const CATEGORIES = [
  { key: "mind", label: "Mind", color: "#007AFF" },
  { key: "body", label: "Body", color: "#34C759" },
  // ...
];
```

### Add New Pillars
1. Add entry to `CATEGORIES` in frontend
2. Add entries to `DEFAULT_HABITS` in backend
3. Run `INSERT INTO habits` for existing users via `/api/log`

---

## Scripts

| Command | Purpose |
|---------|---------|
| `bun run dev` | Local dev server |
| `bun run build` | Production build |
| `bun run prod` | Run in production mode |
| `bun run clear-cache` | Clear Vite cache |

---

## Contributing

This is a personal project for portfolio demonstration and real daily use. PRs welcome for:

- Bug fixes and performance improvements
- New habit categories or custom habit support
- Enhanced analytics (weekly/monthly reports, export)
- Notifications or reminders feature
- Multi-user / social features

---

## License

MIT — Malibongwe Ndhlovu, 2026