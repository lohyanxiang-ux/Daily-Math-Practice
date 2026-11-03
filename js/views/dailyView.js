import { state, addXP } from "../state.js";
import { loadAndGenerateQuestion } from "../questions/loader.js";
import { syncUserProgress } from "../services/backend.js";
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
  let currentSkillTitle = "";

  /**
   * Auto-selects a skill from state.curriculum matching student's Year & Stream
   * and dynamically loads its question generator JS file.
   */
  async function fetchNextQuestion() {
    if (!state.curriculum || state.curriculum.length === 0) {
      console.warn("No active curriculum loaded.");
      return null;
    }

    const studentYear = state.profile ? String(state.profile.year).trim() : "";
    const studentStream = state.profile ? String(state.profile.stream).trim() : "";

    // Filter curriculum matching student's Year & Stream
    const matchingSkills = state.curriculum.filter(s => 
      String(s.year).trim() === studentYear &&
      String(s.stream).trim() === studentStream
    );

    // Pick a matching skill or fallback to first item
    const selectedSkill = matchingSkills.length > 0 
      ? matchingSkills[Math.floor(Math.random() * matchingSkills.length)]
      : state.curriculum[0];

    currentSkillTitle = selectedSkill.title || "Math Practice";

    // Dynamically import generator script via Col F path (e.g. "algebra/quadraticFactorisation.js")
    return await loadAndGenerateQuestion(selectedSkill.generatorPath);
  }

  async function loadQuestion() {
    if (questionIndex >= totalQuestions) {
      renderSummary();
      return;
    }

    // Display loading state while dynamic module imports
    container.innerHTML = `
      <div class="practice-col" style="justify-content: center; align-items: center; height: 100%;">
        <h3>Loading Question ${questionIndex + 1}...</h3>
      </div>
    `;

    currentQuestion = await fetchNextQuestion();
    currentHintStep = 0;

    if (!currentQuestion) {
      container.innerHTML = `
        <div class="practice-col" style="justify-content: center; align-items: center; height: 100%;">
          <h3>Unable to load question template.</h3>
          <button id="btn-exit-err" class="secondary-btn" style="margin-top: 12px;">Back to Dashboard</button>
        </div>
      `;
      container.querySelector("#btn-exit-err").addEventListener("click", () => navigateTo("dashboard"));
      return;
    }

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
            <h4 style="margin-top: 6px; color: var(--text-muted);">${currentSkillTitle}</h4>
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

    // Render KaTeX Math formatting
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

      // Render KaTeX for newly revealed hint step
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
    
    // Algebraic Equivalence Verification
    const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer);

    if (isCorrect) {
      sessionScore++;
      addXP(10);
      
      // Async Sync XP update to Google Sheets
      if (state.userToken) {
        syncUserProgress(state.userToken, state.profile.xp, state.profile.streakCount);
      }

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
    }, 4000);
  }

  function renderSummary() {
    state.dailySession.completedToday = Math.max(state.dailySession.completedToday, totalQuestions);
    const bonusXP = sessionScore === totalQuestions ? 20 : 0;
    
    if (bonusXP > 0) {
      addXP(bonusXP);
    }

    // Sync final session XP to Google Sheets
    if (state.userToken) {
      syncUserProgress(state.userToken, state.profile.xp, state.profile.streakCount);
    }

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
