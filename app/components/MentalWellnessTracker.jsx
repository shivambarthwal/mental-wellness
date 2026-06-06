"use client";

import { useState, useEffect } from "react";
import {
  getEntries,
  saveEntry,
  deleteEntry,
  getUserProfile,
  getStorageStats,
} from "@/app/lib/storage";
import { getStreak, avgMood } from "./tracker-data";

// Import Modular Components
import Onboarding from "./Onboarding";
import DashboardOverview from "./DashboardOverview";
import CheckIn from "./CheckIn";
import Reflect from "./Reflect";
import FocusRoom from "./FocusRoom";
import BurnoutQuiz from "./BurnoutQuiz";
import CommunityWall from "./CommunityWall";
import Analytics from "./Analytics";
import Wellness from "./Wellness";
import History from "./History";
import Settings from "./Settings";

const NAV_ITEMS = [
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "checkin", label: "Check-in", icon: "✦" },
  { id: "journal", label: "Reflect", icon: "◎" },
  { id: "focus", label: "Focus Room", icon: "⏱️" },
  { id: "burnout", label: "Burnout Quiz", icon: "🔬" },
  { id: "community", label: "Hope Board", icon: "🤝" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "wellness", label: "Wellness", icon: "🌿" },
  { id: "history", label: "History Log", icon: "⊹" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function MentalWellnessTracker() {
  const [tab, setTab] = useState("dashboard");
  const [entries, setEntries] = useState([]);
  const [exam, setExam] = useState("");
  const [name, setName] = useState("");
  const [onboarded, setOnboarded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageStats, setStorageStats] = useState({
    totalEntries: 0,
    checkIns: 0,
    journalEntries: 0,
    oldestEntry: null,
    newestEntry: null,
  });

  // Load storage states after SSR hydration
  useEffect(() => {
    try {
      const profile = getUserProfile();
      setName(profile.name);
      setExam(profile.exam);
      setOnboarded(profile.onboarded);

      const loadedEntries = getEntries();
      setEntries(loadedEntries);
      setStorageStats(getStorageStats());
      setIsHydrated(true);
    } catch (error) {
      console.error("Hydration storage load error:", error);
      setIsHydrated(true);
    }
  }, []);

  const handleUpdateStorage = () => {
    setEntries(getEntries());
    setStorageStats(getStorageStats());
  };

  const handleSaveEntry = (newEntry) => {
    const updated = saveEntry(newEntry);
    if (updated) {
      setEntries(updated);
      setStorageStats(getStorageStats());
    }
  };

  const handleDeleteEntry = (entryId) => {
    const updated = deleteEntry(entryId);
    if (updated) {
      setEntries(updated);
      setStorageStats(getStorageStats());
    }
  };

  const handleResetProfile = () => {
    setOnboarded(false);
    setName("");
    setExam("");
  };

  const handleOnboardingComplete = (newName, newExam) => {
    setName(newName);
    setExam(newExam);
    setOnboarded(true);
    setTab("dashboard");
    handleUpdateStorage();
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
        <span className="animate-pulse">Loading MindSpace...</span>
      </div>
    );
  }

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const streak = getStreak(entries);
  const moodAvg = avgMood(entries.filter((e) => !e.isJournal).slice(0, 7));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50/50">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 p-6 space-y-8 fixed h-full">
        {/* Branding header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-xl shadow-md shadow-indigo-500/10">
            🌿
          </div>
          <div>
            <h2 className="font-black text-slate-800 tracking-tight text-base">MindSpace</h2>
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{exam} Warrior</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 shadow-inner"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile capsule footer */}
        <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
            {name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">{name}</p>
            <p className="text-[10px] text-slate-400 truncate">Streak: {streak} days</p>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col pb-24 md:pb-8">
        
        {/* Mobile top bar header */}
        <header className="flex md:hidden items-center justify-between bg-white border-b border-slate-200/80 p-4 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <h1 className="font-extrabold text-slate-800 text-sm tracking-tight">MindSpace</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
            🔥 {streak}
          </div>
        </header>

        {/* Tab content area */}
        <main className="p-4 md:p-8 max-w-5xl w-full mx-auto flex-1">
          {tab === "dashboard" && (
            <DashboardOverview
              name={name}
              exam={exam}
              streak={streak}
              moodAvg={moodAvg}
              checkinCount={entries.length}
              setTab={setTab}
            />
          )}
          {tab === "checkin" && (
            <CheckIn name={name} onSave={handleSaveEntry} />
          )}
          {tab === "journal" && (
            <Reflect exam={exam} entries={entries} onSave={handleSaveEntry} />
          )}
          {tab === "focus" && <FocusRoom />}
          {tab === "burnout" && <BurnoutQuiz />}
          {tab === "community" && <CommunityWall />}
          {tab === "analytics" && (
            <Analytics
              entries={entries}
              storageStats={storageStats}
              setTab={setTab}
            />
          )}
          {tab === "wellness" && <Wellness entries={entries} exam={exam} />}
          {tab === "history" && (
            <History entries={entries} onDelete={handleDeleteEntry} />
          )}
          {tab === "settings" && (
            <Settings
              name={name}
              exam={exam}
              storageStats={storageStats}
              onResetProfile={handleResetProfile}
              onUpdateStorage={handleUpdateStorage}
            />
          )}
        </main>
      </div>

      {/* Mobile bottom bar navigator */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 z-50 overflow-x-auto px-2 py-1 justify-between shadow-lg">
        {NAV_ITEMS.map((item) => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex-1 min-w-[64px] flex flex-col items-center justify-center py-2.5 rounded-xl cursor-pointer ${
                isActive ? "text-indigo-600 font-black" : "text-slate-400"
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-[9px] truncate tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
    </div>
  );
}
