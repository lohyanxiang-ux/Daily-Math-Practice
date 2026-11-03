export const state = {
  profile: null,
  curriculum: [],
  config: {},
  dailySession: {
    targetQuestions: 5,
    completedToday: 0,
    currentScore: 0
  }
};

export function updateState(key, value) {
  state[key] = value;
}

export function addXP(amount) {
  if (state.profile) {
    state.profile.xp += amount;
    const xpEl = document.getElementById("nav-profile-xp");
    if (xpEl) xpEl.innerText = state.profile.xp;
  }
}
