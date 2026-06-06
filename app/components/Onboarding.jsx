"use client";

import { useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { EXAMS } from "./tracker-data";
import { saveUserProfile, saveExamDate } from "../lib/storage";

export default function Onboarding({ onComplete }) {
  const [name, setName] = useState("");
  const [exam, setExam] = useState("JEE");
  const [examDate, setExamDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveUserProfile(name.trim(), exam);
    if (examDate) {
      saveExamDate(examDate);
    }
    onComplete(name.trim(), exam, examDate);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/60 bg-white/90">
        <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-teal-500/10 blur-xl"></div>

        <div className="text-center mb-8 relative">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 flex items-center justify-center shadow-inner mb-4 animate-float text-3xl">
            🌱
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome to MindSpace
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
            Your mindful companion through board exams and competitive entrance
            seasons.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="onboarding-name"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
            >
              What should we call you?
            </label>
            <input
              id="onboarding-name"
              type="text"
              required
              placeholder="Your name or nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-all text-slate-800"
            />
          </div>

          <div>
            <label
              htmlFor="onboarding-exam"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
            >
              Preparing For
            </label>
            <select
              id="onboarding-exam"
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-all text-slate-800"
            >
              {EXAMS.map((ex) => (
                <option key={ex} value={ex}>
                  {ex} {ex === "Board Exams" ? "📝" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="onboarding-date"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
            >
              Target Exam Date{" "}
              <span className="text-slate-300 font-normal">(Optional)</span>
            </label>
            <input
              id="onboarding-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-all text-slate-800"
            />
            <p
              className="text-[11px] text-slate-400 mt-1.5 leading-normal"
              id="onboarding-date-help"
            >
              Used to calculate a gentle countdown and pace your mindful rest
              breaks.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3.5 mt-2 text-sm tracking-wide"
          >
            Begin Journey →
          </Button>
        </form>
      </Card>
    </div>
  );
}
