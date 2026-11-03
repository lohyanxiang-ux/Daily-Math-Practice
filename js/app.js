import { fetchUserData, loginWithPin } from "./services/backend.js";
import { updateState } from "./state.js";
import { navigateTo } from "./router.js";

// Google OAuth Callback (Teachers)
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

    // Route to Teacher Dashboard or Student Dashboard based on role
    if (res.profile && (res.profile.role === "teacher" || res.profile.role === "admin")) {
      navigateTo("teacherDashboard");
    } else {
      navigateTo("dashboard");
    }
  } else {
    if (statusEl) statusEl.innerText = "Error: " + res.message;
  }
}

function renderTopNav(profile) {
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

// UI EVENT LISTENERS FOR TAB TOGGLE & PIN KEYPAD
document.addEventListener("DOMContentLoaded", () => {
  const tabStudent = document.getElementById("tab-student-mode");
  const tabTeacher = document.getElementById("tab-teacher-mode");
  const studentSec = document.getElementById("student-login-section");
  const teacherSec = document.getElementById("teacher-login-section");
  const statusEl = document.getElementById("auth-status");

  const emailInput = document.getElementById("student-email-input");
  const pinInput = document.getElementById("student-pin-input");
  const btnSubmitPin = document.getElementById("btn-submit-pin");

  // Tab Toggle Logic
  if (tabStudent && tabTeacher) {
    tabStudent.addEventListener("click", () => {
      tabStudent.style.background = "#ffffff";
      tabStudent.style.color = "#0f172a";
      tabStudent.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
      
      tabTeacher.style.background = "transparent";
      tabTeacher.style.color = "#64748b";
      tabTeacher.style.boxShadow = "none";

      studentSec.style.display = "block";
      teacherSec.style.display = "none";
      if (statusEl) statusEl.innerText = "";
    });

    tabTeacher.addEventListener("click", () => {
      tabTeacher.style.background = "#ffffff";
      tabTeacher.style.color = "#0f172a";
      tabTeacher.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
      
      tabStudent.style.background = "transparent";
      tabStudent.style.color = "#64748b";
      tabStudent.style.boxShadow = "none";

      teacherSec.style.display = "block";
      studentSec.style.display = "none";
      if (statusEl) statusEl.innerText = "";
    });
  }

  // Keypad Button Clicks
  document.querySelectorAll(".keypad-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-val");
      let currentPin = pinInput.value;

      if (val === "clear") {
        pinInput.value = "";
      } else if (val === "backspace") {
        pinInput.value = currentPin.slice(0, -1);
      } else if (currentPin.length < 4) {
        pinInput.value = currentPin + val;
      }
    });
  });

  // Submit PIN
  if (btnSubmitPin) {
    btnSubmitPin.addEventListener("click", async () => {
      const email = emailInput.value.trim().toLowerCase();
      const pin = pinInput.value.trim();

      if (!email) {
        if (statusEl) statusEl.innerText = "Please enter your school email address.";
        return;
      }
      if (pin.length !== 4) {
        if (statusEl) statusEl.innerText = "Please enter your 4-digit PIN.";
        return;
      }

      if (statusEl) statusEl.innerText = "Verifying PIN...";

      try {
        const res = await loginWithPin(email, pin);
        handleLoginSuccess(res);
      } catch (err) {
        if (statusEl) statusEl.innerText = "Sign in error: " + err.message;
      }
    });
  }
});
