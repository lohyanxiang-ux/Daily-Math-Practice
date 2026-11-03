import { state, addXP, recordQuestionAttempt } from "../state.js";
import { loadQuestionGenerator } from "../questions/loader.js";
import { syncUserProgress, syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";
import { renderKaTeX } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";

export function renderDailyPractice(container, params = {}) {
  // 1. Resolve Mode Configuration
  const mode = params.mode || "dailyQuest";
  const isDailyQuest = mode === "dailyQuest";
  const isSkillTree = mode === "skillTree";
  const isSRS = mode === "srsReview" || mode === "smartReview";

  const totalQuestions = isDailyQuest ? 5 : (isSRS ? (params.queue?.length || 4) : Infinity);
  const allowSkip = params.allowSkip ?? (isDailyQuest || isSRS);

  let questionIndex = 0;
  let sessionScore = 0;
  let currentQuestion = null;
  let activeAnswer = "";
  let currentHintStep = 0;
  let activeGeneratorPath = params.generatorPath || "";
  let currentSkillTitle = "";
  const sessionInitialScores = {};

  // Resolved Queue for Multi-Question Modes
  let queue = Array.isArray(params.queue) ? params.queue : [];

  // 2. Background Mastery Batch Sync
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

  // 3. Question Fetching Engine
  async function fetchNextQuestion() {
    let queueItem = null;

    if (queue.length > 0) {
      queueItem = isSkillTree ? queue[questionIndex % queue.length] : queue[questionIndex];
    }

    if (queueItem) {
      activeGeneratorPath = typeof queueItem === "object" ? queueItem.generatorPath : String(queueItem);
    } else if (activeGeneratorPath) {
      // Path specified directly via params
    } else if (state.curriculum && state.curriculum.length > 0) {
      const studentYear = state.profile ? String(state.profile.year).trim() : "";
      const studentStream = state.profile ? String(state.profile.stream).trim() : "";

      const matchingSkills = state.curriculum.filter(s => 
        String(s.year).trim() === studentYear && String(s.stream).trim() === studentStream
      );

      const selectedSkill = matchingSkills.length > 0 
        ? matchingSkills[Math.floor(Math.random() * matchingSkills.length)]
        : state.curriculum[0];

      activeGeneratorPath = selectedSkill.generatorPath;
    } else {
      activeGeneratorPath = "algebra/linearEquations.js";
    }

    const selectedSkill = (state.curriculum || []).find(s => s.generatorPath === activeGeneratorPath) || {
      title: "Math Practice",
      generatorPath: activeGeneratorPath,
      strand: "Algebra"
    };

    currentSkillTitle = selectedSkill.title || "Math Practice";

    if (sessionInitialScores[activeGeneratorPath] === undefined) {
      sessionInitialScores[activeGeneratorPath] = state.mastery[activeGeneratorPath] ? state.mastery[activeGeneratorPath].score : 0;
    }

    // Determine Tier (SRS caps at Tier 1/2 for memory refresh)
    const currentScore = state.mastery[activeGeneratorPath]?.score || 0;
    let tier = isSRS ? 1 : (currentScore < 40 ? 1 : (currentScore < 70 ? 2 : 3));

    try {
      const genModule = await loadQuestionGenerator(activeGeneratorPath);
      return genModule.generateQuestion(tier);
    } catch (err) {
      console.error(`Failed to load generator for path: ${activeGeneratorPath}`, err);
      return null;
    }
  }

  // 4. Question View Renderer
  async function loadQuestion() {
    if (!isSkillTree && questionIndex >= totalQuestions) {
      renderSummary();
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
          <h3>Unable to load question generator module.</h3>
          <button id="btn-exit-err" class="secondary-btn" style="margin-top: 12px; padding: 10px 20px; cursor: pointer;">Return to Dashboard</button>
        </div>
      `;
      container.querySelector("#btn-exit-err")?.addEventListener("click", () => {
        document.removeEventListener("visibilitychange", visibilityHandler);
        navigateTo("dashboard");
      });
      return;
    }

    // Mode Badges & Header Indicators
    let modeBadge = `<span class="tag" style="background: #e0f2fe; color: #0369a1; font-weight: 700;">📅 Daily Quest</span>`;
    if (isSkillTree) modeBadge = `<span class="tag" style="background: #f0fdf4; color: #15803d; font-weight: 700;">🌳 Skill Mastery</span>`;
    if (isSRS) modeBadge = `<span class="tag" style="background: #fef3c7; color: #b45309; font-weight: 700;">🔄 Memory Refresher</span>`;

    const progressText = isSkillTree ? `Question ${questionIndex + 1}` : `Q${questionIndex + 1} of ${totalQuestions}`;
    const skipBtnHtml = allowSkip ? `<button id="btn-skip-question" class="secondary-btn" style="background: #fff7ed; color: #c2410c; border-color: #ffedd5; cursor: pointer;">Skip ⏭️</button>` : "";
    const exitBtnText = isSkillTree ? "💾 Save & Exit" : "← Exit";

    const stepsList = currentQuestion.steps || currentQuestion.hints || [];

    // 3-COLUMN WORKSPACE LAYOUT
    container.innerHTML = `
      <div class="practice-grid-3col">
        
        <!-- COLUMN 1: PROTECTED QUESTION & SCROLLABLE HINTS/SOLUTIONS -->
        <div class="practice-col col-scrollable">
          
          <!-- FIXED QUESTION HEADER -->
          <div class="protected-question-header">
            <div class="question-header" style="display: flex; justify-content: space-between; align-items: center;">
              <button id="btn-exit-dashboard" class="secondary-btn" style="cursor: pointer;">${exitBtnText}</button>
              <div style="display: flex; gap: 8px; align-items: center;">
                ${skipBtnHtml}
                <span class="step-indicator" style="font-weight: 700; color: #64748b;">${progressText}</span>
              </div>
            </div>

            <div class="skill-header" style="margin-top: 8px;">
              <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
                ${modeBadge}
                <span class="tag">${currentQuestion.strand || 'Algebra'}</span>
              </div>
              <h4 style="margin: 4px 0 0 0; color: var(--text-muted, #475569); font-size: 1.1rem;">${currentSkillTitle}</h4>
            </div>

            <div id="question-prompt" class="math-display" style="margin-top: 10px; font-size: 1.1rem; line-height: 1.5; color: #0f172a;">
              ${currentQuestion.prompt}
            </div>
          </div>

          <!-- SCROLLABLE HINTS & SOLUTION AREA -->
          <div class="scrollable-hints-area" style="padding-top: 10px;">
            <div class="hints-wrapper">
              <div>
                <button id="btn-ask-hint" class="hint-btn" style="cursor: pointer;">
                  💡 Ask for Hint (<span id="hint-count">0</span>/${stepsList.length})
                </button>
              </div>
              <div id="hints-container" class="hints-list" style="margin-top: 8px;"></div>
            </div>

            <div id="daily-feedback" class="feedback-area" style="margin-top: 12px; font-weight: 700; border-radius: 8px; min-height: 24px;"></div>
            <div id="full-solution-container" class="solution-box" style="display: none; margin-top: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;"></div>
          </div>

        </div>

        <!-- COLUMN 2: SCRATCHPAD WITH CANVAS TOOLBAR -->
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

        <!-- COLUMN 3: VIRTUAL MATH KEYPAD -->
        <div class="practice-col keypad-col">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 6px; flex-shrink: 0; color: #334155;">Enter Answer</div>
          <div id="keypad-display" class="answer-display-box"></div>
          <div class="keypad-grid"></div>
        </div>

      </div>
    `;

    // Render KaTeX Math Expressions
    renderKaTeX(container.querySelector("#question-prompt"));

    // Initialize Canvas Scratchpad Component
    initScratchpad(container);

    // Initialize Math Keypad Component
    initKeypad(
      container,
      currentQuestion.keypad,
      (val) => { activeAnswer = val; },
      (val) => { handleSubmission(val); }
    );

    // Event Listener: Trigger next question after submission
    container.addEventListener("triggerNextQuestion", () => {
      questionIndex++;
      loadQuestion();
    });

    // Event Listener: Skip Question (Penalty-Free for Daily Quest / SRS)
    container.querySelector("#btn-skip-question")?.addEventListener("click", () => {
      const feedbackEl = container.querySelector("#daily-feedback");
      if (feedbackEl) {
        feedbackEl.style.background = "#f1f5f9";
        feedbackEl.style.color = "#475569";
        feedbackEl.innerText = "⏭️ Question skipped (no penalty). Loading next...";
      }
      setTimeout(() => {
        questionIndex++;
        loadQuestion();
      }, 600);
    });

    // Event Listener: Progressive Hints
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
      hintCard.style.cssText = "background: #fffbe3; border-left: 4px solid #f59e0b; padding: 10px 12px; margin-bottom: 8px; border-radius: 6px; color: #78350f; font-size: 0.9rem;";
      hintCard.innerHTML = `<strong>Step ${currentHintStep}:</strong> <div>${stepText}</div>`;
      hintsContainer.appendChild(hintCard);
      renderKaTeX(hintCard);

      if (currentHintStep >= stepsList.length) {
        hintBtn.disabled = true;
        hintBtn.innerText = "All Hints Revealed";
      }
    });

    // Event Listener: Exit Dashboard
    container.querySelector("#btn-exit-dashboard")?.addEventListener("click", () => {
      document.removeEventListener("visibilitychange", visibilityHandler);
      flushMasterySync();
      navigateTo("dashboard");
    });
  }

  // 5. Answer Submission Evaluator
  function handleSubmission(userAns) {
    if (!currentQuestion) return;

    const feedbackEl = container.querySelector("#daily-feedback");
    const solutionBox = container.querySelector("#full-solution-container");
    const stepsList = currentQuestion.steps || currentQuestion.hints || [];

    const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer);

    // Record attempt to local state & queue for Google Sheets sync
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

    // Display Full Solution Steps
    if (stepsList.length > 0 && solutionBox) {
      solutionBox.style.display = "block";
      solutionBox.innerHTML = `
        <h5 style="margin: 0 0 8px 0; font-size: 0.95rem; color: #1e293b;">📖 Full Solution Review:</h5>
        <ol style="padding-left: 20px; margin: 0; color: #334155; font-size: 0.9rem;">
          ${stepsList.map(step => `<li style="margin-bottom: 6px;">${step}</li>`).join("")}
        </ol>
      `;
      renderKaTeX(solutionBox);
    }

    // Skill Tree Victory Trigger: Auto-complete when hitting 90+ score
    const currentScore = state.mastery[activeGeneratorPath]?.score || 0;
    if (isSkillTree && currentScore >= 90) {
      setTimeout(() => renderSummary(true), 1200);
    }
  }

  // 6. Summary View & Score Synchronization
  function renderSummary(isMastered = false) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    
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

    // Generate Skill Score Summary Breakdown
    const summaryRowsHtml = Object.keys(sessionInitialScores).map(path => {
      const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practiced Skill" };
      const startScore = sessionInitialScores[path] || 0;
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

    const headerTitle = isMastered ? "🏆 Skill Mastered (90+ Score)!" : "🎉 Practice Session Complete!";

    container.innerHTML = `
      <div class="practice-col" style="justify-content: center; align-items: center; text-align: center; padding: 2.5rem; max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
        <h2 style="font-size: 1.8rem; color: #0f172a; margin-bottom: 6px;">${headerTitle}</h2>
        <p style="font-size: 0.95rem; color: var(--text-muted, #64748b); margin: 0 0 20px 0;">
          Your updated mastery scores have been synchronized with Google Sheets.
        </p>

        <div style="width: 100%; margin-bottom: 20px; text-align: left;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px;">Mastery Score Summary:</div>
          ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.88rem;">Session finished.</div>'}
        </div>

        <button id="btn-return-dash" class="keypad-btn submit" style="width: 100%; padding: 14px; font-size: 1rem; border-radius: 12px; cursor: pointer;">Return to Dashboard</button>
      </div>
    `;

    container.querySelector("#btn-return-dash")?.addEventListener("click", () => {
      navigateTo("dashboard");
    });
  }

  loadQuestion();
}
