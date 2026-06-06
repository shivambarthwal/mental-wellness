"use client";

import { useState, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Progress from "./ui/Progress";
import { saveBurnoutScore, getBurnoutHistory } from "../lib/storage";

const QUESTIONS = [
  "I feel emotionally drained or exhausted by my study schedule.",
  "I find it difficult to concentrate on my books or mock tests.",
  "I worry constantly about failing my upcoming exam.",
  "I have trouble falling asleep or staying asleep due to exam stress.",
  "I feel irritated or lose my temper easily over study setbacks.",
  "I feel disconnected from friends and family because of my studies.",
  "I doubt my ability to clear this exam and succeed.",
  "I experience physical symptoms like headaches, tension, or stomach issues.",
  "I feel that no matter how much I study, it's never enough.",
  "I feel overwhelmed by family or peer expectations."
];

const OPTIONS = [
  { label: "Never", score: 0 },
  { label: "Sometimes", score: 1 },
  { label: "Often", score: 2 },
  { label: "Almost Always", score: 3 },
];

export default function BurnoutQuiz() {
  const [quizState, setQuizState] = useState("intro"); // intro, questions, results
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getBurnoutHistory());
  }, []);

  const handleStart = () => {
    setAnswers({});
    setCurrentIdx(0);
    setQuizState("questions");
  };

  const handleSelectOption = (score) => {
    const nextAnswers = { ...answers, [currentIdx]: score };
    setAnswers(nextAnswers);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate Results
      const totalScore = Object.values(nextAnswers).reduce((sum, val) => sum + val, 0);
      
      let category = "Healthy";
      
      if (totalScore <= 7) {
        category = "Healthy / Low Stress";
      } else if (totalScore <= 15) {
        category = "Mild Stress";
      } else if (totalScore <= 22) {
        category = "Moderate Burnout";
      } else {
        category = "Severe Burnout";
      }

      const scoreData = {
        score: totalScore,
        category,
        anxiety: Math.round(((nextAnswers[2] || 0) + (nextAnswers[3] || 0) + (nextAnswers[7] || 0)) * 11.1), 
        stress: Math.round(((nextAnswers[0] || 0) + (nextAnswers[4] || 0) + (nextAnswers[9] || 0)) * 11.1),
        exhaustion: Math.round(((nextAnswers[1] || 0) + (nextAnswers[5] || 0) + (nextAnswers[6] || 0) + (nextAnswers[8] || 0)) * 8.3),
      };

      const updatedHistory = saveBurnoutScore(scoreData);
      if (updatedHistory) {
        setHistory(updatedHistory);
      }
      
      setResult(scoreData);
      setQuizState("results");
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {quizState === "intro" && (
        <Card className="bg-white border-slate-100/80 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mb-4 animate-float">
            🔬
          </div>
          <h2 className="text-xl font-bold text-slate-800">Academic Burnout & Stress Quiz</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Self-Assessment Tool</p>
          
          <p className="text-sm text-slate-500 mt-6 leading-relaxed max-w-md mx-auto">
            Preparing for competitive exams builds intense mental pressure. This simple 10-question test measures your emotional load and helps identify early signs of chronic burnout.
          </p>

          <div className="my-8 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-left text-xs text-indigo-900 leading-normal">
            <span className="font-bold">⚠️ Note:</span> This is a self-care assessment tool designed to help you monitor your stress levels. It is not a clinical diagnostic instrument.
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleStart} variant="primary" className="py-3 px-8 text-sm">
              Take Assessment
            </Button>
          </div>

          {/* Past history */}
          {history.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6 text-left">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Past Assessment Scores</h4>
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {history.map((h) => (
                  <div key={h.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-700">{h.category}</span>
                      <span className="text-slate-400 block mt-0.5">{new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <span className="font-extrabold text-slate-850 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                      {h.score} / 30
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {quizState === "questions" && (
        <Card className="bg-white border-slate-100/80 p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question {currentIdx + 1} of {QUESTIONS.length}
            </span>
            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-bold">
              {Math.round(((currentIdx) / QUESTIONS.length) * 100)}% Complete
            </span>
          </div>

          <Progress value={currentIdx} max={QUESTIONS.length} className="mb-8" />

          <div className="min-h-[90px] mb-8">
            <h3 className="text-lg font-bold text-slate-800 leading-snug">
              {QUESTIONS[currentIdx]}
            </h3>
          </div>

          <div className="space-y-3">
            {OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleSelectOption(opt.score)}
                className="w-full text-left p-4 rounded-2xl border border-slate-250 hover:border-indigo-400 hover:bg-slate-50/50 transition duration-150 font-medium text-sm text-slate-700 active:scale-[0.99] cursor-pointer"
              >
                {opt.label}
              </button>
            ))}
          </div>

          {currentIdx > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-6 text-xs text-slate-400 font-bold hover:text-slate-600 transition flex items-center gap-1 cursor-pointer"
            >
              <span>←</span> Back to previous question
            </button>
          )}
        </Card>
      )}

      {quizState === "results" && result && (
        <Card className="bg-white border-slate-100/80 p-8">
          <div className="text-center mb-6">
            <span className="text-[40px] block mb-2">📊</span>
            <h2 className="text-xl font-bold text-slate-800">Your Stress Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider font-bold">Assessment Complete</p>
          </div>

          {/* Large Score Indicator */}
          <div className="my-6 p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-4xl font-extrabold text-slate-800">
              {result.score} <span className="text-lg font-normal text-slate-400">/ 30</span>
            </div>
            <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-brand-rose/10 text-brand-rose font-bold text-xs uppercase tracking-wider">
              {result.category}
            </div>
            <p className="text-xs text-slate-600 mt-4 leading-relaxed max-w-md mx-auto">
              {result.score <= 7 
                ? "Excellent! You are coping remarkably well with exam schedules. Continue maintaining healthy limits." 
                : result.score <= 15 
                  ? "Mild academic fatigue is present. Ensure you are allocating 1-2 hours of physical rest, hobby, or mindfulness daily."
                  : result.score <= 22 
                    ? "Burnout levels are moderately high. Consider scaling down daily revision loads by 15%, sleeping at least 7 hours, and checking in with a close friend."
                    : "High burnout hazard detected. Focus on resting immediately. Talk openly to parents or a tutor, and step back from high study stress for 24-48 hours."
              }
            </p>
          </div>

          {/* Breakdowns */}
          <div className="space-y-4 my-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stress Breakdown</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 font-medium mb-1.5">
                  <span>Exhaustion & Fatigue</span>
                  <span>{result.exhaustion}%</span>
                </div>
                <Progress value={result.exhaustion} max={100} color="bg-rose-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 font-medium mb-1.5">
                  <span>Anxiety & Concern</span>
                  <span>{result.anxiety}%</span>
                </div>
                <Progress value={result.anxiety} max={100} color="bg-amber-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 font-medium mb-1.5">
                  <span>Stress & Expectations</span>
                  <span>{result.stress}%</span>
                </div>
                <Progress value={result.stress} max={100} color="bg-indigo-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 border-t border-slate-100 pt-6 mt-6">
            <Button onClick={() => setQuizState("intro")} variant="ghost" className="text-xs py-3 px-6">
              View History
            </Button>
            <Button onClick={handleStart} variant="primary" className="text-xs py-3 px-6">
              Retake Test
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
