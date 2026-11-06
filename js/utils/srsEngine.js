import { state } from "../state.js";

const YEAR_LEVELS = { "Sec 1": 1, "Sec 2": 2, "Sec 3": 3, "Sec 4": 4 };

/**
 * Robust path matcher: Strips prefixes ('js/questions/'), file extensions ('.js'),
 * and normalizes casing to match sheet data against curriculum objects.
 */
export function getSkillTagFromMap(tagsMap, path) {
  if (!tagsMap || !path || typeof tagsMap !== "object") return null;

  const normInput = String(path)
    .trim()
    .replace(/\\/g, '/')
    .replace(/^(\.\/)?(js\/)?(questions\/)?/i, '')
    .replace(/\.js$/i, '')
    .toLowerCase();

  if (tagsMap[path]) return tagsMap[path];

  for (const [key, val] of Object.entries(tagsMap)) {
    if (!key || !val) continue;

    const normKey = String(key)
      .trim()
      .replace(/\\/g, '/')
      .replace(/^(\.\/)?(js\/)?(questions\/)?/i, '')
      .replace(/\.js$/i, '')
      .toLowerCase();

    if (normKey === normInput) {
      return val;
    }
  }

  return null;
}

/**
 * Resolves skill tags across student and teacher state sources with normalized class matching.
 */
export function getResolvedClassSkillTags() {
  const studentClass = String(state.profile?.class || state.profile?.className || state.user?.class || "")
    .trim()
    .toLowerCase()
    .replace(/^class\s*/i, "");

  if (state.skillTags && typeof state.skillTags === "object" && Object.keys(state.skillTags).length > 0) {
    return state.skillTags;
  }

  if (state.profile?.skillTags && typeof state.profile.skillTags === "object" && Object.keys(state.profile.skillTags).length > 0) {
    return state.profile.skillTags;
  }

  const teacherClassTags = state.teacherData?.classSkillTags || state.classSkillTags;
  if (teacherClassTags && typeof teacherClassTags === "object") {
    for (const [cKey, tags] of Object.entries(teacherClassTags)) {
      const cleanCKey = String(cKey).trim().toLowerCase().replace(/^class\s*/i, "");
      if (cleanCKey === studentClass && tags) {
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
 * Features a 3-attempt rolling average with a threshold of >= 2 hints used for Struggle Factor.
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

  // 4. STRUGGLE FACTOR (Max 15 pts - 3-Attempt Rolling Average, >= 2 Hints)
  let struggleFactor = 0;
  const rolling = masteryRecord?.rollingHistory || [];
  if (rolling.length > 0) {
    const last3 = rolling.slice(-3);
    const n = last3.length;

    const incorrectCount = last3.filter(a => {
      if (a.isCorrect !== undefined) return !a.isCorrect;
      if (a.correct !== undefined) return !a.correct;
      return false;
    }).length;

    // Count attempts where 2 or more hints were used
    const heavyHintCount = last3.filter(a => Number(a.hintsUsed ?? a.hints ?? 0) >= 2).length;

    const errorPts = (incorrectCount / n) * 8;
    const hintPts = (heavyHintCount / n) * 7;

    struggleFactor = Math.min(15, Math.round(errorPts + hintPts));
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
  const queue = getSmartReviewQueue({ questionCount: 100 });
  return {
    totalRefreshNeeded: queue.refreshCount || 0
  };
}
