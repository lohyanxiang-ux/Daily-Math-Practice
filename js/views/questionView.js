import { state, addXP, recordQuestionAttempt } from "../state.js";
import { loadQuestionGenerator } from "../questions/loader.js";
import { syncUserProgress, syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";
import { renderKaTeX } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";
import { textToLatex } from "../utils/mathFormatter.js";

const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbwEsVnKapmwUFuv0vyG1wFvyAXoFKQMrpsNxibUqYh891PHXzFgmBThnT62lGoEPo_xiQ/exec";

function getApiUrl() {
  let apiUrl = state.apiUrl || 
               state.config?.apiUrl || 
               state.backendUrl || 
               state.scriptUrl || 
               window.APP_CONFIG?.apiUrl || 
               window.API_URL || 
               localStorage.getItem("math_app_api_url") || 
               DEFAULT_API_URL;
  if (apiUrl && !apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
    apiUrl = "https://" + apiUrl;
  }
  return apiUrl;
}

function escapeHtml(str) {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

export function renderQuestionView(container, options = {}) {
  const mode = options.mode || "dailyQuest";
  const isDailyQuest = mode === "dailyQuest";
  const isSkillTree = mode === "skillTree";
  const isSRS = mode === "srsReview" || mode === "smartReview";
  const isLiveSession = mode === "liveSession";

  let queue = Array.isArray(options.queue) && options.queue.length > 0 ? options.queue : [];
  let activeGeneratorPath = options.generatorPath || "";

  const totalQuestions = options.maxQuestions || (isDailyQuest ? 5 : (isSRS ? queue.length || 4 : Infinity));
  const targetMastery = options.targetMastery || 90;

  // Dynamic Target Score Resolution (Supports options.targetScore, options.targetVal, or live session target)
  let currentLiveTargetScore = options.targetScore || options.targetVal || options.targetScoreVal || null;

  let questionIndex = 0;
  let sessionScore = 0;
  let totalAttemptedCount = 0;
  let currentQuestion = null;
  let activeAnswer = "";
  let currentHintStep = 0;
  let currentSkillTitle = "Practice Skill";
  const sessionInitialScores = {};

  let targetScoreAchievedAlertShown = false;
  let liveSessionCheckTimer = null;

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

  const handleNextQuestionTrigger = () => {
    questionIndex++;
    loadQuestion();
  };

  container.removeEventListener("triggerNextQuestion", handleNextQuestionTrigger);
  container.addEventListener("triggerNextQuestion", handleNextQuestionTrigger);

  function cleanupListeners() {
    document.removeEventListener("visibilitychange", visibilityHandler);
    container.removeEventListener("triggerNextQuestion", handleNextQuestionTrigger);
    if (liveSessionCheckTimer) {
      clearInterval(liveSessionCheckTimer);
      liveSessionCheckTimer = null;
    }
    const topNav = document.querySelector(".top-nav");
    if (topNav && window._originalTopNavHtml) {
      topNav.innerHTML = window._originalTopNavHtml;
      delete window._originalTopNavHtml;
    }
  }

  /**
   * Prompts the student with an interactive target achievement modal.
   * Allows explicit acknowledgment while letting them continue practice uninterrupted.
   */
  function showTargetScoreAchievedModal(targetScore, currentScore) {
    const existingModal = document.querySelector("#target-achieved-modal-overlay");
    if (existingModal) existingModal.remove();

    const overlay = document.createElement("div");
    overlay.id = "target-achieved-modal-overlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(5px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      animation: fadeIn 0.25s ease-out;
    `;

    overlay.innerHTML = `
      <div style="
        background: #ffffff;
        border-radius: 20px;
        max-width: 440px;
        width: 100%;
        padding: 28px 24px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 2px solid #3b82f6;
        box-sizing: border-box;
      ">
        <div style="font-size: 3.5rem; margin-bottom: 10px; line-height: 1;">🎯🎉</div>
        <h3 style="margin: 0 0 8px 0; font-size: 1.45rem; font-weight: 800; color: #0f172a;">Target Score Reached!</h3>
        <p style="margin: 0 0 16px 0; font-size: 0.95rem; color: #475569; line-height: 1.5;">
          Congratulations! You have successfully reached the target mastery score of <strong style="color: #2563eb;">${targetScore}</strong> (Your Score: <strong>${currentScore}</strong>).
        </p>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px; margin-bottom: 22px; color: #1e40af; font-size: 0.88rem; font-weight: 700;">
          💪 Keep practicing to push your mastery even higher!
        </div>
        <button id="btn-ack-target-achieved" style="
          width: 100%;
          padding: 13px 20px;
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
          background: #2563eb;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
          transition: background 0.15s ease;
        ">
          Continue Practice ➔
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#btn-ack-target-achieved")?.addEventListener("click", () => {
      overlay.remove();
    });
  }

  if (isLiveSession) {
    const studentClass = state.profile?.class || state.profile?.className || state.user?.class || "";
    const studentEmail = state.profile?.email || state.profile?.studentEmail || state.user?.email || "";

    liveSessionCheckTimer = setInterval(async () => {
      if (!studentClass) return;
      try {
        const response = await fetch(getApiUrl(), {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "getLiveSessionData",
            token: state.userToken || state.token || (studentEmail ? ("PIN_AUTH_" + studentEmail) : "STUDENT_SESSION"),
            className: studentClass
          })
        });

        const resData = await response.json();
        if (resData.status === "success") {
          const activeSession = resData.activeSession;
          
          if (activeSession) {
            // Extract & sync target score dynamically from active live session
            const sessTargetType = String(activeSession.targetType || "").toUpperCase();
            if (sessTargetType === "SCORE") {
              const val = Number(activeSession.targetVal ?? activeSession.targetScore ?? activeSession.targetValue ?? 0);
              if (val > 0) currentLiveTargetScore = val;
            }
          }

          const isEnded = !activeSession || 
                          activeSession.status === "ENDED" || 
                          activeSession.status === "CLOSED" ||
                          activeSession.isEnded === true ||
                          (options.sessionId && activeSession.sessionId !== options.sessionId);

          if (isEnded) {
            cleanupListeners();
            renderStudentLiveSummary();
          }
        }
      } catch (err) {
        console.error("Error monitoring live session status:", err);
      }
    }, 4000);
  }

  async function fetchNextQuestion() {
    let queueItem = null;

    if (queue.length > 0) {
      if (isLiveSession) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        queueItem = queue[randomIndex];
      } else if (isSkillTree) {
        queueItem = queue[questionIndex % queue.length];
      } else {
        queueItem = queue[questionIndex];
      }
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
    if (isLiveSession) { modeBadgeText = "📡 Live Class Practice"; modeBadgeBg = "#f0fdf4"; modeBadgeColor = "#15803d"; }

    const exitBtnText = (isSkillTree || isLiveSession) ? "💾 Save & Exit" : "← Exit";
    const progressText = (isSkillTree || isLiveSession) ? `Question ${questionIndex + 1}` : `Q${questionIndex + 1} of ${totalQuestions}`;

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
        <span class="stat" style="background: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 6px; border: 1px solid #bfdbfe; font-size: 0.82rem;">
          🎯 Mastery <b id="top-nav-mastery-val">${currentMastery}</b>
        </span>
        <span class="stat">XP <b id="top-nav-xp-val">${userXp}</b></span>
        <span class="stat">Streak <b>${userStreak}</b> 🔥</span>
        <span style="font-size: 0.85rem; font-weight: 700; color: #475569; background: #f1f5f9; padding: 4px 10px; border-radius: 8px;">${displayName}</span>
      </div>
    `;

    topNav.querySelector("#btn-top-exit")?.addEventListener("click", () => {
      cleanupListeners();
      flushMasterySync();
      if (typeof options.onExit === "function") options.onExit();
      else navigateTo("dashboard");
    });
  }

  async function loadQuestion() {
    if (!isSkillTree && !isLiveSession && questionIndex >= totalQuestions) {
      finishSession();
      return;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: calc(100dvh - 96px); background: #f8fafc; color: #64748b; font-weight: 700;">
        <h3>🎲 Loading Question ${questionIndex + 1}...</h3>
      </div>
    `;

    currentQuestion = await fetchNextQuestion();
    currentHintStep = 0;
    activeAnswer = "";

    if (!currentQuestion) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: calc(100dvh - 96px);">
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

    updateGlobalTopNav();

    const stepsList = currentQuestion.steps || currentQuestion.hints || [];
    const diagramSvgContent = currentQuestion.diagramSvg || currentQuestion.svg || "";
    const diagramHtml = (diagramSvgContent || currentQuestion.imageUrl) ? `
      <div id="diagram-viewport" style="margin-top: 14px; width: 100%; max-height: 200px; display: flex; justify-content: center; align-items: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px; box-sizing: border-box; overflow: hidden;">
        ${diagramSvgContent || `<img src="${currentQuestion.imageUrl}" style="max-width: 100%; max-height: 180px; object-fit: contain;">`}
      </div>
    ` : "";

    container.innerHTML = `
      <main style="display: flex; height: calc(100dvh - 96px); max-height: calc(100dvh - 96px); width: 100%; overflow: hidden; padding: 4px 8px 10px 8px; gap: 8px; box-sizing: border-box; background: #f1f5f9;">
        
        <!-- LEFT COLUMN WORKSPACE -->
        <section id="left-column-workspace" style="flex: 1 1 52%; min-width: 0; display: flex; flex-direction: column; background: #ffffff; border-radius: 14px; border: 1px solid #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.04); box-sizing: border-box; overflow: hidden; height: 100%;">
          
          <div class="scratchpad-toolbar" style="padding: 4px 10px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">✏️ Scratchpad Workspace</div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <div class="tool-group" style="padding: 2px;">
                <button class="tool-icon-btn active" data-tool="pen" title="Pen" style="width: 26px; height: 26px; font-size: 0.78rem;">✏️</button>
                <button class="tool-icon-btn" data-tool="eraser" title="Eraser" style="width: 26px; height: 26px; font-size: 0.78rem;">🧹</button>
                <button class="tool-icon-btn" data-tool="pointer" title="Pointer" style="width: 26px; height: 26px; font-size: 0.78rem;">🖐️</button>
              </div>

              <div class="tool-group" style="padding: 2px;">
                <div class="color-swatch active" data-color="#1e293b" style="background: #1e293b; width: 14px; height: 14px;"></div>
                <div class="color-swatch" data-color="#2563eb" style="background: #2563eb; width: 14px; height: 14px;"></div>
                <div class="color-swatch" data-color="#dc2626" style="background: #dc2626; width: 14px; height: 14px;"></div>
                <div class="color-swatch" data-color="#16a34a" style="background: #16a34a; width: 14px; height: 14px;"></div>
              </div>

              <div class="tool-group" style="padding: 2px;">
                <button id="btn-clear-canvas" class="tool-icon-btn" title="Clear Canvas" style="width: 26px; height: 26px; font-size: 0.78rem;">🗑️</button>
              </div>
            </div>
          </div>

          <div style="flex: 1; overflow-y: auto; position: relative;">
            <div id="scratchpad-scroll-wrapper" style="position: relative; min-height: 1200px; width: 100%; padding: 12px; box-sizing: border-box;">
              
              <div id="question-underlay" style="position: relative; z-index: 1; pointer-events: none; max-width: 100%;">
                <div id="question-prompt" class="math-display" style="
                  font-size: 1.08rem; 
                  line-height: 2.2; 
                  color: #1e293b; 
                  background: #f8fafc; 
                  border-left: 4px solid #2563eb; 
                  padding: 18px 16px; 
                  min-height: 100px;
                  border-radius: 10px; 
                  overflow-x: auto; 
                  overflow-y: visible; 
                  margin-bottom: 12px; 
                  box-sizing: border-box;
                  display: block;
                ">
                  ${currentQuestion.prompt}
                </div>
                ${diagramHtml}
              </div>

              <div class="canvas-wrapper" style="position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; background: transparent;">
                <canvas id="scratchpad-canvas" style="width: 100%; height: 100%; display: block; touch-action: none;"></canvas>
              </div>

            </div>
          </div>

        </section>

        <!-- RIGHT COLUMN: HINTS & KEYPAD -->
        <section style="flex: 1 1 48%; min-width: 310px; max-width: 50%; display: flex; flex-direction: column; background: #ffffff; border-radius: 14px; border: 1px solid #cbd5e1; padding: 6px 8px 12px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); box-sizing: border-box; overflow: hidden; height: 100%;">
          
          <div id="hints-scroll-area" style="
            flex: 1 1 0%;
            min-height: 0;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-y;
            padding-right: 4px;
            margin-bottom: 4px;
            border-bottom: 1.5px solid #e2e8f0;
            position: relative;
            z-index: 5;
            box-sizing: border-box;
            word-break: break-word;
          ">
            <div id="hints-container" class="hints-list"></div>
            <div id="daily-feedback" class="feedback-area" style="margin-top: 4px; font-weight: 700; border-radius: 8px;"></div>
            
            <div id="troubleshoot-debug-box" style="display: none; margin-top: 6px; padding: 6px 8px; background: #0f172a; color: #f8fafc; border-radius: 8px; font-family: monospace; font-size: 0.75rem; line-height: 1.4; overflow-x: auto; border: 1px solid #334155;"></div>

            <div id="full-solution-container" class="solution-box" style="display: none; margin-top: 6px; padding: 8px; background: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1; box-sizing: border-box; overflow: visible;"></div>
          </div>

          <div id="keypad-dock-section" style="
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            gap: 3px;
            z-index: 10;
            position: relative;
            background: #ffffff;
            box-sizing: border-box;
            padding-bottom: 14px;
          ">
            <div id="keypad-display" style="width: 100%; box-sizing: border-box;"></div>
            <div class="keypad-grid" style="width: 100%; box-sizing: border-box;"></div>
          </div>

        </section>

      </main>
    `;

    renderKaTeX(container.querySelector("#question-prompt"));
    initScratchpad(container);

    initKeypad(
      container,
      currentQuestion,
      (val) => { activeAnswer = val; },
      (val) => { handleSubmission(val); }
    );

    const hintsContainer = container.querySelector("#hints-container");
    const hintsScrollArea = container.querySelector("#hints-scroll-area");

    function scrollHintsToBottom() {
      if (hintsScrollArea) {
        setTimeout(() => {
          hintsScrollArea.scrollTop = hintsScrollArea.scrollHeight;
        }, 50);
      }
    }

    function renderHintButton() {
      const existingBtn = hintsContainer.querySelector(".dynamic-hint-btn");
      if (existingBtn) existingBtn.remove();

      if (currentHintStep < stepsList.length) {
        const nextStepNum = currentHintStep + 1;
        const btn = document.createElement("button");
        btn.className = "dynamic-hint-btn hint-btn";
        btn.style.cssText = "margin: 4px 0; padding: 5px 10px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: block; width: 100%; border-radius: 6px; background: #fffbeb; border: 1px solid #f59e0b; color: #78350f; text-align: center;";
        btn.innerText = `💡 Ask for Hint (${nextStepNum}/${stepsList.length})`;

        btn.addEventListener("click", () => { revealNextHint(); });
        hintsContainer.appendChild(btn);
        scrollHintsToBottom();
      }
    }

    function revealNextHint() {
      if (!stepsList || currentHintStep >= stepsList.length) return;

      const existingBtn = hintsContainer.querySelector(".dynamic-hint-btn");
      if (existingBtn) existingBtn.remove();

      const stepText = stepsList[currentHintStep];
      currentHintStep++;

      const hintCard = document.createElement("div");
      hintCard.className = "hint-card";
      hintCard.style.cssText = "background: #fffbeb; border-left: 4px solid #f59e0b; padding: 6px 8px; margin-bottom: 4px; border-radius: 6px; color: #78350f; font-size: 0.82rem;";
      hintCard.innerHTML = `<strong>Step ${currentHintStep}:</strong> <div>${stepText}</div>`;
      hintsContainer.appendChild(hintCard);
      renderKaTeX(hintCard);

      renderHintButton();
      scrollHintsToBottom();
    }

    if (stepsList.length > 0) renderHintButton();
  }

  // Submission Evaluator & Dynamic Mastery/XP Tracker
  function handleSubmission(userAns) {
    if (!currentQuestion) return;

    totalAttemptedCount++;
    const feedbackEl = container.querySelector("#daily-feedback");
    const debugBox = container.querySelector("#troubleshoot-debug-box");
    const solutionBox = container.querySelector("#full-solution-container");
    const hintsScrollArea = container.querySelector("#hints-scroll-area");
    const stepsList = currentQuestion.steps || currentQuestion.hints || [];

    const requiredForm = currentQuestion.requiredForm || currentQuestion.form || null;
    const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer, requiredForm);
    const oldScore = state.mastery[activeGeneratorPath]?.score || 0;

    recordQuestionAttempt(activeGeneratorPath, isCorrect, currentHintStep, stepsList.length || 3);

    const newScore = state.mastery[activeGeneratorPath]?.score || 0;
    const scoreDiff = newScore - oldScore;
    const diffBadge = scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`;
    const diffColor = scoreDiff >= 0 ? "#15803d" : "#b91c1c";

    const topMasteryEl = document.querySelector("#top-nav-mastery-val");
    if (topMasteryEl) topMasteryEl.innerText = newScore;

    // Resolve active target score dynamically across all possible property options
    const effectiveTargetScore = currentLiveTargetScore || options.targetScore || options.targetVal || (isSkillTree ? targetMastery : null);

    // Present acknowledgment congratulatory popup when target score is achieved
    if (effectiveTargetScore && effectiveTargetScore > 0 && newScore >= effectiveTargetScore && !targetScoreAchievedAlertShown) {
      targetScoreAchievedAlertShown = true;
      showTargetScoreAchievedModal(effectiveTargetScore, newScore);
    }

    if ((isLiveSession || options.sessionId) && options.sessionId) {
      fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "syncLiveAttempt",
          token: state.userToken || state.token || (state.profile?.email ? ("PIN_AUTH_" + state.profile.email) : "STUDENT_SESSION"),
          sessionId: options.sessionId,
          studentEmail: state.profile?.email || state.profile?.studentEmail,
          generatorPath: activeGeneratorPath,
          isCorrect: isCorrect,
          hintsUsed: currentHintStep,
          newScore: newScore,
          oldScore: oldScore
        })
      }).catch(err => console.error("Live attempt sync error:", err));
    }

    const rawUserInputStr = Array.isArray(userAns) ? JSON.stringify(userAns) : String(userAns || "");
    const rawExpectedStr = Array.isArray(currentQuestion.expectedAnswer)
      ? JSON.stringify(currentQuestion.expectedAnswer)
      : String(currentQuestion.expectedAnswer || "");

    if (debugBox) {
      debugBox.style.display = "block";
      debugBox.innerHTML = `
        <div style="font-weight: 800; color: #38bdf8; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
          <span>🔍 RAW LATEX TROUBLESHOOTING DEBUGGER</span>
          <span style="color: ${isCorrect ? '#4ade80' : '#f87171'}; font-weight: 900;">${isCorrect ? '✅ MATCHED' : '❌ MISMATCHED'}</span>
        </div>
        <div><strong>Submitted Input (Raw LaTeX):</strong> <code style="color:#facc15;">${escapeHtml(rawUserInputStr) || '(empty)'}</code></div>
        <div><strong>Expected Answer (Raw LaTeX):</strong> <code style="color:#4ade80;">${escapeHtml(rawExpectedStr)}</code></div>
        ${requiredForm ? `<div><strong>Required Form Enforcement:</strong> <code>${escapeHtml(requiredForm)}</code></div>` : ''}
      `;
    }

    if (isCorrect) {
      sessionScore++;
      addXP(10);

      const topXpEl = document.querySelector("#top-nav-xp-val");
      if (topXpEl && state.profile) topXpEl.innerText = state.profile.xp;

      if (state.userToken && state.profile) {
        syncUserProgress(state.userToken, state.profile.xp, state.profile.streakCount, state.profile.lastDailyQuestDate);
      }

      if (feedbackEl) {
        feedbackEl.style.padding = "6px 10px";
        feedbackEl.style.background = "#d1fae5";
        feedbackEl.style.color = "#065f46";
        feedbackEl.innerHTML = `Correct! 🎉 +10 XP  |  Mastery: <strong>${newScore}</strong> <span style="color:${diffColor}; font-weight:800;">(${diffBadge})</span>`;
      }
    } else {
      if (feedbackEl) {
        const targetDisplay = currentQuestion.displayAnswer || 
                              (Array.isArray(currentQuestion.expectedAnswer) 
                                ? currentQuestion.expectedAnswer.map(a => `x = ${a}`).join(" \\text{ or } ") 
                                : currentQuestion.expectedAnswer);
        const formattedExpected = textToLatex(targetDisplay);
        feedbackEl.style.padding = "6px 10px";
        feedbackEl.style.background = "#fee2e2";
        feedbackEl.style.color = "#991b1b";
        feedbackEl.innerHTML = `Incorrect. Expected: <strong>$${formattedExpected}$</strong>  |  Mastery: <strong>${newScore}</strong> <span style="color:${diffColor}; font-weight:800;">(${diffBadge})</span>`;
        renderKaTeX(feedbackEl);
      }
    }

    if (stepsList.length > 0 && solutionBox) {
      solutionBox.style.display = "block";
      solutionBox.innerHTML = `
        <h5 style="margin: 0 0 4px 0; font-size: 0.85rem; color: #1e293b;">📖 Full Solution Review:</h5>
        <ol style="padding-left: 18px; margin: 0; font-size: 0.82rem; color: #334155;">
          ${stepsList.map(step => `<li style="margin-bottom: 2px;">${step}</li>`).join("")}
        </ol>
      `;
      renderKaTeX(solutionBox);
    }

    if (hintsScrollArea) {
      setTimeout(() => {
        hintsScrollArea.scrollTop = feedbackEl ? feedbackEl.offsetTop : 0;
      }, 80);
    }

    const currentScore = state.mastery[activeGeneratorPath]?.score || 0;
    if (isSkillTree && currentScore >= targetMastery) {
      setTimeout(() => finishSession(true), 1200);
    }
  }

  function renderStudentLiveSummary() {
    cleanupListeners();

    const accuracyPct = totalAttemptedCount > 0 ? Math.round((sessionScore / totalAttemptedCount) * 100) : 0;

    const summaryRowsHtml = Object.keys(sessionInitialScores).map(path => {
      const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill" };
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

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: calc(100dvh - 96px); padding: 20px; background: #f1f5f9;">
        <div class="card" style="max-width: 500px; width: 100%; text-align: center; padding: 32px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); box-sizing: border-box;">
          <h2 style="font-size: 1.6rem; color: #0f172a; margin: 0 0 6px 0; font-weight: 800;">🎉 Live Practice Completed!</h2>
          <p style="font-size: 0.92rem; color: #64748b; margin: 0 0 20px 0;">Your teacher has ended today's live session. Great work!</p>

          <div style="display: flex; justify-content: center; margin-bottom: 20px;">
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 20px; border-radius: 12px; color: #1e40af; font-weight: 800; font-size: 0.95rem;">
              ⭐ ${sessionScore} / ${totalAttemptedCount} Correct (${accuracyPct}%)
            </div>
          </div>

          <div style="width: 100%; margin-bottom: 24px; text-align: left;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px;">Your Mastery Growth:</div>
            ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.88rem;">Practice session finished.</div>'}
          </div>

          <button id="btn-live-summary-dash" style="background: #2563eb; color: #ffffff; border: none; padding: 14px 28px; border-radius: 12px; font-size: 1rem; font-weight: 800; cursor: pointer; width: 100%; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
            Return to Dashboard ➔
          </button>
        </div>
      </div>
    `;

    container.querySelector("#btn-live-summary-dash")?.addEventListener("click", () => {
      if (typeof options.onExit === "function") options.onExit();
      else navigateTo("dashboard");
    });
  }

  function finishSession(isMastered = false) {
    cleanupListeners();
    
    if (state.dailySession) {
      state.dailySession.completedToday = Math.max(state.dailySession.completedToday || 0, totalQuestions);
    }

    const bonusXP = (!isSkillTree && !isLiveSession && sessionScore === totalQuestions) ? 20 : 0;
    if (bonusXP > 0) {
      addXP(bonusXP);
      const topXpEl = document.querySelector("#top-nav-xp-val");
      if (topXpEl && state.profile) topXpEl.innerText = state.profile.xp;
    }

    if (state.userToken) {
      if (state.profile) {
        syncUserProgress(state.userToken, state.profile.xp, state.profile.streakCount, state.profile.lastDailyQuestDate);
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

    const titleText = summary.isMastered ? "🏆 Skill Mastered (90+ Score)!" : "🎉 Session Completed!";

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: calc(100dvh - 96px); padding: 20px;">
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
      if (typeof options.onExit === "function") options.onExit();
      else navigateTo("dashboard");
    });
  }

  loadQuestion();
}
