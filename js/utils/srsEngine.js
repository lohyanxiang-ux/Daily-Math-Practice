import { state } from "../state.js";

const YEAR_LEVELS = { "Sec 1": 1, "Sec 2": 2, "Sec 3": 3, "Sec 4": 4, "1": 1, "2": 2, "3": 3, "4": 4 };

/**
 * Parses numeric year level safely (e.g. "Sec 3" -> 3, "3" -> 3, 3 -> 3).
 * Defaults to 4 (all unlocked) if unparseable or unspecified.
 */
function parseYearLevel(val) {
  if (val === undefined || val === null || val === "") return 4;
  const str = String(val).trim();
  const match = str.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 4) return num;
  }
  const lower = str.toLowerCase();
  if (lower.includes("sec 1") || lower.includes("s1")) return 1;
  if (lower.includes("sec 2") || lower.includes("s2")) return 2;
  if (lower.includes("sec 3") || lower.includes("s3")) return 3;
  if (lower.includes("sec 4") || lower.includes("s4")) return 4;
  return 4;
}

/**
 * Normalizes and matches academic streams (e.g., "G3" <-> "Express", "G2" <-> "NA", "G1" <-> "NT").
 */
function matchesStream(skillStream, studentStream) {
  if (!skillStream || skillStream === "All" || !studentStream || studentStream === "All") return true;
  const s1 = String(skillStream).trim().toLowerCase();
  const s2 = String(studentStream).trim().toLowerCase();
  if (s1 === s2) return true;
  if ((s1 === "g3" || s1 === "express") && (s2 === "g3" || s2 === "express")) return true;
  if ((s1 === "g2" || s1 === "na" || s1.includes("academic")) && (s2 === "g2" || s2 === "na" || s2.includes("academic"))) return true;
  if ((s1 === "g1" || s1 === "nt" || s1.includes("technical")) && (s2 === "g1" || s2 === "nt" || s2.includes("technical"))) return true;
  return false;
}

/**
 * Robust path matcher: Strips prefixes ('js/questions/'), file extensions ('.js'),
 * and normalizes casing to match sheet data against curriculum objects.
 */
export function getSkillTagFromMap(tagsMap, path) {
  if (!tagsMap || !path || typeof tagsMap !== "object") return null;

  // Direct lookup first
  if (typeof tagsMap[path] === "string") return tagsMap[path];

  const normalize = (p) => String(p || "")
    .trim()
    .replace(/\\/g, '/')
    .replace(/^(\.\/)?(js\/)?(questions\/)?/i, '')
    .replace(/\.js$/i, '')
    .toLowerCase();

  const normInput = normalize(path);

  for (const [key, val] of Object.entries(tagsMap)) {
    if (!key || !val) continue;

    const tagStr = typeof val === "string" ? val : (val.tag || val.status || null);
    if (!tagStr) continue;

    if (normalize(key) === normInput) {
      return tagStr;
    }
  }

  return null;
}

/**
 * Resolves skill tags across student and teacher state sources with normalized class matching.
 * Handles both flat path-to-tag maps and nested class-to-path-tag maps.
 */
export function getResolvedClassSkillTags() {
  const rawClass = String(
    state.profile?.class || 
    state.profile?.className || 
    state.user?.class || 
    state.selectedClass || 
    ""
  ).trim();

  const studentClass = rawClass.toLowerCase().replace(/^class\s*/i, "");

  const sources = [
    state.skillTags,
    state.profile?.skillTags,
    state.classSkillTags,
    state.profile?.classSkillTags,
    state.teacherData?.classSkillTags,
    state.teacherData?.tags
  ];

  for (const src of sources) {
    if (!src || typeof src !== "object" || Object.keys(src).length === 0) continue;

    const firstVal = Object.values(src)[0];
    
    // Flat map: { "algebra/linearEquations.js": "Priority" }
    if (typeof firstVal === "string") {
      return src;
    }

    // Nested map: { "301": { "algebra/linearEquations.js": "Priority" } }
    if (typeof firstVal === "object" && firstVal !== null) {
      // 1. Try class match
      for (const [cKey, tagsMap] of Object.entries(src)) {
        const cleanCKey = String(cKey).trim().toLowerCase().replace(/^class\s*/i, "");
        if (cleanCKey === studentClass && tagsMap && typeof tagsMap === "object") {
          return tagsMap;
        }
      }
      // 2. Try "all" fallback class
      for (const [cKey, tagsMap] of Object.entries(src)) {
        const cleanCKey = String(cKey).trim().toLowerCase().replace(/^class\s*/i, "");
        if (cleanCKey === "all" && tagsMap && typeof tagsMap === "object") {
          return tagsMap;
        }
      }
      // 3. Fallback: single class in map
      const classKeys = Object.keys(src);
      if (classKeys.length === 1 && typeof src[classKeys[0]] === "object") {
        return src[classKeys[0]];
      }
    }
  }

  return {};
}

/**
 * Fallback tag when no explicit entry exists in ClassSkillTags sheet.
 */
function getFallbackTag(skill, studentYearLevel) {
  const skillYearLevel = parseYearLevel(skill.year || skill.level);
  if (skillYearLevel < studentYearLevel) return "Past";
  if (skillYearLevel === studentYearLevel) return "Current";
  return "Future";
}

/**
 * Calculates the Smart Review Score (SRS) & component breakdown for a single skill (0–100 scale).
 * Tag weights: Priority +30, Current +25, Past +10 (Future excluded).
 * Time Decay (Max 25), Deficit (Max 30), Struggle Factor (Max 15).
 */
export function calculateSRSBreakdown(generatorPath, masteryRecord, skillTag) {
  const tag = String(skillTag || "").toUpperCase();

  // HARD GATE: Exclude future/unlearned skills
  if (tag === "FUTURE") {
    return { total: 0, tagWeight: 0, masteryDeficit: 0, timeDecay: 0, struggleFactor: 0, isFuture: true, tag };
  }

  // 1. TAG WEIGHT (Max 30 pts)
  let tagWeight = 10; // Default for PAST
  if (tag === "PRIORITY") tagWeight = 30;
  else if (tag === "CURRENT") tagWeight = 25;

  // 2. MASTERY DEFICIT (Max 30 pts)
  const currentScore = Number(masteryRecord?.score) || 0;
  const masteryDeficit = Math.round((100 - currentScore) * 0.30);

  // 3. TIME DECAY (Max 25 pts)
  let timeDecay = 0;
  const lastPracticedMs = masteryRecord?.lastPracticed ? new Date(masteryRecord.lastPracticed).getTime() : 0;
  if (lastPracticedMs > 0) {
    const daysSince = Math.floor((Date.now() - lastPracticedMs) / (1000 * 60 * 60 * 24));
    timeDecay = Math.min(25, Math.round(daysSince * 1.5));
  } else {
    timeDecay = (tag === "PRIORITY" || tag === "CURRENT") ? 25 : 15;
  }

  // 4. STRUGGLE FACTOR (Max 15 pts)
  let struggleFactor = 0;

  // Rule Override: Priority skills with Mastery < 50 automatically receive max struggle (+15)
  if (tag === "PRIORITY" && currentScore < 50) {
    struggleFactor = 15;
  } else {
    // Standard 3-Attempt Rolling Average (>= 2 Hints)
    const rolling = masteryRecord?.rollingHistory || [];
    if (rolling.length > 0) {
      const last3 = rolling.slice(-3);
      const n = last3.length;

      const incorrectCount = last3.filter(a => {
        if (a.isCorrect !== undefined) return !a.isCorrect;
        if (a.correct !== undefined) return !a.correct;
        return false;
      }).length;

      const heavyHintCount = last3.filter(a => Number(a.hintsUsed ?? a.hints ?? 0) >= 2).length;

      const errorPts = (incorrectCount / n) * 8;
      const hintPts = (heavyHintCount / n) * 7;

      struggleFactor = Math.min(15, Math.round(errorPts + hintPts));
    }
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
 * Generates an adaptive Smart Review Queue based on calculated SRS scores.
 */
export function getSmartReviewQueue(options = {}) {
  const {
    questionCount = 5,
    selectedStrand = "All"
  } = options;

  const studentYearStr = state.profile ? (state.profile.year || state.profile.level) : "";
  const studentStreamStr = state.profile ? state.profile.stream : "";
  const studentYearLevel = parseYearLevel(studentYearStr);

  const resolvedTagsMap = getResolvedClassSkillTags();
  const candidateSkills = [];

  (state.curriculum || []).forEach(skill => {
    if (!matchesStream(skill.stream, studentStreamStr)) return;
    if (selectedStrand !== "All" && skill.strand !== selectedStrand) return;

    const skillYearLevel = parseYearLevel(skill.year || skill.level);
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

  // Reliable Queue Selection: Prioritize highest SRS topics directly
  const questionQueue = [];

  // Step 1: Pick distinct skills starting from highest SRS score down
  for (const item of candidateSkills) {
    if (questionQueue.length >= questionCount) break;
    questionQueue.push(item.generatorPath);
  }

  // Step 2: If questionCount exceeds available distinct candidate skills, cycle top SRS skills to fill queue
  let cycleIdx = 0;
  while (questionQueue.length < questionCount && candidateSkills.length > 0) {
    questionQueue.push(candidateSkills[cycleIdx % candidateSkills.length].generatorPath);
    cycleIdx++;
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
