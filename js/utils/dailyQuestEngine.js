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

  if (state.profile?.lastDailyQuestDate === todayStr) {
    return true;
  }

  if (state.dailySession?.lastCompletedDate === todayStr || state.dailySession?.completedToday) {
    return true;
  }

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

  if (lastDate === todayStr) {
    // Retain active streak
  } else if (lastDate === yesterdayStr) {
    state.profile.streakCount = (state.profile.streakCount || 0) + 1;
  } else {
    state.profile.streakCount = 1;
  }

  state.profile.lastDailyQuestDate = todayStr;
  localStorage.setItem(`daily_quest_date_${userKey}`, todayStr);

  if (!state.dailySession) state.dailySession = {};
  state.dailySession.lastCompletedDate = todayStr;
  state.dailySession.completedToday = true;

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
 * Builds a 5-question Bento Box queue for Daily Quest habit building.
 * Refined to filter out FUTURE skills and pick from CURRENT & PAST skills based on teacher tagging.
 */
export function buildDailyQuestQueue(userState = state) {
  const curriculum = userState.curriculum || [];
  const mastery = userState.mastery || {};
  const skillTags = userState.skillTags || {};
  
  const now = Date.now();
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

  const currentTopicPool = [];
  const pastTopicPool = [];
  const fallbackEligiblePool = [];

  curriculum.forEach((skill) => {
    const path = skill.generatorPath;
    const tag = (skillTags[path] || "Current").toUpperCase();

    // STRICTLY SKIP FUTURE SKILLS FROM DAILY QUEST
    if (tag === "FUTURE") {
      return;
    }

    const record = mastery[path];
    const score = record ? (Number(record.score) || 0) : 0;
    const lastPracticedMs = record && record.lastPracticed ? new Date(record.lastPracticed).getTime() : 0;
    const isRecentlyPracticed = (now - lastPracticedMs) <= FOURTEEN_DAYS_MS && lastPracticedMs > 0;

    const queueItem = { generatorPath: path, skill, score, primaryReason: "Daily Quest Practice" };

    if (tag === "CURRENT") {
      currentTopicPool.push({ ...queueItem, primaryReason: "🟢 Current Unit Practice" });
    } else if (tag === "PAST") {
      pastTopicPool.push({ ...queueItem, primaryReason: "🔵 Spaced Repetition (Past Unit)" });
    }

    fallbackEligiblePool.push(queueItem);
  });

  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

  const selectedQueue = [];
  const usedPaths = new Set();

  // 1. Pick up to 3 questions from CURRENT skills
  for (const item of shuffle(currentTopicPool)) {
    if (selectedQueue.length < 3 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  // 2. Pick up to 2 questions from PAST skills for spaced repetition
  for (const item of shuffle(pastTopicPool)) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  // 3. Fallback fill remaining slots from any non-Future eligible skills
  for (const item of shuffle(fallbackEligiblePool)) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  return selectedQueue;
}
