import { fetchUserData } from "./services/backend.js";
import { registry } from "./questions/registry.js";

const GOOGLE_CLIENT_ID = "874463235708-a7ep34l9ecn43mqvj4nkknn44js6halc.apps.googleusercontent.com";

let currentQuestion = null;
let currentProfile = null;

// Reliable SDK loader (handles fast page loads & cached scripts)
function initGoogleSignIn() {
  const container = document.getElementById("google-btn-container");
  
  if (window.google && window.google.accounts && container) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      width: 250
    });
  } else {
    // Retry every 100ms until Google SDK is ready in memory
    setTimeout(initGoogleSignIn, 100);
  }
}

// Start initialization check immediately
if (document.readyState === "complete" || document.readyState === "interactive") {
  initGoogleSignIn();
} else {
  window.addEventListener("DOMContentLoaded", initGoogleSignIn);
}

async function handleCredentialResponse(response) {
  document.getElementById("auth-status").innerText = "Loading profile from Google Sheets...";
  
  try {
    const res = await fetchUserData(response.credential);
    if (res.status === "success") {
      currentProfile = res.profile;
      renderProfile(res.profile);
      
      document.getElementById("auth-card").style.display = "none";
      document.getElementById("app-container").style.display = "block";

      if (res.curriculum && res.curriculum.length > 0) {
        loadNewQuestion(res.curriculum[0].skillId);
      }
    } else {
      document.getElementById("auth-status").innerText = "Error: " + res.message;
    }
  } catch (err) {
    document.getElementById("auth-status").innerText = "Network Error: " + err;
  }
}

function renderProfile(profile) {
  document.getElementById("profile-name").innerText = profile.displayName;
  document.getElementById("profile-meta").innerText = `${profile.class} - ${profile.year} (${profile.stream})`;
  document.getElementById("profile-xp").innerText = profile.xp;
  document.getElementById("profile-streak").innerText = profile.streakCount;
}

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

document.getElementById("submit-btn").addEventListener("click", () => {
  if (!currentQuestion) return;
  const ans = document.getElementById("student-answer").value.replace(/\s+/g, '').toLowerCase();
  const expected = currentQuestion.expectedAnswer.replace(/\s+/g, '').toLowerCase();

  if (ans === expected) {
    document.getElementById("feedback").innerHTML = "<span style='color:green;'>Correct! 🎉 +10 XP</span>";
    currentProfile.xp += 10;
    document.getElementById("profile-xp").innerText = currentProfile.xp;
  } else {
    document.getElementById("feedback").innerHTML = `<span style='color:red;'>Incorrect. Expected: ${currentQuestion.expectedAnswer}</span>`;
  }
});

document.getElementById("next-btn").addEventListener("click", () => {
  if (currentQuestion) {
    loadNewQuestion(currentQuestion.skillId);
  }
});
