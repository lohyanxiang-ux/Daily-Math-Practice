import { state } from "../state.js";

const YEAR_LEVELS = { "Sec 1": 1, "Sec 2": 2, "Sec 3": 3, "Sec 4": 4 };

/**
 * Normalizes and matches skill paths from ClassSkillTags sheet (handles missing/extra '.js' extension,
 * slash differences, and case sensitivity).
 */
export function getSkillTagFromMap(tagsMap, path) {
  if (!tagsMap || !path) return null;
  const cleanPath = String(path).trim().replace(/\\/g, '/');

  // 1. Direct match
  if (tagsMap[cleanPath]) return tagsMap[cleanPath];

  // 2. Try without .js extension
  const withoutJs = cleanPath.replace(/\.js$/i, '');
  if (tagsMap[withoutJs]) return tagsMap[withoutJs];

  // 3. Try with .js extension
  const withJs = cleanPath.endsWith('.js') ? cleanPath : (cleanPath + '.js');
  if (tagsMap[withJs]) return tagsMap[withJs];

  // 4. Case-insensitive / trailing path segment comparison
  const normClean = withoutJs.toLowerCase();
  for (const [key, val] of Object.entries(tagsMap)) {
    const keyClean = String(key).trim().replace(/\\/g, '/').replace(/\.js$/i, '').toLowerCase();
    if (keyClean === normClean) {
      return val;
    }
  }

  return null;
}

/**
 * Resolves skill tags across student and teacher state sources with normalized class name matching.
 */
function getResolvedClassSkillTags() {
  const studentClass = state.profile?.class || state.profile?.className || state.user?.class || "";
  const targetClassClean = String(studentClass).trim().toLowerCase().replace(/^class\s*/i, "");

  // 1. Direct student skillTags at state root (populated on PIN login)
  if (state.skillTags && typeof state.skillTags === "object" && Object.keys(state.skillTags).length > 0) {
    return state.skillTags;
  }

  // 2. Student profile skillTags
  if (state.profile?.skillTags && typeof state.profile.skillTags === "object" && Object.keys(state.profile.skillTags).length > 0) {
    return state.profile.skillTags;
  }

  // 3. Teacher dashboard classSkillTags map with normalized matching ("301" vs "Class 301")
  const teacherClassTags = state.teacherData?.classSkillTags || state.classSkillTags;
  if (teacherClassTags && typeof teacherClassTags === "object") {
    for (const [cKey, tags] of Object.entries(teacherClassTags)) {
      const cleanCKey = String(cKey).trim().toLowerCase().replace(/^class\s*/i, "");
      if (cleanCKey === targetClassClean && tags) {
        return tags;
      }
    }
  }

  return {};
}

/**
 * Fallback tag when no explicit entry exists in ClassSkillTags sheet.
 */
function getFallbackTag(skill, studentYearLevel) {
  const skillYearLevel = YEAR_LEVELS[String(skill.year || skill.level || "").trim()] || 1;
  if (skillYearLevel < studentYearLevel) return "Past";
  if (skillYearLevel === studentYearLevel) return "Current";
  return "Future";
}

/**
 * Calculates the Smart Review Score (SRS) & component breakdown for a single skill (0–100 scale).
 */
export function calculateSRSBreakdown(generatorPath, masteryRecord, skillTag) {
  const tag = String(skillTag || "").toUpperCase();

  // HARD GATE: Exclude future/unlearned skills
  if (tag === "FUTURE") {
    return { total: 0, tagWeight: 0, masteryDeficit: 0, timeDecay: 0, struggleFactor: 0, isFuture: true, tag };
  }

  // 1. TAG WEIGHT (Max 40 pts)
  let tagWeight = 10;
  if (tag === "PRIORITY") tagWeight = 40;
  else if (tag === "CURRENT") tagWeight = 25;

  // 2. MASTERY DEFICIT (Max 30 pts)
  const currentScore = Number(masteryRecord?.score) || 0;
  const masteryDeficit = Math.round((100 - currentScore) * 0.30);

  // 3. TIME DECAY (Max 15 pts)
  let timeDecay = 0;
  const lastPracticedMs = masteryRecord?.lastPracticed ? new Date(masteryRecord.lastPracticed).getTime() : 0;
  if (lastPracticedMs > 0) {
    const daysSince = Math.floor((Date.now() - lastPracticedMs) / (1000 * 60 * 60 * 24));
    timeDecay = Math.min(15, Math.round(daysSince * 1.5));
  } else {
    timeDecay = (tag === "PRIORITY" || tag === "CURRENT") ? 15 : 10;
  }

  // 4. STRUGGLE FACTOR (Max 15 pts)
  let struggleFactor = 0;
  const rolling = masteryRecord?.rollingHistory || [];
  if (rolling.length > 0) {
    const lastAttempt = rolling[rolling.length - 1];
    if (lastAttempt && !lastAttempt.isCorrect) struggleFactor += 8;
    if (lastAttempt && Number(lastAttempt.hintsUsed) >= 3) struggleFactor += 7;
  }

  const rawTotal = tagWeight + masteryDeficit + timeDecay + struggleFactor;
  const total = Math.min(100, rawTotal);

  return {
    total,
    tagWeight,
    masteryDeficit,
    timeDecay,
    struggleFactor,
    currentScore,
    tag
  };
}

/**
 * Generates an adaptive Smart Review Queue using weighted probabilistic selection.
 */
export function getSmartReviewQueue(options = {}) {
  const {
    questionCount = 5,
    includePriorYears = false,
    selectedStrand = "All"
  } = options;

  const studentYearStr = state.profile ? String(state.profile.year).trim() : "Sec 1";
  const studentStreamStr = state.profile ? String(state.profile.stream).trim() : "G3";
  const studentYearLevel = YEAR_LEVELS[studentYearStr] || 1;

  const resolvedTagsMap = getResolvedClassSkillTags();
  const candidateSkills = [];

  (state.curriculum || []).forEach(skill => {
    if (skill.stream && String(skill.stream).trim() !== studentStreamStr) return;
    if (selectedStrand !== "All" && skill.strand !== selectedStrand) return;

    const skillYearLevel = YEAR_LEVELS[String(skill.year).trim()] || 1;
    if (skillYearLevel > studentYearLevel) return;

    const path = skill.generatorPath;
    const mappedTag = getSkillTagFromMap(resolvedTagsMap, path);
    const tag = mappedTag || getFallbackTag(skill, studentYearLevel);
    const isPriorYear = skillYearLevel < studentYearLevel;

    // Prior-year skills tagged as PRIORITY will bypass the includePriorYears filter
    if (isPriorYear && !includePriorYears && String(tag).toUpperCase() !== "PRIORITY") return;

    const mastery = state.mastery[path] || { score: 0, accuracy: 0, totalAttempted: 0, lastPracticed: "" };
    const breakdown = calculateSRSBreakdown(path, mastery, tag);

    if (breakdown.total > 0) {
      candidateSkills.push({
        skill,
        title: skill.title || "Practice Skill",
        generatorPath: path,
        srsScore: breakdown.total,
        breakdown: breakdown,
        tag: tag
      });
    }
  });

  if (candidateSkills.length === 0) {
    const emptyQueue = [];
    emptyQueue.candidateSkills = [];
    emptyQueue.refreshCount = 0;
    return emptyQueue;
  }

  // Sort candidate pool by SRS score descending
  candidateSkills.sort((a, b) => b.srsScore - a.srsScore);

  // Weighted Probabilistic Selection
  const pool = candidateSkills.map(c => ({ ...c, tempWeight: c.srsScore }));
  const questionQueue = [];

  while (questionQueue.length < questionCount && pool.length > 0) {
    const totalSRS = pool.reduce((sum, item) => sum + item.tempWeight, 0);

    if (totalSRS <= 0) {
      const nextItem = pool[questionQueue.length % pool.length];
      questionQueue.push(nextItem.generatorPath);
      continue;
    }

    let rand = Math.random() * totalSRS;
    for (let i = 0; i < pool.length; i++) {
      rand -= pool[i].tempWeight;
      if (rand <= 0) {
        questionQueue.push(pool[i].generatorPath);
        pool[i].tempWeight = Math.max(1, Math.round(pool[i].tempWeight * 0.3));
        break;
      }
    }
  }

  questionQueue.candidateSkills = candidateSkills;
  questionQueue.refreshCount = candidateSkills.length;
  return questionQueue;
}

export function getSRSMetrics() {
  const queue = getSmartReviewQueue({ questionCount: 100, includePriorYears: true });
  return {
    totalRefreshNeeded: queue.refreshCount || 0
  };
}
