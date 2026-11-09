import { state } from "../state.js";

/**
 * Extracts numeric level from academic grade strings or class codes.
 * Identical logic to skillTreeView.js parseYearNumber.
 */
function parseYearNumber(val) {
  if (typeof val === "number") return val;
  if (!val) return null;
  const str = String(val).trim();
  
  const secMatch = str.match(/(?:Sec|P|Grade|Year)\s*(\d+)/i);
  if (secMatch) return parseInt(secMatch[1], 10);
  
  const digitMatch = str.match(/\d+/);
  if (digitMatch) {
    const num = parseInt(digitMatch[0], 10);
    if (num >= 100 && num <= 999) {
      return Math.floor(num / 100);
    }
    return num;
  }
  return null;
}

/**
 * Smart Auto-Default Tag Rule (Identical to skillTreeView.js):
 * - Previous years (skillYear < studentYear) -> "Past"
 * - Current or future years (skillYear >= studentYear) -> "Future"
 */
function getAutoDefaultTag(skill, studentYearOrClass) {
  const studentYearNum = parseYearNumber(studentYearOrClass || state.profile?.year || "Sec 1");
  const skillYearNum = parseYearNumber(skill.year || skill.level);

  if (studentYearNum !== null && skillYearNum !== null) {
    if (skillYearNum < studentYearNum) {
      return "Past";
    } else {
      return "Future";
    }
  }
  return "Future";
}

/**
 * Resolves skill tags across student and teacher state sources.
 * Handles flat path maps and nested class-to-path maps.
 */
export function getResolvedClassSkillTags() {
  const studentClass = String(
    state.profile?.class || 
    state.profile?.className || 
    state.user?.class || 
    state.selectedClass || 
    ""
  ).trim().toLowerCase().replace(/^class\s*/i, "");

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
      for (const [cKey, tagsMap] of Object.entries(src)) {
        const cleanCKey = String(cKey).trim().toLowerCase().replace(/^class\s*/i, "");
        if (cleanCKey === studentClass && tagsMap && typeof tagsMap === "object") {
          return tagsMap;
        }
      }
      for (const [cKey, tagsMap] of Object.entries(src)) {
        const cleanCKey = String(cKey).trim().toLowerCase().replace(/^class\s*/i, "");
        if (cleanCKey === "all" && tagsMap && typeof tagsMap === "object") {
          return tagsMap;
        }
      }
      const classKeys = Object.keys(src);
      if (classKeys.length === 1 && typeof src[classKeys[0]] === "object") {
        return src[classKeys[0]];
      }
    }
  }

  return {};
}

/**
 * Map Lookup function using skillTreeView's exact filename & path matching algorithm.
 */
export function getSkillTagFromMap(tagsMap, path) {
  if (!tagsMap || !path || typeof tagsMap !== "object") return null;

  const rawPath = String(path).trim().replace(/\\/g, '/');
  const rawFilename = rawPath.split('/').pop().replace(/\.js$/, '');

  if (tagsMap[rawPath]) {
    const val = tagsMap[rawPath];
    return typeof val === "string" ? val : (val.tag || val.status || null);
  }

  for (const [key, tagVal] of Object.entries(tagsMap)) {
    if (!key || !tagVal) continue;
    const cleanKey = String(key).trim().replace(/\\/g, '/');
    const keyFilename = cleanKey.split('/').pop().replace(/\.js$/, '');
    const tag = typeof tagVal === "string" ? tagVal : (tagVal.tag || tagVal.status || null);

    if (
      cleanKey === rawPath ||
      cleanKey.endsWith(rawPath) ||
      rawPath.endsWith(cleanKey) ||
      (keyFilename && keyFilename === rawFilename)
    ) {
      return tag;
    }
  }

  return null;
}

/**
 * Flexible Path Tag Resolver (Identical matching sequence to skillTreeView.js).
 */
export function resolveSkillTag(skill, studentYearOrClass) {
  const resolvedTagsMap = getResolvedClassSkillTags();
  const path = skill.generatorPath;

  const explicitTag = getSkillTagFromMap(resolvedTagsMap, path);
  if (explicitTag) {
    return explicitTag;
  }

  return getAutoDefaultTag(skill, studentYearOrClass);
}

/**
 * Calculates Smart Review Score (SRS) & component breakdown for a single skill (0–100 scale).
 */
export function calculateSRSBreakdown(generatorPath, masteryRecord, skillTag) {
  const tag = String(skillTag || "").toUpperCase();

  // HARD GATE: Exclude future/unlearned skills completely from SRS queue
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
  if (tag === "PRIORITY" && currentScore < 50) {
    struggleFactor = 15;
  } else {
    const rolling = masteryRecord?.rollingHistory || [];
    if (rolling.length > 0) {
      const last3 = rolling.slice(-3);
      const n = last3.length;
      const incorrectCount = last3.filter(a => !(a.isCorrect ?? a.correct ?? true)).length;
      const heavyHintCount = last3.filter(a => Number(a.hintsUsed ?? a.hints ?? 0) >= 2).length;
      struggleFactor = Math.min(15, Math.round(((incorrectCount / n) * 8) + ((heavyHintCount / n) * 7)));
    }
  }

  const rawTotal = tagWeight + masteryDeficit + timeDecay + struggleFactor;
  return {
    total: Math.min(100, rawTotal),
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

  const studentYearStr = state.profile ? String(state.profile.year || state.profile.level).trim() : "Sec 1";
  const studentStreamStr = state.profile ? String(state.profile.stream).trim() : "G3";
  const studentClassStr = state.profile ? String(state.profile.class || state.profile.className).trim() : "";

  const candidateSkills = [];

  (state.curriculum || []).forEach(skill => {
    const skillStreamStr = String(skill.stream || "").trim();
    if (studentStreamStr && skillStreamStr && skillStreamStr !== studentStreamStr) return;
    if (selectedStrand !== "All" && skill.strand !== selectedStrand) return;

    const path = skill.generatorPath;
    const tag = resolveSkillTag(skill, studentClassStr || studentYearStr);

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

  const questionQueue = [];

  // Pick distinct top SRS skills
  for (const item of candidateSkills) {
    if (questionQueue.length >= questionCount) break;
    questionQueue.push(item.generatorPath);
  }

  // Cycle top SRS skills if requested count exceeds unique available candidates
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
