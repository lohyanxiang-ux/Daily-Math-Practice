import { calculateNextScore, getDecayedScore } from "./utils/masteryScoreEngine.js";

// Master System Configuration & Feature Flags
export const CONFIG = {
  ENABLE_GEMS: true,   // Set to false to isolate and disable all Gem features safely
  XP_PER_GEM: 100
};

export const state = {
  userToken: null,
  profile: {
    displayName: "Student",
    year: "Sec 1",
    stream: "G3",
    role: "student",
    xp: 0,
    streakCount: 0,
    gems: 0,
    unlockedThemes: ["default"],
    activeTheme: "default"
  },
  curriculum: [],
  mastery: {}, // Keyed by generatorPath
  skillTags: {}, // Class skill tag mappings for logged-in student
  shopItems: [],
  redemptions: [],
  teacherData: {
    students: [],
    classMastery: {},
    classSkillTags: {},
    pendingRedemptions: []
  },
  pendingMasteryUpdates: new Set(),
  dailySession: {
    targetQuestions: 5,
    completedToday: 0
  }
};

if (typeof window !== "undefined") {
  window.state = state;
  window.CONFIG = CONFIG;
}

export function resetState() {
  state.userToken = null;
  state.profile = {
    displayName: "Student",
    year: "Sec 1",
    stream: "G3",
    role: "student",
    xp: 0,
    streakCount: 0,
    gems: 0,
    unlockedThemes: ["default"],
    activeTheme: "default"
  };
  state.curriculum = [];
  state.mastery = {};
  state.skillTags = {};
  state.shopItems = [];
  state.redemptions = [];
  state.teacherData = { students: [], classMastery: {}, classSkillTags: {}, pendingRedemptions: [] };
  state.pendingMasteryUpdates.clear();
  state.dailySession = { targetQuestions: 5, completedToday: 0 };
}

export function setStateData(payload) {
  if (!payload) return;
  if (payload.profile) {
    state.profile = {
      ...state.profile,
      ...payload.profile,
      gems: payload.profile.gems !== undefined ? payload.profile.gems : (state.profile.gems || 0),
      unlockedThemes: payload.profile.unlockedThemes || state.profile.unlockedThemes || ["default"],
      activeTheme: payload.profile.activeTheme || state.profile.activeTheme || "default"
    };
  }

  if (payload.curriculum) state.curriculum = payload.curriculum;
  if (payload.shopItems) state.shopItems = payload.shopItems;
  if (payload.redemptions) state.redemptions = payload.redemptions;
  
  if (payload.skillTags && typeof payload.skillTags === "object") {
    state.skillTags = { ...payload.skillTags };
  }
  
  if (payload.teacherData) state.teacherData = payload.teacherData;
  
  if (payload.mastery) {
    state.mastery = {};
    Object.keys(payload.mastery).forEach(path => {
      const item = payload.mastery[path];
      let rawScore = item.score !== undefined ? item.score : 0;
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

  // Dynamically apply current theme if enabled
  if (CONFIG.ENABLE_GEMS && state.profile.activeTheme && typeof document !== "undefined") {
    document.body.className = state.profile.activeTheme !== "default" ? state.profile.activeTheme : "";
  }
}

export const updateState = setStateData;

/**
 * Increments XP and checks for 100-XP Gem Milestone Crossings.
 */
export function addXP(amount) {
  if (!state.profile) return;

  const oldXP = Number(state.profile.xp) || 0;
  const newXP = oldXP + amount;
  state.profile.xp = newXP;

  const xpEl = document.getElementById("nav-profile-xp");
  if (xpEl) xpEl.innerText = state.profile.xp;

  // Gracefully skip Gem calculation if feature flag is disabled
  if (!CONFIG.ENABLE_GEMS) return;

  const oldGemsFromXP = Math.floor(oldXP / CONFIG.XP_PER_GEM);
  const newGemsFromXP = Math.floor(newXP / CONFIG.XP_PER_GEM);
  const gemsEarned = newGemsFromXP - oldGemsFromXP;

  if (gemsEarned > 0) {
    state.profile.gems = (Number(state.profile.gems) || 0) + gemsEarned;
    
    const gemNavEl = document.getElementById("nav-profile-gems");
    if (gemNavEl) gemNavEl.innerText = state.profile.gems;

    if (typeof window.showGemEarnedToast === "function") {
      window.showGemEarnedToast(gemsEarned);
    }
  }
}

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

  skillData.rollingHistory.push({ correct: isCorrect, hints: hintsUsed, timestamp: Date.now() });
  if (skillData.rollingHistory.length > 10) skillData.rollingHistory.shift();

  const totalRolling = skillData.rollingHistory.length;
  const correctRolling = skillData.rollingHistory.filter(h => h.correct).length;
  skillData.accuracy = totalRolling > 0 ? Math.round((correctRolling / totalRolling) * 100) : 0;

  const isDecayed = (skillData.effectiveScore || skillData.score) < skillData.score;
  const nextScore = calculateNextScore(skillData.score, isCorrect, hintsUsed, maxHints, isDecayed);
  skillData.score = nextScore;
  skillData.effectiveScore = nextScore;
  skillData.lastPracticed = new Date().toISOString();

  state.mastery[generatorPath] = skillData;
  state.pendingMasteryUpdates.add(generatorPath);
}
