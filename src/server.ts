import { serve } from "bun";
import { getDb, createUser, getUserByEmail, getUserHabitsWithTodayStatus, populateDefaultHabitsForUser, toggleHabitCompletion, getStreak, getUserStats, updateUserSettings } from "./lib/db";

function cors() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...Object.fromEntries(cors()) },
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

serve({
  port: 3000,

  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const headers = cors();

    if (req.method === "OPTIONS") return new Response(null, { headers });

    // ─── AUTH ───────────────────────────────────────────────────────
    if (path === "/api/auth/register" && req.method === "POST") {
      try {
        const { email, password, name } = await req.json();
        if (!email || !password || !name) return json({ error: "All fields required" }, 400);
        const existing = getUserByEmail(email);
        if (existing) return json({ error: "Email already registered" }, 409);
        const hash = Buffer.from(String.fromCharCode(...Array.from({ length: 32 }, (_, i) => (Math.random() * 26 | 0) + 97))).toString("base64");
        const userId = createUser(email, hash, name);
        populateDefaultHabitsForUser(userId!);
        return json({ userId, message: "Account created. Defaults populated." });
      } catch { return json({ error: "Bad request" }, 400); }
    }

    if (path === "/api/auth/login" && req.method === "POST") {
      try {
        const { email, password } = await req.json();
        const user = getUserByEmail(email) as any;
        if (!user) return json({ error: "Invalid credentials" }, 401);
        return json({ userId: user.id, name: user.name, email: user.email });
      } catch { return json({ error: "Bad request" }, 400); }
    }

    // ─── HABITS ───────────────────────────────────────────────────
    if (path === "/api/habits" && req.method === "GET") {
      const userId = Number(url.searchParams.get("userId"));
      const date = url.searchParams.get("date") || today();
      if (!userId) return json({ error: "userId required" }, 400);
      const habits = getUserHabitsWithTodayStatus(userId, date) as any[];
      const enriched = habits.map(h => ({ ...h, streak: getStreak(userId, h.habit_id) }));
      return json({ habits: enriched });
    }

    if (path === "/api/habits/toggle" && req.method === "POST") {
      try {
        const { userId, habitId, date, completed } = await req.json();
        if (!userId || !habitId) return json({ error: "userId and habitId required" }, 400);
        toggleHabitCompletion(userId, habitId, date || today(), completed);
        return json({ ok: true, streak: getStreak(userId, habitId) });
      } catch { return json({ error: "Bad request" }, 400); }
    }

    // ─── STATS ────────────────────────────────────────────────────
    if (path === "/api/stats" && req.method === "GET") {
      const userId = Number(url.searchParams.get("userId"));
      const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
      if (!userId) return json({ error: "userId required" }, 400);
      return json(getUserStats(userId, month));
    }

    // ─── SETTINGS ────────────────────────────────────────────────
    if (path === "/api/settings" && req.method === "PUT") {
      try {
        const { userId, ...settings } = await req.json();
        if (!userId) return json({ error: "userId required" }, 400);
        updateUserSettings(userId, settings);
        return json({ ok: true });
      } catch { return json({ error: "Bad request" }, 400); }
    }

    return json({ error: "Not found" }, 404);
  },
});

console.log("🚀 Renaissance Man API running on :3000");