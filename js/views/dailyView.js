import { state } from "../state.js";
import { renderQuestionView } from "./questionView.js";
import { buildDailyQuestQueue, markDailyQuestCompletedToday } from "../utils/dailyQuestEngine.js";
import { navigateTo } from "../router.js";
import { renderTopNav } from "../app.js";

export function renderDailyPractice(container, params = {}) {
  let dailyQueue = Array.isArray(params.queue) && params.queue.length > 0
    ? params.queue
    : (typeof buildDailyQuestQueue === "function" ? buildDailyQuestQueue(state) : []);

  if (dailyQueue.length === 0 && state.curriculum && state.curriculum.length > 0) {
    dailyQueue = state.curriculum.slice(0, 5).map(s => s.generatorPath);
  }

  renderQuestionView(container, {
    mode: "dailyQuest",
    queue: dailyQueue,
    maxQuestions: 5,
    allowSkip: true,
    onComplete: (summary) => {
      markDailyQuestCompletedToday();
      if (typeof window.renderTopNav === "function") {
        window.renderTopNav(state.profile);
      } else {
        renderTopNav(state.profile);
      }
      renderDailyQuestSummary(container, summary);
    },
    onExit: () => navigateTo("dashboard")
  });
}

function renderDailyQuestSummary(container, summary) {
  const currentStreak = state.profile?.streakCount || 1;

  const summaryRowsHtml = Object.keys(summary.sessionInitialScores).map(path => {
    const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill" };
    const startScore = summary.sessionInitialScores[path] || 0;
    const currentScore = state.mastery[path] ? state.mastery[path].score : startScore;
    const diff = currentScore - startScore;
    const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
    const diffColor = diff >= 0 ? "#16a34a" : "#dc2626";

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 6px; border: 1px solid #e2e8f0; font-size: 0.88rem;">
        <div style="font-weight: 700; color: #1e293b;">${skillObj.title}</div>
        <div style="font-weight: 800; color: #0f172a;">
          ${startScore} ➔ <span style="color: #2563eb;">${currentScore}</span> 
          <span style="font-size: 0.8rem; color: ${diffColor}; margin-left: 6px;">(${diffText} pts)</span>
        </div>
      </div>
    `;
  }).join("");

  container.style.overflowY = "auto";
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 70px); padding: 16px; box-sizing: border-box; background: #f1f5f9;">
      <div class="card" style="max-width: 480px; width: 100%; text-align: center; padding: 24px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); box-sizing: border-box;">
        <h2 style="color: #0f172a; margin: 0 0 6px 0; font-size: 1.4rem;">📅 Daily Quest Completed!</h2>
        <p style="color: #64748b; margin: 0 0 14px 0; font-size: 0.88rem;">Great habit building! You completed today's 5 practice items.</p>
        
        <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 14px;">
          <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 8px 14px; border-radius: 10px; color: #c2410c; font-weight: 800; font-size: 0.88rem;">
            🔥 ${currentStreak} Day Streak!
          </div>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 8px 14px; border-radius: 10px; color: #1e40af; font-weight: 800; font-size: 0.88rem;">
            ⭐ ${summary.sessionScore} / 5 Correct ${summary.bonusXP > 0 ? `(+${summary.bonusXP} XP)` : ''}
          </div>
        </div>

        <div style="margin-bottom: 16px; text-align: left;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 6px;">Mastery Updates:</div>
          <div style="max-height: 180px; overflow-y: auto; padding-right: 4px;">
            ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.88rem;">Daily quest complete.</div>'}
          </div>
        </div>

        <button id="btn-daily-summary-exit" type="button" style="width: 100%; padding: 12px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-size: 0.98rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
          Return to Dashboard
        </button>
      </div>
    </div>
  `;

  container.querySelector("#btn-daily-summary-exit")?.addEventListener("click", () => navigateTo("dashboard"));
}
