import { calculateNextScore, getDecayedScore } from "./utils/masteryScoreEngine.js";

export const state = {
  userToken: null,
  profile: {
    displayName: "Student",
    year: "Sec 1",
    stream: "G3",
    role: "student",
    xp: 0,
    streakCount: 0
  },
  curriculum: [],
  mastery: {}, // Keyed by generatorPath
  skillTags: {}, // Class skill tag mappings for logged-in student
  teacherData: {
    students: [],
    classMastery: {},
    classSkillTags: {}
  },
  pendingMasteryUpdates: new Set(),
  dailySession: {
    targetQuestions: 5,
    completedToday: 0
  }
};

// Expose state globally for browser console debugging
if (typeof window !== "undefined") {
  window.state = state;
}

/**
 * Resets local state when user logs out.
 */
export function resetState() {
  state.userToken = null;
  state.profile = {
    displayName: "Student",
    year: "Sec 1",
    stream: "G3",
    role: "student",
    xp: 0,
    streakCount: 0
  };
  state.curriculum = [];
  state.mastery = {};
  state.skillTags = {};
  state.teacherData = { students: [], classMastery: {}, classSkillTags: {} };
  state.pendingMasteryUpdates.clear();
  state.dailySession = { targetQuestions: 5, completedToday: 0 };
}

/**
 * Initializes/updates state from backend payload.
 */
export function setStateData(payload) {
  if (!payload) return;
  if (payload.profile) state.profile = { ...state.profile, ...payload.profile };
  if (payload.curriculum) state.curriculum = payload.curriculum;
  if (payload.skillTags) state.skillTags = payload.skillTags; // Store class skill tags
  if (payload.teacherData) state.teacherData = payload.teacherData;
  if (payload.mastery) {
    state.mastery = {};
    // Process mastery map and apply decay / legacy conversions
    Object.keys(payload.mastery).forEach(path => {
      const item = payload.mastery[path];
      let rawScore = item.score !== undefined ? item.score : (item.stars !== undefined ? item.stars : 0);

      // Legacy conversion for old 0–3 star records stored in Sheet
      if (rawScore > 0 && rawScore <= 3 && item.score === undefined) {
        if (rawScore === 1) rawScore = 40;
        else if (rawScore === 2) rawScore = 70;
        else if (rawScore === 3) rawScore = 90;
      }

      // Calculate time-decayed score for SRS
      const effectiveScore = getDecayedScore(rawScore, item.lastPracticed, 2);

      state.mastery[path] = {
        generatorPath: path,
        score: rawScore,
        effectiveScore: effectiveScore,
        accuracy: Number(item.accuracy) || 0,
        totalAttempted: Number(item.totalAttempted) || 0,
        totalCorrect: Number(item.totalCorrect) || 0,
        rollingHistory: item.rollingHistory || [],
        lastPracticed: item.lastPracticed || ""
      };
    });
  }
  if (payload.token) state.userToken = payload.token;
}

// Export alias so app.js imports work seamlessly
export const updateState = setStateData;

export function addXP(amount) {
  state.profile.xp = (state.profile.xp || 0) + amount;
  const xpEl = document.getElementById("nav-profile-xp");
  if (xpEl) xpEl.innerText = state.profile.xp;
}

/**
 * Local-First Question Attempt Recorder using Mastery Score (0–100).
 */
export function recordQuestionAttempt(generatorPath, isCorrect, hintsUsed = 0, maxHints = 3) {
  if (!generatorPath) return;

  let skillData = state.mastery[generatorPath] || {
    generatorPath: generatorPath,
    score: 0,
    accuracy: 0,
    totalAttempted: 0,
    totalCorrect: 0,
    rollingHistory: [],
    lastPracticed: new Date().toISOString()
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

  // Check if score is currently decayed
  const isDecayed = (skillData.effectiveScore || skillData.score) < skillData.score;

  // Calculate new Mastery Score (0–100)
  const nextScore = calculateNextScore(skillData.score, isCorrect, hintsUsed, maxHints, isDecayed);
  skillData.score = nextScore;
  skillData.effectiveScore = nextScore;
  skillData.lastPracticed = new Date().toISOString();

  state.mastery[generatorPath] = skillData;
  state.pendingMasteryUpdates.add(generatorPath);
}
