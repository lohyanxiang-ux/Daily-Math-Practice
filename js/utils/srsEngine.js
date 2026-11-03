import { state } from "../state.js";

const YEAR_LEVELS = { "Sec 1": 1, "Sec 2": 2, "Sec 3": 3, "Sec 4": 4 };

const SRS_INTERVALS = {
  0: 0,   // 0 Stars: 0 days (due immediately)
  1: 2,   // 1 Star:  2 days
  2: 6,   // 2 Stars: 6 days
  3: 21   // 3 Stars: 21 days
};

/**
 * Builds a prioritized SRS review queue based on user settings.
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

  state.curriculum.forEach(skill => {
    // Stream matching
    if (String(skill.stream).trim() !== studentStreamStr) return;

    // Strand filtering
    if (selectedStrand !== "All" && skill.strand !== selectedStrand) return;

    const skillYearLevel = YEAR_LEVELS[String(skill.year).trim()] || 1;
    const mastery = state.mastery[skill.generatorPath] || { stars: 0, totalAttempted: 0, lastPracticed: "" };

    const isCurrentYear = skillYearLevel === studentYearLevel;
    const isPriorYear = skillYearLevel < studentYearLevel;

    // RULE 1: Current year skills MUST be attempted at least once
    if (isCurrentYear && mastery.totalAttempted < 1) return;

    // RULE 2: Prior year skills included only if student toggles option ON
    if (isPriorYear && (!includePriorYears || mastery.totalAttempted < 1)) return;

    // RULE 3: Future years excluded
    if (skillYearLevel > studentYearLevel) return;

    // Calculate SRS Urgency
    const stars = mastery.stars || 0;
    const intervalDays = SRS_INTERVALS[stars] || 0;
    const lastPracticedMs = mastery.lastPracticed ? new Date(mastery.lastPracticed).getTime() : 0;
    const daysSincePracticed = lastPracticedMs > 0 ? (now - lastPracticedMs) / (1000 * 60 * 60 * 24) : 999;
    const daysOverdue = daysSincePracticed - intervalDays;

    candidateSkills.push({
      ...skill,
      stars,
      daysOverdue,
      isDue: daysOverdue >= 0
    });
  });

  // Sort queue: Overdue items first (highest overdue score), then lowest stars
  candidateSkills.sort((a, b) => {
    if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
    if (Math.abs(a.daysOverdue - b.daysOverdue) > 0.1) return b.daysOverdue - a.daysOverdue;
    return a.stars - b.stars;
  });

  // Pick target number of questions
  return candidateSkills.slice(0, questionCount);
}

/**
 * Returns summary metrics for the Dashboard badge.
 */
export function getSRSMetrics() {
  const dueQueue = getSmartReviewQueue({ questionCount: 100, includePriorYears: true });
  return {
    totalDue: dueQueue.filter(s => s.isDue).length
  };
}
