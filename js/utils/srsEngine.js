import { state } from "../state.js";

const YEAR_LEVELS = { "Sec 1": 1, "Sec 2": 2, "Sec 3": 3, "Sec 4": 4 };

/**
 * Calculates dynamic memory half-life in days based on baseline mastery score
 */
function getMemoryHalfLife(rawScore) {
  if (rawScore < 40) return 1.5;    // Basic Tier: ~1.5 day half-life
  if (rawScore < 70) return 4.0;    // Intermediate Tier: ~4 day half-life
  if (rawScore < 90) return 9.0;    // Advanced Tier: ~9 day half-life
  return 18.0;                      // Mastered Tier: ~18 day half-life (capped at 30 days max interval)
}

/**
 * Builds a cognitive SRS review queue using memory retention modeling,
 * score-shielding for high-mastery topics, and micro-batch interleaving.
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

  const now = Date.now();
  const candidateSkills = [];

  (state.curriculum || []).forEach(skill => {
    // 1. Filter stream and strand
    if (skill.stream && String(skill.stream).trim() !== studentStreamStr) return;
    if (selectedStrand !== "All" && skill.strand !== selectedStrand) return;

    const skillYearLevel = YEAR_LEVELS[String(skill.year).trim()] || 1;
    const mastery = state.mastery[skill.generatorPath] || {
      score: 0,
      accuracy: 0,
      totalAttempted: 0,
      lastPracticed: ""
    };

    const isCurrentYear = skillYearLevel === studentYearLevel;
    const isPriorYear = skillYearLevel < studentYearLevel;

    // Shield unpracticed skills (must be practiced first in Skill Tree mode)
    if (mastery.totalAttempted < 1) return;
    if (isPriorYear && !includePriorYears) return;
    if (skillYearLevel > studentYearLevel) return;

    const rawScore = Number(mastery.score) || 0;
    const accuracy = Number(mastery.accuracy) || 0;
    const totalAttempted = Number(mastery.totalAttempted) || 0;

    // Days Since Last Practice Calculation
    const lastPracticedMs = mastery.lastPracticed ? new Date(mastery.lastPracticed).getTime() : 0;
    const daysElapsed = lastPracticedMs > 0 ? (now - lastPracticedMs) / (1000 * 60 * 60 * 24) : 999;
    
    // Cognitive Half-Life & Retention Modeling
    const halfLife = getMemoryHalfLife(rawScore);
    const retentionProb = daysElapsed === 999 ? 0.3 : Math.pow(2, -daysElapsed / halfLife);
    const effectiveScore = Math.max(0, Math.round(rawScore * retentionProb));
    const daysOverdue = daysElapsed - halfLife;

    // HARD RETENTION SHIELD:
    // If Retained Score >= 70 and accuracy is healthy (>= 60%), skill does NOT require review
    const needsRefresh = effectiveScore < 70 || accuracy < 60 || daysOverdue >= 0;

    if (!needsRefresh) return; // Topic is shielded / up-to-date

    // Explicit Pedagogical Reasons
    const reasons = [];
    if (retentionProb < 0.75 && rawScore >= 40) {
      const drop = rawScore - effectiveScore;
      reasons.push(`⏳ Retained Score Decayed (-${drop} pts)`);
    }
    if (rawScore < 40) {
      reasons.push("🚨 Basic Skill Tune-Up (< 40 Score)");
    } else if (rawScore < 70) {
      reasons.push("⚠️ Intermediate Consolidation");
    }
    if (accuracy < 60 && totalAttempted >= 2) {
      reasons.push(`❌ Accuracy Drop (${accuracy}%)`);
    }
    if (daysOverdue >= 0 && daysElapsed < 900) {
      reasons.push(`📅 Scheduled Refresh (${Math.floor(daysElapsed)} days elapsed)`);
    }

    // Urgency Priority Score Formula
    let priority = (100 - effectiveScore) * (1 + (daysElapsed / halfLife));
    if (accuracy < 60 && totalAttempted >= 2) priority += (60 - accuracy) * 1.5;
    if (rawScore < 40) priority += 35;

    candidateSkills.push({
      skill,
      title: skill.title || "Practice Skill",
      generatorPath: skill.generatorPath,
      rawScore,
      effectiveScore,
      accuracy,
      totalAttempted,
      lastPracticed: mastery.lastPracticed,
      daysSincePracticed: Math.floor(daysElapsed),
      reasons: reasons.length > 0 ? reasons : ["🔄 Memory Maintenance"],
      primaryReason: reasons[0] || "🔄 Memory Maintenance",
      needsRefresh: true,
      priority
    });
  });

  if (candidateSkills.length === 0) {
    const emptyQueue = [];
    emptyQueue.candidateSkills = [];
    emptyQueue.refreshCount = 0;
    emptyQueue.uniqueTopicsCount = 0;
    return emptyQueue;
  }

  // Sort candidate skills by urgency priority descending
  candidateSkills.sort((a, b) => b.priority - a.priority);

  // Micro-Batch Interleaved Queue Distribution:
  // Build exact questionCount length array by cycling through available candidate topics
  const questionQueue = [];
  let idx = 0;
  while (questionQueue.length < questionCount) {
    const item = candidateSkills[idx % candidateSkills.length];
    questionQueue.push({ ...item });
    idx++;
  }

  // Attach metadata directly to returned array
  questionQueue.candidateSkills = candidateSkills;
  questionQueue.refreshCount = candidateSkills.length;
  questionQueue.uniqueTopicsCount = candidateSkills.length;

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
