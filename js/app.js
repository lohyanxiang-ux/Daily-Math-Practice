import { fetchUserData } from "./services/backend.js";
import { registry } from "./questions/registry.js";

let currentQuestion = null;
let currentProfile = null;

/**
 * Handshake function connected to the window callback in index.html
 */
window.processGoogleSignIn = async (response) => {
  const statusEl = document.getElementById("auth-status");
  statusEl.innerText = "Loading profile from Google Sheets...";
  
  // Safely extract token string
  const token = (typeof response === "string") ? response : (response && response.credential);

  if (!token) {
    statusEl.innerText = "Error: Failed to read token from Google response.";
    console.error("Received unexpected response object:", response);
    return;
  }

  try {
    const res = await fetchUserData(token);
    
    if (res.status === "success") {
      currentProfile = res.profile;
      renderProfile(res.profile);
      
      // Hide sign-in card and display application dashboard
      document.getElementById("auth-card").style.display = "none";
      document.getElementById("app-container").style.display = "block";

      // Load initial practice question from returned active curriculum
      if (res.curriculum && res.curriculum.length > 0) {
        loadNewQuestion(res.curriculum[0].skillId);
      } else {
        document.getElementById("question-prompt").innerText = "No active curriculum assigned.";
      }
    } else {
      // Handles whitelist rejection or inactive account errors sent from Code.gs
      statusEl.innerText = "Error: " + res.message;
    }
  } catch (err) {
    statusEl.innerText = "Network Error: " + err.message;
  }
};

// Immediately process any sign-in that completed before app.js finished loading
if (window.pendingGoogleResponse) {
  window.processGoogleSignIn(window.pendingGoogleResponse);
  window.pendingGoogleResponse = null;
}

/**
 * Render user information on header bar
 */
function renderProfile(profile) {
  document.getElementById("profile-name").innerText = profile.displayName;
  document.getElementById("profile-meta").innerText = `${profile.class} - ${profile.year} (${profile.stream})`;
  document.getElementById("profile-xp").innerText = profile.xp;
  document.getElementById("profile-streak").innerText = profile.streakCount;
}

/**
 * Fetch and display a math question based on SkillID
 */
function loadNewQuestion(skillId) {
  currentQuestion = registry.generateQuestion(skillId, "basic");
  if (currentQuestion) {
    document.getElementById("skill-strand").innerText = currentQuestion.strand || "Algebra";
    document.getElementById("skill-title").innerText = skillId;
    document.getElementById("question-prompt").innerText = currentQuestion.prompt;
    document.getElementById("student-answer").value = "";
    document.getElementById("feedback").innerText = "";
  }
}

/**
 * Handle answer submission
 */
document.getElementById("submit-btn").addEventListener("click", () => {
  if (!currentQuestion) return;
  const ans = document.getElementById("student-answer").value.replace(/\s+/g, '').toLowerCase();
  const expected = String(currentQuestion.expectedAnswer).replace(/\s+/g, '').toLowerCase();

  if (ans === expected) {
    document.getElementById("feedback").innerHTML = "<span style='color:green;'>Correct! 🎉 +10 XP</span>";
    currentProfile.xp += 10;
    document.getElementById("profile-xp").innerText = currentProfile.xp;
  } else {
    document.getElementById("feedback").innerHTML = `<span style='color:red;'>Incorrect. Expected: ${currentQuestion.expectedAnswer}</span>`;
  }
});

/**
 * Handle next question request
 */
document.getElementById("next-btn").addEventListener("click", () => {
  if (currentQuestion) {
    loadNewQuestion(currentQuestion.skillId);
  }
});
