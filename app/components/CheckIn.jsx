"use client";

import { useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { MOODS, TRIGGERS, today } from "./tracker-data";

export default function CheckIn({ name, onSave }) {
  const [mood, setMood] = useState(null);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

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
    onSave(entry);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setMood(null);
      setSelectedTriggers([]);
      setNote("");
    }, 2200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {saved ? (
        <Card className="p-12 text-center bg-white border-slate-100/80 animate-pop">
          <div className="text-5xl mb-4">🌸</div>
          <h2 className="text-xl font-bold text-slate-800">Check-in Saved!</h2>
          <p className="text-sm text-slate-400 mt-2">
            You showed up for yourself today. That's what counts. 💛
          </p>
        </Card>
      ) : (
        <>
          {/* Mood Selection Card */}
          <Card className="bg-white border-slate-100/80 p-6">
            <h2 className="text-lg font-bold text-slate-800">How are you feeling right now, {name}?</h2>
            <p className="text-xs text-slate-400 mt-1">All emotions are welcome here. Take a second to label it.</p>
            
            <div className="grid grid-cols-5 gap-3 mt-6">
              {MOODS.map((m) => {
                const isSelected = mood?.label === m.label;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500 shadow-sm scale-[1.04]"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-3xl emoji-pop transition-transform duration-250 mb-2">{m.emoji}</span>
                    <span className={`text-[10px] font-bold ${
                      isSelected ? "text-indigo-600" : "text-slate-500"
                    }`}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Trigger Selection Card */}
          <Card className="bg-white border-slate-100/80 p-6">
            <h2 className="text-lg font-bold text-slate-800">What's weighing on you?</h2>
            <p className="text-xs text-slate-400 mt-1">Select any stress triggers contributing to your current mood (optional)</p>
            
            <div className="flex flex-wrap gap-2.5 mt-5">
              {TRIGGERS.map((t) => {
                const isSelected = selectedTriggers.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setSelectedTriggers((prev) =>
                        prev.includes(t)
                          ? prev.filter((x) => x !== t)
                          : [...prev, t]
                      )
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500 border-indigo-500 text-white shadow-sm"
                        : "bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Diary/Note Textarea Card */}
          <Card className="bg-white border-slate-100/80 p-6">
            <h2 className="text-lg font-bold text-slate-800">Anything you'd like to write down?</h2>
            <p className="text-xs text-slate-400 mt-1">Vent, write a quick study diary, or celebrate a small win</p>
            
            <textarea
              rows={4}
              placeholder="Start venting... this is a completely private space for your eyes only."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-4 p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-700 transition"
            />

            <Button
              onClick={handleCheckin}
              disabled={!mood}
              variant="primary"
              className="w-full mt-4 py-3.5 text-xs tracking-wider"
            >
              Complete Check-in ✦
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
