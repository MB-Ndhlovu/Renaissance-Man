import { useState, useEffect } from "react";

const API = "";

const C = {
  bg:       "#0a0a0b",
  card:     "#111113",
  border:   "#2a2a2e",
  borderGlow: "#ff6b3520",
  text:     "#f0ede8",
  muted:    "#6b6b78",
  faint:    "#3a3a42",
  orange:   "#ff6b35",
  green:    "#4ade80",
  blue:     "#60a5fa",
  purple:   "#a78bfa",
};

function btoa(str: string) {
  if (typeof globalThis.btoa === "function") return globalThis.btoa(str);
  return Buffer.from(str, "utf-8").toString("base64");
}

const FONTS = ``;

const TOTAL = 6;

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .p-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 16px;
    animation: fadeUp 0.35s ease forwards;
    opacity: 0;
    transition: border-color 0.25s;
  }
  .p-card:hover { border-color: ${C.borderGlow}; }
  .p-card.done  { border-color: ${C.orange}44; }

  .h-row {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 4px; cursor: pointer;
    border-radius: 6px; transition: background 0.15s;
  }
  .h-row:hover { background: #ffffff09; }

  .cbox {
    width: 20px; height: 20px; border-radius: 5px;
    border: 1.5px solid ${C.faint};
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s;
  }
  .cbox.on {
    background: ${C.orange};
    border-color: ${C.orange};
    animation: checkPop 0.22s ease;
  }

  .nav-tab {
    background: none; border: none; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    color: ${C.muted}; padding: 10px 28px;
    font-family: 'Barlow', 'Helvetica Neue', sans-serif;
    font-size: 11px; letter-spacing: 0.5px;
    text-transform: uppercase; transition: color 0.2s;
  }
  .nav-tab.on    { color: ${C.orange}; }
  .nav-tab:hover:not(.on) { color: ${C.text}; }

  .setting-input {
    background: ${C.card}; border: 1px solid ${C.border};
    color: ${C.text}; font-family: 'Barlow', sans-serif;
    font-size: 14px; padding: 11px 14px; border-radius: 8px;
    width: 100%; outline: none; transition: border-color 0.2s;
  }
  .setting-input:focus { border-color: ${C.orange}; }
  .setting-input::placeholder { color: ${C.muted}; }

  .pbar-track {
    border-radius: 99px; overflow: hidden;
    background: ${C.border};
  }
  .pbar-fill {
    height: 100%; border-radius: 99px;
    transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes checkPop {
    0%   { transform: scale(0.7); }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
`;

function fmt(ts: string) {
  const d = new Date(ts + (new Date().getTimezoneOffset() * 60 * 1000 < 0 ? "Z" : ""));
  return d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });
}

export default function App() {
  const [page, setPage] = useState("dash");
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  const toggle = (id: number) =>
    setDone(prev => ({ ...prev, [id]: !prev[id] }));

  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((doneCount / TOTAL) * 100);
  const allDone = doneCount === TOTAL;
  const accentColor = allDone ? C.green : C.orange;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Barlow', 'Helvetica Neue', sans-serif", color: C.text }}>
      <style>{FONTS + CSS}</style>

      {/* DASHBOARD */}
      {page === "dash" && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px 100px" }}>

          {/* Header */}
          <div style={{ paddingTop: 28, paddingBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: 10, letterSpacing: 5, color: C.orange,
                  textTransform: "uppercase", marginBottom: 5,
                }}>Renaissance Man</div>
                <div style={{ fontSize: 13, color: C.muted }}>{fmt(new Date().toISOString().slice(0, 10))}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
                  fontSize: 44, fontWeight: 700, lineHeight: 1,
                  color: allDone ? C.green : C.text,
                }}>
                  {doneCount}<span style={{ color: C.muted, fontSize: 22 }}>/{TOTAL}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{pct}% done today</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pbar-track" style={{ height: 5, margin: "18px 0 24px" }}>
            <div className="pbar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.orange}, ${allDone ? C.green : C.orange})` }} />
          </div>

          {/* Today's Habits */}
          <div className={`p-card${allDone ? " done" : ""}`} style={{ animationDelay: "0.05s" }}>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Today's Habits</div>
            {[
              { id: 1, label: "Meditate", icon: "◉", cat: "Mind" },
              { id: 2, label: "Read 30 mins", icon: "◉", cat: "Mind" },
              { id: 3, label: "Exercise", icon: "◉", cat: "Body" },
              { id: 4, label: "Eat Clean", icon: "◉", cat: "Body" },
              { id: 5, label: "Learn Skill", icon: "◉", cat: "Craft" },
              { id: 6, label: "Reflect", icon: "◉", cat: "Spirit" },
            ].map((h) => (
              <div key={h.id} className="h-row" onClick={() => toggle(h.id)}>
                <div className={`cbox${done[h.id] ? " on" : ""}`}>
                  {done[h.id] && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                </div>
                <span style={{ fontSize: 15, color: done[h.id] ? C.muted : C.text, textDecoration: done[h.id] ? "line-through" : "none", flex: 1 }}>{h.label}</span>
                <span style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>{h.cat}</span>
              </div>
            ))}
          </div>

          {/* All Done Banner */}
          {allDone && (
            <div style={{
              marginTop: 16, padding: "16px 20px",
              background: `${C.green}14`, border: `1px solid ${C.green}40`,
              borderRadius: 12, color: C.green, fontSize: 14, fontWeight: 600,
              textAlign: "center", animation: "fadeUp 0.4s ease",
            }}>
              All habits complete — well done, Renaissance Man.
            </div>
          )}

          {/* Skills */}
          <div className="p-card" style={{ marginTop: 16, animationDelay: "0.1s" }}>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Skills</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[{ label: "Coding", color: C.blue }, { label: "Photography", color: C.purple }].map((s, i) => (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: 8,
                  background: `${s.color}10`, border: `1px solid ${s.color}30`,
                  fontSize: 13, fontWeight: 600, color: s.color,
                }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {page === "settings" && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px 100px" }}>
          <div style={{ paddingTop: 28, marginBottom: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: 5, color: C.orange, textTransform: "uppercase" }}>Settings</div>
          </div>
          {[
            { label: "Skill One", placeholder: "e.g. Coding" },
            { label: "Skill Two", placeholder: "e.g. Photography" },
          ].map((field, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{field.label}</div>
              <input className="setting-input" placeholder={field.placeholder} />
            </div>
          ))}
          <button style={{
            width: "100%", padding: "13px", marginTop: 8,
            background: C.orange, color: "#fff",
            border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600,
            cursor: "pointer", letterSpacing: 0.5,
          }}>
            Save Changes
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: `${C.card}ee`, backdropFilter: "blur(20px)",
        borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "center", gap: 0, padding: "6px 0 20px",
        zIndex: 50,
      }}>
        {[
          { id: "dash",     label: "Today" },
          { id: "settings", label: "Settings" },
        ].map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${page === tab.id ? " on" : ""}`}
            onClick={() => setPage(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
