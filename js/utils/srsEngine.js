import { state } from "../state.js";
import { getDecayedScore } from "./masteryScoreEngine.js";

const YEAR_LEVELS = { "Sec 1": 1, "Sec 2": 2, "Sec 3": 3, "Sec 4": 4 };

/**
 * Calculates dynamic memory half-life in days based on baseline score & accuracy
 */
function getMemoryHalfLife(rawScore, accuracy) {
  if (rawScore < 40) return 1.5;    // Basic Tier: ~1.5 day half-life
  if (rawScore < 70) return 4.0;    // Intermediate Tier: ~4 day half-life
  if (rawScore < 90) return 9.0;    // Advanced Tier: ~9 day half-life
  return 18.0;                      // Mastered Tier: ~18 day half-life
}

/**
 * Builds a cognitive SRS review queue using memory retention modeling,
 * dynamic urgency scoring, and topic interleaving.
 */
export function getSmartReviewQueue(options = {}) {
  const {
    questionCount = 10,
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

    if (isCurrentYear && mastery.totalAttempted < 1) return;
    if (isPriorYear && (!includePriorYears || mastery.totalAttempted < 1)) return;
    if (skillYearLevel > studentYearLevel) return;

    const rawScore = Number(mastery.score) || 0;
    const accuracy = Number(mastery.accuracy) || 0;
    const totalAttempted = Number(mastery.totalAttempted) || 0;

    // Days Since Last Practice
    const lastPracticedMs = mastery.lastPracticed ? new Date(mastery.lastPracticed).getTime() : 0;
    const daysElapsed = lastPracticedMs > 0 ? (now - lastPracticedMs) / (1000 * 60 * 60 * 24) : 999;
    
    // Cognitive Half-Life & Retention Modeling
    const halfLife = getMemoryHalfLife(rawScore, accuracy);
    const retentionProb = daysElapsed === 999 ? 0.3 : Math.pow(2, -daysElapsed / halfLife);
    const effectiveScore = Math.max(0, Math.round(rawScore * retentionProb));
    const daysOverdue = daysElapsed - halfLife;

    // Explicit Cognitive Reasons
    const reasons = [];
    if (retentionProb < 0.75 && rawScore >= 40) {
      const drop = rawScore - effectiveScore;
      reasons.push(`⏳ Memory Decay (-${drop} pts retention loss)`);
    }
    if (rawScore < 40) {
      reasons.push("🚨 Basic Concept Recall (< 40 Score)");
    } else if (rawScore < 70) {
      reasons.push("⚠️ Intermediate Consolidation Needed");
    }
    if (accuracy < 60 && totalAttempted >= 2) {
      reasons.push(`❌ Low Rolling Accuracy (${accuracy}%)`);
    }
    if (daysOverdue >= 0 && daysElapsed < 900) {
      reasons.push(`📅 Overdue Retrieval (${Math.floor(daysElapsed)} days elapsed)`);
    }

    const isDue = effectiveScore < rawScore || rawScore < 70 || accuracy < 60 || daysOverdue >= 0;

    // Urgency Priority Formula
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
      reasons: reasons.length > 0 ? reasons : ["🔄 Routine Memory Maintenance"],
      primaryReason: reasons[0] || "🔄 Routine Memory Maintenance",
      isDue,
      priority
    });
  });

  // Sort by priority (Highest urgency first)
  candidateSkills.sort((a, b) => b.priority - a.priority);

  // Apply Interleaving across topics
  const interleavedQueue = [];
  const pool = candidateSkills.slice(0, Math.max(questionCount * 2, 10));
  const usedGenerators = new Set();

  while (interleavedQueue.length < questionCount && pool.length > 0) {
    let selectedIdx = pool.findIndex(item => !usedGenerators.has(item.generatorPath));
    if (selectedIdx === -1) selectedIdx = 0; // Fallback if repeated

    const item = pool.splice(selectedIdx, 1)[0];
    interleavedQueue.push(item);
    usedGenerators.add(item.generatorPath);
  }

  return interleavedQueue;
}

export function getSRSMetrics() {
  const dueQueue = getSmartReviewQueue({ questionCount: 100, includePriorYears: true });
  return {
    totalDue: dueQueue.filter(s => s.isDue).length
  };
}
