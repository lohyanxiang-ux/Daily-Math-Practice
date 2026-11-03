import { state } from "../state.js";
import { navigateTo } from "../router.js";

export function renderDashboard(container) {
  const dailyDone = state.dailySession.completedToday;
  const dailyTarget = state.dailySession.targetQuestions;
  const isDailyComplete = dailyDone >= dailyTarget;

  container.innerHTML = `
    <div class="dashboard-grid">
      <!-- DAILY QUEST CARD -->
      <div class="card mode-card ${isDailyComplete ? 'completed' : 'active'}" id="btn-mode-daily">
        <div class="mode-header">
          <span class="mode-icon">📅</span>
          <div>
            <h3>Daily Self-Practice</h3>
            <p>${isDailyComplete ? 'Completed for today!' : '5 quick questions to keep your streak alive.'}</p>
          </div>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${Math.min(100, (dailyDone / dailyTarget) * 100)}%;"></div>
        </div>
        <div class="mode-footer">
          <span>${dailyDone} / ${dailyTarget} Done</span>
          <button class="action-btn">${isDailyComplete ? 'Practice Again' : 'Start Daily Quest'}</button>
        </div>
      </div>

      <!-- PLACEHOLDER MODES FOR FUTURE EXPANSION -->
      <div class="card mode-card disabled">
        <div class="mode-header">
          <span class="mode-icon">📋</span>
          <div>
            <h3>Teacher Assignments</h3>
            <p>Homework assigned by your math teacher.</p>
          </div>
        </div>
        <span class="badge">Coming Soon</span>
      </div>

      <div class="card mode-card disabled">
        <div class="mode-header">
          <span class="mode-icon">🎯</span>
          <div>
            <h3>Skill Tree Practice</h3>
            <p>Pick specific topics to master at your own pace.</p>
          </div>
        </div>
        <span class="badge">Coming Soon</span>
      </div>

      <div class="card mode-card disabled">
        <div class="mode-header">
          <span class="mode-icon">⚡</span>
          <div>
            <h3>Speed Blitz</h3>
            <p>Solve as many questions as you can in 60 seconds!</p>
          </div>
        </div>
        <span class="badge">Coming Soon</span>
      </div>
    </div>
  `;

  document.getElementById("btn-mode-daily").addEventListener("click", () => {
    navigateTo("daily");
  });
}
