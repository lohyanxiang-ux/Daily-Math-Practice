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
 * Returns yesterday's date string in local YYYY-MM-DD format
 */
export function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns active streak count, resetting to 0 if 1+ days were missed
 */
export function getActiveStreakCount() {
  if (!state.profile) return 0;
  const lastDate = state.profile.lastDailyQuestDate;
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  if (lastDate === todayStr || lastDate === yesterdayStr) {
    return state.profile.streakCount || 0;
  }
  
  return 0;
}

/**
 * Checks if the student completed today's Daily Quest (Cross-device capable)
 */
export function isDailyQuestCompletedToday() {
  const todayStr = getTodayDateString();
  const userKey = state.profile?.email || state.profile?.studentEmail || state.profile?.displayName || "guest";

  // 1. Google Sheets Profile Backend Check
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
 * Marks today's Daily Quest as completed, calculates streak progression, and syncs to backend
 */
export function markDailyQuestCompletedToday() {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();
  const userKey = state.profile?.email || state.profile?.studentEmail || state.profile?.displayName || "guest";

  if (!state.profile) state.profile = {};

  const lastDate = state.profile.lastDailyQuestDate;

  // ACCURATE STREAK CALCULATION LOGIC
  if (lastDate === todayStr) {
    // Already completed today — retain active streak
  } else if (lastDate === yesterdayStr) {
    // Consecutive daily completion — increment streak count
    state.profile.streakCount = (state.profile.streakCount || 0) + 1;
  } else {
    // Missed 1+ days or first quest — reset streak to 1
    state.profile.streakCount = 1;
  }

  // Update last completion date in state
  state.profile.lastDailyQuestDate = todayStr;

  // Local storage backup
  localStorage.setItem(`daily_quest_date_${userKey}`, todayStr);

  // In-memory session state update
  if (!state.dailySession) state.dailySession = {};
  state.dailySession.lastCompletedDate = todayStr;
  state.dailySession.completedToday = true;

  // Sync updated XP, StreakCount, and lastDailyQuestDate to Google Sheets
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
 * Builds a 5-question Bento Box queue for Daily Quest habit building
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

  for (const item of shuffle([...highScorePool])) {
    if (selectedQueue.length < 2 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  for (const item of shuffle([...currentRecentPool])) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  for (const item of shuffle([...fallbackPool])) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  return selectedQueue;
}
