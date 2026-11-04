import { state } from "../state.js";
import { syncUserProgress } from "../services/backend.js";

/**
 * Returns today's date string in local YYYY-MM-DD format
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if the student completed today's Daily Quest (Cross-device capable)
 */
export function isDailyQuestCompletedToday() {
  const todayStr = getTodayDateString();
  const userKey = state.profile?.studentEmail || state.profile?.displayName || "guest";

  // 1. Google Sheets Profile Backend Check (Cross-Device)
  if (state.profile?.lastDailyQuestDate === todayStr) {
    return true;
  }

  // 2. Active Session Memory Check
  if (state.dailySession?.lastCompletedDate === todayStr || state.dailySession?.completedToday) {
    return true;
  }

  // 3. Local Storage Device Fallback
  const savedDate = localStorage.getItem(`daily_quest_date_${userKey}`);
  return savedDate === todayStr;
}

/**
 * Marks today's Daily Quest as completed and triggers backend sync
 */
export function markDailyQuestCompletedToday() {
  const todayStr = getTodayDateString();
  const userKey = state.profile?.studentEmail || state.profile?.displayName || "guest";

  // Local storage backup
  localStorage.setItem(`daily_quest_date_${userKey}`, todayStr);

  // In-memory state update
  if (!state.dailySession) state.dailySession = {};
  state.dailySession.lastCompletedDate = todayStr;
  state.dailySession.completedToday = true;

  if (!state.profile) state.profile = {};
  state.profile.lastDailyQuestDate = todayStr;

  // Sync to Google Sheets
  if (state.userToken) {
    syncUserProgress(
      state.userToken,
      state.profile.xp,
      state.profile.streakCount,
      todayStr
    );
  }
}

/**
 * Builds a 5-question Bento Box queue for Daily Quest habit building:
 * - 2 High-Score Confidence questions (Score >= 70)
 * - 3 Current / Recent Topic questions (Practiced < 14 days or active curriculum frontier)
 */
export function buildDailyQuestQueue(userState = state) {
  const curriculum = userState.curriculum || [];
  const mastery = userState.mastery || {};
  
  const now = Date.now();
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

  const highScorePool = [];
  const currentRecentPool = [];
  const fallbackPool = [];

  curriculum.forEach((skill, index) => {
    const path = skill.generatorPath;
    const record = mastery[path];
    const score = record ? (Number(record.score) || 0) : 0;
    
    const lastPracticedMs = record && record.lastPracticed ? new Date(record.lastPracticed).getTime() : 0;
    const isRecent = (now - lastPracticedMs) <= FOURTEEN_DAYS_MS && lastPracticedMs > 0;
    const isCurriculumFrontier = index < 3 || skill.isCurrentUnit === true;

    const queueItem = { generatorPath: path, skill, score, primaryReason: "Daily Quest Practice" };

    if (score >= 70) {
      highScorePool.push({ ...queueItem, primaryReason: "⭐ High Score Confidence" });
    }

    if (isRecent || isCurriculumFrontier) {
      currentRecentPool.push({ ...queueItem, primaryReason: "📌 Current/Recent Topic" });
    }

    fallbackPool.push(queueItem);
  });

  const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

  const selectedQueue = [];
  const usedPaths = new Set();

  // 1. Select up to 2 High-Score Questions
  const shuffledHigh = shuffle([...highScorePool]);
  for (const item of shuffledHigh) {
    if (selectedQueue.length < 2 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  // 2. Select up to 3 Current/Recent Questions
  const shuffledRecent = shuffle([...currentRecentPool]);
  for (const item of shuffledRecent) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  // 3. Fill remaining slots up to 5 questions from fallback pool
  const shuffledFallback = shuffle([...fallbackPool]);
  for (const item of shuffledFallback) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  return selectedQueue;
}
