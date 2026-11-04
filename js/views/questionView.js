import { state, addXP, recordQuestionAttempt } from "../state.js";
import { loadQuestionGenerator } from "../questions/loader.js";
import { syncUserProgress, syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";
import { renderKaTeX } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";

/**
 * Enhanced iPad/Landscape 2-Panel Question Workspace Runner
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
  let activeLayoutMode = "balanced"; // 'balanced', 'diagram-focus', 'canvas-focus'
  let isKeypadCollapsed = false;
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

  // Single Next Question Event Handler (Prevents duplicate listener stacking)
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

  // Render Workspace
  async function loadQuestion() {
    if (!isSkillTree && questionIndex >= totalQuestions) {
      finishSession();
      return;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100dvh; background: #f8fafc; color: #64748b; font-weight: 700;">
        <h3>🎲 Loading Question ${questionIndex + 1}...</h3>
      </div>
    `;

    currentQuestion = await fetchNextQuestion();
    currentHintStep = 0;
    activeAnswer = "";

    if (!currentQuestion) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100dvh;">
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

    let modeBadge = `<span class="tag" style="background: #e0f2fe; color: #0369a1; font-weight: 700;">📅 Daily Quest</span>`;
    if (isSkillTree) modeBadge = `<span class="tag" style="background: #f0fdf4; color: #15803d; font-weight: 700;">🌳 Skill Mastery</span>`;
    if (isSRS) modeBadge = `<span class="tag" style="background: #fef3c7; color: #b45309; font-weight: 700;">🔄 Memory Refresher</span>`;

    const progressText = isSkillTree ? `Question ${questionIndex + 1}` : `Q${questionIndex + 1} of ${totalQuestions}`;
    const skipBtnHtml = allowSkip ? `<button id="btn-skip-question" class="secondary-btn" style="background: #fff7ed; color: #c2410c; border-color: #ffedd5;">Skip ⏭️</button>` : "";
    const exitBtnText = isSkillTree ? "💾 Save & Exit" : "← Exit";
    const stepsList = currentQuestion.steps || currentQuestion.hints || [];

    const diagramSvgContent = currentQuestion.diagramSvg || currentQuestion.svg || "";
    const diagramHtml = (diagramSvgContent || currentQuestion.imageUrl) ? `
      <div id="diagram-viewport" style="margin-top: 8px; width: 100%; max-height: 230px; display: flex; justify-content: center; align-items: center; background: #fafafa; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px; box-sizing: border-box; overflow: hidden;">
        ${diagramSvgContent || `<img src="${currentQuestion.imageUrl}" style="max-width: 100%; max-height: 210px; object-fit: contain;">`}
      </div>
    ` : "";

    // 2-PANEL IPAD/LANDSCAPE ADAPTIVE DOM STRUCTURE
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100dvh; width: 100vw; overflow: hidden; background: #f1f5f9; box-sizing: border-box;">
        
        <!-- TOP TOOLBAR & VIEWPORT CONTROL BAR -->
        <header style="height: 50px; background: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; flex-shrink: 0; user-select: none;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-exit-dashboard" class="secondary-btn" style="padding: 6px 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer;">${exitBtnText}</button>
            ${modeBadge}
            <span style="font-weight: 700; color: #64748b; font-size: 0.88rem;">${progressText}</span>
          </div>

          <!-- VIEWPORT LAYOUT MODE TOGGLES -->
          <div style="display: flex; gap: 6px; align-items: center;">
            <button class="layout-toggle-btn active" data-mode="balanced" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #eff6ff; color: #2563eb; font-weight: 700; font-size: 0.8rem; cursor: pointer;">📐 Split 50/50</button>
            <button class="layout-toggle-btn" data-mode="diagram-focus" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #475569; font-weight: 700; font-size: 0.8rem; cursor: pointer;">🔍 Focus Diagram</button>
            <button class="layout-toggle-btn" data-mode="canvas-focus" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #475569; font-weight: 700; font-size: 0.8rem; cursor: pointer;">✏️ Max Working</button>
            ${diagramSvgContent ? `<button id="btn-trace-diagram" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #bfdbfe; background: #f0fdf4; color: #166534; font-weight: 700; font-size: 0.8rem; cursor: pointer;">🎨 Trace on Canvas</button>` : ''}
          </div>
        </header>

        <!-- MAIN 2-PANEL FLEX WORKSPACE -->
        <main id="ipad-workspace" style="display: flex; flex: 1; height: calc(100dvh - 50px); overflow: hidden; padding: 10px; gap: 10px; box-sizing: border-box;">
          
          <!-- LEFT PANEL: PINNED PROMPT/DIAGRAM & INDEPENDENT SCROLL HINTS -->
          <section id="left-panel" style="flex: 0 0 42%; display: flex; flex-direction: column; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 14px; box-sizing: border-box; overflow: hidden; transition: flex 0.2s ease;">
            
            <!-- PINNED TOP AREA (PROMPT & ENLARGED DIAGRAM - NO SCROLL) -->
            <div style="flex-shrink: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span class="tag" style="font-size: 0.75rem; font-weight: 700; color: #475569;">${currentQuestion.strand || 'Algebra'}</span>
                <span style="font-size: 0.88rem; font-weight: 700; color: #1e293b;">${currentSkillTitle}</span>
              </div>
              
              <div id="question-prompt" class="math-display" style="font-size: 1.05rem; line-height: 1.45; color: #0f172a; margin-top: 6px;">
                ${currentQuestion.prompt}
              </div>

              ${diagramHtml}
            </div>

            <!-- INDEPENDENT BOTTOM SCROLL AREA (HINTS & SOLUTIONS ONLY) -->
            <div style="flex: 1; overflow-y: auto; padding-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <button id="btn-ask-hint" class="hint-btn" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
                  💡 Ask for Hint (<span id="hint-count">0</span>/${stepsList.length})
                </button>
                ${skipBtnHtml}
              </div>
              <div id="hints-container" class="hints-list"></div>
              <div id="daily-feedback" class="feedback-area" style="margin-top: 8px; font-weight: 700; border-radius: 8px;"></div>
              <div id="full-solution-container" class="solution-box" style="display: none; margin-top: 8px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;"></div>
            </div>

          </section>

          <!-- RIGHT PANEL: SCRATCHPAD CANVAS & KEYPAD DOCK -->
          <section id="right-panel" style="flex: 1; display: flex; flex-direction: column; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 10px; box-sizing: border-box; overflow: hidden; position: relative;">
            
            <!-- SCRATCHPAD WORKSPACE -->
            <div class="practice-col" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
              <div class="scratchpad-toolbar" style="margin-bottom: 6px;">
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
                  <button id="btn-toggle-keypad-view" class="tool-icon-btn" title="Toggle Keypad Visibility" style="font-size: 0.8rem; font-weight: 700; width: auto; padding: 0 8px;">⌨️ Hide</button>
                  <button id="btn-clear-canvas" class="tool-icon-btn" title="Clear Canvas">🗑️</button>
                </div>
              </div>

              <div class="canvas-wrapper" style="flex: 1; position: relative; border-radius: 10px; overflow: hidden; background: #fafafa; border: 1px dashed #cbd5e1;">
                <div id="canvas-watermark" style="position: absolute; inset: 0; display: none; opacity: 0.18; pointer-events: none; justify-content: center; align-items: center; padding: 10px;">
                  ${diagramSvgContent}
                </div>
                <canvas id="scratchpad-canvas"></canvas>
              </div>
            </div>

            <!-- KEYPAD DOCK SECTION -->
            <div id="keypad-dock-section" class="practice-col keypad-col" style="flex-shrink: 0; margin-top: 8px; transition: all 0.25s ease;">
              <div style="font-weight: 700; font-size: 0.82rem; margin-bottom: 4px; flex-shrink: 0; color: #475569; display: flex; justify-content: space-between;">
                <span>Enter Answer:</span>
              </div>
              <div id="keypad-display" class="answer-display-box"></div>
              <div class="keypad-grid"></div>
            </div>

          </section>

        </main>
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

    // Layout Viewport Mode Toggles
    const leftPanel = container.querySelector("#left-panel");
    const rightPanel = container.querySelector("#right-panel");

    container.querySelectorAll(".layout-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".layout-toggle-btn").forEach(b => {
          b.style.background = "#ffffff";
          b.style.color = "#475569";
        });
        btn.style.background = "#eff6ff";
        btn.style.color = "#2563eb";

        activeLayoutMode = btn.getAttribute("data-mode");
        if (activeLayoutMode === "diagram-focus") {
          leftPanel.style.flex = "0 0 65%";
          rightPanel.style.flex = "1";
        } else if (activeLayoutMode === "canvas-focus") {
          leftPanel.style.flex = "0 0 28%";
          rightPanel.style.flex = "1";
        } else {
          leftPanel.style.flex = "0 0 42%";
          rightPanel.style.flex = "1";
        }
      });
    });

    // Toggle Keypad Visibility (Reclaims canvas space)
    const keypadDock = container.querySelector("#keypad-dock-section");
    const toggleKeypadBtn = container.querySelector("#btn-toggle-keypad-view");
    toggleKeypadBtn?.addEventListener("click", () => {
      isKeypadCollapsed = !isKeypadCollapsed;
      if (isKeypadCollapsed) {
        keypadDock.style.display = "none";
        toggleKeypadBtn.innerText = "⌨️ Show";
      } else {
        keypadDock.style.display = "flex";
        toggleKeypadBtn.innerText = "⌨️ Hide";
      }
    });

    // Trace Diagram Watermark Toggle
    const traceBtn = container.querySelector("#btn-trace-diagram");
    const watermarkEl = container.querySelector("#canvas-watermark");
    traceBtn?.addEventListener("click", () => {
      if (watermarkEl) {
        const isHidden = watermarkEl.style.display === "none";
        watermarkEl.style.display = isHidden ? "flex" : "none";
        traceBtn.style.background = isHidden ? "#dcfce7" : "#f0fdf4";
      }
    });

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
      hintCard.style.cssText = "background: #fffbe3; border-left: 4px solid #f59e0b; padding: 8px 10px; margin-bottom: 6px; border-radius: 6px; color: #78350f; font-size: 0.85rem;";
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
      feedbackEl.style.padding = "8px 12px";
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
        feedbackEl.style.padding = "8px 12px";
        feedbackEl.style.background = "#d1fae5";
        feedbackEl.style.color = "#065f46";
        feedbackEl.innerText = isSRS ? "Correct! 🎉 Memory restored." : "Correct! 🎉 +10 XP";
      }
    } else {
      if (feedbackEl) {
        feedbackEl.style.padding = "8px 12px";
        feedbackEl.style.background = "#fee2e2";
        feedbackEl.style.color = "#991b1b";
        feedbackEl.innerText = `Incorrect. Expected: ${currentQuestion.expectedAnswer}`;
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
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100dvh; padding: 20px;">
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
