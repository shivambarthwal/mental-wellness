"use client";

import { useState, useEffect, useRef } from "react";

// ── Fonts & global styles injected once ──────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #f6fbff;
      --surface: #ffffff;
      --primary: #2563eb; /* indigo-600 */
      --primary-weak: #93c5fd;
      --accent: #06b6d4; /* teal-500 */
      --muted: #64748b; /* slate-500 */
      --muted-weak: #cbd5e1;
      --edge: #e6eef8;
      --glass: rgba(255,255,255,0.8);
      --text: #0f1724;
      --text-soft: #475569;
      --card-bg: #ffffff;
    }

    body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); }

    @keyframes breathe {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.08); opacity: 1; }
    }
    @keyframes floatUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.85); opacity: 1; }
      100% { transform: scale(1.3); opacity: 0; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-12px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes pop {
      0% { transform: scale(0.9); opacity: 0; }
      60% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }

    .float-up { animation: floatUp 0.5s ease forwards; }
    .pop { animation: pop 0.35s ease forwards; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--mist); border-radius: 3px; }

    .card {
      background: var(--card-bg);
      border-radius: 16px;
      border: 1px solid var(--edge);
      box-shadow: 0 10px 30px rgba(15,23,42,0.06);
    }
    .btn-primary {
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 10px 22px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.18s ease;
      letter-spacing: 0.2px;
      box-shadow: 0 8px 30px rgba(37,99,235,0.12);
    }
    .btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 18px 50px rgba(37,99,235,0.12); }
    .btn-ghost {
      background: transparent;
      color: var(--text-soft);
      border: 1px solid var(--edge);
      border-radius: 12px;
      padding: 8px 18px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.18s ease;
    }
    .btn-ghost:hover { border-color: var(--primary-weak); color: var(--primary); background: var(--glass); }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.16s ease;
      user-select: none;
      background: var(--glass);
      color: var(--text-soft);
      border-color: var(--edge);
    }
    .chip.selected {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(37,99,235,0.08);
    }
    .chip:not(.selected):hover { border-color: var(--primary-weak); color: var(--primary); }

    textarea {
      width: 100%;
      border: 1px solid var(--edge);
      border-radius: 12px;
      padding: 14px 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text);
      background: var(--card-bg);
      resize: vertical;
      outline: none;
      transition: border-color 0.16s ease, box-shadow 0.16s ease;
      line-height: 1.6;
    }
    textarea:focus { border-color: var(--primary-weak); box-shadow: 0 8px 30px rgba(37,99,235,0.04); }
    textarea::placeholder { color: #94a3b8; }

    select, input[type="text"] {
      border: 1px solid var(--edge);
      border-radius: 12px;
      padding: 10px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: var(--text);
      background: var(--card-bg);
      outline: none;
      transition: border-color 0.16s ease, box-shadow 0.16s ease;
      appearance: none;
    }
    select:focus, input[type="text"]:focus { border-color: var(--primary-weak); box-shadow: 0 8px 30px rgba(37,99,235,0.04); }
  `}</style>
);

// ── Data ─────────────────────────────────────────────────────────────────────
const MOODS = [
  { emoji: "😊", label: "Good", score: 5, color: "#7a9e7e" },
  { emoji: "🙂", label: "Okay", score: 4, color: "#9db87a" },
  { emoji: "😐", label: "Meh", score: 3, color: "#d4b03e" },
  { emoji: "😔", label: "Low", score: 2, color: "#d4843e" },
  { emoji: "😰", label: "Stressed", score: 1, color: "#c4614a" },
];

const TRIGGERS = [
  "Syllabus overload",
  "Mock test results",
  "Peer pressure",
  "Sleep issues",
  "Family expectations",
  "Time pressure",
  "Self-doubt",
  "Revision backlog",
  "Social media",
  "Health issues",
  "Fear of failure",
  "Comparison",
];

const EXAMS = [
  "JEE",
  "NEET",
  "CUET",
  "CAT",
  "UPSC",
  "Board Exams",
  "GATE",
  "Other",
];

const AFFIRMATIONS = [
  "You are more than your score. Keep going. 🌱",
  "Every expert was once a beginner. Trust the process.",
  "Rest is not giving up — it's fueling your comeback.",
  "One day at a time. One chapter at a time.",
  "Your effort today is your result tomorrow.",
  "It's okay to not be okay. Reach out, breathe, reset.",
  "Comparison is the thief of joy. Run your own race.",
  "Hard days build the character that easy days never could.",
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const getStreak = (entries) => {
  if (!entries.length) return 0;
  let s = 0,
    d = new Date();
  for (let i = 0; i < 60; i++) {
    const key = d.toISOString().split("T")[0];
    if (entries.find((e) => e.date === key)) s++;
    else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }
  return s;
};

const avgMood = (entries) => {
  if (!entries.length) return null;
  return (
    entries.reduce((a, e) => a + e.moodScore, 0) / entries.length
  ).toFixed(1);
};

// ── Breathing Orb ─────────────────────────────────────────────────────────────
const BreathOrb = () => (
  <div
    style={{ position: "relative", width: 70, height: 70, margin: "0 auto" }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, #f0b97a, #d4843e)",
        animation: "breathe 4s ease-in-out infinite",
        boxShadow: "0 0 0 0 rgba(212,132,62,0.4)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: -4,
        borderRadius: "50%",
        border: "2px solid rgba(212,132,62,0.25)",
        animation: "pulse-ring 4s ease-out infinite",
      }}
    />
  </div>
);

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "checkin", icon: "✦", label: "Check-in" },
  { id: "journal", icon: "◎", label: "Reflect" },
  { id: "history", icon: "⊹", label: "History" },
  { id: "insights", icon: "◈", label: "Insights" },
  { id: "wellness", icon: "❋", label: "Wellness" },
];

// ── AI Wellness Panel ─────────────────────────────────────────────────────────
const WellnessPanel = ({ entries, exam }) => {
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [exercise, setExercise] = useState(null);
  const [breathPhase, setBreathPhase] = useState(null);
  const [breathCount, setBreathCount] = useState(0);
  const breathRef = useRef(null);

  const lastMood = entries[0]?.moodLabel || "stressed";
  const triggers = entries
    .slice(0, 3)
    .flatMap((e) => e.triggers)
    .slice(0, 4);

  const fetchTip = async () => {
    setLoading(true);
    setTip("");
    const context = `Student preparing for ${exam || "competitive exam"} in India. Recent mood: ${lastMood}. Stress triggers: ${triggers.join(", ") || "general exam stress"}. Recent journal: "${entries[0]?.note?.slice(0, 100) || ""}"`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `${context}\n\nGive a warm, empathetic, practical mental wellness tip (3-4 sentences) for this student. Be specific to their exam context and triggers. End with one small, concrete action they can do right now. Be conversational, not clinical. Don't use bullet points.`,
            },
          ],
        }),
      });
      const data = await res.json();
      setTip(
        data.content?.[0]?.text ||
          "Take a deep breath. You're doing better than you think. 💛",
      );
    } catch {
      setTip(
        "You're not alone in this journey. Take 5 minutes to step outside, breathe fresh air, and remind yourself: one step at a time.",
      );
    }
    setLoading(false);
  };

  const startBreath = () => {
    setBreathPhase("inhale");
    setBreathCount(0);
    let count = 0;
    const phases = ["inhale", "hold", "exhale", "rest"];
    const durations = [4000, 7000, 8000, 2000];
    const cycle = () => {
      let pi = 0;
      const step = () => {
        setBreathPhase(phases[pi]);
        breathRef.current = setTimeout(() => {
          pi = (pi + 1) % 4;
          if (pi === 0) {
            count++;
            setBreathCount(count);
            if (count >= 3) {
              setBreathPhase(null);
              return;
            }
          }
          step();
        }, durations[pi]);
      };
      step();
    };
    cycle();
  };

  useEffect(() => () => clearTimeout(breathRef.current), []);

  const EXERCISES = [
    {
      id: "grounding",
      title: "5-4-3-2-1 Grounding",
      icon: "🌿",
      steps: [
        "Notice 5 things you can SEE around you",
        "Touch 4 things you can FEEL",
        "Listen for 3 things you can HEAR",
        "Find 2 things you can SMELL",
        "Notice 1 thing you can TASTE",
      ],
    },
    {
      id: "reframe",
      title: "Exam Anxiety Reframe",
      icon: "🧠",
      steps: [
        "Write down your worst fear about the exam",
        "Ask: Is this thought 100% true?",
        "What would you tell a friend who had this fear?",
        "Replace with a balanced, realistic thought",
        "Read it aloud 3 times",
      ],
    },
    {
      id: "schedule",
      title: "Micro-Break Reset",
      icon: "⏱️",
      steps: [
        "Stop studying. Set a 10-min timer",
        "Stand up, stretch arms overhead",
        "Drink a glass of water slowly",
        "Look at something 20 feet away for 20 seconds",
        "Write one thing you learned today. Resume.",
      ],
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        animation: "floatUp 0.4s ease",
      }}
    >
      {/* Affirmation */}
      <div
        className="card"
        style={{
          padding: "22px 24px",
          background: "linear-gradient(135deg, #fdf6ec, #f5f0e8)",
          borderColor: "#e8d8c4",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 10 }}>✨</div>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 17,
            color: "var(--ink)",
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          {AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length]}
        </p>
      </div>

      {/* 4-7-8 Breathing */}
      <div className="card" style={{ padding: "22px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display'",
                fontSize: 17,
                color: "var(--ink)",
              }}
            >
              4-7-8 Breathing
            </h3>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 3 }}>
              Calm your nervous system in 3 cycles
            </p>
          </div>
          {!breathPhase && (
            <button
              className="btn-primary"
              style={{ padding: "9px 20px", fontSize: 14 }}
              onClick={startBreath}
            >
              Begin
            </button>
          )}
        </div>
        {breathPhase && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                position: "relative",
                width: 100,
                height: 100,
                margin: "0 auto 16px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background:
                    breathPhase === "inhale"
                      ? "radial-gradient(circle, #b8d4bb, #7a9e7e)"
                      : breathPhase === "hold"
                        ? "radial-gradient(circle, #f0b97a, #d4843e)"
                        : breathPhase === "exhale"
                          ? "radial-gradient(circle, #d4b9f0, #9b7fa0)"
                          : "radial-gradient(circle, #e8e0d8, #c8bdb8)",
                  transition: "all 0.5s ease",
                  transform:
                    breathPhase === "inhale"
                      ? "scale(1.2)"
                      : breathPhase === "hold"
                        ? "scale(1.2)"
                        : "scale(0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.5,
                  boxShadow: "0 0 30px rgba(122,158,126,0.3)",
                }}
              >
                {breathPhase.toUpperCase()}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              Cycle {breathCount + 1} of 3
            </p>
          </div>
        )}
        {!breathPhase && breathCount >= 3 && (
          <p
            style={{
              textAlign: "center",
              color: "var(--sage)",
              fontWeight: 600,
            }}
          >
            ✓ Well done! How do you feel now?
          </p>
        )}
      </div>

      {/* AI Tip */}
      <div className="card" style={{ padding: "22px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div>
            <h3 style={{ fontFamily: "'Playfair Display'", fontSize: 17 }}>
              Personalized Tip
            </h3>
            <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
              Based on your recent check-ins
            </p>
          </div>
          <button
            className="btn-ghost"
            style={{ fontSize: 13, padding: "8px 16px" }}
            onClick={fetchTip}
            disabled={loading}
          >
            {loading ? "Thinking…" : tip ? "Refresh" : "Get Tip ✦"}
          </button>
        </div>
        {loading && (
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "12px 0",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                border: "2.5px solid var(--mist)",
                borderTopColor: "var(--amber)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              Crafting something just for you…
            </span>
          </div>
        )}
        {tip && !loading && (
          <div
            style={{
              background: "var(--warm)",
              borderRadius: 14,
              padding: "16px",
              borderLeft: "3px solid var(--amber)",
              animation: "floatUp 0.4s ease",
            }}
          >
            <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7 }}>
              {tip}
            </p>
          </div>
        )}
        {!tip && !loading && (
          <p
            style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}
          >
            Get a personalized wellness tip tailored to your exam prep and
            current emotional state.
          </p>
        )}
      </div>

      {/* Quick Exercises */}
      <div className="card" style={{ padding: "22px 24px" }}>
        <h3
          style={{
            fontFamily: "'Playfair Display'",
            fontSize: 17,
            marginBottom: 4,
          }}
        >
          Quick Exercises
        </h3>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
          Pick one when you feel stuck or overwhelmed
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXERCISES.map((ex) => (
            <div key={ex.id}>
              <button
                onClick={() => setExercise(exercise?.id === ex.id ? null : ex)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background:
                    exercise?.id === ex.id ? "var(--warm)" : "transparent",
                  border: "1.5px solid var(--mist)",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  borderColor:
                    exercise?.id === ex.id
                      ? "var(--amber-light)"
                      : "var(--mist)",
                }}
              >
                <span style={{ fontSize: 20 }}>{ex.icon}</span>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 14,
                    color: "var(--ink)",
                    flex: 1,
                  }}
                >
                  {ex.title}
                </span>
                <span
                  style={{
                    color: "var(--amber)",
                    fontSize: 18,
                    transform:
                      exercise?.id === ex.id ? "rotate(90deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  ›
                </span>
              </button>
              {exercise?.id === ex.id && (
                <div
                  style={{
                    background: "var(--warm)",
                    borderRadius: "0 0 12px 12px",
                    padding: "14px 16px",
                    animation: "floatUp 0.3s ease",
                  }}
                >
                  {ex.steps.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          minWidth: 22,
                          height: 22,
                          background: "var(--amber)",
                          color: "white",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--ink-soft)",
                          lineHeight: 1.6,
                          paddingTop: 2,
                        }}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("checkin");
  const [entries, setEntries] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("mw_entries") || "[]");
    } catch {
      return [];
    }
  });
  const [exam, setExam] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("mw_exam") || "";
  });
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("mw_name") || "";
  });
  const [onboarded, setOnboarded] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("mw_name");
  });

  // Check-in state
  const [mood, setMood] = useState(null);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  // Journal
  const [journalNote, setJournalNote] = useState("");
  const [journalPrompt, setJournalPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const save = (obj) => {
    const updated = [obj, ...entries].slice(0, 120);
    setEntries(updated);
    localStorage.setItem("mw_entries", JSON.stringify(updated));
  };

  const handleCheckin = () => {
    if (!mood) return;
    const entry = {
      id: Date.now(),
      date: today(),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      moodEmoji: mood.emoji,
      moodLabel: mood.label,
      moodScore: mood.score,
      triggers: selectedTriggers,
      note,
    };
    save(entry);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setMood(null);
      setSelectedTriggers([]);
      setNote("");
    }, 2200);
  };

  const fetchJournalPrompt = async () => {
    setLoadingPrompt(true);
    const lastMood = entries[0]?.moodLabel || "stressed";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `A student preparing for ${exam || "competitive exams"} in India is feeling ${lastMood}. Give ONE thoughtful, open-ended journal reflection prompt (1-2 sentences) that helps them process their emotions and build self-awareness. Be warm and specific to exam prep context. No preamble, just the prompt.`,
            },
          ],
        }),
      });
      const data = await res.json();
      setJournalPrompt(
        data.content?.[0]?.text ||
          "What is one thing you're proud of yourself for today, no matter how small?",
      );
    } catch {
      setJournalPrompt(
        "What is one thing you're proud of yourself for today, no matter how small?",
      );
    }
    setLoadingPrompt(false);
  };

  const saveJournal = () => {
    if (!journalNote.trim()) return;
    const entry = {
      id: Date.now(),
      date: today(),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      moodEmoji: "📝",
      moodLabel: "Reflected",
      moodScore: 3,
      triggers: [],
      note: journalNote,
      isJournal: true,
      prompt: journalPrompt,
    };
    save(entry);
    setJournalNote("");
    setJournalPrompt("");
  };

  const streak = getStreak(entries);
  const moodAvg = avgMood(entries.filter((e) => !e.isJournal).slice(0, 7));
  const topTriggers = Object.entries(
    entries
      .flatMap((e) => e.triggers)
      .reduce((a, t) => ({ ...a, [t]: (a[t] || 0) + 1 }), {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const moodColor =
    MOODS.find((m) => m.label === entries[0]?.moodLabel)?.color ||
    "var(--amber)";

  // Onboarding
  const [tmpName, setTmpName] = useState("");
  const [tmpExam, setTmpExam] = useState("JEE");

  if (!onboarded) {
    return (
      <>
        <GlobalStyle />
        <div
          style={{
            minHeight: "100vh",
            background: "var(--sand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 420,
              width: "100%",
              padding: "40px 36px",
              textAlign: "center",
              animation: "floatUp 0.6s ease",
            }}
          >
            <BreathOrb />
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                color: "var(--ink)",
                marginTop: 20,
                marginBottom: 8,
              }}
            >
              You've got this. 🌿
            </h1>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              This is your safe space to check in with yourself — because your
              mental health matters as much as your rank.
            </p>
            <div
              style={{
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--ink-soft)",
                    marginBottom: 8,
                    letterSpacing: 0.3,
                  }}
                >
                  YOUR NAME
                </label>
                <input
                  type="text"
                  placeholder="What should we call you?"
                  value={tmpName}
                  onChange={(e) => setTmpName(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--ink-soft)",
                    marginBottom: 8,
                    letterSpacing: 0.3,
                  }}
                >
                  PREPARING FOR
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={tmpExam}
                    onChange={(e) => setTmpExam(e.target.value)}
                    style={{ width: "100%", paddingRight: 36 }}
                  >
                    {EXAMS.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "var(--ink-soft)",
                    }}
                  >
                    ▾
                  </span>
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ marginTop: 8, width: "100%", padding: "14px" }}
                onClick={() => {
                  if (!tmpName.trim()) return;
                  const n = tmpName.trim();
                  setName(n);
                  setExam(tmpExam);
                  localStorage.setItem("mw_name", n);
                  localStorage.setItem("mw_exam", tmpExam);
                  setOnboarded(true);
                }}
              >
                Begin My Journey →
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: "100vh", background: "var(--sand)" }}>
        {/* Header */}
        <div
          style={{
            background: "var(--white)",
            borderBottom: "1.5px solid var(--mist)",
            padding: "16px 20px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f0b97a, #c4614a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                🌿
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--ink)",
                  }}
                >
                  MindSpace
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                  {exam} prep · {name}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {streak > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "var(--warm)",
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "1.5px solid var(--mist)",
                  }}
                >
                  <span style={{ fontSize: 14 }}>🔥</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--amber)",
                    }}
                  >
                    {streak}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                    streak
                  </span>
                </div>
              )}
              {entries.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 18 }}>
                    {entries[0]?.moodEmoji || "😊"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                    last check-in
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div
          style={{
            background: "var(--white)",
            borderBottom: "1.5px solid var(--mist)",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              display: "flex",
              padding: "0 12px",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  minWidth: 80,
                  padding: "14px 8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "'DM Sans'",
                  fontSize: 12,
                  fontWeight: tab === t.id ? 700 : 400,
                  color: tab === t.id ? "var(--amber)" : "var(--ink-soft)",
                  borderBottom:
                    tab === t.id
                      ? "2.5px solid var(--amber)"
                      : "2.5px solid transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div
          style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 80px" }}
        >
          {/* ── CHECK IN ── */}
          {tab === "checkin" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                animation: "floatUp 0.4s ease",
              }}
            >
              {saved ? (
                <div
                  className="card"
                  style={{
                    padding: "40px 24px",
                    textAlign: "center",
                    animation: "pop 0.4s ease",
                  }}
                >
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🌸</div>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display'",
                      fontSize: 22,
                      color: "var(--ink)",
                    }}
                  >
                    Checked in!
                  </h2>
                  <p
                    style={{
                      color: "var(--ink-soft)",
                      marginTop: 8,
                      fontSize: 14,
                    }}
                  >
                    You showed up for yourself today. That matters. 💛
                  </p>
                </div>
              ) : (
                <>
                  <div className="card" style={{ padding: "24px" }}>
                    <p
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 19,
                        color: "var(--ink)",
                        marginBottom: 4,
                      }}
                    >
                      How are you feeling right now, {name}?
                    </p>
                    <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                      Be honest — there are no wrong answers here.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 20,
                        flexWrap: "wrap",
                      }}
                    >
                      {MOODS.map((m) => (
                        <button
                          key={m.label}
                          onClick={() => setMood(m)}
                          style={{
                            flex: 1,
                            minWidth: 80,
                            padding: "16px 8px",
                            border: "2px solid",
                            borderColor:
                              mood?.label === m.label ? m.color : "var(--mist)",
                            borderRadius: 16,
                            background:
                              mood?.label === m.label
                                ? m.color + "18"
                                : "var(--warm)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            transform:
                              mood?.label === m.label
                                ? "scale(1.06)"
                                : "scale(1)",
                          }}
                        >
                          <div style={{ fontSize: 28, marginBottom: 6 }}>
                            {m.emoji}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color:
                                mood?.label === m.label
                                  ? m.color
                                  : "var(--ink-soft)",
                            }}
                          >
                            {m.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="card" style={{ padding: "24px" }}>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "var(--ink)",
                        marginBottom: 4,
                        fontSize: 15,
                      }}
                    >
                      What's weighing on you?
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--ink-soft)",
                        marginBottom: 16,
                      }}
                    >
                      Select all that apply (optional)
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {TRIGGERS.map((t) => (
                        <span
                          key={t}
                          className={`chip ${selectedTriggers.includes(t) ? "selected" : ""}`}
                          onClick={() =>
                            setSelectedTriggers((prev) =>
                              prev.includes(t)
                                ? prev.filter((x) => x !== t)
                                : [...prev, t],
                            )
                          }
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card" style={{ padding: "24px" }}>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "var(--ink)",
                        marginBottom: 12,
                        fontSize: 15,
                      }}
                    >
                      Anything you want to add?
                    </p>
                    <textarea
                      rows={4}
                      placeholder="Vent, reflect, celebrate — this space is just for you..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <button
                      className="btn-primary"
                      style={{ marginTop: 14, width: "100%" }}
                      onClick={handleCheckin}
                      disabled={!mood}
                    >
                      Save Check-in ✦
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── JOURNAL ── */}
          {tab === "journal" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                animation: "floatUp 0.4s ease",
              }}
            >
              <div className="card" style={{ padding: "24px" }}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display'",
                    fontSize: 21,
                    marginBottom: 6,
                  }}
                >
                  Reflection Journal
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ink-soft)",
                    marginBottom: 20,
                    lineHeight: 1.6,
                  }}
                >
                  Writing your thoughts helps you process stress and gain
                  clarity. Even 5 minutes makes a difference.
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--ink)",
                    }}
                  >
                    Today's Prompt
                  </p>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: "7px 14px" }}
                    onClick={fetchJournalPrompt}
                    disabled={loadingPrompt}
                  >
                    {loadingPrompt ? "…" : "New Prompt ✦"}
                  </button>
                </div>
                {journalPrompt ? (
                  <div
                    style={{
                      background: "var(--warm)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      borderLeft: "3px solid var(--sage)",
                      marginBottom: 16,
                      animation: "slideIn 0.3s ease",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        color: "var(--ink)",
                        lineHeight: 1.7,
                        fontStyle: "italic",
                      }}
                    >
                      "{journalPrompt}"
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "var(--warm)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      borderLeft: "3px solid var(--sage)",
                      marginBottom: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        color: "var(--ink-soft)",
                        lineHeight: 1.7,
                        fontStyle: "italic",
                      }}
                    >
                      "If you could send a message to yourself one year from
                      now, what would it say?"
                    </p>
                  </div>
                )}
                <textarea
                  rows={7}
                  placeholder="Start writing... there are no rules here."
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                />
                <button
                  className="btn-primary"
                  style={{ marginTop: 14, width: "100%" }}
                  onClick={saveJournal}
                  disabled={!journalNote.trim()}
                >
                  Save Entry
                </button>
              </div>

              {entries
                .filter((e) => e.isJournal)
                .slice(0, 3)
                .map((e) => (
                  <div
                    key={e.id}
                    className="card"
                    style={{
                      padding: "20px 24px",
                      animation: "floatUp 0.4s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--sage)",
                        }}
                      >
                        📝 Journal
                      </span>
                      <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                        {fmtDate(e.date)} · {e.time}
                      </span>
                    </div>
                    {e.prompt && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--ink-soft)",
                          fontStyle: "italic",
                          marginBottom: 8,
                        }}
                      >
                        Prompt: {e.prompt}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: 14,
                        color: "var(--ink)",
                        lineHeight: 1.7,
                      }}
                    >
                      {e.note}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab === "history" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                animation: "floatUp 0.4s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 21 }}>
                  Your History
                </h2>
                <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  {entries.length} entries
                </span>
              </div>
              {entries.length === 0 && (
                <div
                  className="card"
                  style={{ padding: "40px 24px", textAlign: "center" }}
                >
                  <p style={{ fontSize: 40, marginBottom: 12 }}>🌱</p>
                  <p style={{ color: "var(--ink-soft)", fontSize: 15 }}>
                    No entries yet. Your first check-in starts your journey.
                  </p>
                </div>
              )}
              {entries.map((e, i) => (
                <div
                  key={e.id}
                  className="card"
                  style={{
                    padding: "18px 20px",
                    borderLeft: `3px solid ${MOODS.find((m) => m.label === e.moodLabel)?.color || "var(--sage)"}`,
                    animation: `floatUp ${0.1 + i * 0.05}s ease`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <span style={{ fontSize: 22 }}>{e.moodEmoji}</span>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "var(--ink)",
                          }}
                        >
                          {e.moodLabel}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                          {fmtDate(e.date)} · {e.time}
                        </div>
                      </div>
                    </div>
                  </div>
                  {e.triggers?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 12,
                      }}
                    >
                      {e.triggers.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "var(--warm)",
                            color: "var(--ink-soft)",
                            border: "1px solid var(--mist)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {e.note && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--ink-soft)",
                        marginTop: 10,
                        lineHeight: 1.6,
                        borderTop: "1px solid var(--mist)",
                        paddingTop: 10,
                      }}
                    >
                      {e.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── INSIGHTS ── */}
          {tab === "insights" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                animation: "floatUp 0.4s ease",
              }}
            >
              <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 21 }}>
                Your Insights
              </h2>

              {/* Stats row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "Day Streak",
                    value: streak ? `${streak} 🔥` : "—",
                    sub: "consistency",
                  },
                  {
                    label: "Avg Mood",
                    value: moodAvg ? `${moodAvg}/5` : "—",
                    sub: "last 7 days",
                  },
                  {
                    label: "Total Entries",
                    value: entries.length,
                    sub: "check-ins",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="card"
                    style={{ padding: "18px 14px", textAlign: "center" }}
                  >
                    <div
                      style={{
                        fontFamily: "'Playfair Display'",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--amber)",
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--ink)",
                        marginTop: 4,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--ink-soft)",
                        marginTop: 2,
                      }}
                    >
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mood chart - last 7 days */}
              {entries.filter((e) => !e.isJournal).length > 0 && (
                <div className="card" style={{ padding: "24px" }}>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display'",
                      fontSize: 17,
                      marginBottom: 16,
                    }}
                  >
                    Mood This Week
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 8,
                      height: 80,
                    }}
                  >
                    {entries
                      .filter((e) => !e.isJournal)
                      .slice(0, 7)
                      .reverse()
                      .map((e, i) => {
                        const color =
                          MOODS.find((m) => m.label === e.moodLabel)?.color ||
                          "var(--amber)";
                        const h = (e.moodScore / 5) * 70;
                        return (
                          <div
                            key={e.id}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: h,
                                background: color,
                                borderRadius: "6px 6px 3px 3px",
                                opacity: 0.85,
                                transition: "height 0.5s",
                              }}
                              title={e.moodLabel}
                            />
                            <span
                              style={{ fontSize: 10, color: "var(--ink-soft)" }}
                            >
                              {fmtDate(e.date).split(" ")[0]}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                      fontSize: 11,
                      color: "var(--ink-soft)",
                    }}
                  >
                    <span>← older</span>
                    <span>today →</span>
                  </div>
                </div>
              )}

              {/* Top triggers */}
              {topTriggers.length > 0 && (
                <div className="card" style={{ padding: "24px" }}>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display'",
                      fontSize: 17,
                      marginBottom: 16,
                    }}
                  >
                    Your Top Stress Triggers
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {topTriggers.map(([t, count]) => (
                      <div
                        key={t}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--ink)",
                            minWidth: 150,
                          }}
                        >
                          {t}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: 8,
                            background: "var(--mist)",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(count / topTriggers[0][1]) * 100}%`,
                              height: "100%",
                              background: "var(--terracotta)",
                              borderRadius: 4,
                              opacity: 0.75,
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--ink-soft)",
                            minWidth: 24,
                          }}
                        >
                          {count}×
                        </span>
                      </div>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      marginTop: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Knowing your triggers is the first step to managing them.
                    Head to Wellness for targeted exercises. 💡
                  </p>
                </div>
              )}

              {/* Mood distribution */}
              {entries.length > 0 && (
                <div className="card" style={{ padding: "24px" }}>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display'",
                      fontSize: 17,
                      marginBottom: 16,
                    }}
                  >
                    Mood Distribution
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {MOODS.map((m) => {
                      const cnt = entries.filter(
                        (e) => e.moodLabel === m.label,
                      ).length;
                      const pct = entries.length
                        ? Math.round((cnt / entries.length) * 100)
                        : 0;
                      return (
                        <div
                          key={m.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span style={{ fontSize: 16, minWidth: 28 }}>
                            {m.emoji}
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              color: "var(--ink)",
                              minWidth: 70,
                            }}
                          >
                            {m.label}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 8,
                              background: "var(--mist)",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: m.color,
                                borderRadius: 4,
                                transition: "width 0.6s ease",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--ink-soft)",
                              minWidth: 36,
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {entries.length === 0 && (
                <div
                  className="card"
                  style={{ padding: "40px 24px", textAlign: "center" }}
                >
                  <p style={{ fontSize: 36, marginBottom: 12 }}>📊</p>
                  <p style={{ color: "var(--ink-soft)", fontSize: 15 }}>
                    Insights appear after a few check-ins. Start your streak
                    today!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── WELLNESS ── */}
          {tab === "wellness" && (
            <WellnessPanel entries={entries} exam={exam} />
          )}
        </div>

        {/* Bottom padding note */}
        <div
          style={{
            textAlign: "center",
            padding: "0 20px 30px",
            color: "var(--ink-soft)",
            fontSize: 12,
          }}
        >
          MindSpace · built with care for {exam} warriors 🌱
        </div>
      </div>
    </>
  );
}
