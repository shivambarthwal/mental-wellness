"use client";

import { useMemo } from "react";
import Card from "./ui/Card";
import {
  MoodTrendChart,
  TriggerFrequencyChart,
  MoodDistributionChart,
  EntryVolumeChart,
} from "./AnalyticsCharts";

export default function Analytics({ entries, storageStats, setTab }) {
  // Generate insights based on logs
  const insights = useMemo(() => {
    const checkins = entries.filter((e) => !e.isJournal);
    if (checkins.length < 2) return null;

    const stressTriggers = {};
    let lowMoodTriggers = {};

    checkins.forEach((entry) => {
      const isLowMood = entry.moodScore <= 2; // Stressed or Low
      entry.triggers?.forEach((t) => {
        stressTriggers[t] = (stressTriggers[t] || 0) + 1;
        if (isLowMood) {
          lowMoodTriggers[t] = (lowMoodTriggers[t] || 0) + 1;
        }
      });
    });

    const topTrigger = Object.entries(stressTriggers).sort((a, b) => b[1] - a[1])[0];
    const topLowTrigger = Object.entries(lowMoodTriggers).sort((a, b) => b[1] - a[1])[0];

    return {
      topTrigger: topTrigger ? topTrigger[0] : null,
      topLowTrigger: topLowTrigger ? topLowTrigger[0] : null,
    };
  }, [entries]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800">Your Wellness Analytics</h2>
        <p className="text-xs text-slate-400 mt-1">Visualize emotional trends and pinpoint primary study triggers</p>
      </div>

      {entries.length === 0 ? (
        <Card className="text-center py-16 bg-white border-slate-100/80">
          <span className="text-4xl block mb-4">📊</span>
          <p className="text-sm text-slate-500">
            Analytics dashboards compile after logging your initial mood entries.
          </p>
        </Card>
      ) : (
        <>
          {/* Smart Advisor Insight card */}
          {insights && (insights.topTrigger || insights.topLowTrigger) && (
            <Card className="bg-gradient-to-tr from-indigo-50 to-teal-50 border border-indigo-100 p-6">
              <div className="flex gap-4">
                <span className="text-2xl">💡</span>
                <div className="space-y-1 text-slate-800">
                  <h4 className="text-sm font-bold text-slate-800">MindSpace Smart Advisor</h4>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {insights.topLowTrigger ? (
                      <span>We notice that <span className="font-bold text-brand-indigo">"{insights.topLowTrigger}"</span> correlates heavily with your lowest mood days. Try opening the <button type="button" onClick={() => setTab("wellness")} className="underline font-bold text-indigo-700 hover:text-indigo-950 cursor-pointer">Wellness tab</button> and doing the grounding or reframe activities during these triggers.</span>
                    ) : (
                      <span>Your most frequent study stressor is <span className="font-bold text-brand-indigo">"{insights.topTrigger}"</span>. Scheduling a 25-minute Pomodoro study block in the <button type="button" onClick={() => setTab("focus")} className="underline font-bold text-indigo-700 hover:text-indigo-950 cursor-pointer">Focus Room</button> can help you digest study overload systematically.</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border-slate-100/80 p-5 text-center">
              <span className="text-2xl font-black text-brand-indigo">{storageStats.totalEntries}</span>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Total Logs</p>
            </Card>
            <Card className="bg-white border-slate-100/80 p-5 text-center">
              <span className="text-2xl font-black text-brand-secondary">{storageStats.checkIns}</span>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Check-ins</p>
            </Card>
          </div>

          {/* Mood Trend */}
          <Card className="bg-white border-slate-100/80">
            <h3 className="text-sm font-bold text-slate-800 mb-6">30-Day Mood Trend</h3>
            <MoodTrendChart entries={entries} />
          </Card>

          {/* Grid layout for distributions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-100/80">
              <h3 className="text-sm font-bold text-slate-800 mb-6">Top Stress Triggers</h3>
              <TriggerFrequencyChart entries={entries} />
            </Card>
            <Card className="bg-white border-slate-100/80">
              <h3 className="text-sm font-bold text-slate-800 mb-6">Mood Distribution</h3>
              <MoodDistributionChart entries={entries} />
            </Card>
          </div>

          {/* Entry Volume */}
          <Card className="bg-white border-slate-100/80">
            <h3 className="text-sm font-bold text-slate-800 mb-6">Daily Activity (Last 14 Days)</h3>
            <EntryVolumeChart entries={entries} />
          </Card>
        </>
      )}
    </div>
  );
}
