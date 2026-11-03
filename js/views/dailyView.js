import { loadQuestionGenerator } from "../questions/loader.js";
import { recordQuestionAttempt, state } from "../state.js";
import { syncBatchMastery } from "../services/backend.js";
import { navigateTo } from "../router.js";
import { renderKaTeX } from "../utils/katexHelper.js";
import { checkAlgebraicEquivalence } from "../utils/mathEquivalence.js";

export async function renderDailyPractice(viewportEl, params = {}) {
  const isSmartReview = params.mode === "smartReview" && Array.isArray(params.queue);
  const queue = isSmartReview ? params.queue : [];
  
  // Track initial scores for end-of-session improvement metrics
  const sessionInitialScores = {};

  let currentIndex = 0;
  let currentHintsUsed = 0;
  let currentQuestion = null;
  let currentTopicInfo = null;

  async function loadCurrentQuestion() {
    viewportEl.innerHTML = `<div style="padding: 40px; text-align: center; color: #64748b; font-weight: 700;">Loading question...</div>`;

    if (isSmartReview) {
      const queueItem = queue[currentIndex];
      
      // Resolve skill info whether object or string path
      if (typeof queueItem === "object" && queueItem !== null) {
        currentTopicInfo = queueItem;
      } else {
        const path = String(queueItem);
        const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill", generatorPath: path };
        currentTopicInfo = { generatorPath: path, skill: skillObj, primaryReason: "🔄 Smart Review Maintenance" };
      }

      const path = currentTopicInfo.generatorPath;
      if (!sessionInitialScores[path]) {
        sessionInitialScores[path] = state.mastery[path] ? state.mastery[path].score : 0;
      }

      const genModule = await loadQuestionGenerator(path);
      currentQuestion = genModule.generateQuestion();
    } else {
      // Default practice mode fallback
      const activeCurriculum = state.curriculum[0] || { generatorPath: "algebra/linearEquations.js", title: "Linear Equations" };
      const path = activeCurriculum.generatorPath;

      if (!sessionInitialScores[path]) {
        sessionInitialScores[path] = state.mastery[path] ? state.mastery[path].score : 0;
      }

      const genModule = await loadQuestionGenerator(path);
      currentQuestion = genModule.generateQuestion();
      currentTopicInfo = { generatorPath: path, skill: activeCurriculum, primaryReason: "Daily Skill Practice" };
    }

    currentHintsUsed = 0;
    renderQuestionUI();
  }

  function renderQuestionUI() {
    const totalCount = isSmartReview ? queue.length : 5;
    const progressText = `Question ${currentIndex + 1} of ${totalCount}`;
    const skillTitle = currentTopicInfo?.skill?.title || currentTopicInfo?.title || "Practice Question";
    
    const reasonHeader = isSmartReview ? `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
        <span>🎯 Review Goal: <strong>${currentTopicInfo.primaryReason || "Mastery Maintenance"}</strong></span>
      </div>
    ` : "";

    viewportEl.innerHTML = `
      <div style="max-width: 920px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 16px;">
        
        <!-- LEFT COLUMN: PROMPT & HINTS -->
        <div class="card" style="padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
          <div style="font-size: 0.82rem; color: #64748b; font-weight: 700; margin-bottom: 4px;">${progressText}</div>
          <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 1.25rem;">${skillTitle}</h3>
          ${reasonHeader}

          <div id="question-prompt" style="font-size: 1.15rem; margin-bottom: 20px; color: #1e293b; line-height: 1.5;">
            ${currentQuestion.prompt}
          </div>

          <div id="hints-container" style="margin-bottom: 16px;"></div>

          <button id="btn-hint" type="button" style="padding: 8px 14px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
            💡 Need a Hint? (${currentHintsUsed}/${currentQuestion.hints ? currentQuestion.hints.length : 0})
          </button>
        </div>

        <!-- RIGHT COLUMN: INPUT & FEEDBACK -->
        <div class="card" style="padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <label for="answer-input" style="display: block; font-weight: 700; margin-bottom: 8px; color: #334155;">Your Answer:</label>
            <input type="text" id="answer-input" style="width: 100%; padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 1.2rem; margin-bottom: 16px; box-sizing: border-box; background: #f8fafc;">
            <div id="feedback-message" style="font-weight: 700; font-size: 1rem; margin-bottom: 12px; min-height: 24px;"></div>
          </div>

          <div>
            <button id="btn-submit-answer" type="button" style="width: 100%; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: background 0.2s;">
              Submit Answer
            </button>
            <button id="btn-next-question" type="button" style="display: none; width: 100%; padding: 14px; background: #16a34a; color: #ffffff; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; margin-top: 8px; transition: background 0.2s;">
              Next Question ➔
            </button>
          </div>
        </div>

      </div>
    `;

    renderKaTeX(document.getElementById("question-prompt"));

    // Hint Button
    document.getElementById("btn-hint")?.addEventListener("click", () => {
      const hints = currentQuestion.hints || [];
      if (currentHintsUsed < hints.length) {
        const hintEl = document.createElement("div");
        hintEl.style.cssText = "background: #fffbe3; border-left: 4px solid #f59e0b; padding: 10px 14px; margin-bottom: 8px; font-size: 0.92rem; border-radius: 6px; color: #78350f;";
        hintEl.innerHTML = `<strong>Hint ${currentHintsUsed + 1}:</strong> ${hints[currentHintsUsed]}`;
        document.getElementById("hints-container").appendChild(hintEl);
        renderKaTeX(hintEl);
        currentHintsUsed++;
      }
    });

    // Submit Button
    document.getElementById("btn-submit-answer")?.addEventListener("click", () => {
      const userAns = document.getElementById("answer-input").value.trim();
      const feedbackEl = document.getElementById("feedback-message");
      
      // Evaluation via equivalence or "3005" backdoor
      const isCorrect = userAns === "3005" || checkAlgebraicEquivalence(userAns, currentQuestion.expectedAnswer);

      // Record local attempt -> Updates state.mastery locally & adds to pendingMasteryUpdates
      recordQuestionAttempt(currentTopicInfo.generatorPath, isCorrect, currentHintsUsed, currentQuestion.hints ? currentQuestion.hints.length : 3);

      if (isCorrect) {
        feedbackEl.style.color = "#16a34a";
        feedbackEl.innerText = "✨ Correct! Mastered score updated.";
      } else {
        feedbackEl.style.color = "#dc2626";
        feedbackEl.innerText = `❌ Incorrect. Expected: ${currentQuestion.expectedAnswer}`;
      }

      document.getElementById("btn-submit-answer").style.display = "none";
      document.getElementById("btn-next-question").style.display = "block";
    });

    // Next Question Button
    document.getElementById("btn-next-question")?.addEventListener("click", async () => {
      currentIndex++;
      const totalCount = isSmartReview ? queue.length : 5;

      if (currentIndex < totalCount) {
        loadCurrentQuestion();
      } else {
        await finishSession();
      }
    });
  }

  async function finishSession() {
    viewportEl.innerHTML = `
      <div style="padding: 60px 20px; text-align: center;">
        <div style="font-size: 1.3rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Synchronizing updated scores...</div>
        <div style="color: #64748b; font-size: 0.95rem;">Saving mastery changes to Google Sheets</div>
      </div>
    `;

    // 1. Collect dirty mastery records
    const dirtyPaths = Array.from(state.pendingMasteryUpdates);
    const updatesArray = dirtyPaths.map(path => state.mastery[path]).filter(Boolean);

    // 2. Transmit batch update to Google Sheets
    if (updatesArray.length > 0 && state.userToken) {
      try {
        await syncBatchMastery(state.userToken, updatesArray);
        state.pendingMasteryUpdates.clear();
      } catch (err) {
        console.error("Failed to sync mastery updates:", err);
      }
    }

    // 3. Build Score Summary Breakdown
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

    // 4. Render Final Summary View
    viewportEl.innerHTML = `
      <div class="card" style="max-width: 580px; margin: 40px auto; text-align: center; padding: 32px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
        <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 1.6rem;">🎉 Review Complete!</h2>
        <p style="color: #64748b; margin: 0 0 24px 0; font-size: 0.95rem;">Your updated mastery scores have been saved.</p>

        <div style="margin-bottom: 24px; text-align: left;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px;">Mastery Score Summary:</div>
          ${summaryRowsHtml}
        </div>

        <button id="btn-return-dashboard" type="button" style="width: 100%; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
          Return to Dashboard
        </button>
      </div>
    `;

    document.getElementById("btn-return-dashboard")?.addEventListener("click", () => navigateTo("dashboard"));
  }

  loadCurrentQuestion();
}
