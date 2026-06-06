"use client";

import { useEffect, useRef, useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { AFFIRMATIONS } from "./tracker-data";

const EXERCISES = [
  {
    id: "grounding",
    title: "5-4-3-2-1 Grounding",
    icon: "🌿",
    desc: "Reconnect with your physical surroundings to disrupt spiral thoughts.",
    steps: [
      "Notice 5 things you can SEE around you (e.g. your book, a pen, a clock).",
      "Touch 4 things you can FEEL (e.g. the desk surface, your chair, hair).",
      "Listen for 3 things you can HEAR (e.g. traffic outside, fan hum).",
      "Find 2 things you can SMELL (e.g. coffee, paper pages, pencil lead).",
      "Notice 1 thing you can TASTE (e.g. toothpaste, mint, water).",
    ],
  },
  {
    id: "reframe",
    title: "Exam Anxiety Reframe",
    icon: "🧠",
    desc: "Actively question and pivot catastrophic predictions about mock tests or exam results.",
    steps: [
      "Write down your worst fear about the exam (e.g. 'I will fail and ruin everything').",
      "Ask yourself: Is this statement 100% realistic or an emotional catastrophizing thought?",
      "Reframe: What would you tell a best friend with this exact fear?",
      "Replace it with a balanced fact: 'No exam determines my whole life. I will prepare my best.'",
      "Close your eyes and read it silently 3 times.",
    ],
  },
  {
    id: "reset",
    title: "Micro-Break Reset",
    icon: "⏱️",
    desc: "A 10-minute structural recharge to take during intense study sessions.",
    steps: [
      "Stop looking at screens or books. Set a 10-minute timer.",
      "Stand up and stretch your arms overhead, rolling your shoulders.",
      "Drink a glass of water slowly, feeling the temperature.",
      "Look at an object 20 feet away for 20 seconds to rest your eye muscles.",
      "Acknowledge one concept you reviewed today, then rest your mind."
    ],
  },
];

export default function Wellness({ entries, exam }) {
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [exerciseId, setExerciseId] = useState(null);
  const [breathPhase, setBreathPhase] = useState(null);
  const [breathCount, setBreathCount] = useState(0);
  const timeoutRef = useRef(null);

  const lastMood = entries[0]?.moodLabel || "stressed";
  const recentTriggers = entries
    .slice(0, 3)
    .flatMap((e) => e.triggers)
    .slice(0, 4);

  const fetchTip = async () => {
    setLoading(true);
    setTip("");

    try {
      const response = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "wellness_tip",
          exam,
          mood: lastMood,
          triggers: recentTriggers,
          note: entries[0]?.note || "",
        }),
      });
      const data = await response.json();
      setTip(data.tip);
    } catch {
      setTip(
        "Take a slow breath. You are not alone in this exam season. Remember that your score does not represent your worth. Focus on one small concept at a time."
      );
    } finally {
      setLoading(false);
    }
  };

  const startBreath = () => {
    setBreathPhase("inhale");
    setBreathCount(0);

    const phases = ["inhale", "hold", "exhale", "rest"];
    const durations = [4000, 7000, 8000, 2000];
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

  const todayAffirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Affirmation Card */}
      <Card className="bg-gradient-to-tr from-amber-50 to-orange-50 border-amber-200/50 p-6 text-center">
        <span className="text-3xl block mb-2">✨</span>
        <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Daily Affirmation</h3>
        <p className="font-serif italic text-base leading-relaxed text-slate-800">
          "{todayAffirmation}"
        </p>
      </Card>

      {/* Main Breathing Guide */}
      <Card className="bg-white border-slate-100/80 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">4-7-8 Breathing Guide</h3>
            <p className="text-xs text-slate-400 mt-1">Calm your autonomic nervous system and release muscle tension</p>
          </div>
          {!breathPhase && (
            <Button onClick={startBreath} size="sm" variant="primary">
              Begin Breathing
            </Button>
          )}
        </div>

        {breathPhase ? (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-150">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div
                className={`absolute w-32 h-32 rounded-full transition-all duration-[3000ms] ${
                  breathPhase === "inhale"
                    ? "bg-teal-200/50 scale-[1.2] shadow-lg shadow-teal-100"
                    : breathPhase === "hold"
                      ? "bg-amber-200/50 scale-[1.2] shadow-lg shadow-amber-100"
                      : breathPhase === "exhale"
                        ? "bg-indigo-200/50 scale-[0.85] shadow-lg shadow-indigo-100"
                        : "bg-slate-200/30 scale-100"
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600 z-10">
                {breathPhase}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Cycle {breathCount + 1} of 3 — follow the rhythm and relax.
            </p>
          </div>
        ) : (
          <div className="text-center p-6 bg-slate-50/50 border border-slate-150 rounded-2xl text-xs text-slate-400">
            {breathCount >= 3 ? (
              <span className="text-brand-secondary font-bold">✓ Cycle completed! How does your head feel now? 🌿</span>
            ) : (
              <span>Press Begin and trace the inhale (4s), hold (7s), exhale (8s) rhythm.</span>
            )}
          </div>
        )}
      </Card>

      {/* AI Tips Container */}
      <Card className="bg-white border-slate-100/80 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Empathetic Wellness Tip</h3>
            <p className="text-xs text-slate-400 mt-1">Personalized support based on your latest mood check-ins</p>
          </div>
          <Button
            onClick={fetchTip}
            disabled={loading}
            variant="ghost"
            size="sm"
            className="text-xs py-2 px-4 cursor-pointer"
          >
            {loading ? "Thinking..." : tip ? "Refresh Note" : "Get Support ✦"}
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
            <span className="inline-block w-4 h-4 rounded-full border-2 border-indigo-200 border-t-brand-indigo animate-spin"></span>
            <span>Crafting a supportive message for your study session...</span>
          </div>
        )}

        {tip && !loading && (
          <div className="p-4 bg-indigo-50/40 border-l-3 border-indigo-400 rounded-r-2xl text-slate-700 text-xs leading-relaxed animate-fade-in">
            {tip}
          </div>
        )}

        {!tip && !loading && (
          <p className="text-xs text-slate-500 leading-relaxed">
            Get a tailored mental health tip adapted to your {exam} studies, stress triggers, and notes.
          </p>
        )}
      </Card>

      {/* Accordion list */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Coping Rituals</h3>
        
        {EXERCISES.map((ex) => {
          const isOpen = exerciseId === ex.id;
          return (
            <div key={ex.id} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setExerciseId(isOpen ? null : ex.id)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl bg-slate-50 border border-slate-100 p-2 rounded-xl">{ex.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{ex.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ex.desc}</p>
                  </div>
                </div>
                <span className={`text-slate-400 text-lg transition-transform ${isOpen ? "rotate-90" : ""}`}>
                  &rsaquo;
                </span>
              </button>

              {isOpen && (
                <div className="p-4 bg-slate-50 border-t border-slate-150 space-y-3 animate-fade-in">
                  {ex.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-600">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-indigo text-white flex items-center justify-center font-bold text-[9px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
