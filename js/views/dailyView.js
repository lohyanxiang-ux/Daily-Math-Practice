import { state, addXP, recordQuestionAttempt } from "../state.js";
import { loadAndGenerateQuestion } from "../questions/loader.js";
import { syncUserProgress, syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";
import { renderMath } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";

export function renderDailyPractice(container, params = {}) {
  let questionIndex = 0;
  const totalQuestions = state.dailySession.targetQuestions;
  let sessionScore = 0;
  let currentQuestion = null;
  let activeAnswer = "";
  let currentHintStep = 0;
  let activeGeneratorPath = params.generatorPath || "";
  let currentSkillTitle = "";

  function flushMasterySync() {
    if (state.pendingMasteryUpdates.size > 0 && state.userToken) {
      const updates = Array.from(state.pendingMasteryUpdates).map(path => state.mastery[path]);
      syncBatchMastery(state.userToken, updates);
      state.pendingMasteryUpdates.clear();
    }
  }

  const visibilityHandler = () => {
    if (document.visibilityState === "hidden") flushMasterySync();
  };
  document.addEventListener("visibilitychange", visibilityHandler);

  async function fetchNextQuestion() {
    if (!state.curriculum || state.curriculum.length === 0) return null;

    let selectedSkill = null;
    if (activeGeneratorPath) {
      selectedSkill = state.curriculum.find(s => s.generatorPath === activeGeneratorPath);
    }

    if (!selectedSkill) {
      const studentYear = state.profile ? String(state.profile.year).trim() : "";
      const studentStream = state.profile ? String(state.profile.stream).trim() : "";

      const matchingSkills = state.curriculum.filter(s => 
        String(s.year).trim() === studentYear && String(s.stream).trim() === studentStream
      );

      selectedSkill = matchingSkills.length > 0 
        ? matchingSkills[Math.floor(Math.random() * matchingSkills.length)]
        : state.curriculum[0];
    }

    if (!selectedSkill) return null;

    activeGeneratorPath = selectedSkill.generatorPath;
    currentSkillTitle = selectedSkill.title || "Math Practice";

    const skillMastery = state.mastery[activeGeneratorPath] || { stars: 0 };
    const currentStars = skillMastery.stars || 0;
    
    // Tier Mapping: 0 Stars -> Tier 1 (Basic) | 1 Star -> Tier 2 (Intermediate) | 2-3 Stars -> Tier 3 (Advanced)
    const tier = currentStars < 1 ? 1 : (currentStars === 1 ? 2 : 3);

    return await loadAndGenerateQuestion(selectedSkill.generatorPath, tier);
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
          <h3>Unable to load question generator.</h3>
          <button id="btn-exit-err" class="secondary-btn" style="margin-top: 12px;">Back to Dashboard</button>
        </div>
      `;
      container.querySelector("#btn-exit-err").addEventListener("click", () => {
        document.removeEventListener("visibilitychange", visibilityHandler);
        navigateTo("dashboard");
      });
      return;
    }

    container.innerHTML = `
      <div class="practice-grid-3col">
        <!-- COLUMN 1: QUESTION, DIFFICULTY TAG, HINTS, & SOLUTION REVIEW -->
        <div class="practice-col col-scrollable">
          <div class="question-header">
            <button id="btn-exit-dashboard" class="secondary-btn">← Exit Session</button>
            <span class="step-indicator">Q${questionIndex + 1} of ${totalQuestions}</span>
          </div>

          <div class="skill-header">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
              <span class="tag">${currentQuestion.strand || 'Algebra'}</span>
              <!-- REPLACED TIER TAGS WITH BASIC, INTERMEDIATE, ADVANCED -->
              <span class="tag" style="background: #fef3c7; color: #92400e; font-weight: 700;">
                ${currentQuestion.tierName || (currentQuestion.tier === 1 ? 'Basic' : currentQuestion.tier === 2 ? 'Intermediate' : 'Advanced')}
              </span>
            </div>
            <h4 style="margin-top: 2px; color: var(--text-muted);">${currentSkillTitle}</h4>
          </div>

          <div id="question-prompt" class="math-display">
            ${currentQuestion.prompt}
          </div>

          <div class="hints-wrapper">
            <div>
              <button id="btn-ask-hint" class="hint-btn">💡 Ask for Hint (<span id="hint-count">0</span>/${currentQuestion.steps ? currentQuestion.steps.length : 0})</button>
            </div>
            <div id="hints-container" class="hints-list"></div>
          </div>

          <div id="daily-feedback" class="feedback-area"></div>
          <div id="full-solution-container" class="solution-box" style="display: none;"></div>
        </div>

        <!-- COLUMN 2: APPLE PENCIL SCRATCHPAD WITH POINTER MODE & ICONS -->
        <div class="practice-col">
          <div class="scratchpad-toolbar">
            <div class="tool-group">
              <button class="tool-icon-btn active" data-tool="pen" title="Pen">✏️</button>
              <button class="tool-icon-btn" data-tool="eraser" title="Eraser">🧹</button>
              <button class="tool-icon-btn" data-tool="pointer" title="Scroll / Pointer">🖐️</button>
            </div>

            <div class="tool-group">
              <div class="color-swatch active" data-color="#1e293b" style="background: #1e293b;"></div>
              <div class="color-swatch" data-color="#2563eb" style="background: #2563eb;"></div>
              <div class="color-swatch" data-color="#dc2626" style="background: #dc2626;"></div>
              <div class="color-swatch" data-color="#16a34a" style="background: #16a34a;"></div>
            </div>

            <div class="tool-group">
              <button id="btn-clear-canvas" class="tool-icon-btn" title="Clear Canvas">🗑️</button>
            </div>
          </div>

          <div class="canvas-wrapper">
            <canvas id="scratchpad-canvas"></canvas>
          </div>
        </div>

        <!-- COLUMN 3: COMPACT VIRTUAL KEYPAD WITH INLINE NEXT BUTTON -->
        <div class="practice-col">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;">Enter Answer</div>
          <div id="keypad-display" class="answer-display-box"></div>
          <div class="keypad-grid"></div>
        </div>
      </div>
    `;

    renderMath(container.querySelector("#question-prompt"));
    initScratchpad(container);

    initKeypad(
      container,
      currentQuestion.keypad,
      (val) => { activeAnswer = val; },
      (val) => { handleSubmission(val); }
    );

    // Listen for Next Question trigger from Keypad Submit button replacement
    container.addEventListener("triggerNextQuestion", () => {
      questionIndex++;
      loadQuestion();
    });

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
      document.removeEventListener("visibilitychange", visibilityHandler);
      flushMasterySync();
      navigateTo("dashboard");
    });
  }

  function handleSubmission(userAns) {
    if (!currentQuestion) return;

    const feedbackEl = document.getElementById("daily-feedback");
    const solutionBox = document.getElementById("full-solution-container");
    const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer);

    recordQuestionAttempt(activeGeneratorPath, isCorrect, currentHintStep);

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
  }

  function renderSummary() {
    document.removeEventListener("visibilitychange", visibilityHandler);
    state.dailySession.completedToday = Math.max(state.dailySession.completedToday, totalQuestions);
    const bonusXP = sessionScore === totalQuestions ? 20 : 0;
    if (bonusXP > 0) addXP(bonusXP);

    if (state.userToken) {
      syncUserProgress(state.userToken, state.profile.xp, state.profile.streakCount);
      flushMasterySync();
    }

    container.innerHTML = `
      <div class="practice-col" style="justify-content: center; align-items: center; text-align: center; padding: 3rem;">
        <h2 style="font-size: 2rem;">🎉 Session Completed!</h2>
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
