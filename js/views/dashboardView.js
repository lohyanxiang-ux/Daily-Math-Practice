import { navigateTo } from "../router.js";
import { state } from "../state.js";

export function renderDashboard(container) {
  container.innerHTML = `
    <div class="dashboard-grid">
      <!-- DAILY QUEST CARD -->
      <div id="card-daily" class="mode-card active">
        <div>
          <span class="tag">Recommended</span>
          <h2 style="margin-top: 10px;">⚡ Daily Quest</h2>
          <p style="color: var(--text-muted); margin-top: 6px;">
            Target: 5 Questions | Complete to maintain your daily streak!
          </p>
        </div>
        <button class="btn-next-question" style="margin-top: 20px;">Start Daily Quest ➔</button>
      </div>

      <!-- SKILL TREE CARD -->
      <div id="card-skill-tree" class="mode-card active">
        <div>
          <span class="tag" style="background: #e0f2fe; color: #0369a1;">Self-Paced</span>
          <h2 style="margin-top: 10px;">🗺️ Skill Tree</h2>
          <p style="color: var(--text-muted); margin-top: 6px;">
            Browse all math skills, earn 3-Star mastery ratings, and target specific topics.
          </p>
        </div>
        <button class="btn-next-question" style="margin-top: 20px; background: #0284c7;">Explore Skills ➔</button>
      </div>
    </div>
  `;

  container.querySelector("#card-daily").addEventListener("click", () => navigateTo("daily"));
  container.querySelector("#card-skill-tree").addEventListener("click", () => navigateTo("skillTree"));
}
