import { useState, useEffect, useRef } from "react";

function btoa(str: string) {
  return typeof window !== "undefined" ? window.btoa(str) : Buffer.from(str).toString("base64");
}

// ─── AUTH SCREENS ────────────────────────────────────────────────
function LoginScreen({ onAuth }: { onAuth: (id: number, name: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
      onAuth(data.userId, data.name);
    } catch { setError("Network error"); setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: email.split("@")[0] }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      onAuth(data.userId, "Renaissance Man");
    } catch { setError("Network error"); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-3xl mx-auto mb-5 flex items-center justify-center">
            <span className="text-3xl">🧬</span>
          </div>
          <h1 className="text-4xl font-semibold text-white tracking-tight">Renaissance Man</h1>
          <p className="text-[#86868b] mt-2 text-sm">Master every dimension of your life.</p>
        </div>
        <div className="bg-[#1c1c1e] rounded-3xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#2c2c2e] text-white rounded-2xl px-5 py-4 text-base placeholder-[#636366] outline-none focus:ring-2 focus:ring-[#0a84ff]" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#2c2c2e] text-white rounded-2xl px-5 py-4 text-base placeholder-[#636366] outline-none focus:ring-2 focus:ring-[#0a84ff]" />
            {error && <p className="text-[#ff453a] text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#0a84ff] text-white font-semibold rounded-2xl py-4 text-base hover:bg-[#0a7aff] transition-colors">
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>
          <p className="text-[#636366] text-sm text-center mt-4">
            No account? <button onClick={handleRegister} className="text-[#0a84ff]" disabled={loading}>Create one</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── HABIT ICONS ───────────────────────────────────────────────
const ICONS: Record<string, string> = {
  "sun": "☀️", "brain": "🧠", "book": "📖", "droplet": "💧", "moon": "🌙",
  "phone_off": "📵", "dumbbell": "🏋️", "heart-pulse": "❤️", "book-open": "📚",
  "layers": "🗂️", "code-2": "💻", "languages": "🗣️",
};

// ─── HABIT CARD ─────────────────────────────────────────────────
function HabitCard({ habit, onToggle, loading }: { habit: any; onToggle: (id: number, done: boolean) => void; loading: boolean }) {
  const icon = ICONS[habit.icon] || "✨";
  const done = habit.completed === 1;
  const label = habit.custom_label || habit.name;
  const catColor = { mindset: "#a78bfa", health: "#34d399", fitness: "#f87171", knowledge: "#60a5fa" }[habit.category] || "#86868b";
  const is100 = habit.streak >= 100;

  return (
    <div className={`relative rounded-3xl p-5 transition-all duration-300 ${done ? "bg-[#1c3a1c]" : "bg-[#1c1c1e]"} ${is100 ? "ring-1 ring-[#34d399]/50 shadow-[0_0_20px_rgba(52,211,153,0.15)]" : ""}`}>
      {is100 && (
        <div className="absolute top-3 right-3 text-[10px] font-medium text-[#34d399] bg-[#34d399]/20 px-2 py-0.5 rounded-full">
          LEGENDARY 🔥
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="text-3xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-base font-medium truncate ${done ? "line-through text-[#86868b]" : "text-white"}`}>{label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: catColor + "22", color: catColor }}>
              {habit.category}
            </span>
            {habit.streak > 0 && (
              <span className="text-[10px] text-[#86868b]">🔥 {habit.streak} day streak</span>
            )}
          </div>
        </div>
        <button
          onClick={() => !loading && onToggle(habit.habit_id, !done)}
          disabled={loading}
          className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl transition-all duration-200 flex-shrink-0 ${
            done ? "bg-[#34d399] border-[#34d399] text-white" : "border-[#3a3a3c] text-[#636366] hover:border-[#34d399]/50"
          }`}
        >
          {done ? "✓" : ""}
        </button>
      </div>
    </div>
  );
}

// ─── STATS BAR ───────────────────────────────────────────────────
function StatsBar({ stats }: { stats: { completed: number; possible: number; percentage: number } }) {
  const pct = stats.percentage || 0;
  return (
    <div className="bg-[#1c1c1e] rounded-3xl p-5 mb-5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-[#86868b]">Monthly progress</span>
        <span className="text-sm font-semibold text-white">{pct}%</span>
      </div>
      <div className="h-1.5 bg-[#2c2c2e] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#0a84ff] to-[#34d399] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-[#636366] mt-2">{stats.completed}/{stats.possible} completions this month</p>
    </div>
  );
}

// ─── CALENDAR ────────────────────────────────────────────────────
function CalendarHeatmap({ entries, month }: { entries: any[]; month: string }) {
  const year = parseInt(month.split("-")[0]);
  const mon = parseInt(month.split("-")[1]) - 1;
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const firstDay = new Date(year, mon, 1).getDay();
  const completedByDate: Record<string, number> = {};
  entries.forEach((e: any) => { if (e.completed) completedByDate[e.date] = (completedByDate[e.date] || 0) + 1; });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(mon + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const done = completedByDate[dateStr] || 0;
    const color = done === 0 ? "bg-[#2c2c2e]" : done === 1 ? "bg-[#0a84ff]/30" : done === 2 ? "bg-[#0a84ff]/60" : "bg-[#34d399]/60";
    cells.push({ day: d, color, done });
  }

  return (
    <div className="bg-[#1c1c1e] rounded-3xl p-5 mb-5">
      <h3 className="text-sm font-medium text-[#86868b] mb-3">{new Date(year, mon).toLocaleString("default", { month: "long", year: "numeric" })}</h3>
      <div className="grid grid-cols-7 gap-1">
        {["S","M","T","W","T","F","S"].map(d => <div key={d} className="text-center text-[10px] text-[#636366]">{d}</div>)}
        {cells.map((c, i) => c === null ? <div key={"e"+i} /> : (
          <div key={c.day} className={`aspect-square rounded-lg flex items-center justify-center text-[10px] text-white ${c.color}`}>{c.day}</div>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS MODAL ──────────────────────────────────────────────
function SettingsModal({ userId, name, onClose }: { userId: number; name: string; onClose: () => void }) {
  const [skill1, setSkill1] = useState("Skill 1");
  const [skill2, setSkill2] = useState("Skill 2");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, skill_one_label: skill1, skill_two_label: skill2 }) });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1c1c1e] rounded-3xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold text-white mb-6">Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#86868b] mb-1 block">Skill One Label</label>
            <input value={skill1} onChange={e => setSkill1(e.target.value)} className="w-full bg-[#2c2c2e] text-white rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0a84ff]" />
          </div>
          <div>
            <label className="text-sm text-[#86868b] mb-1 block">Skill Two Label</label>
            <input value={skill2} onChange={e => setSkill2(e.target.value)} className="w-full bg-[#2c2c2e] text-white rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0a84ff]" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-[#2c2c2e] text-[#86868b] text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-2xl bg-[#0a84ff] text-white text-sm font-medium">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────
export default function App() {
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [habits, setHabits] = useState<any[]>([]);
  const [stats, setStats] = useState({ completed: 0, possible: 0, percentage: 0 });
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [entries, setEntries] = useState<any[]>([]);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!userId) return;
    const date = month + "-15";
    fetch(`/api/habits?userId=${userId}&date=${date}`).then(r => r.json()).then(d => setHabits(d.habits || []));
    fetch(`/api/stats?userId=${userId}&month=${month}`).then(r => r.json()).then(d => setStats(d));
    fetch(`/api/habits?userId=${userId}&date=${todayStr}`).then(r => r.json()).then(d => setEntries(d.habits || []));
  }, [userId, month]);

  const handleToggle = async (habitId: number, done: boolean) => {
    setToggleLoading(true);
    await fetch("/api/habits/toggle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, habitId, date: todayStr, completed: done }) });
    const d = await fetch(`/api/habits?userId=${userId}&date=${todayStr}`).then(r => r.json());
    setHabits(d.habits || []);
    const s = await fetch(`/api/stats?userId=${userId}&month=${month}`).then(r => r.json());
    setStats(s);
    setToggleLoading(false);
  };

  if (!userId) return <LoginScreen onAuth={(id, name) => { setUserId(id); setUserName(name); }} />;

  const cats = ["mindset", "health", "fitness", "knowledge"];
  const catLabels = { mindset: "🧠 Mindset", health: "❤️ Health", fitness: "💪 Fitness", knowledge: "📚 Knowledge" };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 bg-black/80 backdrop-bl-xl border-b border-[#2c2c2e]">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Renaissance Man</h1>
            <p className="text-xs text-[#86868b]">Welcome back, {userName}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMonth(prev => { const [y, m] = prev.split("-").map(Number); const d = new Date(y, m - 2, 1); return d.toISOString().slice(0, 7); })}
              className="w-9 h-9 bg-[#1c1c1e] rounded-2xl flex items-center justify-center text-[#86868b]">‹</button>
            <button onClick={() => setShowSettings(true)} className="w-9 h-9 bg-[#1c1c1e] rounded-2xl flex items-center justify-center text-[#86868b]">⚙️</button>
            <button onClick={() => setMonth(prev => { const [y, m] = prev.split("-").map(Number); const d = new Date(y, m, 1); return d.toISOString().slice(0, 7); })}
              className="w-9 h-9 bg-[#1c1c1e] rounded-2xl flex items-center justify-center text-[#86868b]">›</button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-5">
        <StatsBar stats={stats} />
        <CalendarHeatmap entries={entries} month={month} />

        {cats.map(cat => {
          const catHabits = habits.filter(h => h.category === cat);
          if (!catHabits.length) return null;
          return (
            <div key={cat} className="mb-5">
              <h2 className="text-sm font-semibold text-[#86868b] mb-3">{catLabels[cat as keyof typeof catLabels]}</h2>
              <div className="space-y-2">
                {catHabits.map(h => <HabitCard key={h.id} habit={h} onToggle={handleToggle} loading={toggleLoading} />)}
              </div>
            </div>
          );
        })}
      </main>

      {showSettings && <SettingsModal userId={userId!} name={userName} onClose={() => setShowSettings(false)} />}
    </div>
  );
}