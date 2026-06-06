"use client";

import { useState, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { getCommunityNotes, saveCommunityNote, reactToCommunityNote } from "../lib/storage";
import { EXAMS } from "./tracker-data";

const COLORS = [
  "bg-amber-50/90 border-amber-100/90 text-amber-950 shadow-amber-500/5",
  "bg-emerald-50/90 border-emerald-100/90 text-emerald-950 shadow-emerald-500/5",
  "bg-sky-50/90 border-sky-100/90 text-sky-950 shadow-sky-500/5",
  "bg-purple-50/90 border-purple-100/90 text-purple-950 shadow-purple-500/5",
  "bg-rose-50/90 border-rose-100/90 text-rose-950 shadow-rose-500/5",
];

export default function CommunityWall() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [exam, setExam] = useState("General");
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setNotes(getCommunityNotes());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newNote = {
      author: author.trim() || "Anonymous Warrior",
      exam: exam,
      text: text.trim(),
    };

    const updated = saveCommunityNote(newNote);
    if (updated) {
      setNotes(updated);
      setText("");
      setAuthor("");
      setIsFormOpen(false);
    }
  };

  const handleReact = (noteId, type) => {
    const updated = reactToCommunityNote(noteId, type);
    if (updated) {
      setNotes(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Aspirants' Encouragement Wall</h2>
          <p className="text-xs text-slate-400 mt-1">Leave a kind word of motivation for other students preparing for exams</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          variant={isFormOpen ? "ghost" : "secondary"}
          className="text-xs py-2.5 cursor-pointer"
        >
          {isFormOpen ? "Cancel Note" : "Write a Sticky Note ✍️"}
        </Button>
      </div>

      {/* Write form */}
      {isFormOpen && (
        <Card className="bg-white border-slate-100/80 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Write an Encouragement Note</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Your Alias</label>
                <input
                  type="text"
                  placeholder="Anonymous Warrior"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Your Target Exam</label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-755 font-medium"
                >
                  <option value="General">General</option>
                  {EXAMS.filter(e => e !== "Other").map((ex) => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Your Message</label>
              <textarea
                rows={3}
                required
                placeholder="Share a struggle, a win, or simply some words of support..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700"
              />
            </div>

            <Button type="submit" variant="secondary" className="w-full py-3 text-xs">
              Post to Wall ✨
            </Button>
          </form>
        </Card>
      )}

      {/* Grid of Sticky Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {notes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">
            The board is clean. Leave the first encouragement note!
          </div>
        ) : (
          notes.map((note, index) => {
            const colorClass = COLORS[index % COLORS.length];
            return (
              <div
                key={note.id}
                className={`p-6 border rounded-[28px] shadow-sm flex flex-col justify-between transition duration-200 hover:scale-[1.01] ${colorClass}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
                    <span>{note.author}</span>
                    <span className="bg-black/5 px-2 py-0.5 rounded-full">{note.exam} Prep</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed italic">
                    "{note.text}"
                  </p>
                </div>

                <div className="flex justify-between items-center mt-6 border-t border-black/5 pt-3">
                  <span className="text-[10px] font-medium opacity-50">
                    {new Date(note.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                  
                  {/* Reaction panel */}
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleReact(note.id, "likes")}
                      className="flex items-center gap-1 bg-white/40 hover:bg-white/70 border border-black/5 px-2 py-1 rounded-xl transition cursor-pointer active:scale-95"
                    >
                      <span>❤️</span>
                      <span className="font-bold">{note.likes || 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReact(note.id, "hugs")}
                      className="flex items-center gap-1 bg-white/40 hover:bg-white/70 border border-black/5 px-2 py-1 rounded-xl transition cursor-pointer active:scale-95"
                    >
                      <span>🫂</span>
                      <span className="font-bold">{note.hugs || 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReact(note.id, "supports")}
                      className="flex items-center gap-1 bg-white/40 hover:bg-white/70 border border-black/5 px-2 py-1 rounded-xl transition cursor-pointer active:scale-95"
                    >
                      <span>🤝</span>
                      <span className="font-bold">{note.supports || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
