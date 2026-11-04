import { state, addXP, recordQuestionAttempt } from "../state.js";
import { loadQuestionGenerator } from "../questions/loader.js";
import { syncUserProgress, syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";
import { renderKaTeX } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";

/**
 * Core 3-Column Question Practice Runner
 */
export function renderQuestionView(container, options = {}) {
  const mode = options.mode || "dailyQuest";
  const isDailyQuest = mode === "dailyQuest";
  const isSkillTree = mode === "skillTree";
  const isSRS = mode === "srsReview" || mode === "smartReview";

  let queue = Array.isArray(options.queue) && options.queue.length > 0 ? options.queue : [];
  let activeGeneratorPath = options.generatorPath || "";

  const totalQuestions = options.maxQuestions || (isDailyQuest ? 5 : (isSRS ? queue.length || 4 : Infinity));
  const allowSkip = options.allowSkip ?? (isDailyQuest || isSRS);
  const targetMastery = options.targetMastery || 90;

  let questionIndex = 0;
  let sessionScore = 0;
  let currentQuestion = null;
  let activeAnswer = "";
  let currentHintStep = 0;
  let currentSkillTitle = "Practice Skill";
  const sessionInitialScores = {};

  // Background Mastery Batch Sync on page visibility change
  function flushMasterySync() {
    if (state.pendingMasteryUpdates && state.pendingMasteryUpdates.size > 0 && state.userToken) {
      const dirtyPaths = Array.from(state.pendingMasteryUpdates);
      const updates = dirtyPaths.map(path => state.mastery[path]).filter(Boolean);
      if (updates.length > 0) {
        syncBatchMastery(state.userToken, updates);
        state.pendingMasteryUpdates.clear();
      }
    }
  }

  const visibilityHandler = () => {
    if (document.visibilityState === "hidden") flushMasterySync();
  };
  document.addEventListener("visibilitychange", visibilityHandler);

  // Single Next Question Event Handler (Prevents duplicate event listener stacking)
  const handleNextQuestionTrigger = () => {
    questionIndex++;
    loadQuestion();
  };

  container.removeEventListener("triggerNextQuestion", handleNextQuestionTrigger);
  container.addEventListener("triggerNextQuestion", handleNextQuestionTrigger);

  function cleanupListeners() {
    document.removeEventListener("visibilitychange", visibilityHandler);
    container.removeEventListener("triggerNextQuestion", handleNextQuestionTrigger);
  }

  // Fetch Next Question from Generator Module
  async function fetchNextQuestion() {
    let queueItem = null;

    if (queue.length > 0) {
      queueItem = isSkillTree ? queue[questionIndex % queue.length] : queue[questionIndex];
    }

    if (queueItem) {
      activeGeneratorPath = typeof queueItem === "object" ? queueItem.generatorPath : String(queueItem);
    } else if (!activeGeneratorPath && state.curriculum && state.curriculum.length > 0) {
      activeGeneratorPath = state.curriculum[0].generatorPath;
    }

    if (!activeGeneratorPath) activeGeneratorPath = "algebra/linearEquations.js";

    const selectedSkill = (state.curriculum || []).find(s => s.generatorPath === activeGeneratorPath) || {
      title: "Practice Skill",
      generatorPath: activeGeneratorPath,
      strand: "Algebra"
    };

    currentSkillTitle = selectedSkill.title || "Practice Skill";

    if (sessionInitialScores[activeGeneratorPath] === undefined) {
      sessionInitialScores[activeGeneratorPath] = state.mastery[activeGeneratorPath] ? state.mastery[activeGeneratorPath].score : 0;
    }

    const currentScore = state.mastery[activeGeneratorPath]?.score || 0;
    let tier = isSRS ? 1 : (currentScore < 40 ? 1 : (currentScore < 70 ? 2 : 3));

    try {
      const genModule = await loadQuestionGenerator(activeGeneratorPath);
      return genModule.generateQuestion(tier);
    } catch (err) {
      console.error(`Failed to load question generator for path [${activeGeneratorPath}]:`, err);
      return null;
    }
  }

  // Render 3-Column Question Workspace
  async function loadQuestion() {
    if (!isSkillTree && questionIndex >= totalQuestions) {
      finishSession();
      return;
    }

    container.innerHTML = `
      <div class="practice-col" style="justify-content: center; align-items: center; height: 100%; min-height: 300px;">
        <h3>🎲 Loading Question ${questionIndex + 1}...</h3>
      </div>
    `;

    currentQuestion = await fetchNextQuestion();
    currentHintStep = 0;
    activeAnswer = "";

    if (!currentQuestion) {
      container.innerHTML = `
        <div class="practice-col" style="justify-content: center; align-items: center; height: 100%; min-height: 300px;">
          <h3>Unable to load question generator.</h3>
          <button id="btn-exit-err" class="secondary-btn" style="margin-top: 12px; cursor: pointer;">Back</button>
        </div>
      `;
      container.querySelector("#btn-exit-err")?.addEventListener("click", () => {
        cleanupListeners();
        if (typeof options.onExit === "function") options.onExit();
        else navigateTo("dashboard");
      });
      return;
    }

    let modeBadge = `<span class="tag" style="background: #e0f2fe; color: #0369a1; font-weight: 700;">📅 Daily Quest</span>`;
    if (isSkillTree) modeBadge = `<span class="tag" style="background: #f0fdf4; color: #15803d; font-weight: 700;">🌳 Skill Mastery</span>`;
    if (isSRS) modeBadge = `<span class="tag" style="background: #fef3c7; color: #b45309; font-weight: 700;">🔄 Memory Refresher</span>`;

    const progressText = isSkillTree ? `Question ${questionIndex + 1}` : `Q${questionIndex + 1} of ${totalQuestions}`;
    const skipBtnHtml = allowSkip ? `<button id="btn-skip-question" class="secondary-btn" style="background: #fff7ed; color: #c2410c; border-color: #ffedd5;">Skip ⏭️</button>` : "";
    const exitBtnText = isSkillTree ? "💾 Save & Exit" : "← Exit";
    const stepsList = currentQuestion.steps || currentQuestion.hints || [];

    container.innerHTML = `
      <div class="practice-grid-3col">
        
        <!-- COLUMN 1: PROTECTED QUESTION & SCROLLABLE HINTS -->
        <div class="practice-col col-scrollable">
          
          <div class="protected-question-header">
            <div class="question-header">
              <button id="btn-exit-dashboard" class="secondary-btn">${exitBtnText}</button>
              <div style="display: flex; gap: 8px; align-items: center;">
                ${skipBtnHtml}
                <span class="step-indicator">${progressText}</span>
              </div>
            </div>

            <div class="skill-header" style="margin-top: 8px;">
              <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
                ${modeBadge}
                <span class="tag">${currentQuestion.strand || 'Algebra'}</span>
              </div>
              <h4 style="margin-top: 2px; color: var(--text-muted);">${currentSkillTitle}</h4>
            </div>

            <div id="question-prompt" class="math-display" style="margin-top: 8px;">
              ${currentQuestion.prompt}
            </div>
          </div>

          <div class="scrollable-hints-area">
            <div class="hints-wrapper">
              <div>
                <button id="btn-ask-hint" class="hint-btn">💡 Ask for Hint (<span id="hint-count">0</span>/${stepsList.length})</button>
              </div>
              <div id="hints-container" class="hints-list"></div>
            </div>

            <div id="daily-feedback" class="feedback-area"></div>
            <div id="full-solution-container" class="solution-box" style="display: none;"></div>
          </div>

        </div>

        <!-- COLUMN 2: SCRATCHPAD CANVAS WORKSPACE -->
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

        <!-- COLUMN 3: VIRTUAL KEYPAD -->
        <div class="practice-col keypad-col">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 6px; flex-shrink: 0;">Enter Answer</div>
          <div id="keypad-display" class="answer-display-box"></div>
          <div class="keypad-grid"></div>
        </div>

      </div>
    `;

    renderKaTeX(container.querySelector("#question-prompt"));
    initScratchpad(container);

    initKeypad(
      container,
      currentQuestion.keypad,
      (val) => { activeAnswer = val; },
      (val) => { handleSubmission(val); },
      () => { handleSkip(); }
    );

    container.querySelector("#btn-skip-question")?.addEventListener("click", () => handleSkip());

    const hintBtn = container.querySelector("#btn-ask-hint");
    const hintsContainer = container.querySelector("#hints-container");
    const hintCountEl = container.querySelector("#hint-count");

    hintBtn?.addEventListener("click", () => {
      if (!stepsList || currentHintStep >= stepsList.length) return;

      const stepText = stepsList[currentHintStep];
      currentHintStep++;
      if (hintCountEl) hintCountEl.innerText = currentHintStep;

      const hintCard = document.createElement("div");
      hintCard.className = "hint-card";
      hintCard.innerHTML = `<strong>Step ${currentHintStep}:</strong> <div>${stepText}</div>`;
      hintsContainer.appendChild(hintCard);
      renderKaTeX(hintCard);

      if (currentHintStep >= stepsList.length) {
        hintBtn.disabled = true;
        hintBtn.innerText = "All Hints Revealed";
      }
    });

    container.querySelector("#btn-exit-dashboard")?.addEventListener("click", () => {
      cleanupListeners();
      flushMasterySync();
      if (typeof options.onExit === "function") {
        options.onExit();
      } else {
        navigateTo("dashboard");
      }
    });
  }

  function handleSkip() {
    const feedbackEl = container.querySelector("#daily-feedback");
    if (feedbackEl) {
      feedbackEl.style.padding = "10px 14px";
      feedbackEl.style.background = "#f1f5f9";
      feedbackEl.style.color = "#475569";
      feedbackEl.innerText = "⏭️ Question skipped (no penalty). Loading next...";
    }
    setTimeout(() => {
      questionIndex++;
      loadQuestion();
    }, 500);
  }

  function handleSubmission(userAns) {
    if (!currentQuestion) return;

    const feedbackEl = container.querySelector("#daily-feedback");
    const solutionBox = container.querySelector("#full-solution-container");
    const stepsList = currentQuestion.steps || currentQuestion.hints || [];

    const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer);

    recordQuestionAttempt(activeGeneratorPath, isCorrect, currentHintStep, stepsList.length || 3);

    if (isCorrect) {
      sessionScore++;
      addXP(10);
      if (feedbackEl) {
        feedbackEl.style.padding = "10px 14px";
        feedbackEl.style.background = "#d1fae5";
        feedbackEl.style.color = "#065f46";
        feedbackEl.innerText = isSRS ? "Correct! 🎉 Memory restored." : "Correct! 🎉 +10 XP";
      }
    } else {
      if (feedbackEl) {
        feedbackEl.style.padding = "10px 14px";
        feedbackEl.style.background = "#fee2e2";
        feedbackEl.style.color = "#991b1b";
        feedbackEl.innerText = `Incorrect. Expected: ${currentQuestion.expectedAnswer}`;
      }
    }

    if (stepsList.length > 0 && solutionBox) {
      solutionBox.style.display = "block";
      solutionBox.innerHTML = `
        <h4 style="margin-bottom: 8px;">📖 Full Solution Review:</h4>
        <ol style="padding-left: 20px; margin: 0;">
          ${stepsList.map(step => `<li style="margin-bottom: 6px;">${step}</li>`).join("")}
        </ol>
      `;
      renderKaTeX(solutionBox);
    }

    const currentScore = state.mastery[activeGeneratorPath]?.score || 0;
    if (isSkillTree && currentScore >= targetMastery) {
      setTimeout(() => finishSession(true), 1200);
    }
  }

  function finishSession(isMastered = false) {
    cleanupListeners();
    
    if (state.dailySession) {
      state.dailySession.completedToday = Math.max(state.dailySession.completedToday || 0, totalQuestions);
    }

    const bonusXP = (!isSkillTree && sessionScore === totalQuestions) ? 20 : 0;
    if (bonusXP > 0) addXP(bonusXP);

    if (state.userToken) {
      if (state.profile) {
        syncUserProgress(state.userToken, state.profile.xp, state.profile.streakCount);
      }
      flushMasterySync();
    }

    const summaryData = {
      mode,
      sessionScore,
      totalQuestions: totalQuestions === Infinity ? questionIndex : totalQuestions,
      isMastered,
      sessionInitialScores,
      bonusXP
    };

    if (typeof options.onComplete === "function") {
      options.onComplete(summaryData);
      return;
    }

    renderDefaultSummary(summaryData);
  }

  function renderDefaultSummary(summary) {
    const summaryRowsHtml = Object.keys(summary.sessionInitialScores).map(path => {
      const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill" };
      const startScore = summary.sessionInitialScores[path] || 0;
      const currentScore = state.mastery[path] ? state.mastery[path].score : startScore;
      const diff = currentScore - startScore;
      const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
      const diffColor = diff >= 0 ? "#16a34a" : "#dc2626";

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border-radius: 10px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
          <div style="text-align: left; font-weight: 700; color: #1e293b; font-size: 0.92rem;">${skillObj.title}</div>
          <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">
            ${startScore} ➔ <span style="color: #2563eb;">${currentScore}</span> 
            <span style="font-size: 0.82rem; color: ${diffColor}; margin-left: 6px;">(${diffText} pts)</span>
          </div>
        </div>
      `;
    }).join("");

    const titleText = summary.isMastered ? "🏆 Skill Mastered (90+ Score)!" : "🎉 Session Completed!";

    container.innerHTML = `
      <div class="practice-col" style="justify-content: center; align-items: center; text-align: center; padding: 3rem; max-width: 520px; margin: 40px auto;">
        <h2 style="font-size: 2rem; color: #0f172a; margin-bottom: 6px;">${titleText}</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted); margin: 12px 0 24px 0;">
          Final Score: <strong>${summary.sessionScore} / ${summary.totalQuestions}</strong>
        </p>

        <div style="width: 100%; margin-bottom: 24px; text-align: left;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px;">Mastery Score Summary:</div>
          ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.88rem;">Session finished.</div>'}
        </div>

        <button id="btn-return-dash" class="keypad-btn submit" style="padding: 14px 28px; font-size: 1.1rem; cursor: pointer; width: 100%;">
          Return to Dashboard
        </button>
      </div>
    `;

    container.querySelector("#btn-return-dash")?.addEventListener("click", () => {
      navigateTo("dashboard");
    });
  }

  loadQuestion();
}
