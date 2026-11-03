/**
 * Mastery Score Engine
 * Manages 0-100 student progression, dynamic color styling, and SRS decay.
 */

/**
 * Returns Tier Metadata, Badge Color, and Background CSS for a given score
 * @param {number} score - Current Mastery Score (0–100)
 */
export function getMasteryMetadata(score) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));

  if (s < 40) {
    return {
      score: s,
      tier: 1,
      tierName: "Basic",
      color: "#2563eb",       // Blue
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
      badgeCss: "background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;"
    };
  } else if (s < 70) {
    return {
      score: s,
      tier: 2,
      tierName: "Intermediate",
      color: "#d97706",       // Amber
      bgColor: "#fffbeb",
      borderColor: "#fde68a",
      badgeCss: "background: #fffbeb; color: #d97706; border: 1px solid #fde68a;"
    };
  } else if (s < 90) {
    return {
      score: s,
      tier: 3,
      tierName: "Advanced",
      color: "#7c3aed",       // Purple
      bgColor: "#f5f3ff",
      borderColor: "#ddd6fe",
      badgeCss: "background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe;"
    };
  } else {
    return {
      score: s,
      tier: 3,
      tierName: "Mastered",
      color: "#059669",       // Emerald Green
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
      badgeCss: "background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;"
    };
  }
}

/**
 * Calculates updated Mastery Score following a question attempt
 * 
 * @param {number} currentScore - Stored score (0–100)
 * @param {boolean} isCorrect - Attempt outcome
 * @param {number} hintsUsed - Hints requested by student
 * @param {number} maxHints - Total hints available in question
 * @param {boolean} isDecayed - Whether skill score is currently in time-decayed state
 */
export function calculateNextScore(currentScore = 0, isCorrect, hintsUsed = 0, maxHints = 3, isDecayed = false) {
  let score = Math.max(0, Math.min(100, currentScore));
  const meta = getMasteryMetadata(score);

  // ALL HINTS REVEALED: Neutral result (0 score change)
  if (hintsUsed >= maxHints && maxHints > 0) {
    return score;
  }

  if (isCorrect) {
    let baseGain = 10;
    if (score >= 90) baseGain = 4;
    else if (score >= 70) baseGain = 6;
    else if (score >= 40) baseGain = 8;

    // Hint Multipliers: 0 hints = 100% | 1 hint = 75% | 2 hints = 40%
    let hintMultiplier = 1.0;
    if (hintsUsed === 1) hintMultiplier = 0.75;
    else if (hintsUsed === 2) hintMultiplier = 0.40;

    // Recovery bonus for decayed skills
    const recoveryMultiplier = isDecayed ? 1.5 : 1.0;

    const delta = Math.round(baseGain * hintMultiplier * recoveryMultiplier);
    score = Math.min(100, score + Math.max(1, delta));
  } else {
    // Gentle Penalties
    let penalty = 2;
    if (score >= 90) penalty = 4;
    else if (score >= 70) penalty = 4;
    else if (score >= 40) penalty = 3;

    // Session Tier Floor Protection (Score will not drop below current unlocked band base)
    const tierFloor = meta.tier === 3 ? (score >= 90 ? 70 : 70) : (meta.tier === 2 ? 40 : 0);
    score = Math.max(tierFloor, score - penalty);
  }

  return score;
}

/**
 * Calculates time-decayed score for forgetting curve / SRS priority
 */
export function getDecayedScore(storedScore = 0, lastAttemptDate, srsIntervalDays = 2) {
  if (!lastAttemptDate) return storedScore;

  const now = new Date();
  const lastDate = new Date(lastAttemptDate);
  const daysElapsed = (now - lastDate) / (1000 * 60 * 60 * 24);
  const daysOverdue = Math.max(0, daysElapsed - srsIntervalDays);

  if (daysOverdue <= 0) return storedScore;

  // Decay 1 point per overdue day, capped at max 15 points lost
  const totalDecay = Math.min(15, Math.floor(daysOverdue * 1.0));
  return Math.max(0, storedScore - totalDecay);
}
