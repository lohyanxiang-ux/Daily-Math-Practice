import { navigateTo } from "../router.js";
import { getSRSMetrics } from "../utils/srsEngine.js";

export function renderDashboard(container) {
  const srsMetrics = getSRSMetrics();

  container.innerHTML = `
    <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; padding: 20px;">
      
      <!-- CARD 1: DAILY QUEST -->
      <div id="card-daily" class="mode-card active" style="background: #fff; padding: 24px; border-radius: 20px; box-shadow: var(--shadow); cursor: pointer;">
        <span class="tag">Daily Practice</span>
        <h2 style="margin-top: 10px;">⚡ Daily Quest</h2>
        <p style="color: var(--text-muted); margin-top: 6px;">5-question daily win to build habit and extend your streak!</p>
        <button class="btn-next-question" style="margin-top: 20px;">Start Quest ➔</button>
      </div>

      <!-- CARD 2: SMART REVIEW (SRS) -->
      <div id="card-srs" class="mode-card active" style="background: #fff; padding: 24px; border-radius: 20px; box-shadow: var(--shadow); cursor: pointer;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span class="tag" style="background: #fef3c7; color: #92400e;">Adaptive Memory</span>
          ${srsMetrics.totalDue > 0 ? `<span style="background: #ef4444; color: white; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.8rem;">${srsMetrics.totalDue} Due</span>` : ''}
        </div>
        <h2 style="margin-top: 10px;">🧠 Smart Review</h2>
        <p style="color: var(--text-muted); margin-top: 6px;">Close learning gaps & review topics based on memory decay curves.</p>
        <button class="btn-next-question" style="margin-top: 20px; background: #2563eb;">Start Review ➔</button>
      </div>

      <!-- CARD 3: SKILL TREE -->
      <div id="card-skill-tree" class="mode-card active" style="background: #fff; padding: 24px; border-radius: 20px; box-shadow: var(--shadow); cursor: pointer;">
        <span class="tag" style="background: #e0f2fe; color: #0369a1;">Self-Paced</span>
        <h2 style="margin-top: 10px;">🗺️ Skill Tree</h2>
        <p style="color: var(--text-muted); margin-top: 6px;">Browse all curriculum topics, target weak areas, and unlock 3-Star ratings.</p>
        <button class="btn-next-question" style="margin-top: 20px; background: #0284c7;">Explore Skills ➔</button>
      </div>

    </div>
  `;

  container.querySelector("#card-daily").addEventListener("click", () => navigateTo("daily"));
  container.querySelector("#card-srs").addEventListener("click", () => navigateTo("smartReviewSetup"));
  container.querySelector("#card-skill-tree").addEventListener("click", () => navigateTo("skillTree"));
}
