import { state, addXP } from "../state.js";
import { registry } from "../questions/registry.js";
import { navigateTo } from "../router.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";

export function renderDailyPractice(container) {
  let questionIndex = 0;
  const totalQuestions = state.dailySession.targetQuestions;
  let sessionScore = 0;
  let currentQuestion = null;
  let activeAnswer = "";
  let keypadInstance = null;

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
      <div class="practice-grid-3col">
        <!-- COLUMN 1: QUESTION & STATUS -->
        <div class="practice-col">
          <div class="question-header">
            <button id="btn-exit-dashboard" class="secondary-btn">← Dashboard</button>
            <span class="step-indicator">Q${questionIndex + 1} of ${totalQuestions}</span>
          </div>

          <div class="skill-header">
            <span class="tag">${currentQuestion ? currentQuestion.strand : 'Algebra'}</span>
            <h4 style="margin-top: 6px; color: var(--text-muted);">${activeSkillId}</h4>
          </div>

          <div id="question-prompt" class="math-display">
            ${currentQuestion ? currentQuestion.prompt : 'Loading prompt...'}
          </div>

          <div id="daily-feedback" class="feedback-area"></div>
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

        <!-- COLUMN 3: CUSTOM ON-SCREEN KEYPAD -->
        <div class="practice-col">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;">Enter Answer</div>
          
          <div id="keypad-display" class="answer-display-box"></div>

          <div class="keypad-grid">
            <button class="keypad-btn" data-val="7">7</button>
            <button class="keypad-btn" data-val="8">8</button>
            <button class="keypad-btn" data-val="9">9</button>
            <button class="keypad-btn action" data-action="backspace">⌫</button>

            <button class="keypad-btn" data-val="4">4</button>
            <button class="keypad-btn" data-val="5">5</button>
            <button class="keypad-btn" data-val="6">6</button>
            <button class="keypad-btn operator" data-val="+">+</button>

            <button class="keypad-btn" data-val="1">1</button>
            <button class="keypad-btn" data-val="2">2</button>
            <button class="keypad-btn" data-val="3">3</button>
            <button class="keypad-btn operator" data-val="-">-</button>

            <button class="keypad-btn" data-val="0">0</button>
            <button class="keypad-btn operator" data-val=".">.</button>
            <button class="keypad-btn operator" data-val="x">x</button>
            <button class="keypad-btn operator" data-val="/">/</button>

            <button class="keypad-btn action" data-action="clear">C</button>
            <button class="keypad-btn operator" data-val="-">(-)</button>
            <button class="keypad-btn submit" data-action="submit">Submit ➔</button>
          </div>
        </div>
      </div>
    `;

    // Initialize Canvas Scratchpad & Virtual Keypad components
    initScratchpad(container);

    keypadInstance = initKeypad(
      container,
      (val) => { activeAnswer = val; },
      (val) => { handleSubmission(val); }
    );

    document.getElementById("btn-exit-dashboard").addEventListener("click", () => {
      navigateTo("dashboard");
    });
  }

  function handleSubmission(ans) {
    if (!currentQuestion) return;

    const userAns = ans.replace(/\s+/g, '').toLowerCase();
    const expected = String(currentQuestion.expectedAnswer).replace(/\s+/g, '').toLowerCase();
    const feedbackEl = document.getElementById("daily-feedback");

    if (userAns === expected) {
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

    setTimeout(() => {
      questionIndex++;
      loadQuestion();
    }, 1500);
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
