export const state = {
  userToken: null,
  profile: {
    displayName: "Student",
    year: "Sec 1",
    stream: "G3",
    xp: 0,
    streakCount: 0
  },
  curriculum: [],
  mastery: {}, // Keyed by generatorPath: { stars, accuracy, totalAttempted, totalCorrect, rollingHistory }
  pendingMasteryUpdates: new Set(),
  dailySession: {
    targetQuestions: 5,
    completedToday: 0
  }
};

/**
 * Initializes/updates state from backend payload.
 */
export function setStateData(payload) {
  if (!payload) return;
  if (payload.profile) state.profile = { ...state.profile, ...payload.profile };
  if (payload.curriculum) state.curriculum = payload.curriculum;
  if (payload.mastery) state.mastery = payload.mastery;
  if (payload.token) state.userToken = payload.token;
}

// Export alias so app.js imports work seamlessly
export const updateState = setStateData;

export function addXP(amount) {
  state.profile.xp = (state.profile.xp || 0) + amount;
  const xpEl = document.getElementById("nav-xp-count");
  if (xpEl) xpEl.innerText = state.profile.xp;
}

/**
 * Local-First Question Attempt Recorder.
 */
export function recordQuestionAttempt(generatorPath, isCorrect, hintsUsed = 0) {
  if (!generatorPath) return;

  let skillData = state.mastery[generatorPath] || {
    generatorPath: generatorPath,
    stars: 0,
    accuracy: 0,
    totalAttempted: 0,
    totalCorrect: 0,
    rollingHistory: []
  };

  skillData.totalAttempted += 1;
  if (isCorrect) skillData.totalCorrect += 1;

  // Maintain rolling history of last 10 attempts
  skillData.rollingHistory.push({
    correct: isCorrect,
    hints: hintsUsed,
    timestamp: Date.now()
  });

  if (skillData.rollingHistory.length > 10) {
    skillData.rollingHistory.shift();
  }

  // Calculate rolling accuracy
  const totalRolling = skillData.rollingHistory.length;
  const correctRolling = skillData.rollingHistory.filter(h => h.correct).length;
  skillData.accuracy = totalRolling > 0 ? Math.round((correctRolling / totalRolling) * 100) : 0;

  // Star Calculation Logic
  const hintsInHistory = skillData.rollingHistory.reduce((sum, h) => sum + h.hints, 0);
  const last5 = skillData.rollingHistory.slice(-5);
  const last5Perfect = last5.length === 5 && last5.every(h => h.correct && h.hints === 0);

  if (last5Perfect) {
    skillData.stars = 3;
  } else if (totalRolling >= 5 && skillData.accuracy >= 80 && hintsInHistory <= 1) {
    skillData.stars = Math.max(skillData.stars, 2);
  } else if (totalRolling >= 5 && skillData.accuracy >= 60) {
    skillData.stars = Math.max(skillData.stars, 1);
  }

  state.mastery[generatorPath] = skillData;
  state.pendingMasteryUpdates.add(generatorPath);
}
