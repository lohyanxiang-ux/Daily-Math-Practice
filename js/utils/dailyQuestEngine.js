import { state } from "../state.js";
import { syncUserProgress } from "../services/backend.js";

/**
 * Extracts numeric level from academic grade strings (e.g. "Sec 3" -> 3)
 */
function parseYearNumber(val) {
  if (typeof val === "number") return val;
  if (!val) return null;
  const str = String(val).trim();
  const secMatch = str.match(/(?:Sec|P|Grade|Year)\s*(\d+)/i);
  if (secMatch) return parseInt(secMatch[1], 10);
  const digitMatch = str.match(/\d+/);
  if (digitMatch) return parseInt(digitMatch[0], 10);
  return null;
}

/**
 * Normalizes date inputs (Date objects, ISO strings, timestamp strings) into local YYYY-MM-DD
 */
function normalizeDateStr(dateVal) {
  if (!dateVal) return "";
  if (dateVal instanceof Date) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(dateVal).trim();
  const match = str.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : str;
}

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
  const lastDateClean = normalizeDateStr(state.profile.lastDailyQuestDate);
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  if (lastDateClean === todayStr || lastDateClean === yesterdayStr) {
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
  const lastDateClean = normalizeDateStr(state.profile?.lastDailyQuestDate);

  if (lastDateClean === todayStr) {
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
  const userKey = state.profile?.email || state.profile?.studentEmail || state.profile?.displayName || "guest";

  if (!state.profile) state.profile = {};

  const lastDateClean = normalizeDateStr(state.profile.lastDailyQuestDate);

  if (lastDateClean === todayStr) {
    // Retain active streak if completed again today
    state.profile.streakCount = Math.max(state.profile.streakCount || 1, 1);
  } else if (lastDateClean) {
    const todayDateObj = new Date(todayStr);
    const lastDateObj = new Date(lastDateClean);
    const diffTime = todayDateObj.getTime() - lastDateObj.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      // Completed on consecutive day
      state.profile.streakCount = (state.profile.streakCount || 0) + 1;
    } else {
      // Missed 2+ days
      state.profile.streakCount = 1;
    }
  } else {
    // First daily quest completion
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
 * Builds a 5-question Daily Quest queue based on strict rules:
 * 1. Must match the student's current stream (e.g., G3).
 * 2. Must ONLY be Past or Current skills (Future skills & out-of-stream skills are strictly excluded).
 */
export function buildDailyQuestQueue(userState = state) {
  const curriculum = userState.curriculum || [];
  const mastery = userState.mastery || {};
  const skillTags = userState.skillTags || {};
  
  const studentStream = String(userState.profile?.stream || "G3").trim().toUpperCase();
  const studentYear = userState.profile?.year || userState.profile?.grade || "Sec 1";
  const studentYearNum = parseYearNumber(studentYear);

  const currentTopicPool = [];
  const pastTopicPool = [];
  const fallbackEligiblePool = [];

  curriculum.forEach((skill) => {
    const path = skill.generatorPath;

    // RULE 1: STREAM MATCHING - Exclude skills from other streams
    const skillStream = String(skill.stream || "").trim().toUpperCase();
    if (studentStream && skillStream && skillStream !== studentStream) {
      return;
    }

    // RESOLVE SKILL TAG: Check explicit teacher tag or fallback to year comparison
    let rawTag = skillTags[path];
    if (!rawTag) {
      const skillYearNum = parseYearNumber(skill.year || skill.level);
      if (studentYearNum !== null && skillYearNum !== null) {
        rawTag = skillYearNum < studentYearNum ? "Past" : "Future";
      } else {
        rawTag = "Current";
      }
    }

    const tag = String(rawTag).toUpperCase();

    // RULE 2: STRICT TAG MATCHING - Only allow CURRENT or PAST (strictly exclude FUTURE)
    if (tag !== "CURRENT" && tag !== "PAST") {
      return;
    }

    const record = mastery[path];
    const score = record ? (Number(record.score) || 0) : 0;

    const queueItem = { 
      generatorPath: path, 
      skill, 
      score, 
      primaryReason: tag === "CURRENT" ? "🟢 Current Unit Practice" : "🔵 Spaced Repetition (Past Unit)" 
    };

    if (tag === "CURRENT") {
      currentTopicPool.push(queueItem);
    } else if (tag === "PAST") {
      pastTopicPool.push(queueItem);
    }

    fallbackEligiblePool.push(queueItem);
  });

  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

  const selectedQueue = [];
  const usedPaths = new Set();

  // 1. Pick up to 3 questions from SAME STREAM + CURRENT skills
  for (const item of shuffle(currentTopicPool)) {
    if (selectedQueue.length < 3 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  // 2. Pick up to 2 questions from SAME STREAM + PAST skills for spaced repetition
  for (const item of shuffle(pastTopicPool)) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  // 3. Fallback fill remaining slots from any eligible SAME STREAM (Past/Current) skills
  for (const item of shuffle(fallbackEligiblePool)) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  return selectedQueue;
}
