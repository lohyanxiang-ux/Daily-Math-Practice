import { fetchUserData } from "./services/backend.js";
import { state, updateState } from "./state.js";
import { navigateTo } from "./router.js";

window.processGoogleSignIn = async (response) => {
  const statusEl = document.getElementById("auth-status");
  statusEl.innerText = "Loading profile from Google Sheets...";
  
  const token = (typeof response === "string") ? response : (response && response.credential);

  if (!token) {
    statusEl.innerText = "Error: Failed to read token from Google response.";
    return;
  }

  try {
    const res = await fetchUserData(token);
    
    if (res.status === "success") {
      updateState("profile", res.profile);
      updateState("curriculum", res.curriculum || []);
      updateState("config", res.config || {});

      renderTopNav(res.profile);
      
      document.getElementById("auth-card").style.display = "none";
      document.getElementById("app-container").style.display = "block";

      // Launch Dashboard View
      navigateTo("dashboard");
    } else {
      statusEl.innerText = "Error: " + res.message;
    }
  } catch (err) {
    statusEl.innerText = "Network Error: " + err.message;
  }
};

if (window.pendingGoogleResponse) {
  window.processGoogleSignIn(window.pendingGoogleResponse);
  window.pendingGoogleResponse = null;
}

function renderTopNav(profile) {
  document.getElementById("nav-profile-name").innerText = profile.displayName;
  document.getElementById("nav-profile-meta").innerText = `${profile.class} - ${profile.year} (${profile.stream})`;
  document.getElementById("nav-profile-xp").innerText = profile.xp;
  document.getElementById("nav-profile-streak").innerText = profile.streakCount;
}
