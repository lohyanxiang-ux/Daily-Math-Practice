import { state, addXP, recordQuestionAttempt } from "../state.js";
import { loadQuestionGenerator } from "../questions/loader.js";
import { syncUserProgress, syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";
import { renderKaTeX } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";

/**
 * Refined 2-Column Question Practice Runner
 * Left Column: Top Scratchpad Toolbar + Question Prompt + Canvas Overlay
 * Right Column: Progressive Hints + Dynamic Mastery Feedback + Unified Standard Keypad
 */
export function renderQuestionView(container, options = {}) {
  const mode = options.mode || "dailyQuest";
  const isDailyQuest = mode === "dailyQuest";
  const isSkillTree = mode === "skillTree";
  const isSRS = mode === "srsReview" || mode === "smartReview";

  let queue = Array.isArray(options.queue) && options.queue.length > 0 ? options.queue : [];
  let activeGeneratorPath = options.generatorPath || "";

  const totalQuestions = options.maxQuestions || (isDailyQuest ? 5 : (isSRS ? queue.length || 4 : Infinity));
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

  // Single Next Question Event Handler
  const handleNextQuestionTrigger = () => {
    questionIndex++;
    loadQuestion();
  };

  container.removeEventListener("triggerNextQuestion", handleNextQuestionTrigger);
  container.addEventListener("triggerNextQuestion", handleNextQuestionTrigger);

  function cleanupListeners() {
    document.removeEventListener("visibilitychange", visibilityHandler);
    container.removeEventListener("triggerNextQuestion", handleNextQuestionTrigger);
    
    // Restore original global top nav on session exit
    const topNav = document.querySelector(".top-nav");
    if (topNav && window._originalTopNavHtml) {
      topNav.innerHTML = window._originalTopNavHtml;
      delete window._originalTopNavHtml;
    }
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
      generatorPath: activeGeneratorPath
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
      console.error(`Failed to load generator for [${activeGeneratorPath}]:`, err);
      return null;
    }
  }

  // Updates Global Top Header Bar to integrate Exit, Mode, Mastery Score, and Progress
  function updateGlobalTopNav() {
    const topNav = document.querySelector(".top-nav");
    if (!topNav) return;

    if (!window._originalTopNavHtml) {
      window._originalTopNavHtml = topNav.innerHTML;
    }

    let modeBadgeText = "📅 Daily Quest";
    let modeBadgeBg = "#e0f2fe";
    let modeBadgeColor = "#0369a1";
    if (isSkillTree) { modeBadgeText = "🌳 Skill Mastery"; modeBadgeBg = "#f0fdf4"; modeBadgeColor = "#15803d"; }
    if (isSRS) { modeBadgeText = "🔄 Memory Refresher"; modeBadgeBg = "#fef3c7"; modeBadgeColor = "#b45309"; }

    const exitBtnText = isSkillTree ? "💾 Save & Exit" : "← Exit";
    const progressText = isSkillTree ? `Question ${questionIndex + 1}` : `Q${questionIndex + 1} of ${totalQuestions}`;

    const displayName = state.profile ? (state.profile.displayName || state.profile.name || "Student") : "Student";
    const userXp = state.profile ? (state.profile.xp || 0) : 0;
    const userStreak = state.profile ? (state.profile.streakCount || 0) : 0;
    const currentMastery = state.mastery[activeGeneratorPath]?.score || 0;

    topNav.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <button id="btn-top-exit" class="secondary-btn" style="padding: 5px 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer;">${exitBtnText}</button>
        <span style="background: ${modeBadgeBg}; color: ${modeBadgeColor}; font-weight: 700; padding: 4px 10px; border-radius: 8px; font-size: 0.82rem;">${modeBadgeText}</span>
      </div>

      <div style="font-weight: 800; color: #0f172a; font-size: 0.95rem; background: #f1f5f9; padding: 4px 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
        ${progressText}
      </div>

      <div style="display: flex; align-items: center; gap: 14px;">
        <!-- MASTERY SCORE BADGE -->
        <span class="stat" style="background: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 6px; border: 1px solid #bfdbfe; font-size: 0.82rem;">
          🎯 Mastery <b id="top-nav-mastery-val">${currentMastery}</b>
        </span>
        <span class="stat">XP <b>${userXp}</b></span>
        <span class="stat">Streak <b>${userStreak}</b> 🔥</span>
        <span style="font-size: 0.85rem; font-weight: 700; color: #475569; background: #f1f5f9; padding: 4px 10px; border-radius: 8px;">${displayName}</span>
      </div>
    `;

    topNav.querySelector("#btn-top-exit")?.addEventListener("click", () => {
      cleanupListeners();
      flushMasterySync();
      if (typeof options.onExit === "function") {
        options.onExit();
      } else {
        navigateTo("dashboard");
      }
    });
  }

  // Render 2-Column Workspace
  async function loadQuestion() {
    if (!isSkillTree && questionIndex >= totalQuestions) {
      finishSession();
      return;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: calc(100dvh - 72px); background: #f8fafc; color: #64748b; font-weight: 700;">
        <h3>🎲 Loading Question ${questionIndex + 1}...</h3>
      </div>
    `;

    currentQuestion = await fetchNextQuestion();
    currentHintStep = 0;
    activeAnswer = "";

    if (!currentQuestion) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: calc(100dvh - 72px);">
          <h3>Unable to load question generator.</h3>
          <button id="btn-exit-err" class="secondary-btn" style="margin-top: 12px; padding: 10px 20px; cursor: pointer;">Back</button>
        </div>
      `;
      container.querySelector("#btn-exit-err")?.addEventListener("click", () => {
        cleanupListeners();
        if (typeof options.onExit === "function") options.onExit();
        else navigateTo("dashboard");
      });
      return;
    }

    // Update global top nav bar with Exit, Mode, Mastery, and Progress
    updateGlobalTopNav();

    const stepsList = currentQuestion.steps || currentQuestion.hints || [];
    const diagramSvgContent = currentQuestion.diagramSvg || currentQuestion.svg || "";
    const diagramHtml = (diagramSvgContent || currentQuestion.imageUrl) ? `
      <div id="diagram-viewport" style="margin-top: 10px; width: 100%; max-height: 240px; display: flex; justify-content: center; align-items: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px; box-sizing: border-box; overflow: hidden;">
        ${diagramSvgContent || `<img src="${currentQuestion.imageUrl}" style="max-width: 100%; max-height: 220px; object-fit: contain;">`}
      </div>
    ` : "";

    // 2-COLUMN DOM STRUCTURE
    container.innerHTML = `
      <main style="display: flex; height: calc(100dvh - 76px); width: 100vw; overflow: hidden; padding: 8px 14px; gap: 12px; box-sizing: border-box; background: #f1f5f9;">
        
        <!-- LEFT COLUMN (55% Width): TOOLBAR AT TOP + QUESTION PROMPT + CANVAS OVERLAY -->
        <section id="left-column-workspace" style="flex: 0 0 55%; display: flex; flex-direction: column; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.04); box-sizing: border-box; overflow: hidden;">
          
          <!-- SCRATCHPAD TOOLBAR (TOP OF LEFT COLUMN ABOVE QUESTION) -->
          <div class="scratchpad-toolbar" style="padding: 8px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">✏️ Scratchpad Workspace</div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <div class="tool-group" style="padding: 2px;">
                <button class="tool-icon-btn active" data-tool="pen" title="Pen" style="width: 30px; height: 30px; font-size: 0.85rem;">✏️</button>
                <button class="tool-icon-btn" data-tool="eraser" title="Eraser" style="width: 30px; height: 30px; font-size: 0.85rem;">🧹</button>
                <button class="tool-icon-btn" data-tool="pointer" title="Pointer" style="width: 30px; height: 30px; font-size: 0.85rem;">🖐️</button>
              </div>

              <div class="tool-group" style="padding: 2px;">
                <div class="color-swatch active" data-color="#1e293b" style="background: #1e293b; width: 18px; height: 18px;"></div>
                <div class="color-swatch" data-color="#2563eb" style="background: #2563eb; width: 18px; height: 18px;"></div>
                <div class="color-swatch" data-color="#dc2626" style="background: #dc2626; width: 18px; height: 18px;"></div>
                <div class="color-swatch" data-color="#16a34a" style="background: #16a34a; width: 18px; height: 18px;"></div>
              </div>

              <div class="tool-group" style="padding: 2px;">
                <button id="btn-clear-canvas" class="tool-icon-btn" title="Clear Canvas" style="width: 30px; height: 30px; font-size: 0.85rem;">🗑️</button>
              </div>
            </div>
          </div>

          <!-- SCROLLABLE QUESTION PROMPT & CANVAS OVERLAY PAPER WRAPPER -->
          <div style="flex: 1; overflow-y: auto; position: relative;">
            <div id="scratchpad-scroll-wrapper" style="position: relative; min-height: 1200px; width: 100%; padding: 18px; box-sizing: border-box;">
              
              <!-- UNDERLAY: QUESTION PROMPT & DIAGRAM -->
              <div id="question-underlay" style="position: relative; z-index: 1; pointer-events: none; max-width: 100%;">
                
                <!-- SKILL TITLE -->
                <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
                  ${currentSkillTitle}
                </div>

                <div id="question-prompt" class="math-display" style="font-size: 1.08rem; line-height: 1.5; color: #1e293b; background: #f8fafc; border-left: 4px solid #2563eb; padding: 14px; border-radius: 10px;">
                  ${currentQuestion.prompt}
                </div>

                ${diagramHtml}
              </div>

              <!-- OVERLAY: TRANSPARENT SCRATCHPAD CANVAS -->
              <div class="canvas-wrapper" style="position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; background: transparent;">
                <canvas id="scratchpad-canvas" style="width: 100%; height: 100%; display: block; touch-action: none;"></canvas>
              </div>

            </div>
          </div>

        </section>

        <!-- RIGHT COLUMN (45% Width): PROGRESSIVE HINTS & KEYPAD -->
        <section style="flex: 1; display: flex; flex-direction: column; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 10px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); box-sizing: border-box; overflow: hidden; height: 100%;">
          
          <!-- TOP HALF: SCROLLABLE HINTS & SOLUTION FEEDBACK (HEIGHT: 140px) -->
          <div id="hints-scroll-area" style="height: 140px; flex-shrink: 0; overflow-y: auto; padding-right: 4px; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
            <div id="hints-container" class="hints-list"></div>
            <div id="daily-feedback" class="feedback-area" style="margin-top: 4px; font-weight: 700; border-radius: 8px;"></div>
            <div id="full-solution-container" class="solution-box" style="display: none; margin-top: 4px; padding: 6px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;"></div>
          </div>

          <!-- BOTTOM HALF: UNIFIED STANDARDIZED KEYPAD DOCK SECTION -->
          <div id="keypad-dock-section" style="flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 4px;">
            <div id="keypad-display" style="width: 100%;"></div>
            <div class="keypad-grid" style="flex: 1; min-height: 0;"></div>
          </div>

        </section>

      </main>
    `;

    renderKaTeX(container.querySelector("#question-prompt"));
    
    // Initialize Scratchpad Canvas Component
    initScratchpad(container);

    // Initialize Unified Standardized Keypad
    initKeypad(
      container,
      currentQuestion.keypad || null,
      (val) => { activeAnswer = val; },
      (val) => { handleSubmission(val); }
    );

    // Progressive Hint Rendering (Hint button appears directly below revealed hints)
    const hintsContainer = container.querySelector("#hints-container");
    const hintsScrollArea = container.querySelector("#hints-scroll-area");

    function scrollHintsToBottom() {
      if (hintsScrollArea) {
        hintsScrollArea.scrollTop = hintsScrollArea.scrollHeight;
      }
    }

    function renderHintButton() {
      // Remove previous inline hint button if it exists
      const existingBtn = hintsContainer.querySelector(".dynamic-hint-btn");
      if (existingBtn) existingBtn.remove();

      if (currentHintStep < stepsList.length) {
        const nextStepNum = currentHintStep + 1;
        const btn = document.createElement("button");
        btn.className = "dynamic-hint-btn hint-btn";
        btn.style.cssText = "margin: 6px 0; padding: 6px 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: block; width: 100%; border-radius: 6px; background: #fffbeb; border: 1px solid #f59e0b; color: #78350f; text-align: center;";
        btn.innerText = `💡 Ask for Hint (${nextStepNum}/${stepsList.length})`;

        btn.addEventListener("click", () => {
          revealNextHint();
        });

        hintsContainer.appendChild(btn);
        scrollHintsToBottom();
      }
    }

    function revealNextHint() {
      if (!stepsList || currentHintStep >= stepsList.length) return;

      // Remove current inline button before placing hint text
      const existingBtn = hintsContainer.querySelector(".dynamic-hint-btn");
      if (existingBtn) existingBtn.remove();

      const stepText = stepsList[currentHintStep];
      currentHintStep++;

      const hintCard = document.createElement("div");
      hintCard.className = "hint-card";
      hintCard.style.cssText = "background: #fffbeb; border-left: 4px solid #f59e0b; padding: 8px 10px; margin-bottom: 6px; border-radius: 6px; color: #78350f; font-size: 0.85rem;";
      hintCard.innerHTML = `<strong>Step ${currentHintStep}:</strong> <div>${stepText}</div>`;
      hintsContainer.appendChild(hintCard);
      renderKaTeX(hintCard);

      // Render next hint button below this new hint
      renderHintButton();
      scrollHintsToBottom();
    }

    // Render initial Hint 1 button if hints are available
    if (stepsList.length > 0) {
      renderHintButton();
    }
  }

  // Submission Evaluator & Dynamic Mastery Tracker
  function handleSubmission(userAns) {
    if (!currentQuestion) return;

    const feedbackEl = container.querySelector("#daily-feedback");
    const solutionBox = container.querySelector("#full-solution-container");
    const stepsList = currentQuestion.steps || currentQuestion.hints || [];

    const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer);

    // Capture score prior to recording attempt
    const oldScore = state.mastery[activeGeneratorPath]?.score || 0;

    recordQuestionAttempt(activeGeneratorPath, isCorrect, currentHintStep, stepsList.length || 3);

    // Calculate mastery score difference
    const newScore = state.mastery[activeGeneratorPath]?.score || 0;
    const scoreDiff = newScore - oldScore;
    const diffBadge = scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`;
    const diffColor = scoreDiff >= 0 ? "#15803d" : "#b91c1c";

    // Live update top banner mastery value
    const topMasteryEl = document.querySelector("#top-nav-mastery-val");
    if (topMasteryEl) topMasteryEl.innerText = newScore;

    if (isCorrect) {
      sessionScore++;
      addXP(10);
      if (feedbackEl) {
        feedbackEl.style.padding = "8px 12px";
        feedbackEl.style.background = "#d1fae5";
        feedbackEl.style.color = "#065f46";
        feedbackEl.innerHTML = `Correct! 🎉 +10 XP  |  Mastery: <strong>${newScore}</strong> <span style="color:${diffColor}; font-weight:800;">(${diffBadge})</span>`;
      }
    } else {
      if (feedbackEl) {
        feedbackEl.style.padding = "8px 12px";
        feedbackEl.style.background = "#fee2e2";
        feedbackEl.style.color = "#991b1b";
        feedbackEl.innerHTML = `Incorrect. Expected: <strong>${currentQuestion.expectedAnswer}</strong>  |  Mastery: <strong>${newScore}</strong> <span style="color:${diffColor}; font-weight:800;">(${diffBadge})</span>`;
      }
    }

    if (stepsList.length > 0 && solutionBox) {
      solutionBox.style.display = "block";
      solutionBox.innerHTML = `
        <h5 style="margin: 0 0 6px 0; font-size: 0.9rem; color: #1e293b;">📖 Full Solution Review:</h5>
        <ol style="padding-left: 18px; margin: 0; font-size: 0.85rem; color: #334155;">
          ${stepsList.map(step => `<li style="margin-bottom: 4px;">${step}</li>`).join("")}
        </ol>
      `;
      renderKaTeX(solutionBox);
    }

    const currentScore = state.mastery[activeGeneratorPath]?.score || 0;
    if (isSkillTree && currentScore >= targetMastery) {
      setTimeout(() => finishSession(true), 1200);
    }
  }

  // Session Completion
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
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: calc(100dvh - 72px); padding: 20px;">
        <div class="card" style="max-width: 520px; width: 100%; text-align: center; padding: 32px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          <h2 style="font-size: 1.8rem; color: #0f172a; margin-bottom: 6px;">${titleText}</h2>
          <p style="font-size: 1rem; color: var(--text-muted); margin: 8px 0 20px 0;">
            Final Score: <strong>${summary.sessionScore} / ${summary.totalQuestions}</strong>
          </p>

          <div style="width: 100%; margin-bottom: 24px; text-align: left;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px;">Mastery Score Summary:</div>
            ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.88rem;">Session finished.</div>'}
          </div>

          <button id="btn-return-dash" class="keypad-btn submit" style="padding: 14px 28px; font-size: 1rem; cursor: pointer; width: 100%;">
            Return to Dashboard
          </button>
        </div>
      </div>
    `;

    container.querySelector("#btn-return-dash")?.addEventListener("click", () => {
      navigateTo("dashboard");
    });
  }

  loadQuestion();
}
