export const MOODS = [
  { emoji: "😊", label: "Good", score: 5, color: "#7a9e7e" },
  { emoji: "🙂", label: "Okay", score: 4, color: "#9db87a" },
  { emoji: "😐", label: "Meh", score: 3, color: "#d4b03e" },
  { emoji: "😔", label: "Low", score: 2, color: "#d4843e" },
  { emoji: "😰", label: "Stressed", score: 1, color: "#c4614a" },
];

export const TRIGGERS = [
  "Syllabus overload",
  "Mock test results",
  "Peer pressure",
  "Sleep issues",
  "Family expectations",
  "Time pressure",
  "Self-doubt",
  "Revision backlog",
  "Social media",
  "Health issues",
  "Fear of failure",
  "Comparison",
];

export const EXAMS = [
  "JEE",
  "NEET",
  "CUET",
  "CAT",
  "UPSC",
  "Board Exams",
  "GATE",
  "Other",
];

export const AFFIRMATIONS = [
  "You are more than your score. Keep going. 🌱",
  "Every expert was once a beginner. Trust the process.",
  "Rest is not giving up — it's fueling your comeback.",
  "One day at a time. One chapter at a time.",
  "Your effort today is your result tomorrow.",
  "It's okay to not be okay. Reach out, breathe, reset.",
  "Comparison is the thief of joy. Run your own race.",
  "Hard days build the character that easy days never could.",
];

export const TABS = [
  { id: "checkin", label: "Check-in", icon: "✦" },
  { id: "journal", label: "Reflect", icon: "◎" },
  { id: "history", label: "History", icon: "⊹" },
  { id: "insights", label: "Insights", icon: "◈" },
  { id: "wellness", label: "Wellness", icon: "❋" },
];

export const today = () => new Date().toISOString().split("T")[0];

export const fmtDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

export const getStreak = (entries) => {
  if (!entries.length) return 0;
  let streak = 0;
  const todayDate = new Date();
  for (let i = 0; i < 60; i += 1) {
    const key = todayDate.toISOString().split("T")[0];
    if (entries.find((entry) => entry.date === key)) {
      streak += 1;
      todayDate.setDate(todayDate.getDate() - 1);
    } else if (i > 0) {
      break;
    } else {
      break;
    }
  }
  return streak;
};

export const avgMood = (entries) => {
  if (!entries.length) return null;
  return (
    entries.reduce((sum, entry) => sum + entry.moodScore, 0) / entries.length
  ).toFixed(1);
};
