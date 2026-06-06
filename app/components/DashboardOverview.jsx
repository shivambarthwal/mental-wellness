"use client";

import { useState, useEffect } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { AFFIRMATIONS } from "./tracker-data";
import { getTasks, saveTasks, getExamDate } from "../lib/storage";

export default function DashboardOverview({ name, exam, streak, moodAvg, checkinCount, setTab }) {
  const [greeting, setGreeting] = useState("Hello");
  const [subGreeting, setSubGreeting] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskLoad, setNewTaskLoad] = useState("Medium");
  const [daysLeft, setDaysLeft] = useState(null);

  // Load tasks and calculate countdown
  useEffect(() => {
    setTasks(getTasks());
    
    // Greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
      setSubGreeting("Start today with a clear mind and gentle steps.");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
      setSubGreeting("Remember, taking mindful breaks makes you study smarter.");
    } else if (hour < 21) {
      setGreeting("Good Evening");
      setSubGreeting("Time to unwind, reflect, and celebrate your efforts today.");
    } else {
      setGreeting("Good Night");
      setSubGreeting("Let go of today's study load. Sleep is your superpower.");
    }

    // Countdown
    const examDateStr = getExamDate();
    if (examDateStr) {
      const target = new Date(examDateStr);
      target.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays);
    }
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      load: newTaskLoad, // Low, Medium, High
      completed: false,
    };

    const updated = [...tasks, newTask];
    setTasks(updated);
    saveTasks(updated);
    setNewTaskText("");
  };

  const handleToggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    saveTasks(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const todayAffirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Calculate high stress task count
  const highStressCount = safeTasks.filter(t => !t.completed && t.load === "High").length;
  const completedCount = safeTasks.filter(t => t.completed).length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-950 p-8 text-white border border-indigo-950 shadow-xl glow-indigo">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-medium text-indigo-200 uppercase tracking-widest mb-3">
              ✨ Welcome Back
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {greeting}, {name}
            </h1>
            <p className="text-indigo-200/70 text-sm mt-2 max-w-md font-medium">
              {subGreeting}
            </p>
          </div>

          {/* Countdown Display */}
          {daysLeft !== null && (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm self-start md:self-auto min-w-[200px]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div>
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Exam Countdown</p>
                <h3 className="text-lg font-bold mt-1 text-white">
                  {daysLeft > 0 ? (
                    <span>{daysLeft} days left <span className="text-xs text-indigo-300 font-normal">for {exam}</span></span>
                  ) : daysLeft === 0 ? (
                    <span>Today is {exam} Day! 🎯</span>
                  ) : (
                    <span>Result Season 🎓</span>
                  )}
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4 hover:scale-[1.02] border-slate-100/80 bg-white/80" hover>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl shadow-inner">
            🔥
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Check-in Streak</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">{streak} Days</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 hover:scale-[1.02] border-slate-100/80 bg-white/80" hover>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl shadow-inner">
            🧠
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Weekly Mood</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">{moodAvg ? `${moodAvg} / 5` : "No logs"}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 hover:scale-[1.02] border-slate-100/80 bg-white/80" hover>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center text-xl shadow-inner">
            ✅
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Study Task Ratio</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {safeTasks.length > 0 ? `${completedCount} of ${safeTasks.length}` : "0 Tasks"}
            </h3>
          </div>
        </Card>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        
        {/* Study Planner / Tasks */}
        <Card className="bg-white border-slate-100/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Mindful Study Planner</h2>
              <p className="text-xs text-slate-400 mt-1">Manage study targets with cognitive stress loads</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full font-bold">
              Productive
            </span>
          </div>

            {safeTasks.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <span className="font-bold">MindSpace Advisor:</span>{" "}
                  {highStressCount > 0 ? (
                    <span>You have {highStressCount} High-Stress study task(s) active. We recommend a 5-minute <button type="button" onClick={() => setTab("wellness")} className="underline font-bold hover:text-amber-950 cursor-pointer">4-7-8 breathing session</button> after each to prevent cognitive fatigue.</span>
                  ) : safeTasks.filter(t => !t.completed).length > 0 ? (
                    <span>Nice steady tasks today. Take a quick stretching break every 45 minutes to keep blood circulating!</span>
                  ) : (
                    <span>All planned tasks done! Use the remaining time for a calm grounding exercise or self-reflection in the Journal tab.</span>
                  )}
                </div>
              </div>
            )}

          {/* Form */}
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="What are we studying next?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-700 transition"
            />
            <div className="flex gap-2">
              <select
                value={newTaskLoad}
                onChange={(e) => setNewTaskLoad(e.target.value)}
                className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low Stress</option>
                <option value="Medium">Med Stress</option>
                <option value="High">High Stress</option>
              </select>
              <Button type="submit" variant="primary" className="py-3 px-5 text-xs">
                Add
              </Button>
            </div>
          </form>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {safeTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No tasks set for today. Plan your revision items mindfully.
              </div>
            ) : (
              safeTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 border rounded-2xl transition-all ${
                    task.completed 
                      ? "border-slate-100 bg-slate-50/50 opacity-60" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className={`text-sm text-slate-700 ${task.completed ? "line-through text-slate-400" : ""}`}>
                      {task.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      task.load === "High" 
                        ? "bg-rose-50 text-rose-600" 
                        : task.load === "Medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-teal-50 text-teal-600"
                    }`}>
                      {task.load} Load
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-slate-500 transition cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Pane: Affirmation & Daily Advice */}
        <div className="space-y-6">
          {/* Affirmation Card */}
          <Card className="relative overflow-hidden bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200/50 p-6 text-slate-800">
            <div className="absolute top-2 right-2 text-3xl opacity-20">✨</div>
            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">Daily Affirmation</h3>
            <p className="font-serif italic text-base leading-relaxed text-slate-850">
              "{todayAffirmation}"
            </p>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="bg-white border-slate-100/80">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Mindful Check-ins</h3>
            <p className="text-xs text-slate-400 mb-4">
              Stress level rising? Spend a quick minute on checks and logs.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setTab("checkin")} variant="ghost" className="w-full text-xs font-semibold py-3 justify-between">
                <span>Check in your mood</span>
                <span>➜</span>
              </Button>
              <Button onClick={() => setTab("wellness")} variant="secondary" className="w-full text-xs font-semibold py-3 justify-between">
                <span>Try 4-7-8 Breathing Guide</span>
                <span>🌿 ➜</span>
              </Button>
              <Button onClick={() => setTab("focus")} variant="ghost" className="w-full text-xs font-semibold py-3 justify-between">
                <span>Study in Focus Room</span>
                <span>⏱️ ➜</span>
              </Button>
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
