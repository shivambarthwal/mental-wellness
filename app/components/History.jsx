"use client";

import { useState } from "react";
import Card from "./ui/Card";
import { fmtDate } from "./tracker-data";

export default function History({ entries, onDelete }) {
  const [filter, setFilter] = useState("all"); // all, checkin, journal
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = entries.filter((e) => {
    // Type filter
    if (filter === "checkin" && e.isJournal) return false;
    if (filter === "journal" && !e.isJournal) return false;

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const noteMatch = e.note?.toLowerCase().includes(q);
      const moodMatch = e.moodLabel?.toLowerCase().includes(q);
      const triggerMatch = e.triggers?.some((t) => t.toLowerCase().includes(q));
      return noteMatch || moodMatch || triggerMatch;
    }

    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your Wellness Log</h2>
          <p className="text-xs text-slate-400 mt-1">Review past emotions, triggers, and reflection diaries</p>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {entries.length} Entries Logged
        </span>
      </div>

      {/* Filter and Search controls */}
      <Card className="bg-white border-slate-100/80 p-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search notes, triggers, or moods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-700 transition"
          />
        </div>
        <div className="flex gap-1.5 bg-slate-50 border border-slate-200/60 p-1 rounded-2xl">
          {[
            { id: "all", label: "All Logs" },
            { id: "checkin", label: "Moods" },
            { id: "journal", label: "Journals" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f.id
                  ? "bg-brand-indigo text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card className="p-12 text-center bg-white border-slate-100/80">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-xs text-slate-400">No matching entries found in your logs.</p>
          </Card>
        ) : (
          filteredEntries.map((e) => (
            <Card
              key={e.id}
              className={`bg-white border-slate-150 relative overflow-hidden transition-all duration-200 hover:border-slate-250`}
            >
              {/* Type tag ribbon */}
              <div className="absolute top-0 right-0 h-1.5 left-0 bg-slate-100">
                <div
                  className={`h-full ${
                    e.isJournal ? "bg-teal-500" : "bg-indigo-500"
                  }`}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="text-3xl bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex items-center justify-center">
                    {e.moodEmoji}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      {e.isJournal ? "Reflection Journal" : e.moodLabel}
                      {e.moodScore && !e.isJournal && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          Score {e.moodScore}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {fmtDate(e.date)} · {e.time}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this entry?")) {
                      onDelete(e.id);
                    }
                  }}
                  className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-xl transition cursor-pointer"
                  title="Delete entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Triggers display */}
              {e.triggers && e.triggers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {e.triggers.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold px-2.5 py-0.5 bg-slate-50 border border-slate-250 text-slate-500 rounded-lg"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Note body */}
              {e.note && (
                <div className="mt-4 border-t border-slate-100 pt-3.5">
                  {e.prompt && (
                    <p className="text-[11px] text-slate-400 italic mb-2">Prompt: {e.prompt}</p>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {e.note}
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
