import { fetchUserData, loginWithPin } from "./services/backend.js";
import { updateState, resetState, state } from "./state.js";
import { navigateTo } from "./router.js";

// 1. PIN Keypad Global Window Handlers
window.appendPin = function(digit) {
  const pinInput = document.getElementById("student-pin-input");
  if (pinInput && pinInput.value.length < 4) {
    pinInput.value += digit;
  }
};

window.clearPin = function() {
  const pinInput = document.getElementById("student-pin-input");
  if (pinInput) pinInput.value = "";
};

window.backspacePin = function() {
  const pinInput = document.getElementById("student-pin-input");
  if (pinInput) pinInput.value = pinInput.value.slice(0, -1);
};

// 2. Role Tab Switcher Global Window Handler
window.switchAuthTab = function(mode) {
  const tabStudent = document.getElementById("tab-student-mode");
  const tabTeacher = document.getElementById("tab-teacher-mode");
  const studentSec = document.getElementById("student-login-section");
  const teacherSec = document.getElementById("teacher-login-section");
  const statusEl = document.getElementById("auth-status");

  if (statusEl) statusEl.innerText = "";

  if (mode === "student") {
    if (tabStudent) {
      tabStudent.style.background = "#ffffff";
      tabStudent.style.color = "#0f172a";
      tabStudent.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
    }
    if (tabTeacher) {
      tabTeacher.style.background = "transparent";
      tabTeacher.style.color = "#64748b";
      tabTeacher.style.boxShadow = "none";
    }
    if (studentSec) studentSec.style.display = "block";
    if (teacherSec) teacherSec.style.display = "none";
  } else if (mode === "teacher") {
    if (tabTeacher) {
      tabTeacher.style.background = "#ffffff";
      tabTeacher.style.color = "#0f172a";
      tabTeacher.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
    }
    if (tabStudent) {
      tabStudent.style.background = "transparent";
      tabStudent.style.color = "#64748b";
      tabStudent.style.boxShadow = "none";
    }
    if (teacherSec) teacherSec.style.display = "block";
    if (studentSec) studentSec.style.display = "none";
  }
};

// 3. Student PIN Login Submission Handler
window.submitStudentPin = async function() {
  const pinInput = document.getElementById("student-pin-input");
  const statusEl = document.getElementById("auth-status");
  if (!pinInput) return;

  const pin = pinInput.value.trim();
  if (pin.length !== 4) {
    if (statusEl) statusEl.innerText = "Please enter your 4-digit PIN.";
    return;
  }

  if (statusEl) statusEl.innerText = "Verifying PIN...";

  try {
    const res = await loginWithPin(pin);
    handleLoginSuccess(res);
  } catch (err) {
    if (statusEl) statusEl.innerText = "Sign in error: " + err.message;
  }
};

// 4. Global App Logout Handler
window.handleLogoutApp = function() {
  resetState();

  const authCard = document.getElementById("auth-card");
  const appContainer = document.getElementById("app-container");
  const pinInput = document.getElementById("student-pin-input");
  const statusEl = document.getElementById("auth-status");
  const viewport = document.getElementById("app-viewport");

  if (appContainer) appContainer.style.display = "none";
  if (authCard) authCard.style.display = "block";
  if (pinInput) pinInput.value = "";
  if (statusEl) statusEl.innerText = "";
  if (viewport) viewport.innerHTML = "";

  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.disableAutoSelect();
  }
};

// 5. Google OAuth Callback Handler (Teachers)
window.processGoogleSignIn = async (response) => {
  const statusEl = document.getElementById("auth-status");
  if (statusEl) statusEl.innerText = "Authenticating Google account...";
  
  const token = (typeof response === "string") ? response : (response && response.credential);

  if (!token) {
    if (statusEl) statusEl.innerText = "Error: Failed to read token from Google response.";
    return;
  }

  try {
    const res = await fetchUserData(token);
    handleLoginSuccess(res);
  } catch (err) {
    if (statusEl) statusEl.innerText = "Network Error: " + err.message;
  }
};

if (window.pendingGoogleResponse) {
  window.processGoogleSignIn(window.pendingGoogleResponse);
  window.pendingGoogleResponse = null;
}

function handleLoginSuccess(res) {
  const statusEl = document.getElementById("auth-status");

  if (res.status === "success") {
    updateState(res);
    renderTopNav(res.profile);

    const authCard = document.getElementById("auth-card");
    const appContainer = document.getElementById("app-container");
    if (authCard) authCard.style.display = "none";
    if (appContainer) appContainer.style.display = "block";

    if (res.profile && (res.profile.role === "teacher" || res.profile.role === "admin")) {
      navigateTo("teacherDashboard");
    } else {
      navigateTo("dashboard");
    }
  } else {
    if (statusEl) statusEl.innerText = "Error: " + res.message;
  }
}

export function renderTopNav(profile = state.profile) {
  if (!profile) return;
  const nameEl = document.getElementById("nav-profile-name");
  const metaEl = document.getElementById("nav-profile-meta");
  const xpEl = document.getElementById("nav-profile-xp");
  const streakEl = document.getElementById("nav-profile-streak");

  if (nameEl) nameEl.innerText = profile.displayName || "User";
  if (metaEl) {
    if (profile.role === "teacher" || profile.role === "admin") {
      metaEl.innerText = `Teacher • ${profile.displayName || 'Staff'}`;
    } else {
      metaEl.innerText = `${profile.class || ''} - ${profile.year || ''} (${profile.stream || ''})`;
    }
  }
  if (xpEl) xpEl.innerText = profile.xp || 0;
  if (streakEl) streakEl.innerText = profile.streakCount || 0;
}

window.renderTopNav = renderTopNav;
