import { state, addXP } from "../state.js";
import { registry } from "../questions/registry.js";
import { navigateTo } from "../router.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";
import { renderMath } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";

export function renderDailyPractice(container) {
  let questionIndex = 0;
  const totalQuestions = state.dailySession.targetQuestions;
  let sessionScore = 0;
  let currentQuestion = null;
  let activeAnswer = "";
  let currentHintStep = 0;

  const activeSkillId = (state.curriculum && state.curriculum.length > 0)
    ? state.curriculum[0].skillId
    : "sec2_g3_alg_quad";

  function loadQuestion() {
    if (questionIndex >= totalQuestions) {
      renderSummary();
      return;
    }

    currentQuestion = registry.generateQuestion(activeSkillId, "basic");
    currentHintStep = 0;

    container.innerHTML = `
      <div class="practice-grid-3col">
        <!-- COLUMN 1: QUESTION, HINTS, & SOLUTION REVIEW -->
        <div class="practice-col col-scrollable">
          <div class="question-header">
            <button id="btn-exit-dashboard" class="secondary-btn">← Dashboard</button>
            <span class="step-indicator">Q${questionIndex + 1} of ${totalQuestions}</span>
          </div>

          <div class="skill-header">
            <span class="tag">${currentQuestion ? currentQuestion.strand : 'Algebra'}</span>
            <h4 style="margin-top: 6px; color: var(--text-muted);">${currentQuestion.skillTitle || activeSkillId}</h4>
          </div>

          <div id="question-prompt" class="math-display">
            ${currentQuestion ? currentQuestion.prompt : 'Loading question...'}
          </div>

          <!-- HINTS SECTION -->
          <div class="hints-wrapper">
            <div class="hints-header">
              <button id="btn-ask-hint" class="hint-btn">💡 Ask for Hint (<span id="hint-count">0</span>/${currentQuestion.steps ? currentQuestion.steps.length : 0})</button>
            </div>
            <div id="hints-container" class="hints-list"></div>
          </div>

          <!-- FEEDBACK & FULL SOLUTION REVIEW -->
          <div id="daily-feedback" class="feedback-area"></div>
          <div id="full-solution-container" class="solution-box" style="display: none;"></div>
        </div>

        <!-- COLUMN 2: APPLE PENCIL SCRATCHPAD -->
        <div class="practice-col">
          <div class="scratchpad-toolbar">
            <span style="font-weight: 700; font-size: 0.95rem;">✏️ Working Area</span>
            <button id="btn-clear-canvas" class="secondary-btn" style="font-size: 0.8rem;">Clear Workspace</button>
          </div>
          <div class="canvas-wrapper">
            <canvas id="scratchpad-canvas"></canvas>
          </div>
        </div>

        <!-- COLUMN 3: DYNAMIC FLEXIBLE KEYPAD -->
        <div class="practice-col">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;">Enter Answer</div>
          <div id="keypad-display" class="answer-display-box"></div>
          <div class="keypad-grid"></div>
        </div>
      </div>
    `;

    // Render KaTeX Math in question prompt
    renderMath(container.querySelector("#question-prompt"));

    // Initialize Canvas Scratchpad & Keypad
    initScratchpad(container);
    initKeypad(
      container,
      currentQuestion.keypad,
      (val) => { activeAnswer = val; },
      (val) => { handleSubmission(val); }
    );

    // Event Listener for Progressive Hints
    const hintBtn = container.querySelector("#btn-ask-hint");
    const hintsContainer = container.querySelector("#hints-container");
    const hintCountEl = container.querySelector("#hint-count");

    hintBtn.addEventListener("click", () => {
      if (!currentQuestion.steps || currentHintStep >= currentQuestion.steps.length) return;

      const stepText = currentQuestion.steps[currentHintStep];
      currentHintStep++;
      hintCountEl.innerText = currentHintStep;

      const hintCard = document.createElement("div");
      hintCard.className = "hint-card";
      hintCard.innerHTML = `<strong>Step ${currentHintStep}:</strong> <div>${stepText}</div>`;
      hintsContainer.appendChild(hintCard);

      // Render KaTeX for newly revealed hint
      renderMath(hintCard);

      if (currentHintStep >= currentQuestion.steps.length) {
        hintBtn.disabled = true;
        hintBtn.innerText = "All Hints Revealed";
      }
    });

    document.getElementById("btn-exit-dashboard").addEventListener("click", () => {
      navigateTo("dashboard");
    });
  }

  function handleSubmission(userAns) {
    if (!currentQuestion) return;

    const feedbackEl = document.getElementById("daily-feedback");
    const solutionBox = document.getElementById("full-solution-container");
    
    // Perform Algebraic Equivalence Check
    const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer);

    if (isCorrect) {
      sessionScore++;
      addXP(10);
      feedbackEl.style.background = "#d1fae5";
      feedbackEl.style.color = "#065f46";
      feedbackEl.innerText = "Correct! 🎉 +10 XP";
    } else {
      feedbackEl.style.background = "#fee2e2";
      feedbackEl.style.color = "#991b1b";
      feedbackEl.innerText = `Incorrect. Expected: ${currentQuestion.expectedAnswer}`;
    }

    // Display Full Step-by-Step Solution Review
    if (currentQuestion.steps && currentQuestion.steps.length > 0) {
      solutionBox.style.display = "block";
      solutionBox.innerHTML = `
        <h4 style="margin-bottom: 8px;">📖 Full Solution Review:</h4>
        <ol style="padding-left: 20px;">
          ${currentQuestion.steps.map(step => `<li style="margin-bottom: 6px;">${step}</li>`).join("")}
        </ol>
      `;
      renderMath(solutionBox);
    }

    setTimeout(() => {
      questionIndex++;
      loadQuestion();
    }, 4000); // 4-second review pause before loading next question
  }

  function renderSummary() {
    state.dailySession.completedToday = Math.max(state.dailySession.completedToday, totalQuestions);
    const bonusXP = sessionScore === totalQuestions ? 20 : 0;
    if (bonusXP > 0) addXP(bonusXP);

    container.innerHTML = `
      <div class="practice-col" style="justify-content: center; align-items: center; text-align: center; padding: 3rem;">
        <h2 style="font-size: 2rem;">🎉 Daily Quest Completed!</h2>
        <p style="font-size: 1.2rem; color: var(--text-muted); margin: 12px 0;">
          Final Score: <strong>${sessionScore} / ${totalQuestions}</strong>
        </p>
        <div style="font-size: 1.1rem; margin-bottom: 24px;">
          Total XP Earned: <strong style="color: var(--primary);">+${(sessionScore * 10) + bonusXP} XP</strong>
        </div>
        <button id="btn-return-dash" class="keypad-btn submit" style="padding: 14px 28px; font-size: 1.1rem;">Return to Dashboard</button>
      </div>
    `;

    document.getElementById("btn-return-dash").addEventListener("click", () => {
      navigateTo("dashboard");
    });
  }

  loadQuestion();
}
