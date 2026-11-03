import { fetchUserData } from "./services/backend.js";
import { registry } from "./questions/registry.js";

let currentQuestion = null;
let currentProfile = null;

// Explicitly attach to window so the Google HTML SDK can find it
window.handleCredentialResponse = async (response) => {
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
};

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
