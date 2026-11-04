import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { isDailyQuestCompletedToday } from "../utils/dailyQuestEngine.js";

/**
 * Renders the Student Dashboard Bento Grid without duplicate inner header banners
 */
export function renderStudentDashboard(container) {
  const dailyCompleted = isDailyQuestCompletedToday();

  container.innerHTML = `
    <div style="min-height: calc(100vh - 70px); background: #f1f5f9; padding: 24px; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif;">
      
      <!-- 3-COLUMN BENTO GRID DASHBOARD -->
      <main style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1200px; margin: 0 auto;">
        
        <!-- CARD 1: DAILY PRACTICE / DAILY QUEST -->
        <section style="background: #ffffff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #cbd5e1;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <span style="font-size: 0.88rem; font-weight: 700; color: #64748b;">Daily Practice</span>
              ${dailyCompleted ? `<span style="background: #d1fae5; color: #047857; padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 800;">✅ Completed Today</span>` : ''}
            </div>

            <h3 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
              ⚡ Daily Quest
            </h3>

            <p style="color: #475569; line-height: 1.5; font-size: 0.95rem;">
              5-question daily win to build habit and extend your streak!
            </p>
          </div>

          <button id="btn-start-daily-quest" type="button" style="
            width: 100%;
            padding: 14px;
            font-size: 1rem;
            font-weight: 800;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            ${dailyCompleted 
              ? 'background: #d1fae5; color: #065f46; border: 1.5px solid #6ee7b7;' 
              : 'background: #f8fafc; color: #0f172a; border: 1.5px solid #94a3b8;'}
          ">
            ${dailyCompleted ? '✓ Completed Today 🎉' : 'Start Quest ➔'}
          </button>
        </section>

        <!-- CARD 2: ADAPTIVE MEMORY / SMART REVIEW -->
        <section style="background: #ffffff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #cbd5e1;">
          <div>
            <div style="font-size: 0.88rem; font-weight: 700; color: #b45309; margin-bottom: 24px;">
              <span style="background: #fef3c7; padding: 4px 10px; border-radius: 12px;">Adaptive Memory</span>
            </div>

            <h3 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
              🧠 Smart Review
            </h3>

            <p style="color: #475569; line-height: 1.5; font-size: 0.95rem;">
              Close learning gaps & review topics based on memory decay curves.
            </p>
          </div>

          <button id="btn-start-smart-review" type="button" style="
            width: 100%;
            padding: 14px;
            font-size: 1rem;
            font-weight: 800;
            background: #2563eb;
            color: #ffffff;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
          ">
            Start Review ➔
          </button>
        </section>

        <!-- CARD 3: SELF-PACED / SKILL TREE -->
        <section style="background: #ffffff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #cbd5e1;">
          <div>
            <div style="font-size: 0.88rem; font-weight: 700; color: #0369a1; margin-bottom: 24px;">
              <span style="background: #e0f2fe; padding: 4px 10px; border-radius: 12px;">Self-Paced</span>
            </div>

            <h3 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
              🗺️ Skill Tree
            </h3>

            <p style="color: #475569; line-height: 1.5; font-size: 0.95rem;">
              Browse all curriculum topics, target weak areas, and unlock 3-Star ratings.
            </p>
          </div>

          <button id="btn-start-skill-tree" type="button" style="
            width: 100%;
            padding: 14px;
            font-size: 1rem;
            font-weight: 800;
            background: #0284c7;
            color: #ffffff;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
          ">
            Explore Skills ➔
          </button>
        </section>

      </main>
    </div>
  `;

  container.querySelector("#btn-start-daily-quest")?.addEventListener("click", () => {
    navigateTo("daily");
  });

  container.querySelector("#btn-start-smart-review")?.addEventListener("click", () => {
    navigateTo("smartReviewSetup");
  });

  container.querySelector("#btn-start-skill-tree")?.addEventListener("click", () => {
    navigateTo("skillTree");
  });
}
