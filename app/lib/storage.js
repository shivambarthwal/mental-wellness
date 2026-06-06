/**
 * Centralized storage management for Mental Wellness Tracker
 * Handles all localStorage operations with validation, backup, and recovery
 */

const STORAGE_KEYS = {
  ENTRIES: "mw_entries",
  USER_NAME: "mw_name",
  EXAM: "mw_exam",
  BACKUP: "mw_backup",
  LAST_BACKUP: "mw_last_backup",
  TASKS: "mw_tasks",
  BURNOUT: "mw_burnout",
  EXAM_DATE: "mw_exam_date",
  COMMUNITY: "mw_community",
};

const MAX_ENTRIES = 500;
const BACKUP_INTERVAL_MS = 86400000; // 24 hours

/**
 * Safe JSON parse with fallback
 */
function safeParse(json, fallback = null) {
  try {
    const parsed = JSON.parse(json);
    // JSON.parse(null) returns null — treat as missing data and use fallback
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    console.error("Storage parse error:", json);
    return fallback;
  }
}

/**
 * Get all entries with validation
 */
export function getEntries() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    const entries = safeParse(raw, []);
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

/**
 * Add or update an entry
 */
export function saveEntry(entry) {
  if (typeof window === "undefined") return null;
  try {
    const entries = getEntries();
    const updated = [
      {
        ...entry,
        id: entry.id || Date.now(),
        createdAt: entry.createdAt || new Date().toISOString(),
      },
      ...entries,
    ].slice(0, MAX_ENTRIES);

    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(updated));
    autoBackup();
    return updated;
  } catch (error) {
    console.error("Failed to save entry:", error);
    return null;
  }
}

/**
 * Delete an entry by ID
 */
export function deleteEntry(entryId) {
  if (typeof window === "undefined") return null;
  try {
    const entries = getEntries().filter((e) => e.id !== entryId);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    return entries;
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return null;
  }
}

/**
 * Get user profile
 */
export function getUserProfile() {
  if (typeof window === "undefined")
    return { name: "", exam: "", onboarded: false };
  try {
    const name = localStorage.getItem(STORAGE_KEYS.USER_NAME) || "";
    const exam = localStorage.getItem(STORAGE_KEYS.EXAM) || "";
    return {
      name,
      exam,
      onboarded: !!name,
    };
  } catch {
    return { name: "", exam: "", onboarded: false };
  }
}

/**
 * Save user profile
 */
export function saveUserProfile(name, exam) {
  if (typeof window === "undefined") return false;
  try {
    if (name) localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
    if (exam) localStorage.setItem(STORAGE_KEYS.EXAM, exam);
    return true;
  } catch (error) {
    console.error("Failed to save user profile:", error);
    return false;
  }
}

/**
 * Auto backup entries every 24 hours
 */
function autoBackup() {
  if (typeof window === "undefined") return;
  try {
    const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
    const now = Date.now();

    if (!lastBackup || now - parseInt(lastBackup) > BACKUP_INTERVAL_MS) {
      const entries = getEntries();
      const backup = {
        timestamp: new Date().toISOString(),
        count: entries.length,
        data: entries,
      };
      localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backup));
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, now.toString());
    }
  } catch (error) {
    console.error("Backup failed:", error);
  }
}

/**
 * Export data as JSON file for download
 */
export function exportData() {
  if (typeof window === "undefined") return;
  try {
    const entries = getEntries();
    const profile = getUserProfile();
    const data = {
      exportedAt: new Date().toISOString(),
      profile,
      entries,
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mental-wellness-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
  }
}

/**
 * Import data from JSON file
 */
export function importData(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        if (data.entries && Array.isArray(data.entries)) {
          localStorage.setItem(
            STORAGE_KEYS.ENTRIES,
            JSON.stringify(data.entries),
          );
          if (data.profile) {
            saveUserProfile(data.profile.name, data.profile.exam);
          }
          resolve(true);
        } else {
          reject(new Error("Invalid backup file format"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Clear all data
 */
export function clearAllData() {
  if (typeof window === "undefined") return false;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error("Clear failed:", error);
    return false;
  }
}

/**
 * Get storage stats
 */
export function getStorageStats() {
  const entries = getEntries();
  return {
    totalEntries: entries.length,
    checkIns: entries.filter((e) => !e.isJournal).length,
    journalEntries: entries.filter((e) => e.isJournal).length,
    oldestEntry: entries.length > 0 ? entries[entries.length - 1].date : null,
    newestEntry: entries.length > 0 ? entries[0].date : null,
  };
}

/**
 * Get tasks
 */
export function getTasks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    const parsed = safeParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save tasks
 */
export function saveTasks(tasks) {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("Failed to save tasks:", error);
    return false;
  }
}

/**
 * Get burnout history
 */
export function getBurnoutHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BURNOUT);
    return safeParse(raw, []);
  } catch {
    return [];
  }
}

/**
 * Save burnout score
 */
export function saveBurnoutScore(score) {
  if (typeof window === "undefined") return null;
  try {
    const history = getBurnoutHistory();
    const updated = [
      {
        id: Date.now(),
        date: new Date().toISOString(),
        score: score.score,
        category: score.category,
        anxiety: score.anxiety,
        stress: score.stress,
        exhaustion: score.exhaustion,
      },
      ...history,
    ].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.BURNOUT, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to save burnout score:", error);
    return null;
  }
}

/**
 * Get exam countdown date
 */
export function getExamDate() {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEYS.EXAM_DATE) || "";
  } catch {
    return "";
  }
}

/**
 * Save exam countdown date
 */
export function saveExamDate(dateStr) {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEYS.EXAM_DATE, dateStr);
    return true;
  } catch (error) {
    console.error("Failed to save exam date:", error);
    return false;
  }
}

/**
 * Initial community notes for seeding
 */
const DEFAULT_COMMUNITY_NOTES = [
  {
    id: 1,
    author: "FutureMD 🩺",
    exam: "NEET",
    text: "NEET prep is a marathon, not a sprint. Take care of your sleep! Your brain needs rest to recall biology facts. You are doing amazing! 🌸",
    date: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    likes: 12,
    hugs: 8,
    supports: 15,
  },
  {
    id: 2,
    author: "IITianInSpirit 🚀",
    exam: "JEE",
    text: "Just bombed a math mock test, but a mock test score does not define my intelligence. It only shows what to revise. We got this! 💪",
    date: new Date(Date.now() - 12 * 3600000).toISOString(),
    likes: 24,
    hugs: 14,
    supports: 19,
  },
  {
    id: 3,
    author: "UPSC_Warrior 🎯",
    exam: "UPSC",
    text: "Mains prep can feel so isolating. Seeing everyone here sharing their feelings makes me feel less alone. Let's keep pushing, one day at a time. 📚",
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
    likes: 18,
    hugs: 9,
    supports: 22,
  },
  {
    id: 4,
    author: "CatAspirant 📊",
    exam: "CAT",
    text: "Venting helps! Don't let peer pressure dictate your pace. Compare yourself to who you were yesterday, not to others today. 📈",
    date: new Date(Date.now() - 36 * 3600000).toISOString(),
    likes: 9,
    hugs: 4,
    supports: 11,
  }
];

/**
 * Get community sticky notes
 */
export function getCommunityNotes() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(DEFAULT_COMMUNITY_NOTES));
      return DEFAULT_COMMUNITY_NOTES;
    }
    return safeParse(raw, DEFAULT_COMMUNITY_NOTES);
  } catch {
    return DEFAULT_COMMUNITY_NOTES;
  }
}

/**
 * Save community sticky note
 */
export function saveCommunityNote(note) {
  if (typeof window === "undefined") return null;
  try {
    const notes = getCommunityNotes();
    const updated = [
      {
        id: Date.now(),
        author: note.author || "Anonymous Warrior",
        exam: note.exam || "General",
        text: note.text,
        date: new Date().toISOString(),
        likes: 0,
        hugs: 0,
        supports: 0,
      },
      ...notes,
    ];
    localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to save community note:", error);
    return null;
  }
}

/**
 * Like/React to a community note
 */
export function reactToCommunityNote(noteId, type) {
  if (typeof window === "undefined") return null;
  try {
    const notes = getCommunityNotes();
    const updated = notes.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          [type]: (note[type] || 0) + 1,
        };
      }
      return note;
    });
    localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to react to community note:", error);
    return null;
  }
}

