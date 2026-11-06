import { state } from "../state.js";

const YEAR_LEVELS = { "Sec 1": 1, "Sec 2": 2, "Sec 3": 3, "Sec 4": 4 };

/**
 * Calculates the Smart Review Score (SRS) for a single skill on a 0 to 100 scale.
 * SRS = Tag Weight (Max 40) + Mastery Deficit (Max 30) + Time Decay (Max 15) + Struggle Factor (Max 15)
 */
export function calculateSRS(generatorPath, masteryRecord, skillTag) {
  const tag = String(skillTag || "").toUpperCase();

  // HARD GATE: Exclude unlearned / future topics
  if (tag === "FUTURE") return 0;

  let score = 0;

  // 1. TAG WEIGHT (Max 40 pts)
  if (tag === "PRIORITY") score += 40;
  else if (tag === "CURRENT") score += 25;
  else score += 10; // Past or default skills

  // 2. MASTERY DEFICIT (Max 30 pts)
  const currentScore = Number(masteryRecord?.score) || 0;
  score += (100 - currentScore) * 0.30;

  // 3. TIME DECAY (Max 15 pts)
  const lastPracticedMs = masteryRecord?.lastPracticed ? new Date(masteryRecord.lastPracticed).getTime() : 0;
  if (lastPracticedMs > 0) {
    const daysSince = Math.floor((Date.now() - lastPracticedMs) / (1000 * 60 * 60 * 24));
    score += Math.min(15, daysSince * 1.5);
  } else {
    // Unpracticed catch-up skills get full time-decay allocation
    score += (tag === "PRIORITY" || tag === "CURRENT") ? 15 : 10;
  }

  // 4. STRUGGLE FACTOR (Max 15 pts)
  const rolling = masteryRecord?.rollingHistory || [];
  if (rolling.length > 0) {
    const lastAttempt = rolling[rolling.length - 1];
    if (lastAttempt && !lastAttempt.isCorrect) score += 8;
    if (lastAttempt && Number(lastAttempt.hintsUsed) >= 3) score += 7;
  }

  // Cap final SRS score strictly at 100
  return Math.min(100, Math.round(score));
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

  const classTagsMap = state.teacherData?.classSkillTags?.[state.profile?.class] || 
                       state.profile?.skillTags || {};

  const candidateSkills = [];

  (state.curriculum || []).forEach(skill => {
    // 1. Filter stream and strand
    if (skill.stream && String(skill.stream).trim() !== studentStreamStr) return;
    if (selectedStrand !== "All" && skill.strand !== selectedStrand) return;

    const skillYearLevel = YEAR_LEVELS[String(skill.year).trim()] || 1;
    const isPriorYear = skillYearLevel < studentYearLevel;

    // Filter out higher grade skills
    if (skillYearLevel > studentYearLevel) return;

    const path = skill.generatorPath;
    const tag = classTagsMap[path] || (isPriorYear ? "Past" : "Current");

    // Skip prior year skills unless explicitly checked OR tagged as Priority
    if (isPriorYear && !includePriorYears && String(tag).toUpperCase() !== "PRIORITY") return;

    const mastery = state.mastery[path] || { score: 0, accuracy: 0, totalAttempted: 0, lastPracticed: "" };
    const srs = calculateSRS(path, mastery, tag);

    if (srs > 0) {
      candidateSkills.push({
        skill,
        title: skill.title || "Practice Skill",
        generatorPath: path,
        srsScore: srs,
        masteryScore: Number(mastery.score) || 0
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

  // Weighted Probabilistic Selection to build queue
  const pool = candidateSkills.map(c => ({ ...c }));
  const questionQueue = [];

  while (questionQueue.length < questionCount && pool.length > 0) {
    const totalSRS = pool.reduce((sum, item) => sum + item.srsScore, 0);
    let rand = Math.random() * totalSRS;

    for (let i = 0; i < pool.length; i++) {
      rand -= pool[i].srsScore;
      if (rand <= 0) {
        questionQueue.push(pool[i].generatorPath);
        // Dampen score to reduce back-to-back duplicate selection
        pool[i].srsScore = Math.round(pool[i].srsScore * 0.3);
        break;
      }
    }
  }

  questionQueue.candidateSkills = candidateSkills;
  questionQueue.refreshCount = candidateSkills.length;
  return questionQueue;
}

/**
 * Returns metrics for Dashboard badges.
 */
export function getSRSMetrics() {
  const queue = getSmartReviewQueue({ questionCount: 100, includePriorYears: true });
  return {
    totalRefreshNeeded: queue.refreshCount || 0
  };
}
