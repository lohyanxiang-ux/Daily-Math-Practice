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
 * Converts ISO UTC timestamps into local timezone dates to prevent Google Sheets timezone shifts.
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

  // 1. ISO Timestamps containing time component (e.g., "2026-11-05T16:00:00.000Z")
  if (str.includes('T')) {
    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
      const y = parsedDate.getFullYear();
      const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const d = String(parsedDate.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  // 2. M/D/YYYY or MM/DD/YYYY (e.g., "11/6/2026" or "11/6/2026 10:28")
  const usMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (usMatch) {
    return `${usMatch[3]}-${String(usMatch[1]).padStart(2, '0')}-${String(usMatch[2]).padStart(2, '0')}`;
  }

  // 3. Plain YYYY-MM-DD or YYYY/MM/DD
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
 * Checks active streak on login. If a required weekday was missed (e.g. Thu -> Sat),
 * resets streak to 0 and syncs to Google Sheet Column J immediately.
 */
export function getActiveStreakCount() {
  if (!state.profile) return 0;
  const lastDateClean = normalizeDateStr(state.profile.lastDailyQuestDate);
  const todayStr = getTodayDateString();

  if (!lastDateClean) {
    if (state.profile.streakCount !== 0) {
      state.profile.streakCount = 0;
      if (state.userToken) {
        syncUserProgress(state.userToken, state.profile.xp, 0, "");
      }
    }
    return 0;
  }

  // Check if current streak is still active
  if (isStreakContinuation(lastDateClean, todayStr)) {
    return Number(state.profile.streakCount) || 0;
  }

  // Streak missed: Reset to 0 upon login and sync to Google Sheet Column J
  if (state.profile.streakCount !== 0) {
    state.profile.streakCount = 0;
    if (state.userToken) {
      syncUserProgress(
        state.userToken,
        state.profile.xp,
        0,
        state.profile.lastDailyQuestDate
      );
    }
  }

  return 0;
}

/**
 * Checks if the student completed today's Daily Quest strictly by comparing today's date
 * with Column L (LastDailyQuestDate) from the Google Sheet Roster table.
 */
export function isDailyQuestCompletedToday() {
  const todayStr = getTodayDateString();
  const lastDateClean = normalizeDateStr(state.profile?.lastDailyQuestDate);

  return lastDateClean === todayStr;
}

/**
 * Marks today's Daily Quest as completed:
 * - Increments active streak (+1) for consecutive days or valid weekend grace.
 * - Writes new streak and today's date to Google Sheet Columns J & L.
 */
export function markDailyQuestCompletedToday() {
  const todayStr = getTodayDateString();

  if (!state.profile) state.profile = {};

  const previousDateClean = normalizeDateStr(state.profile.lastDailyQuestDate);
  const currentStreakVal = Number(state.profile.streakCount) || 0;

  if (previousDateClean === todayStr) {
    // Retain streak if completed again on the same day
    state.profile.streakCount = Math.max(currentStreakVal, 1);
  } else if (previousDateClean && isStreakContinuation(previousDateClean, todayStr)) {
    // Increment active streak (+1)
    state.profile.streakCount = currentStreakVal + 1;
  } else {
    // Streak was reset to 0 or missed: Start new streak at 1
    state.profile.streakCount = 1;
  }

  // Update memory state for Column L
  state.profile.lastDailyQuestDate = todayStr;

  // Sync updated streak count (Column J) and today's date (Column L) to Google Sheets
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
 * Builds a 5-question Daily Quest queue based on stream and current/past unit rules
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

    // RULE 1: STREAM MATCHING
    const skillStream = String(skill.stream || "").trim().toUpperCase();
    if (studentStream && skillStream && skillStream !== studentStream) {
      return;
    }

    // RESOLVE SKILL TAG
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

    // RULE 2: STRICT TAG MATCHING (Only allow CURRENT or PAST)
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

  // 2. Pick up to 2 questions from SAME STREAM + PAST skills
  for (const item of shuffle(pastTopicPool)) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  // 3. Fallback fill remaining slots
  for (const item of shuffle(fallbackEligiblePool)) {
    if (selectedQueue.length < 5 && !usedPaths.has(item.generatorPath)) {
      selectedQueue.push(item);
      usedPaths.add(item.generatorPath);
    }
  }

  return selectedQueue;
}
