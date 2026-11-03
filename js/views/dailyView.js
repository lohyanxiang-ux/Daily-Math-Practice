import { loadQuestionGenerator } from "../questions/loader.js";
import { recordQuestionAttempt, state } from "../state.js";
import { syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { renderKaTeX } from "../utils/katexHelper.js";
import { isAlgebraicallyEquivalent } from "../utils/mathEquivalence.js";

export async function renderDailyPractice(viewportEl, params = {}) {
  // Mode resolution: 'dailyQuest' | 'skillTree' | 'srsReview'
  const rawMode = params.mode || "dailyQuest";
  const isDailyQuest = rawMode === "dailyQuest";
  const isSkillTree = rawMode === "skillTree";
  const isSRS = rawMode === "srsReview" || rawMode === "smartReview";

  const allowSkip = params.allowSkip ?? (isDailyQuest || isSRS);
  const maxQuestions = isDailyQuest ? 5 : (isSRS ? (params.queue?.length || 4) : Infinity);

  let queue = Array.isArray(params.queue) ? params.queue : [];
  if (queue.length === 0) {
    queue = isSkillTree && params.generatorPath 
      ? [params.generatorPath] 
      : (state.curriculum?.map(s => s.generatorPath) || ["algebra/linearEquations.js"]);
  }

  let currentIndex = 0;
  let currentHintsUsed = 0;
  let currentQuestion = null;
  let currentTopicInfo = null;
  const sessionInitialScores = {};

  async function loadCurrentQuestion() {
    viewportEl.innerHTML = `
      <div style="padding: 60px 20px; text-align: center; color: #64748b; font-weight: 700;">
        <div style="font-size: 1.2rem; margin-bottom: 8px;">🎲 Generating Question...</div>
      </div>
    `;

    const queueIndex = isSkillTree ? (currentIndex % queue.length) : currentIndex;
    const queueItem = queue[queueIndex] || queue[0];
    const path = typeof queueItem === "object" ? queueItem.generatorPath : String(queueItem);

    const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill", generatorPath: path };
    currentTopicInfo = typeof queueItem === "object" ? queueItem : { generatorPath: path, skill: skillObj };

    if (sessionInitialScores[path] === undefined) {
      sessionInitialScores[path] = state.mastery[path] ? state.mastery[path].score : 0;
    }

    try {
      // Primary Call: Dynamic Importer
      const genModule = await loadQuestionGenerator(path);
      // Primary Call: Question Generator (SRS Tier 1, standard Tier 2)
      const targetTier = isSRS ? 1 : 2;
      currentQuestion = genModule.generateQuestion(targetTier);
    } catch (err) {
      console.error(`Error loading question generator for [${path}]:`, err);
      currentIndex++;
      loadCurrentQuestion();
      return;
    }

    currentHintsUsed = 0;
    renderQuestionUI();
  }

  function renderQuestionUI() {
    const totalCountText = isSkillTree ? `Question ${currentIndex + 1}` : `Question ${currentIndex + 1} of ${maxQuestions}`;
    const skillTitle = currentTopicInfo?.skill?.title || "Math Practice";
    const availableHints = currentQuestion.hints || currentQuestion.steps || [];

    let modeBadge = `<span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">📅 Daily Quest</span>`;
    if (isSkillTree) modeBadge = `<span style="background: #f0fdf4; color: #15803d; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">🌳 Skill Mastery</span>`;
    if (isSRS) modeBadge = `<span style="background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">🔄 Memory Refresher</span>`;

    const saveAndExitBtn = isSkillTree ? `
      <button id="btn-save-exit" type="button" style="padding: 6px 14px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; touch-action: manipulation;">
        💾 Save & Exit
      </button>
    ` : "";

    const skipBtnHtml = allowSkip ? `
      <button id="btn-skip-question" type="button" style="padding: 12px; background: #f8fafc; color: #64748b; border: 1.5px solid #cbd5e1; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 8px; width: 100%; touch-action: manipulation;">
        ⏭️ Skip Question (No Penalty)
      </button>
    ` : "";

    viewportEl.innerHTML = `
      <div style="max-width: 920px; margin: 0 auto; padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${modeBadge}
            <span style="font-size: 0.88rem; color: #64748b; font-weight: 700;">${totalCountText}</span>
          </div>
          ${saveAndExitBtn}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="card" style="padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 1.25rem;">${skillTitle}</h3>
            <div id="question-prompt" style="font-size: 1.15rem; margin-bottom: 20px; color: #1e293b;">
              ${currentQuestion.prompt}
            </div>
            <div id="hints-container" style="margin-bottom: 16px;"></div>
            <button id="btn-hint" type="button" style="padding: 8px 14px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; cursor: pointer; touch-action: manipulation;">
              💡 Need a Hint? (${currentHintsUsed}/${availableHints.length})
            </button>
          </div>

          <div class="card" style="padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <label for="answer-input" style="display: block; font-weight: 700; margin-bottom: 8px; color: #334155;">Your Answer:</label>
              <input type="text" id="answer-input" style="width: 100%; padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 1.2rem; margin-bottom: 16px; box-sizing: border-box; background: #f8fafc;">
              <div id="feedback-message" style="font-weight: 700; font-size: 1rem; margin-bottom: 12px; min-height: 24px;"></div>
            </div>

            <div>
              <button id="btn-submit-answer" type="button" style="width: 100%; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; touch-action: manipulation;">
                Submit Answer
              </button>
              ${skipBtnHtml}
              <button id="btn-next-question" type="button" style="display: none; width: 100%; padding: 14px; background: #16a34a; color: #ffffff; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; margin-top: 8px; touch-action: manipulation;">
                Next Question ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Primary Call: DOM KaTeX Math Rendering
    renderKaTeX(document.getElementById("question-prompt"));

    document.getElementById("btn-save-exit")?.addEventListener("click", () => finishSession());

    document.getElementById("btn-hint")?.addEventListener("click", () => {
      if (currentHintsUsed < availableHints.length) {
        const hintEl = document.createElement("div");
        hintEl.style.cssText = "background: #fffbe3; border-left: 4px solid #f59e0b; padding: 10px 14px; margin-bottom: 8px; font-size: 0.92rem; border-radius: 6px; color: #78350f;";
        hintEl.innerHTML = `<strong>Hint ${currentHintsUsed + 1}:</strong> ${availableHints[currentHintsUsed]}`;
        document.getElementById("hints-container").appendChild(hintEl);
        renderKaTeX(hintEl);
        currentHintsUsed++;
      }
    });

    document.getElementById("btn-skip-question")?.addEventListener("click", () => {
      const feedbackEl = document.getElementById("feedback-message");
      feedbackEl.style.color = "#64748b";
      feedbackEl.innerText = "⏭️ Question skipped (no mastery score penalty).";
      document.getElementById("btn-submit-answer").style.display = "none";
      if (document.getElementById("btn-skip-question")) document.getElementById("btn-skip-question").style.display = "none";
      document.getElementById("btn-next-question").style.display = "block";
    });

    document.getElementById("btn-submit-answer")?.addEventListener("click", () => {
      const userAns = document.getElementById("answer-input").value.trim();
      const feedbackEl = document.getElementById("feedback-message");
      if (!userAns) return;

      // Primary Call: Math Equivalence Evaluator
      const isCorrect = isAlgebraicallyEquivalent(userAns, currentQuestion.expectedAnswer);

      // Primary Call: Local Attempt & State Mastery Recording
      recordQuestionAttempt(currentTopicInfo.generatorPath, isCorrect, currentHintsUsed, availableHints.length || 3);

      if (isCorrect) {
        feedbackEl.style.color = "#16a34a";
        feedbackEl.innerText = isSRS ? "✨ Excellent recall! Memory restored." : "✨ Correct! Mastery score updated.";
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
      </div>
    `;

    const dirtyPaths = Array.from(state.pendingMasteryUpdates || []);
    const updatesArray = dirtyPaths.map(path => state.mastery[path]).filter(Boolean);

    if (updatesArray.length > 0 && state.userToken) {
      try {
        // Primary Call: Google Sheets Batch Sync
        await syncBatchMastery(state.userToken, updatesArray);
        if (state.pendingMasteryUpdates) state.pendingMasteryUpdates.clear();
      } catch (err) {
        console.error("Failed to sync batch mastery updates:", err);
      }
    }

    const titleText = isMastered ? "🏆 Skill Mastered (90+ Score)!" : "🎉 Practice Session Complete!";

    viewportEl.innerHTML = `
      <div class="card" style="max-width: 560px; margin: 40px auto; text-align: center; padding: 32px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
        <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 1.6rem;">${titleText}</h2>
        <p style="color: #64748b; margin: 0 0 24px 0; font-size: 0.95rem;">Your updated scores have been synchronized with Google Sheets.</p>
        <button id="btn-return-dashboard" type="button" style="width: 100%; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; touch-action: manipulation;">
          Return to Dashboard
        </button>
      </div>
    `;

    // Primary Call: Router Navigation
    document.getElementById("btn-return-dashboard")?.addEventListener("click", () => navigateTo("dashboard"));
  }

  loadCurrentQuestion();
}
