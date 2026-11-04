import { state } from "../state.js";
import { renderQuestionView } from "./questionView.js";
import { buildDailyQuestQueue, markDailyQuestCompletedToday } from "../utils/dailyQuestEngine.js";
import { navigateTo } from "../router.js";

export function renderDailyPractice(container, params = {}) {
  // Use Daily Quest Engine to construct the 5-question Bento Box queue
  let dailyQueue = Array.isArray(params.queue) && params.queue.length > 0
    ? params.queue
    : (typeof buildDailyQuestQueue === "function" ? buildDailyQuestQueue(state) : []);

  if (dailyQueue.length === 0 && state.curriculum && state.curriculum.length > 0) {
    dailyQueue = state.curriculum.slice(0, 5).map(s => s.generatorPath);
  }

  // Launch Question View for 5 Questions
  renderQuestionView(container, {
    mode: "dailyQuest",
    queue: dailyQueue,
    maxQuestions: 5,
    allowSkip: true,
    onComplete: (summary) => {
      // Mark Daily Quest as completed today & sync to backend Google Sheet
      markDailyQuestCompletedToday();
      renderDailyQuestSummary(container, summary);
    },
    onExit: () => navigateTo("dashboard")
  });
}

function renderDailyQuestSummary(container, summary) {
  const summaryRowsHtml = Object.keys(summary.sessionInitialScores).map(path => {
    const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill" };
    const startScore = summary.sessionInitialScores[path] || 0;
    const currentScore = state.mastery[path] ? state.mastery[path].score : startScore;
    const diff = currentScore - startScore;
    const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
    const diffColor = diff >= 0 ? "#16a34a" : "#dc2626";

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
        <div style="font-weight: 700; color: #1e293b; font-size: 0.95rem;">${skillObj.title}</div>
        <div style="font-weight: 800; font-size: 1rem; color: #0f172a;">
          ${startScore} ➔ <span style="color: #2563eb;">${currentScore}</span> 
          <span style="font-size: 0.85rem; color: ${diffColor}; margin-left: 6px;">(${diffText} pts)</span>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="card" style="max-width: 540px; margin: 40px auto; text-align: center; padding: 32px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
      <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 1.6rem;">📅 Daily Quest Completed!</h2>
      <p style="color: #64748b; margin: 0 0 20px 0; font-size: 0.95rem;">Great habit building! You completed today's 5 practice items.</p>
      
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 12px; margin-bottom: 20px; color: #1e40af; font-weight: 700;">
        ⭐ Accuracy: ${summary.sessionScore} / 5 Correct ${summary.bonusXP > 0 ? `• +${summary.bonusXP} Perfect Bonus XP!` : ''}
      </div>

      <div style="margin-bottom: 24px; text-align: left;">
        <div style="font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px;">Mastery Updates:</div>
        ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.9rem;">Daily quest complete.</div>'}
      </div>

      <button id="btn-daily-summary-exit" type="button" style="width: 100%; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer;">
        Return to Dashboard
      </button>
    </div>
  `;

  container.querySelector("#btn-daily-summary-exit")?.addEventListener("click", () => navigateTo("dashboard"));
}
