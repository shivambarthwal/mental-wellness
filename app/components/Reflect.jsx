"use client";

import { useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { today, fmtDate } from "./tracker-data";

export default function Reflect({ exam, entries, onSave }) {
  const [journalNote, setJournalNote] = useState("");
  const [journalPrompt, setJournalPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const fetchJournalPrompt = async () => {
    setLoadingPrompt(true);
    const lastMood = entries[0]?.moodLabel || "stressed";
    
    try {
      const res = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "journal_prompt",
          exam,
          mood: lastMood,
        }),
      });
      const data = await res.json();
      setJournalPrompt(data.prompt);
    } catch {
      setJournalPrompt(
        "What is one thing you're proud of yourself for today, no matter how small?"
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
    onSave(entry);
    setJournalNote("");
    setJournalPrompt("");
  };

  const journals = entries.filter((e) => e.isJournal);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Card className="bg-white border-slate-100/80 p-6">
        <h2 className="text-xl font-bold text-slate-800">Reflection Journal</h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Writing your thoughts down releases tension, halts negative thought patterns, and promotes emotional clarity.
        </p>

        {/* Prompt generator container */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Writing Prompt</h3>
            <button
              type="button"
              onClick={fetchJournalPrompt}
              disabled={loadingPrompt}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition cursor-pointer"
            >
              {loadingPrompt ? "Generating..." : "New Prompt ✦"}
            </button>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-sm text-slate-800 italic leading-relaxed">
            {journalPrompt ? (
              <span>"{journalPrompt}"</span>
            ) : (
              <span>"What is one thing you are proud of yourself for today, regardless of how much syllabus you finished?"</span>
            )}
          </div>
        </div>

        {/* Journal Textarea */}
        <textarea
          rows={6}
          placeholder="Start writing... don't edit yourself, just let your thoughts flow."
          value={journalNote}
          onChange={(e) => setJournalNote(e.target.value)}
          className="w-full mt-4 p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-700 transition"
        />

        <Button
          onClick={saveJournal}
          disabled={!journalNote.trim()}
          variant="primary"
          className="w-full mt-4 py-3"
        >
          Save Journal Entry
        </Button>
      </Card>

      {/* Past reflections list */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Reflections</h3>
        {journals.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No journal entries recorded. Write your first entry above to build a mindful reflection log.
          </div>
        ) : (
          journals.map((e) => (
            <Card key={e.id} className="bg-white border-slate-100/80 p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                  📝 Reflection Journal
                </span>
                <span className="text-xs text-slate-400">
                  {fmtDate(e.date)} · {e.time}
                </span>
              </div>
              {e.prompt && (
                <div className="text-xs text-slate-400 border-l-2 border-slate-200 pl-2.5 py-0.5 italic mb-3">
                  Prompt: {e.prompt}
                </div>
              )}
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {e.note}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
