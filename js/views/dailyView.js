import { loadQuestionGenerator } from "../questions/loader.js";
import { recordQuestionAttempt, state } from "../state.js";
import { syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { renderKaTeX } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";
import { initScratchpad } from "../components/scratchpad.js";
import { initKeypad } from "../components/keypad.js";

export async function renderDailyPractice(viewportEl, params = {}) {
  // 1. Resolve Practice Mode & Rules
  const rawMode = params.mode || "dailyQuest";
  const isDailyQuest = rawMode === "dailyQuest";
  const isSkillTree = rawMode === "skillTree";
  const isSRS = rawMode === "srsReview" || rawMode === "smartReview";

  const allowSkip = params.allowSkip ?? (isDailyQuest || isSRS);
  const maxQuestions = isDailyQuest ? 5 : (isSRS ? (params.queue?.length || 4) : Infinity);

  // 2. Queue Resolution
  let queue = Array.isArray(params.queue) ? params.queue : [];
  if (queue.length === 0) {
    queue = isSkillTree && params.generatorPath 
      ? [params.generatorPath] 
      : (state.curriculum?.map(s => s.generatorPath) || ["algebra/linearEquations.js"]);
  }

  // 3. Session State
  let currentIndex = 0;
  let currentHintsUsed = 0;
  let currentQuestion = null;
  let currentTopicInfo = null;
  const sessionInitialScores = {};

  async function loadCurrentQuestion() {
    viewportEl.innerHTML = `
      <div style="padding: 60px 20px; text-align: center; color: #64748b; font-weight: 700;">
        <div style="font-size: 1.2rem; margin-bottom: 8px;">🎲 Loading Question...</div>
      </div>
    `;

    const queueIndex = isSkillTree ? (currentIndex % queue.length) : currentIndex;
    const queueItem = queue[queueIndex] || queue[0];
    const path = typeof queueItem === "object" && queueItem !== null
      ? queueItem.generatorPath 
      : String(queueItem);

    const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill", generatorPath: path };
    currentTopicInfo = typeof queueItem === "object" && queueItem !== null
      ? queueItem
      : { generatorPath: path, skill: skillObj, primaryReason: isSRS ? "🔄 Memory Refresher" : "Daily Practice" };

    if (sessionInitialScores[path] === undefined) {
      sessionInitialScores[path] = state.mastery[path] ? state.mastery[path].score : 0;
    }

    try {
      const genModule = await loadQuestionGenerator(path);
      const targetTier = isSRS ? 1 : 2;
      currentQuestion = genModule.generateQuestion(targetTier);
    } catch (err) {
      console.error(`Error loading generator for [${path}]:`, err);
      currentIndex++;
      loadCurrentQuestion();
      return;
    }

    currentHintsUsed = 0;
    renderQuestionUI();
  }

  function renderQuestionUI() {
    const totalCountText = isSkillTree ? `Question ${currentIndex + 1}` : `Question ${currentIndex + 1} of ${maxQuestions}`;
    const skillTitle = currentTopicInfo?.skill?.title || currentTopicInfo?.title || "Math Practice";
    const availableHints = currentQuestion.hints || currentQuestion.steps || [];

    // Mode Badges
    let modeBadge = `<span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">📅 Daily Quest</span>`;
    if (isSkillTree) modeBadge = `<span style="background: #f0fdf4; color: #15803d; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">🌳 Skill Mastery</span>`;
    if (isSRS) modeBadge = `<span style="background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">🔄 Memory Refresher</span>`;

    const saveAndExitBtn = isSkillTree ? `
      <button id="btn-save-exit" type="button" style="padding: 6px 14px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; touch-action: manipulation;">
        💾 Save & Exit
      </button>
    ` : "";

    const skipBtnHtml = allowSkip ? `
      <button id="btn-skip-question" type="button" style="padding: 10px; background: #f8fafc; color: #64748b; border: 1.5px solid #cbd5e1; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 6px; width: 100%; touch-action: manipulation;">
        ⏭️ Skip Question (No Penalty)
      </button>
    ` : "";

    // 3-COLUMN IPAD LANDSCAPE WORKSPACE
    viewportEl.innerHTML = `
      <div style="max-width: 1280px; margin: 0 auto; padding: 12px; height: calc(100vh - 90px); box-sizing: border-box; display: flex; flex-direction: column;">
        
        <!-- HEADER BAR -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${modeBadge}
            <span style="font-size: 0.88rem; color: #64748b; font-weight: 700;">${totalCountText}</span>
          </div>
          ${saveAndExitBtn}
        </div>

        <!-- 3-COLUMN WORKSPACE GRID -->
        <div style="display: grid; grid-template-columns: 320px 1fr 280px; gap: 14px; flex: 1; min-height: 0;">
          
          <!-- COLUMN 1: QUESTION, HINTS & ANSWER INPUT -->
          <div class="card" style="padding: 16px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; overflow-y: auto;">
            <div>
              <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 1.1rem;">${skillTitle}</h3>
              
              <div id="question-prompt" style="font-size: 1.05rem; margin-bottom: 14px; color: #1e293b; line-height: 1.4;">
                ${currentQuestion.prompt}
              </div>

              <div id="hints-container" style="margin-bottom: 10px;"></div>

              <button id="btn-hint" type="button" style="padding: 6px 12px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; font-size: 0.82rem; cursor: pointer; margin-bottom: 12px; touch-action: manipulation;">
                💡 Hint (${currentHintsUsed}/${availableHints.length})
              </button>
            </div>

            <div>
              <label for="answer-input" style="display: block; font-weight: 700; margin-bottom: 6px; color: #334155; font-size: 0.85rem;">Your Answer:</label>
              <input type="text" id="answer-input" style="width: 100%; padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 1.1rem; margin-bottom: 8px; box-sizing: border-box; background: #f8fafc;">
              <div id="feedback-message" style="font-weight: 700; font-size: 0.88rem; margin-bottom: 8px; min-height: 20px;"></div>

              <button id="btn-submit-answer" type="button" style="width: 100%; padding: 12px; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer; touch-action: manipulation;">
                Submit Answer
              </button>
              ${skipBtnHtml}
              <button id="btn-next-question" type="button" style="display: none; width: 100%; padding: 12px; background: #16a34a; color: #ffffff; border: none; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer; margin-top: 6px; touch-action: manipulation;">
                Next Question ➔
              </button>
            </div>
          </div>

          <!-- COLUMN 2: SCRATCHPAD CANVAS WORKSPACE -->
          <div class="card" style="padding: 12px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.82rem; font-weight: 700; color: #64748b;">✏️ Scratchpad / Working Space</span>
              <button id="btn-clear-scratchpad" type="button" style="padding: 4px 10px; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer; touch-action: manipulation;">
                Clear
              </button>
            </div>
            <div id="scratchpad-container" style="flex: 1; width: 100%; height: 100%; background: #fafafa; border: 1px dashed #cbd5e1; border-radius: 12px; overflow: hidden; position: relative;">
              <canvas id="scratchpad-canvas" style="width: 100%; height: 100%; touch-action: none; cursor: crosshair;"></canvas>
            </div>
          </div>

          <!-- COLUMN 3: VIRTUAL MATH KEYPAD -->
          <div class="card" style="padding: 12px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column;">
            <div style="font-size: 0.82rem; font-weight: 700; color: #64748b; margin-bottom: 8px; text-align: center;">⌨️ Math Keypad</div>
            <div id="keypad-container" style="flex: 1; display: flex; flex-direction: column; justify-content: center;"></div>
          </div>

        </div>
      </div>
    `;

    // 1. Render KaTeX Math
    renderKaTeX(document.getElementById("question-prompt"));

    // 2. Initialize Scratchpad Component (Column 2)
    const canvasEl = document.getElementById("scratchpad-canvas");
    if (canvasEl) {
      if (typeof initScratchpad === "function") {
        initScratchpad(canvasEl, document.getElementById("btn-clear-scratchpad"));
      } else {
        // Fallback Canvas Clear Handler
        document.getElementById("btn-clear-scratchpad")?.addEventListener("click", () => {
          const ctx = canvasEl.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        });
      }
    }

    // 3. Initialize Keypad Component (Column 3)
    const keypadContainer = document.getElementById("keypad-container");
    const inputEl = document.getElementById("answer-input");
    if (keypadContainer && typeof initKeypad === "function") {
      initKeypad(keypadContainer, inputEl, currentQuestion.keypad);
    }

    // 4. Action Handlers
    document.getElementById("btn-save-exit")?.addEventListener("click", () => finishSession());

    document.getElementById("btn-hint")?.addEventListener("click", () => {
      if (currentHintsUsed < availableHints.length) {
        const hintEl = document.createElement("div");
        hintEl.style.cssText = "background: #fffbe3; border-left: 4px solid #f59e0b; padding: 8px 12px; margin-bottom: 6px; font-size: 0.88rem; border-radius: 6px; color: #78350f;";
        hintEl.innerHTML = `<strong>Hint ${currentHintsUsed + 1}:</strong> ${availableHints[currentHintsUsed]}`;
        document.getElementById("hints-container").appendChild(hintEl);
        renderKaTeX(hintEl);
        currentHintsUsed++;
      }
    });

    document.getElementById("btn-skip-question")?.addEventListener("click", () => {
      const feedbackEl = document.getElementById("feedback-message");
      feedbackEl.style.color = "#64748b";
      feedbackEl.innerText = "⏭️ Question skipped (no penalty).";
      
      document.getElementById("btn-submit-answer").style.display = "none";
      if (document.getElementById("btn-skip-question")) document.getElementById("btn-skip-question").style.display = "none";
      document.getElementById("btn-next-question").style.display = "block";
    });

    document.getElementById("btn-submit-answer")?.addEventListener("click", () => {
      const userAns = inputEl.value.trim();
      const feedbackEl = document.getElementById("feedback-message");
      
      if (!userAns) {
        feedbackEl.style.color = "#dc2626";
        feedbackEl.innerText = "Please enter an answer.";
        return;
      }

      const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer);

      recordQuestionAttempt(
        currentTopicInfo.generatorPath, 
        isCorrect, 
        currentHintsUsed, 
        availableHints.length || 3
      );

      if (isCorrect) {
        feedbackEl.style.color = "#16a34a";
        feedbackEl.innerText = isSRS ? "✨ Excellent recall!" : "✨ Correct! Score updated.";
      } else {
        feedbackEl.style.color = "#dc2626";
        feedbackEl.innerText = `❌ Incorrect. Expected: ${currentQuestion.expectedAnswer}`;
      }

      document.getElementById("btn-submit-answer").style.display = "none";
      if (document.getElementById("btn-skip-question")) document.getElementById("btn-skip-question").style.display = "none";
      document.getElementById("btn-next-question").style.display = "block";

      const liveScore = state.mastery[currentTopicInfo.generatorPath]?.score || 0;
      if (isSkillTree && liveScore >= 90) {
        setTimeout(() => finishSession(true), 1200);
      }
    });

    document.getElementById("btn-next-question")?.addEventListener("click", async () => {
      currentIndex++;
      if (isSkillTree || currentIndex < maxQuestions) {
        loadCurrentQuestion();
      } else {
        await finishSession();
      }
    });
  }

  async function finishSession(isMastered = false) {
    viewportEl.innerHTML = `
      <div style="padding: 60px 20px; text-align: center;">
        <div style="font-size: 1.3rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Synchronizing updated scores...</div>
        <div style="color: #64748b; font-size: 0.95rem;">Saving mastery changes to Google Sheets</div>
      </div>
    `;

    const dirtyPaths = Array.from(state.pendingMasteryUpdates || []);
    const updatesArray = dirtyPaths.map(path => state.mastery[path]).filter(Boolean);

    if (updatesArray.length > 0 && state.userToken) {
      try {
        await syncBatchMastery(state.userToken, updatesArray);
        if (state.pendingMasteryUpdates) state.pendingMasteryUpdates.clear();
      } catch (err) {
        console.error("Failed to sync batch mastery updates:", err);
      }
    }

    const summaryRowsHtml = Object.keys(sessionInitialScores).map(path => {
      const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practiced Skill" };
      const startScore = sessionInitialScores[path] || 0;
      const currentScore = state.mastery[path] ? state.mastery[path].score : startScore;
      const diff = currentScore - startScore;
      const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
      const diffColor = diff >= 0 ? "#16a34a" : "#dc2626";

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
          <div style="text-align: left; font-weight: 700; color: #1e293b; font-size: 0.95rem;">${skillObj.title}</div>
          <div style="font-weight: 800; font-size: 1rem; color: #0f172a;">
            ${startScore} ➔ <span style="color: #2563eb;">${currentScore}</span> 
            <span style="font-size: 0.85rem; color: ${diffColor}; margin-left: 6px;">(${diffText} pts)</span>
          </div>
        </div>
      `;
    }).join("");

    const titleText = isMastered ? "🏆 Skill Mastered (90+ Score)!" : "🎉 Practice Session Complete!";

    viewportEl.innerHTML = `
      <div class="card" style="max-width: 560px; margin: 40px auto; text-align: center; padding: 32px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
        <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 1.6rem;">${titleText}</h2>
        <p style="color: #64748b; margin: 0 0 24px 0; font-size: 0.95rem;">Your updated scores have been synchronized with Google Sheets.</p>

        <div style="margin-bottom: 24px; text-align: left;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px;">Mastery Score Summary:</div>
          ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.9rem;">Session completed.</div>'}
        </div>

        <button id="btn-return-dashboard" type="button" style="width: 100%; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; touch-action: manipulation;">
          Return to Dashboard
        </button>
      </div>
    `;

    document.getElementById("btn-return-dashboard")?.addEventListener("click", () => navigateTo("dashboard"));
  }

  loadCurrentQuestion();
}
