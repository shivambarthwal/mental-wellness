"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MOODS } from "./tracker-data";

const MOOD_COLORS = {
  Good: "#10b981",
  Okay: "#f59e0b",
  Meh: "#eab308",
  Low: "#f97316",
  Stressed: "#ef4444",
};

export function MoodTrendChart({ entries }) {
  const chartData = useMemo(() => {
    return entries
      .filter((e) => !e.isJournal)
      .slice(0, 30)
      .reverse()
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        score: entry.moodScore,
        label: entry.moodLabel,
      }));
  }, [entries]);

  if (!chartData.length)
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Need more data to show trends
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6eef8" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#64748b" }}
          stroke="#cbd5e1"
        />
        <YAxis
          domain={[0, 5]}
          tick={{ fontSize: 12, fill: "#64748b" }}
          stroke="#cbd5e1"
        />
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e6eef8",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.1)",
          }}
          labelStyle={{ color: "#0f1724" }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType="circle"
          formatter={() => "Mood Score"}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2563eb"
          strokeWidth={3}
          dot={{ fill: "#2563eb", r: 5 }}
          activeDot={{ r: 7 }}
          name="Mood Score"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TriggerFrequencyChart({ entries }) {
  const chartData = useMemo(() => {
    const triggers = {};
    entries.forEach((entry) => {
      (entry.triggers || []).forEach((trigger) => {
        triggers[trigger] = (triggers[trigger] || 0) + 1;
      });
    });

    return Object.entries(triggers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name: name.length > 15 ? name.substring(0, 12) + "..." : name,
        count,
      }));
  }, [entries]);

  if (!chartData.length)
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No stress triggers recorded yet
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6eef8" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#64748b" }}
          stroke="#cbd5e1"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} stroke="#cbd5e1" />
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e6eef8",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.1)",
          }}
          labelStyle={{ color: "#0f1724" }}
        />
        <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MoodDistributionChart({ entries }) {
  const chartData = useMemo(() => {
    const distribution = {};
    MOODS.forEach((mood) => {
      distribution[mood.label] = 0;
    });

    entries
      .filter((e) => !e.isJournal)
      .forEach((entry) => {
        if (distribution[entry.moodLabel] !== undefined) {
          distribution[entry.moodLabel] += 1;
        }
      });

    return Object.entries(distribution)
      .filter(([, count]) => count > 0)
      .map(([label, value]) => ({
        name: label,
        value,
        color: MOOD_COLORS[label] || "#94a3b8",
      }));
  }, [entries]);

  if (!chartData.length)
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No mood data available
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e6eef8",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.1)",
          }}
          labelStyle={{ color: "#0f1724" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function EntryVolumeChart({ entries }) {
  const chartData = useMemo(() => {
    const grouped = {};

    entries.forEach((entry) => {
      const date = new Date(entry.date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .reverse()
      .slice(0, 14)
      .map(([date, count]) => ({ date, entries: count }));
  }, [entries]);

  if (!chartData.length)
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No entries yet
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6eef8" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#64748b" }}
          stroke="#cbd5e1"
        />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} stroke="#cbd5e1" />
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e6eef8",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.1)",
          }}
          labelStyle={{ color: "#0f1724" }}
        />
        <Bar dataKey="entries" fill="#06b6d4" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
