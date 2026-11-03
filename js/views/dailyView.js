import { state, addXP } from "../state.js";
import { registry } from "../questions/registry.js";
import { navigateTo } from "../router.js";

export function renderDailyPractice(container) {
  let questionIndex = 0;
  const totalQuestions = state.dailySession.targetQuestions;
  let sessionScore = 0;
  let currentQuestion = null;

  // Primary active SkillID from curriculum or fallback default
  const activeSkillId = (state.curriculum && state.curriculum.length > 0)
    ? state.curriculum[0].skillId
    : "sec1_g1_alg_linear";

  function loadQuestion() {
    if (questionIndex >= totalQuestions) {
      renderSummary();
      return;
    }

    currentQuestion = registry.generateQuestion(activeSkillId, "basic");

    container.innerHTML = `
      <div class="card practice-box">
        <div class="practice-top">
          <button id="btn-exit" class="secondary-btn">← Back to Dashboard</button>
          <span class="step-indicator">Question ${questionIndex + 1} of ${totalQuestions}</span>
        </div>

        <div class="skill-header">
          <span class="tag">${currentQuestion ? currentQuestion.strand : 'Algebra'}</span>
          <h3>${activeSkillId}</h3>
        </div>

        <div id="question-prompt" class="math-display">
          ${currentQuestion ? currentQuestion.prompt : 'No question available.'}
        </div>

        <div class="answer-section">
          <input type="text" id="daily-answer-input" placeholder="Type your answer..." autofocus>
          <button id="daily-submit-btn">Submit Answer</button>
        </div>

        <div id="daily-feedback" class="feedback"></div>
      </div>
    `;

    document.getElementById("btn-exit").addEventListener("click", () => {
      navigateTo("dashboard");
    });

    const submitBtn = document.getElementById("daily-submit-btn");
    const answerInput = document.getElementById("daily-answer-input");

    const handleSubmission = () => {
      if (!currentQuestion) return;

      const userAns = answerInput.value.replace(/\s+/g, '').toLowerCase();
      const expected = String(currentQuestion.expectedAnswer).replace(/\s+/g, '').toLowerCase();
      const feedbackEl = document.getElementById("daily-feedback");

      if (userAns === expected) {
        sessionScore++;
        addXP(10);
        feedbackEl.innerHTML = "<span style='color:green;'>Correct! 🎉 +10 XP</span>";
      } else {
        feedbackEl.innerHTML = `<span style='color:red;'>Incorrect. Expected: ${currentQuestion.expectedAnswer}</span>`;
      }

      submitBtn.disabled = true;
      answerInput.disabled = true;

      setTimeout(() => {
        questionIndex++;
        loadQuestion();
      }, 1500);
    };

    submitBtn.addEventListener("click", handleSubmission);
    answerInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !submitBtn.disabled) {
        handleSubmission();
      }
    });
  }

  function renderSummary() {
    state.dailySession.completedToday = Math.max(state.dailySession.completedToday, totalQuestions);
    const bonusXP = sessionScore === totalQuestions ? 20 : 0;
    if (bonusXP > 0) addXP(bonusXP);

    container.innerHTML = `
      <div class="card summary-box" style="text-align: center; padding: 2rem;">
        <h2>🎉 Daily Practice Complete!</h2>
        <p style="font-size: 1.2rem; margin: 1rem 0;">
          You scored <strong>${sessionScore} / ${totalQuestions}</strong>
        </p>
        <div style="margin: 1.5rem 0;">
          <p>Earned: <strong>+${sessionScore * 10} XP</strong></p>
          ${bonusXP > 0 ? `<p style="color: gold; font-weight: bold;">⭐ Perfect Score Bonus: +${bonusXP} XP!</p>` : ''}
        </div>
        <button id="btn-return-dashboard" class="action-btn" style="padding: 0.8rem 1.5rem;">Return to Dashboard</button>
      </div>
    `;

    document.getElementById("btn-return-dashboard").addEventListener("click", () => {
      navigateTo("dashboard");
    });
  }

  loadQuestion();
}
