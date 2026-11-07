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
 * Normalizes all date inputs (Date objects, ISO strings, YYYY-MM-DD, M/D/YYYY) into local YYYY-MM-DD.
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

  if (str.includes('T')) {
    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
      const y = parsedDate.getFullYear();
      const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const d = String(parsedDate.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const usMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (usMatch) {
    return `${usMatch[3]}-${String(usMatch[1]).padStart(2, '0')}-${String(usMatch[2]).padStart(2, '0')}`;
  }

  const plainYmd = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (plainYmd) {
    return `${plainYmd[1]}-${String(plainYmd[2]).padStart(2, '0')}-${String(plainYmd[3]).padStart(2, '0')}`;
  }

  return str;
}

/**
 * Calculates exact calendar day difference between two YYYY-MM-DD strings using UTC Date objects
 */
function getDaysBetween(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return null;
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);

  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Returns Day of Week index (0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday)
 */
function getDayOfWeek(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * Evaluates whether a streak is continued based on calendar gap and weekend grace rules
 */
function isStreakContinuation(prevDateStr, todayStr) {
  if (!prevDateStr || !todayStr) return false;

  const diffDays = getDaysBetween(prevDateStr, todayStr);
  if (diffDays <= 0) return true; // Same day or duplicate completion
  if (diffDays === 1) return true; // Consecutive calendar day

  const prevDow = getDayOfWeek(prevDateStr); // 0 = Sun, 1 = Mon, 5 = Fri, 6 = Sat

  // Friday (5) -> Sunday (0) [diff 2]: Valid weekend grace
  if (diffDays === 2 && prevDow === 5) return true;

  // Saturday (6) -> Monday (1) [diff 2]: Valid weekend grace
  if (diffDays === 2 && prevDow === 6) return true;

  // Friday (5) -> Monday (1) [diff 3]: Valid weekend grace
  if (diffDays === 3 && prevDow === 5) return true;

  // Thursday (4) -> Saturday (6) [diff 2]: Missed Friday -> Streak Breaks
  return false;
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
 * Evaluates whether student's streak is currently broken upon login
 */
export function checkStreakStatus() {
  if (!state.profile) return { isBroken: false, previousStreak: 0 };

  const lastDateClean = normalizeDateStr(state.profile.lastDailyQuestDate);
  const todayStr = getTodayDateString();
  const currentStreak = Number(state.profile.streakCount) || 0;

  if (!lastDateClean || currentStreak === 0 || lastDateClean === todayStr) {
    return { isBroken: false, previousStreak: currentStreak };
  }

  const isContinued = isStreakContinuation(lastDateClean, todayStr);
  if (!isContinued) {
    const currentXp = Number(state.profile.xp) || 0;
    return {
      isBroken: true,
      previousStreak: currentStreak,
      userXp: currentXp,
      canAfford: currentXp >= 50
    };
  }

  return { isBroken: false, previousStreak: currentStreak };
}

/**
 * Preserves broken streak for 50 XP, setting last date to yesterday
 */
export function preserveStreakWithXP() {
  if (!state.profile) return false;
  const currentXp = Number(state.profile.xp) || 0;
  if (currentXp < 50) return false;

  state.profile.xp = currentXp - 50;
  state.profile.lastDailyQuestDate = getYesterdayDateString();
  state.streakRepairHandled = true;

  if (state.userToken) {
    syncUserProgress(
      state.userToken,
      state.profile.xp,
      state.profile.streakCount,
      state.profile.lastDailyQuestDate
    );
  }

  if (typeof window.renderTopNav === "function") {
    window.renderTopNav(state.profile);
  }
  return true;
}

/**
 * Declines streak preservation, resetting streak count to 0
 */
export function declineStreakPreservation() {
  if (!state.profile) return;
  state.profile.streakCount = 0;
  state.streakRepairHandled = true;

  if (state.userToken) {
    syncUserProgress(
      state.userToken,
      state.profile.xp,
      0,
      state.profile.lastDailyQuestDate
    );
  }

  if (typeof window.renderTopNav === "function") {
    window.renderTopNav(state.profile);
  }
}

/**
 * Gets active streak count for display
 */
export function getActiveStreakCount() {
  if (!state.profile) return 0;
  const lastDateClean = normalizeDateStr(state.profile.lastDailyQuestDate);
  const todayStr = getTodayDateString();

  if (!lastDateClean) return 0;

  if (isStreakContinuation(lastDateClean, todayStr)) {
    return Number(state.profile.streakCount) || 0;
  }

  if (state.streakRepairHandled) {
    return Number(state.profile.streakCount) || 0;
  }

  return Number(state.profile.streakCount) || 0;
}

/**
 * Checks if Daily Quest was completed today
 */
export function isDailyQuestCompletedToday() {
  const todayStr = getTodayDateString();
  const lastDateClean = normalizeDateStr(state.profile?.lastDailyQuestDate);

  return lastDateClean === todayStr;
}

/**
 * Marks today's Daily Quest as completed and increments streak (+1)
 */
export function markDailyQuestCompletedToday() {
  const todayStr = getTodayDateString();

  if (!state.profile) state.profile = {};

  const previousDateClean = normalizeDateStr(state.profile.lastDailyQuestDate);
  const currentStreakVal = Number(state.profile.streakCount) || 0;

  if (previousDateClean === todayStr) {
    state.profile.streakCount = Math.max(currentStreakVal, 1);
  } else if (previousDateClean && isStreakContinuation(previousDateClean, todayStr)) {
    state.profile.streakCount = currentStreakVal + 1;
  } else {
    state.profile.streakCount = 1;
  }

  state.profile.lastDailyQuestDate = todayStr;

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
 * Builds Daily Quest queue
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

    const skillStream = String(skill.stream || "").trim().toUpperCase();
    if (studentStream && skillStream && skillStream !== studentStream) {
      return;
    }

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
    if (tag !== "CURRENT" && tag !== "PAST") return;

    const record = mastery[path];
    const score = record ? (Number(record.score) || 0) : 0;

    const queueItem = {
      generatorPath: path,
      skill,
      score,
      primaryReason: tag === "CURRENT" ? "🟢 Current Unit Practice" : "🔵 Spaced Repetition (Past Unit)"
    };

    if (tag === "CURRENT") currentTopicPool.push(queueItem);
    else if (tag === "PAST") pastTopicPool.push(queueItem);

    fallbackEligiblePool.push(queueItem);
  });

  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

  const selectedQueue = [];
  const usedPaths = new Set();

  for (const item of shuffle(currentTopicPool)) {
    if (selectedQueue.length < 3 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  for (const item of shuffle(pastTopicPool)) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  for (const item of shuffle(fallbackEligiblePool)) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  return selectedQueue;
}
