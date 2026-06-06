"use client";

import { useEffect, useRef, useState } from "react";
import { AFFIRMATIONS, MOODS } from "./tracker-data";

const EXERCISES = [
  {
    id: "grounding",
    title: "5-4-3-2-1 Grounding",
    icon: "🌿",
    steps: [
      "Notice 5 things you can SEE around you.",
      "Touch 4 things you can FEEL.",
      "Listen for 3 things you can HEAR.",
      "Find 2 things you can SMELL.",
      "Notice 1 thing you can TASTE.",
    ],
  },
  {
    id: "reframe",
    title: "Exam Anxiety Reframe",
    icon: "🧠",
    steps: [
      "Write down your worst fear about the exam.",
      "Ask: Is this thought 100% true?",
      "What would you tell a friend with this worry?",
      "Replace it with a kinder, realistic thought.",
      "Read it aloud 3 times.",
    ],
  },
  {
    id: "reset",
    title: "Micro-Break Reset",
    icon: "⏱️",
    steps: [
      "Stop studying and set a 10-minute timer.",
      "Stand up and stretch arms overhead.",
      "Drink water slowly and breathe deeply.",
      "Look at something 20 feet away for 20 seconds.",
      "Write one thing you learned today.",
    ],
  },
];

const defaultTip =
  "You are not alone in this season. Pause, notice one thing you can control, and take a small step forward with kindness.";

export function WellnessPanel({ entries, exam }) {
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [exercise, setExercise] = useState(null);
  const [breathPhase, setBreathPhase] = useState(null);
  const [breathCount, setBreathCount] = useState(0);
  const timeoutRef = useRef(null);

  const lastMood = entries[0]?.moodLabel || "stressed";
  const triggers = entries
    .slice(0, 3)
    .flatMap((entry) => entry.triggers)
    .slice(0, 4);
  const affirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

  const fetchTip = async () => {
    setLoading(true);
    setTip("");

    const context = `Student preparing for ${exam || "competitive exams"} in India. Recent mood: ${lastMood}. Stress triggers: ${
      triggers.join(", ") || "general exam stress"
    }. Recent journal: "${entries[0]?.note?.slice(0, 100) || ""}"`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
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
      const data = await response.json();
      setTip(data.content?.[0]?.text?.trim() || defaultTip);
    } catch {
      setTip(defaultTip);
    } finally {
      setLoading(false);
    }
  };

  const startBreath = () => {
    setBreathPhase("inhale");
    setBreathCount(0);

    const phases = ["inhale", "hold", "exhale", "rest"];
    const durations = [3800, 7000, 8000, 2000];
    let phaseIndex = 0;
    let completedCycles = 0;

    const nextPhase = () => {
      const timeout = setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        setBreathPhase(phases[phaseIndex]);

        if (phaseIndex === 0) {
          completedCycles += 1;
          setBreathCount(completedCycles);
          if (completedCycles >= 3) {
            setBreathPhase(null);
            return;
          }
        }
        nextPhase();
      }, durations[phaseIndex]);
      timeoutRef.current = timeout;
    };

    nextPhase();
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-amber-50 via-slate-50 to-white p-6 shadow-[0_30px_80px_rgba(16,24,40,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
              Daily boost
            </span>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
              A calm, steady companion for every exam season.
            </h2>
          </div>
          <div className="grid gap-3 sm:text-right">
            <p className="text-sm text-slate-600">
              Wellness support tuned for your journey.
            </p>
            <p className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200">
              {affirmation}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-amber-700">
                Calm practice
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">
                4-7-8 breathing
              </h3>
            </div>
            {!breathPhase ? (
              <button
                type="button"
                onClick={startBreath}
                className="rounded-full bg-amber-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
              >
                Begin
              </button>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-5 rounded-[24px] border border-slate-200/80 bg-slate-50 p-6">
            <div
              className={`relative flex h-28 w-28 items-center justify-center rounded-full ${
                breathPhase === "exhale"
                  ? "bg-violet-200"
                  : breathPhase === "hold"
                    ? "bg-amber-200"
                    : "bg-emerald-200"
              } animate-[pulse_4s_ease-in-out_infinite] text-slate-900 shadow-[0_14px_40px_rgba(148,163,184,0.18)]`}
            >
              <span className="text-sm font-semibold uppercase tracking-[0.26em]">
                {breathPhase ? breathPhase : "Ready"}
              </span>
            </div>
            {breathPhase ? (
              <p className="text-center text-sm text-slate-600">
                Cycle {breathCount + 1} of 3 — follow the rhythm and let your
                body settle.
              </p>
            ) : (
              <p className="text-center text-sm text-slate-500">
                Press begin and breathe through the inhale, hold, exhale, rest
                sequence.
              </p>
            )}
            {breathPhase === null && breathCount >= 3 ? (
              <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
                Well done — feel the reset. 🌿
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Personalized support
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                Wellness tip
              </h3>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-900"
              onClick={fetchTip}
              disabled={loading}
            >
              {loading ? "Thinking..." : tip ? "Refresh" : "Get tip"}
            </button>
          </div>

          <div className="rounded-[24px] border border-amber-100 bg-amber-50/90 p-5 text-slate-700 shadow-sm">
            {loading ? (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
                Crafting a warm, helpful note for your next study break.
              </div>
            ) : (
              <p className="text-sm leading-7">
                {tip ||
                  "Tap the button to receive a short, encouraging wellness note tailored to your exam journey."}
              </p>
            )}
          </div>

          <div className="mt-7 space-y-4">
            <h4 className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Quick wellness rituals
            </h4>
            <div className="space-y-3">
              {EXERCISES.map((item) => (
                <div
                  key={item.id}
                  className="space-y-3 rounded-[22px] border border-slate-200 p-4 transition hover:border-amber-200"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 text-left"
                    onClick={() =>
                      setExercise(exercise?.id === item.id ? null : item)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-lg">
                        {item.icon}
                      </span>
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          Simple steps to calm your mind.
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-2xl text-amber-600 transition ${exercise?.id === item.id ? "rotate-90" : ""}`}
                    >
                      &rsaquo;
                    </span>
                  </button>
                  {exercise?.id === item.id ? (
                    <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      {item.steps.map((step, index) => (
                        <div key={step} className="flex gap-3">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-[11px] font-semibold text-amber-900">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
