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

  async function fetchNextQuestion() {
    if (!state.curriculum || state.curriculum.length === 0) return null;

    const studentYear = state.profile ? String(state.profile.year).trim() : "";
    const studentStream = state.profile ? String(state.profile.stream).trim() : "";

    const matchingSkills = state.curriculum.filter(s => 
      String(s.year).trim() === studentYear &&
      String(s.stream).trim() === studentStream
    );

    const selectedSkill = matchingSkills.length > 0 
      ? matchingSkills[Math.floor(Math.random() * matchingSkills.length)]
      : state.curriculum[0];

    currentSkillTitle = selectedSkill.title || "Math Practice";
    return await loadAndGenerateQuestion(selectedSkill.generatorPath);
  }

  async function loadQuestion() {
    if (questionIndex >= totalQuestions) {
      renderSummary();
      return;
    }

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
            <span class="tag">${currentQuestion.strand || 'Algebra'}</span>
            <h4 style="margin-top: 4px; color: var(--text-muted);">${currentSkillTitle}</h4>
          </div>

          <div id="question-prompt" class="math-display">
            ${currentQuestion.prompt}
          </div>

          <!-- HINTS SECTION -->
          <div class="hints-wrapper">
            <div>
              <button id="btn-ask-hint" class="hint-btn">💡 Ask for Hint (<span id="hint-count">0</span>/${currentQuestion.steps ? currentQuestion.steps.length : 0})</button>
            </div>
            <div id="hints-container" class="hints-list"></div>
          </div>

          <!-- FEEDBACK & SOLUTION REVIEW -->
          <div id="daily-feedback" class="feedback-area"></div>
          <div id="full-solution-container" class="solution-box" style="display: none;"></div>
          <div id="next-action-container"></div>
        </div>

        <!-- COLUMN 2: SCRATCHPAD WITH ENHANCED TOOLBAR -->
        <div class="practice-col">
          <div class="scratchpad-toolbar">
            <!-- Mode Selector -->
            <div class="tool-group">
              <button class="tool-btn active" data-tool="pen">✏️ Pen</button>
              <button class="tool-btn" data-tool="eraser">🧹 Eraser</button>
            </div>

            <!-- Color Palette -->
            <div class="tool-group">
              <div class="color-swatch active" data-color="#1e293b" style="background: #1e293b;"></div>
              <div class="color-swatch" data-color="#2563eb" style="background: #2563eb;"></div>
              <div class="color-swatch" data-color="#dc2626" style="background: #dc2626;"></div>
              <div class="color-swatch" data-color="#16a34a" style="background: #16a34a;"></div>
            </div>

            <!-- Thickness & Clear -->
            <div class="tool-group">
              <select id="scratchpad-size" class="tool-btn" style="padding: 4px;">
                <option value="1.5">Thin</option>
                <option value="2.5" selected>Medium</option>
                <option value="4.5">Thick</option>
              </select>
              <button id="btn-clear-canvas" class="secondary-btn" style="font-size: 0.8rem;">Clear</button>
            </div>
          </div>

          <div class="canvas-wrapper">
            <canvas id="scratchpad-canvas"></canvas>
          </div>
        </div>

        <!-- COLUMN 3: DYNAMIC KEYPAD -->
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
    const nextActionContainer = document.getElementById("next-action-container");

    const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer);

    if (isCorrect) {
      sessionScore++;
      addXP(10);
      
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

    // Render Step-by-Step Solution Review
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

    // Render Manual "Next Question" Button (replaces timeout)
    nextActionContainer.innerHTML = `
      <button id="btn-next-q" class="btn-next-question">
        ${questionIndex + 1 >= totalQuestions ? 'Finish Practice ➔' : 'Next Question ➔'}
      </button>
    `;

    document.getElementById("btn-next-q").addEventListener("click", () => {
      questionIndex++;
      loadQuestion();
    });
  }

  function renderSummary() {
    state.dailySession.completedToday = Math.max(state.dailySession.completedToday, totalQuestions);
    const bonusXP = sessionScore === totalQuestions ? 20 : 0;
    
    if (bonusXP > 0) {
      addXP(bonusXP);
    }

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
