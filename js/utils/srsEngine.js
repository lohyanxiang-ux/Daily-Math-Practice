import { state } from "../state.js";
import { getDecayedScore } from "./masteryScoreEngine.js";

const YEAR_LEVELS = { "Sec 1": 1, "Sec 2": 2, "Sec 3": 3, "Sec 4": 4 };

function getSRSIntervalDays(score) {
  if (score < 40) return 1;     // Basic Tier: Review daily
  if (score < 70) return 3;     // Intermediate Tier: Review every 3 days
  if (score < 90) return 7;     // Advanced Tier: Review weekly
  return 14;                    // Mastered Tier: Review bi-weekly
}

/**
 * Builds a prioritized SRS review queue for Smart Review (smartReviewView.js)
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
    const effectiveScore = getDecayedScore(rawScore, mastery.lastPracticed, 2);
    const accuracy = Number(mastery.accuracy) || 0;
    const totalAttempted = Number(mastery.totalAttempted) || 0;

    const lastPracticedMs = mastery.lastPracticed ? new Date(mastery.lastPracticed).getTime() : 0;
    const daysSincePracticed = lastPracticedMs > 0 ? (now - lastPracticedMs) / (1000 * 60 * 60 * 24) : 999;
    const intervalDays = getSRSIntervalDays(rawScore);
    const daysOverdue = daysSincePracticed - intervalDays;

    const reasons = [];
    if (effectiveScore < rawScore) {
      const drop = rawScore - effectiveScore;
      reasons.push(`⏳ Time Decay (-${drop} pts since last practice)`);
    }
    if (rawScore < 40) {
      reasons.push("🚨 Basic Tier (< 40 Mastery Score)");
    } else if (rawScore < 70) {
      reasons.push("⚠️ Intermediate Tier Needs Strengthening");
    }
    if (accuracy < 60 && totalAttempted >= 3) {
      reasons.push(`❌ Low Accuracy (${accuracy}% rolling average)`);
    }
    if (daysOverdue >= 0 && daysSincePracticed < 900) {
      reasons.push(`📅 Overdue SRS Review (${Math.floor(daysSincePracticed)} days ago)`);
    }

    const isDue = effectiveScore < rawScore || rawScore < 70 || accuracy < 60 || daysOverdue >= 0;

    let priority = 0;
    if (effectiveScore < rawScore) priority += (rawScore - effectiveScore) * 3;
    if (rawScore < 40) priority += 50;
    else if (rawScore < 70) priority += 25;
    if (accuracy < 60) priority += (100 - accuracy) * 0.5;
    if (daysOverdue > 0) priority += Math.min(daysOverdue * 2, 30);

    candidateSkills.push({
      skill,
      title: skill.title || "Practice Skill",
      generatorPath: skill.generatorPath,
      rawScore,
      effectiveScore,
      accuracy,
      totalAttempted,
      lastPracticed: mastery.lastPracticed,
      daysSincePracticed: Math.floor(daysSincePracticed),
      reasons: reasons.length > 0 ? reasons : ["🔄 Routine Mastery Maintenance"],
      primaryReason: reasons[0] || "🔄 Routine Mastery Maintenance",
      isDue,
      priority
    });
  });

  candidateSkills.sort((a, b) => b.priority - a.priority);
  return candidateSkills.slice(0, questionCount);
}

export function getSRSMetrics() {
  const dueQueue = getSmartReviewQueue({ questionCount: 100, includePriorYears: true });
  return {
    totalDue: dueQueue.filter(s => s.isDue).length
  };
}
