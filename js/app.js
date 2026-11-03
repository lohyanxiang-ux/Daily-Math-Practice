import { fetchUserData } from "./services/backend.js";
import { updateState } from "./state.js";
import { navigateTo } from "./router.js";

window.processGoogleSignIn = async (response) => {
  const statusEl = document.getElementById("auth-status");
  if (statusEl) statusEl.innerText = "Loading profile from Google Sheets...";
  
  const token = (typeof response === "string") ? response : (response && response.credential);

  if (!token) {
    if (statusEl) statusEl.innerText = "Error: Failed to read token from Google response.";
    return;
  }

  try {
    const res = await fetchUserData(token);
    
    if (res.status === "success") {
      // Passes full payload (profile, curriculum, mastery data, and userToken) into central state
      updateState(res);

      renderTopNav(res.profile);
      
      const authCard = document.getElementById("auth-card");
      const appContainer = document.getElementById("app-container");
      if (authCard) authCard.style.display = "none";
      if (appContainer) appContainer.style.display = "block";

      // Launch Dashboard View
      navigateTo("dashboard");
    } else {
      if (statusEl) statusEl.innerText = "Error: " + res.message;
    }
  } catch (err) {
    if (statusEl) statusEl.innerText = "Network Error: " + err.message;
  }
};

if (window.pendingGoogleResponse) {
  window.processGoogleSignIn(window.pendingGoogleResponse);
  window.pendingGoogleResponse = null;
}

function renderTopNav(profile) {
  const nameEl = document.getElementById("nav-profile-name");
  const metaEl = document.getElementById("nav-profile-meta");
  const xpEl = document.getElementById("nav-profile-xp");
  const streakEl = document.getElementById("nav-profile-streak");

  if (nameEl) nameEl.innerText = profile.displayName || "Student";
  if (metaEl) metaEl.innerText = `${profile.class || ''} - ${profile.year || ''} (${profile.stream || ''})`;
  if (xpEl) xpEl.innerText = profile.xp || 0;
  if (streakEl) streakEl.innerText = profile.streakCount || 0;
}
