import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { syncBatchMastery } from "../services/backend.js";

export function renderSkillTree(container) {
  let activeStrand = "All";

  function flushSync() {
    if (state.pendingMasteryUpdates.size > 0 && state.userToken) {
      const updates = Array.from(state.pendingMasteryUpdates).map(path => state.mastery[path]);
      syncBatchMastery(state.userToken, updates);
      state.pendingMasteryUpdates.clear();
    }
  }

  function getStrands() {
    const strands = new Set(["All"]);
    state.curriculum.forEach(s => {
      if (s.strand) strands.add(s.strand);
    });
    return Array.from(strands);
  }

  function getFilteredCurriculum() {
    const studentYear = state.profile ? String(state.profile.year).trim() : "";
    const studentStream = state.profile ? String(state.profile.stream).trim() : "";

    return state.curriculum.filter(s => {
      const matchLevel = String(s.year).trim() === studentYear && String(s.stream).trim() === studentStream;
      const matchStrand = activeStrand === "All" || s.strand === activeStrand;
      return matchLevel && matchStrand;
    });
  }

  function render() {
    const filtered = getFilteredCurriculum();
    const strands = getStrands();

    // Group skills by Topic
    const groupedByTopic = {};
    filtered.forEach(skill => {
      const topic = skill.topic || "General Topics";
      if (!groupedByTopic[topic]) groupedByTopic[topic] = [];
      groupedByTopic[topic].push(skill);
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; gap: 16px; overflow-y: auto;">
        <!-- HEADER & NAVIGATION -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 16px; box-shadow: var(--shadow);">
          <div>
            <h2 style="font-size: 1.5rem; color: var(--text-main);">🗺️ Skill Mastery Tree</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">${state.profile.year} (${state.profile.stream}) Curriculum</p>
          </div>
          <button id="btn-tree-dashboard" class="secondary-btn">← Back to Dashboard</button>
        </div>

        <!-- STRAND FILTER TABS -->
        <div style="display: flex; gap: 10px;">
          ${strands.map(strand => `
            <button class="strand-tab ${strand === activeStrand ? 'active' : ''}" data-strand="${strand}" style="
              padding: 8px 18px; border-radius: 20px; border: none; font-weight: 700; cursor: pointer;
              background: ${strand === activeStrand ? 'var(--primary)' : '#ffffff'};
              color: ${strand === activeStrand ? '#ffffff' : 'var(--text-main)'};
              box-shadow: var(--shadow);
            ">${strand}</button>
          `).join('')}
        </div>

        <!-- TOPICS & SKILL CARDS GRID -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${Object.keys(groupedByTopic).length === 0 ? `
            <div style="background: #fff; padding: 40px; text-align: center; border-radius: 16px; color: var(--text-muted);">
              No active skills available for this topic filter.
            </div>
          ` : Object.entries(groupedByTopic).map(([topicName, skills]) => `
            <div style="background: #ffffff; padding: 20px; border-radius: 20px; box-shadow: var(--shadow);">
              <h3 style="font-size: 1.2rem; margin-bottom: 14px; color: var(--text-main); border-bottom: 2px solid var(--bg-main); padding-bottom: 8px;">
                📂 ${topicName}
              </h3>

              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
                ${skills.map(skill => {
                  const m = state.mastery[skill.generatorPath] || { stars: 0, accuracy: 0, totalAttempted: 0 };
                  const isLocked = skill.prerequisites && state.mastery[skill.prerequisites]?.stars < 1;
                  
                  // Render 3-Star icons
                  const starsHtml = [1, 2, 3].map(i => 
                    `<span style="font-size: 1.2rem; opacity: ${i <= m.stars ? '1' : '0.25'};">⭐</span>`
                  ).join('');

                  return `
                    <div style="border: 1.5px solid var(--border); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; background: ${isLocked ? '#f9fafb' : '#ffffff'};">
                      <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                          <span class="tag" style="font-size: 0.75rem;">${skill.strand}</span>
                          <div>${starsHtml}</div>
                        </div>
                        <h4 style="font-size: 1rem; color: var(--text-main); margin-bottom: 6px;">${skill.title}</h4>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">
                          Accuracy: <strong>${m.accuracy}%</strong> (${m.totalAttempted} attempted)
                        </div>
                      </div>

                      <button class="btn-launch-skill ${isLocked ? 'disabled' : ''}" data-path="${skill.generatorPath}" ${isLocked ? 'disabled' : ''} style="
                        margin-top: 14px; padding: 10px; border-radius: 10px; border: none; font-weight: 700; cursor: ${isLocked ? 'not-allowed' : 'pointer'};
                        background: ${isLocked ? '#e5e7eb' : 'var(--primary)'};
                        color: ${isLocked ? '#9ca3af' : '#ffffff'};
                      ">
                        ${isLocked ? '🔒 Locked' : (m.stars > 0 ? 'Practice Again ➔' : 'Start Skill ➔')}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Strand Filter Listeners
    container.querySelectorAll(".strand-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        activeStrand = tab.getAttribute("data-strand");
        render();
      });
    });

    // Back to Dashboard
    container.querySelector("#btn-tree-dashboard").addEventListener("click", () => {
      flushSync();
      navigateTo("dashboard");
    });

    // Launch Skill Listener
    container.querySelectorAll(".btn-launch-skill:not([disabled])").forEach(btn => {
      btn.addEventListener("click", () => {
        flushSync();
        const selectedPath = btn.getAttribute("data-path");
        navigateTo("daily", { generatorPath: selectedPath });
      });
    });
  }

  render();
}
