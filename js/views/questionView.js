import { state, addXP, recordQuestionAttempt } from "../state.js";
import { loadQuestionGenerator } from "../questions/loader.js";
import { syncUserProgress, syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";
import { renderKaTeX } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";

/**
 * Enhanced 2-Column Question Practice Runner
 * Left Column: Scrollable Question Prompt + Direct Scratchpad Overlay
 * Right Column: Scrollable Hints + Strategy C Tabbed Keypad
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
  let activeKeypadTab = "basic"; // 'basic' or 'math'
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

  // Render 2-Column Workspace
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

    let modeBadge = `<span class="tag" style="background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 2px 8px; border-radius: 6px; font-size: 0.78rem;">📅 Daily Quest</span>`;
    if (isSkillTree) modeBadge = `<span class="tag" style="background: #f0fdf4; color: #15803d; font-weight: 700; padding: 2px 8px; border-radius: 6px; font-size: 0.78rem;">🌳 Skill Mastery</span>`;
    if (isSRS) modeBadge = `<span class="tag" style="background: #fef3c7; color: #b45309; font-weight: 700; padding: 2px 8px; border-radius: 6px; font-size: 0.78rem;">🔄 Memory Refresher</span>`;

    const progressText = isSkillTree ? `Question ${questionIndex + 1}` : `Q${questionIndex + 1} of ${totalQuestions}`;
    const exitBtnText = isSkillTree ? "💾 Save & Exit" : "← Exit";
    const stepsList = currentQuestion.steps || currentQuestion.hints || [];

    // Student Profile Info String (Name | Class/Year)
    const displayName = state.profile ? (state.profile.displayName || state.profile.name || "Student") : "Student";
    const classInfo = state.profile ? `${state.profile.year || ''} ${state.profile.stream || ''}`.trim() : "";
    const studentInfoStr = classInfo ? `${displayName} (${classInfo})` : displayName;

    const diagramSvgContent = currentQuestion.diagramSvg || currentQuestion.svg || "";
    const diagramHtml = (diagramSvgContent || currentQuestion.imageUrl) ? `
      <div id="diagram-viewport" style="margin-top: 10px; width: 100%; max-height: 240px; display: flex; justify-content: center; align-items: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px; box-sizing: border-box; overflow: hidden;">
        ${diagramSvgContent || `<img src="${currentQuestion.imageUrl}" style="max-width: 100%; max-height: 220px; object-fit: contain;">`}
      </div>
    ` : "";

    // Keypad Layout Config for Strategy C
    const basicKeypadKeys = [
      ["7", "8", "9", "/"],
      ["4", "5", "6", "*"],
      ["1", "2", "3", "-"],
      ["0", ".", "⌫", "+"]
    ];

    const mathKeypadKeys = [
      ["x", "y", "(", ")"],
      ["x²", "xⁿ", "√", "/"],
      ["+", "-", "=", "π"],
      ["0", ".", "⌫", "Clear"]
    ];

    const currentKeypadLayout = currentQuestion.keypad || basicKeypadKeys;

    // CONSOLIDATED 2-COLUMN DOM STRUCTURE
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100dvh; width: 100vw; overflow: hidden; background: #f1f5f9; box-sizing: border-box;">
        
        <!-- SINGLE CONSOLIDATED TOP NAVBAR (44px Height) -->
        <header style="height: 44px; background: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; padding: 0 14px; flex-shrink: 0; user-select: none;">
          
          <!-- LEFT: Exit | Mode Badge | Student Name & Class -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-exit-dashboard" class="secondary-btn" style="padding: 4px 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">${exitBtnText}</button>
            ${modeBadge}
            <span style="font-weight: 700; color: #475569; font-size: 0.85rem; border-left: 1px solid #cbd5e1; padding-left: 10px;">${studentInfoStr}</span>
          </div>

          <!-- CENTER: Progress Indicator -->
          <div style="font-weight: 800; color: #1e293b; font-size: 0.9rem; background: #f1f5f9; padding: 3px 12px; border-radius: 12px; border: 1px solid #e2e8f0;">
            ${progressText}
          </div>

          <!-- RIGHT: Integrated Scratchpad Toolbar Controls -->
          <div class="scratchpad-toolbar" style="margin: 0; padding: 0; background: transparent; border: none; gap: 6px;">
            <div class="tool-group" style="padding: 2px;">
              <button class="tool-icon-btn active" data-tool="pen" title="Pen" style="width: 28px; height: 28px; font-size: 0.85rem;">✏️</button>
              <button class="tool-icon-btn" data-tool="eraser" title="Eraser" style="width: 28px; height: 28px; font-size: 0.85rem;">🧹</button>
              <button class="tool-icon-btn" data-tool="pointer" title="Pointer" style="width: 28px; height: 28px; font-size: 0.85rem;">🖐️</button>
            </div>

            <div class="tool-group" style="padding: 2px;">
              <div class="color-swatch active" data-color="#1e293b" style="background: #1e293b; width: 18px; height: 18px;"></div>
              <div class="color-swatch" data-color="#2563eb" style="background: #2563eb; width: 18px; height: 18px;"></div>
              <div class="color-swatch" data-color="#dc2626" style="background: #dc2626; width: 18px; height: 18px;"></div>
              <div class="color-swatch" data-color="#16a34a" style="background: #16a34a; width: 18px; height: 18px;"></div>
            </div>

            <div class="tool-group" style="padding: 2px;">
              <button id="btn-clear-canvas" class="tool-icon-btn" title="Clear Canvas" style="width: 28px; height: 28px; font-size: 0.85rem;">🗑️</button>
            </div>
          </div>
        </header>

        <!-- MAIN 2-COLUMN WORKSPACE -->
        <main style="display: flex; flex: 1; height: calc(100dvh - 44px); overflow: hidden; padding: 8px; gap: 8px; box-sizing: border-box;">
          
          <!-- LEFT COLUMN (55% Width): QUESTION PROMPT + SCROLLABLE CANVAS OVERLAY -->
          <section id="left-column-workspace" style="flex: 0 0 55%; background: #ffffff; border-radius: 14px; border: 1px solid #cbd5e1; box-sizing: border-box; overflow-y: auto; position: relative;">
            
            <!-- TALL PAPER WRAPPER (Allows scrolling down for extra scratchpad space) -->
            <div id="scratchpad-scroll-wrapper" style="position: relative; min-height: 1200px; width: 100%; padding: 16px; box-sizing: border-box;">
              
              <!-- UNDERLAY: QUESTION PROMPT & DIAGRAM -->
              <div id="question-underlay" style="position: relative; z-index: 1; pointer-events: none; max-width: 100%;">
                
                <!-- SKILL TITLE ONLY (NO STRAND TAG) -->
                <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
                  ${currentSkillTitle}
                </div>

                <div id="question-prompt" class="math-display" style="font-size: 1.08rem; line-height: 1.5; color: #1e293b;">
                  ${currentQuestion.prompt}
                </div>

                ${diagramHtml}
              </div>

              <!-- OVERLAY: TRANSPARENT SCRATCHPAD CANVAS -->
              <div class="canvas-wrapper" style="position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; background: transparent;">
                <canvas id="scratchpad-canvas" style="width: 100%; height: 100%; display: block; touch-action: none;"></canvas>
              </div>

            </div>
          </section>

          <!-- RIGHT COLUMN (45% Width): HINTS/FEEDBACK & STRATEGY C KEYPAD -->
          <section style="flex: 1; display: flex; flex-direction: column; background: #ffffff; border-radius: 14px; border: 1px solid #cbd5e1; padding: 10px; box-sizing: border-box; overflow: hidden;">
            
            <!-- TOP HALF: SCROLLABLE HINTS & SOLUTION FEEDBACK -->
            <div style="flex: 1; overflow-y: auto; padding-right: 4px; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <button id="btn-ask-hint" class="hint-btn" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
                  💡 Ask for Hint (<span id="hint-count">0</span>/${stepsList.length})
                </button>
              </div>
              
              <div id="hints-container" class="hints-list"></div>
              <div id="daily-feedback" class="feedback-area" style="margin-top: 8px; font-weight: 700; border-radius: 8px;"></div>
              <div id="full-solution-container" class="solution-box" style="display: none; margin-top: 8px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;"></div>
            </div>

            <!-- BOTTOM HALF: STRATEGY C TABBED KEYPAD DOCK -->
            <div id="keypad-dock-section" class="practice-col keypad-col" style="flex-shrink: 0; height: 265px; display: flex; flex-direction: column; justify-content: space-between;">
              
              <!-- STRATEGY C SEGMENTED TAB SWITCHER -->
              <div style="display: flex; gap: 4px; background: #f1f5f9; padding: 3px; border-radius: 8px; margin-bottom: 6px; flex-shrink: 0;">
                <button type="button" id="tab-keypad-basic" class="keypad-tab-btn active" style="flex: 1; padding: 5px; font-size: 0.78rem; font-weight: 700; border: none; border-radius: 6px; cursor: pointer; background: #2563eb; color: #ffffff;">
                  🔢 Basic (123)
                </button>
                <button type="button" id="tab-keypad-math" class="keypad-tab-btn" style="flex: 1; padding: 5px; font-size: 0.78rem; font-weight: 700; border: none; border-radius: 6px; cursor: pointer; background: transparent; color: #64748b;">
                  ∛ Math Symbols
                </button>
              </div>

              <!-- LIVE ANSWER DISPLAY BOX -->
              <div id="keypad-display" class="answer-display-box" style="height: 38px; margin-bottom: 6px; flex-shrink: 0;"></div>

              <!-- KEYPAD GRID CONTAINER (FIXED HEIGHT) -->
              <div class="keypad-grid" style="flex: 1; display: grid; gap: 4px;"></div>
            
            </div>

          </section>

        </main>
      </div>
    `;

    renderKaTeX(container.querySelector("#question-prompt"));
    
    // Initialize Scratchpad Canvas Component
    initScratchpad(container);

    // Render Strategy C Keypad Layout Function
    function renderKeypadLayout(layoutKeys) {
      initKeypad(
        container,
        layoutKeys,
        (val) => { activeAnswer = val; },
        (val) => { handleSubmission(val); }
      );
    }

    // Default Keypad Initialization
    renderKeypadLayout(currentKeypadLayout);

    // Keypad Strategy C Tab Listeners
    const tabBasic = container.querySelector("#tab-keypad-basic");
    const tabMath = container.querySelector("#tab-keypad-math");

    tabBasic?.addEventListener("click", () => {
      activeKeypadTab = "basic";
      tabBasic.style.background = "#2563eb";
      tabBasic.style.color = "#ffffff";
      tabMath.style.background = "transparent";
      tabMath.style.color = "#64748b";
      renderKeypadLayout(basicKeypadKeys);
    });

    tabMath?.addEventListener("click", () => {
      activeKeypadTab = "math";
      tabMath.style.background = "#2563eb";
      tabMath.style.color = "#ffffff";
      tabBasic.style.background = "transparent";
      tabBasic.style.color = "#64748b";
      renderKeypadLayout(mathKeypadKeys);
    });

    // Progressive Hints Listener
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

    // Exit Button Handler
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

  // Submission Evaluator
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
