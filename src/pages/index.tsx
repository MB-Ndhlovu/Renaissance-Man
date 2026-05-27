import { useState, useEffect, useRef } from "react";

function btoa(str: string) {
  return typeof window !== "undefined" ? window.btoa(str) : Buffer.from(str, "binary").toString("base64");
}

// ─── Icons (inline SVG to avoid dependency) ──────────────────────
const Icon = ({ path, size = 16 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const Home =       () => <Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const TrendingUp = () => <Icon path="M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6" />;
const Settings =  () => <Icon path="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41" />;
const Check =      () => <Icon path="M20 6L9 17l-5-5" />;
const User =       () => <Icon path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const Book =       () => <Icon path="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />;
const Heart =      () => <Icon path="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />;
const Zap =        () => <Icon path="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const Users =      () => <Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const Briefcase =  () => <Icon path="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />;
const DollarSign = () => <Icon path="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />;
const ChevronRight = () => <Icon path="M9 18l6-6-6-6" />;
const Flame =     () => <Icon path="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />;

// ─── Color Palette ──────────────────────────────────────────────
const C = {
  bg:         "#080808",
  card:       "#111111",
  border:     "#1e1e1e",
  borderGlow: "#ff6b0022",
  orange:     "#ff6b00",
  orangeDim:  "#ff6b0044",
  green:      "#34d399",
  greenDim:   "#34d39933",
  red:        "#f87171",
  text:       "#f0f0f0",
  muted:      "#5c5c5c",
  faint:      "#2a2a2a",
  glow:       "rgba(255,107,0,0.08)",
};

// ─── Default Habits (auto-populated on signup) ───────────────────
const DEFAULT_HABITS = [
  // Mind
  { id: "m1", pillar: "mind",    label: "Read 10 pages",           icon: "Book" },
  { id: "m2", pillar: "mind",    label: "Practice problems",       icon: "Zap" },
  { id: "m3", pillar: "mind",    label: "Learn one concept",        icon: "TrendingUp" },
  // Body
  { id: "b1", pillar: "body",    label: "Workout / Exercise",       icon: "Flame" },
  { id: "b2", pillar: "body",    label: "Sleep 7+ hours",          icon: "Heart" },
  { id: "b3", pillar: "body",    label: "Eat clean / Hydrate",      icon: "Zap" },
  // Spirit
  { id: "s1", pillar: "spirit",  label: "Meditate / Pray",         icon: "Heart" },
  { id: "s2", pillar: "spirit",  label: "Gratitude journaling",     icon: "Book" },
  { id: "s3", pillar: "spirit",  label: "Reflect on the day",      icon: "TrendingUp" },
  // Network
  { id: "n1", pillar: "network", label: "Reach out to someone",    icon: "Users" },
  { id: "n2", pillar: "network", label: "Help someone",            icon: "User" },
  { id: "n3", pillar: "network", label: "Grow your network",       icon: "Users" },
  // Portfolio
  { id: "p1", pillar: "portfolio", label: "Work on a project",    icon: "Briefcase" },
  { id: "p2", pillar: "portfolio", label: "Build your craft",      icon: "TrendingUp" },
  { id: "p3", pillar: "portfolio", label: "Ship something",        icon: "Zap" },
  // Wealth
  { id: "w1", pillar: "wealth",  label: "Review finances",         icon: "DollarSign" },
  { id: "w2", pillar: "wealth",  label: "Save / Invest",           icon: "DollarSign" },
  { id: "w3", pillar: "wealth",  label: "Track net worth",         icon: "TrendingUp" },
];

const PILLARS = [
  { id: "mind",     name: "Mind",     sub: "Learn & grow daily",  icon: Book,      color: "#60a5fa" },
  { id: "body",     name: "Body",     sub: "Move & fuel well",    icon: Flame,     color: "#f97316" },
  { id: "spirit",   name: "Spirit",   sub: "Centre & reflect",   icon: Heart,     color: "#a78bfa" },
  { id: "network",  name: "Network",  sub: "Connect & serve",    icon: Users,     color: "#34d399" },
  { id: "portfolio",name: "Portfolio",sub: "Create & ship",      icon: Briefcase, color: "#fbbf24" },
  { id: "wealth",   name: "Wealth",   sub: "Earn & multiply",    icon: DollarSign,color: "#ff6b00" },
];

const TOTAL = DEFAULT_HABITS.length;
const today  = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });

// ─── CSS ────────────────────────────────────────────────────────
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Cinzel:wght@400;500;600;700&family=Barlow+Condensed:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  body { background: #080808; }
  ::-webkit-scrollbar { width: 0; }
`;

const CSS = `
  .page { max-width: 680px; margin: 0 auto; padding: 0 16px 110px; }

  /* Card */
  .p-card {
    background: #111111;
    border: 1px solid #1e1e1e;
    border-radius: 12px;
    padding: 16px;
    animation: fadeUp 0.35s ease forwards;
    opacity: 0;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .p-card:hover { border-color: #1e1e2e; box-shadow: 0 0 20px rgba(255,107,0,0.04); }
  .p-card.done  { border-color: #ff6b0033; }

  /* Habit row */
  .h-row {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 4px; cursor: pointer;
    border-radius: 6px; transition: background 0.15s;
  }
  .h-row:hover { background: rgba(255,255,255,0.035); }
  .h-row.done-op { opacity: 0.5; }

  /* Checkbox */
  .cbox {
    width: 22px; height: 22px; border-radius: 6px;
    border: 1.5px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s;
  }
  .cbox.on {
    background: #ff6b00;
    border-color: #ff6b00;
    animation: checkPop 0.22s ease;
  }

  /* Progress bar */
  .pbar-track {
    border-radius: 99px; overflow: hidden;
    background: #1e1e1e; height: 4px;
  }
  .pbar-fill {
    height: 100%; border-radius: 99px;
    transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
  }

  /* Nav tabs */
  .nav-tab {
    background: none; border: none; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    color: #5c5c5c; padding: 10px 28px;
    font-family: 'Barlow', sans-serif;
    font-size: 11px; letter-spacing: 0.5px;
    text-transform: uppercase; transition: color 0.2s;
  }
  .nav-tab.on    { color: #ff6b00; }
  .nav-tab:hover:not(.on) { color: #a0a0a0; }

  /* Input */
  .setting-input {
    background: #111111; border: 1px solid #1e1e1e;
    color: #f0f0f0; font-family: 'Barlow', sans-serif;
    font-size: 14px; padding: 11px 14px; border-radius: 8px;
    width: 100%; outline: none; transition: border-color 0.2s;
  }
  .setting-input:focus { border-color: #ff6b00; }
  .setting-input::placeholder { color: #5c5c5c; }

  /* Glow ring for 100% */
  .glow-complete { box-shadow: 0 0 0 1px #ff6b0044, 0 0 24px rgba(255,107,0,0.12); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes checkPop {
    0%   { transform: scale(0.7); }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
`;

// ─── App ────────────────────────────────────────────────────────
export default function App() {
  const [page,   setPage]   = useState("dash");
  const [done,   setDone]   = useState<Record<string, boolean>>({});
  const [skills, setSkills] = useState({ one: "Coding", two: "Photography" });
  const [user,   setUser]   = useState({ name: "Rena

issance Man", email: "" });
  const [showAuth, setShowAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName,  setLoginName]  = useState("");
  const [authMode,   setAuthMode]   = useState<"login"|"signup">("signup");

  const toggle = (id: string) => setDone(prev => ({ ...prev, [id]: !prev[id] }));
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct      = Math.round((doneCount / TOTAL) * 100);
  const allDone  = doneCount === TOTAL;

  const handleAuth = () => {
    if (!loginEmail || !loginName) return;
    setUser({ name: loginName, email: loginEmail });
    setShowAuth(false);
    // Auto-populate habits
    const initial: Record<string, boolean> = {};
    DEFAULT_HABITS.forEach(h => { initial[h.id] = false; });
    setDone(initial);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Barlow', sans-serif", color: C.text }}>
      <style>{FONTS + CSS}</style>

      {/* ═══ AUTH OVERLAY ═══ */}
      {showAuth && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(8,8,8,0.97)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999, padding: "0 24px",
        }}>
          <div className="p-card" style={{ width: "100%", maxWidth: 400, animationDelay: "0s" }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 11, color: C.orange,
              letterSpacing: 4, textTransform: "uppercase", marginBottom: 6, textAlign: "center",
            }}>Renaissance Man</div>
            <div style={{ fontSize: 22, fontWeight: 600, textAlign: "center", marginBottom: 28 }}>
              {authMode === "signup" ? "Begin your journey" : "Welcome back"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                className="setting-input"
                placeholder="Your name"
                value={loginName}
                onChange={e => setLoginName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAuth()}
              />
              <input
                className="setting-input"
                placeholder="Email address"
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAuth()}
              />
              <button
                onClick={handleAuth}
                style={{
                  background: C.orange, color: "#fff", border: "none",
                  padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Barlow', sans-serif",
                  transition: "opacity 0.15s",
                }}
              >
                {authMode === "signup" ? "Create Account" : "Sign In"}
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: C.muted }}>
              {authMode === "signup" ? "Already have an account? " : "Need an account? "}
              <span
                style={{ color: C.orange, cursor: "pointer" }}
                onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
              >
                {authMode === "signup" ? "Sign in" : "Create one"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DASHBOARD ═══ */}
      {!showAuth && page === "dash" && (
        <div className="page">
          {/* Header */}
          <div style={{ paddingTop: 32, paddingBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 4, color: C.orange, textTransform: "uppercase", marginBottom: 5 }}>
                  Renaissance Man
                </div>
                <div style={{ fontSize: 13, color: C.muted }}>{today}</div>
                <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>Welcome, {user.name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 48, fontWeight: 700, lineHeight: 1,
                  color: allDone ? C.green : C.text,
                }}>
                  {doneCount}<span style={{ color: C.muted, fontSize: 24 }}>/{TOTAL}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{pct}% complete</div>
              </div>
            </div>

            {/* Overall progress */}
            <div className={`p-card ${allDone ? "glow-complete" : ""}`} style={{ marginTop: 18, animationDelay: "0.05s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Daily Progress</span>
                <span style={{ fontSize: 12, color: allDone ? C.green : C.orange, fontWeight: 600 }}>
                  {allDone ? "✓ Complete" : `${doneCount} of ${TOTAL}`}
                </span>
              </div>
              <div className="pbar-track">
                <div className="pbar-fill" style={{
                  width: `${pct}%`,
                  background: allDone
                    ? `linear-gradient(90deg, ${C.green}, #10b981)`
                    : `linear-gradient(90deg, ${C.orange}, #f97316)`,
                }} />
              </div>
            </div>
          </div>

          {/* Six Pillars */}
          {PILLARS.map((pillar, pi) => {
            const habits = DEFAULT_HABITS.filter(h => h.pillar === pillar.id);
            const pillarDone = habits.filter(h => done[h.id]).length;
            const pillarPct = Math.round((pillarDone / habits.length) * 100);
            const PIcon = pillar.icon;

            return (
              <div key={pillar.id} className="p-card" style={{ marginBottom: 12, animationDelay: `${0.1 + pi * 0.05}s` }}>
                {/* Pillar header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: `${pillar.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: pillar.color,
                  }}>
                    <PIcon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, color: C.text }}>{pillar.name}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{pillar.sub}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: pillarDone === habits.length ? C.green : C.muted, fontWeight: 600 }}>
                      {pillarDone}/{habits.length}
                    </div>
                    <div style={{ fontSize: 10, color: C.muted }}>{pillarPct}%</div>
                  </div>
                </div>

                {/* Mini progress */}
                <div className="pbar-track" style={{ marginBottom: 10 }}>
                  <div className="pbar-fill" style={{ width: `${pillarPct}%`, background: pillar.color }} />
                </div>

                {/* Habits */}
                {habits.map(habit => (
                  <div
                    key={habit.id}
                    className={`h-row ${done[habit.id] ? "done-op" : ""}`}
                    onClick={() => toggle(habit.id)}
                  >
                    <div className={`cbox ${done[habit.id] ? "on" : ""}`}>
                      {done[habit.id] && <Check />}
                    </div>
                    <span style={{
                      fontSize: 13.5,
                      color: done[habit.id] ? C.muted : C.text,
                      textDecoration: done[habit.id] ? "line-through" : "none",
                      transition: "all 0.2s",
                    }}>
                      {habit.label}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}

          {/* About card */}
          <div className="p-card" style={{ animationDelay: "0.5s" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: C.orange, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
              The Framework
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              The Renaissance Man framework helps you master all six pillars of a balanced,
              high-performance life — without burning out or doing nothing. Find the middle.
            </div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              Built with discipline. Shipped with purpose.
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROGRESS PAGE ═══ */}
      {!showAuth && page === "progress" && (
        <div className="page">
          <div style={{ paddingTop: 32, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 4, color: C.orange, textTransform: "uppercase", marginBottom: 4 }}>Progress</div>
            <div style={{ fontSize: 13, color: C.muted }}>{today}</div>
          </div>

          {/* Overall ring */}
          <div className="p-card" style={{ textAlign: "center", animationDelay: "0.05s" }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Overall Completion</div>
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              border: `4px solid ${C.border}`,
              position: "relative", margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderTopColor: allDone ? C.green : C.orange,
              transform: "rotate(-45deg)",
            }}>
              <div style={{ transform: "rotate(45deg)", textAlign: "center" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 700, color: allDone ? C.green : C.text }}>{pct}%</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: C.muted }}>{doneCount} of {TOTAL} habits completed</div>
          </div>

          {/* Per-pillar breakdown */}
          {PILLARS.map((pillar, pi) => {
            const habits = DEFAULT_HABITS.filter(h => h.pillar === pillar.id);
            const pillarDone = habits.filter(h => done[h.id]).length;
            const pillarPct = Math.round((pillarDone / habits.length) * 100);
            const PIcon = pillar.icon;
            return (
              <div key={pillar.id} className="p-card" style={{ marginBottom: 10, animationDelay: `${0.1 + pi * 0.05}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `${pillar.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: pillar.color }}>
                    <PIcon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{pillar.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{pillarDone}/{habits.length} habits</div>
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: pillar.color }}>
                    {pillarPct}%
                  </div>
                </div>
                <div className="pbar-track">
                  <div className="pbar-fill" style={{ width: `${pillarPct}%`, background: pillar.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ SETTINGS PAGE ═══ */}
      {!showAuth && page === "settings" && (
        <div className="page">
          <div style={{ paddingTop: 32, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 4, color: C.orange, textTransform: "uppercase", marginBottom: 4 }}>Settings</div>
            <div style={{ fontSize: 13, color: C.muted }}>Customize your journey</div>
          </div>

          {/* Profile */}
          <div className="p-card" style={{ marginBottom: 12, animationDelay: "0.05s" }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Profile</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input className="setting-input" placeholder="Your name" value={user.name} onChange={e => setUser(u => ({ ...u, name: e.target.value }))} />
              <input className="setting-input" placeholder="Email" type="email" value={user.email} readOnly style={{ opacity: 0.5 }} />
            </div>
          </div>

          {/* Skill focus */}
          <div className="p-card" style={{ marginBottom: 12, animationDelay: "0.1s" }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Skill Focus</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Primary Skill</div>
                <input className="setting-input" placeholder="e.g. Coding" value={skills.one} onChange={e => setSkills(s => ({ ...s, one: e.target.value }))} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Secondary Skill</div>
                <input className="setting-input" placeholder="e.g. Photography" value={skills.two} onChange={e => setSkills(s => ({ ...s, two: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-card" style={{ animationDelay: "0.15s" }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Statistics</div>
            {[
              { label: "Total Habits", value: TOTAL },
              { label: "Completed Today", value: doneCount },
              { label: "Completion Rate", value: `${pct}%` },
              { label: "Current Streak", value: "1 day" },
            ].map(stat => (
              <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, color: C.muted }}>{stat.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ BOTTOM NAVIGATION ═══ */}
      {!showAuth && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(8,8,8,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "center",
          paddingBottom: 18, paddingTop: 8,
          zIndex: 100,
        }}>
          {[
            { id: "dash",     label: "Today",    Icon: Home },
            { id: "progress", label: "Progress", Icon: TrendingUp },
            { id: "settings", label: "Settings", Icon: Settings },
          ].map(n => (
            <button
              key={n.id}
              className={`nav-tab ${page === n.id ? " on" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <n.Icon />
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
