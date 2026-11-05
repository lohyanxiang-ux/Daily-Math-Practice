import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { isDailyQuestCompletedToday } from "../utils/dailyQuestEngine.js";
import { renderQuestionView } from "./questionView.js";

const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbwEsVnKapmwUFuv0vyG1wFvyAXoFKQMrpsNxibUqYh891PHXzFgmBThnT62lGoEPo_xiQ/exec";

function getApiUrl() {
  let apiUrl = state.apiUrl || 
               state.config?.apiUrl || 
               state.backendUrl || 
               state.scriptUrl || 
               window.APP_CONFIG?.apiUrl || 
               window.API_URL || 
               localStorage.getItem("math_app_api_url") || 
               DEFAULT_API_URL;
  if (apiUrl && !apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
    apiUrl = "https://" + apiUrl;
  }
  return apiUrl;
}

/**
 * Renders the Student Dashboard Bento Grid with integrated Teacher Live Practice Mode
 */
export async function renderStudentDashboard(container) {
  const dailyCompleted = isDailyQuestCompletedToday();
  const studentClass = state.profile?.class || state.profile?.className || state.user?.class || "";

  let activeLiveSession = null;

  // Check if a live session is currently active for this student's class
  if (studentClass) {
    try {
      const response = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "getLiveSessionData",
          className: studentClass
        })
      });
      const data = await response.json();
      if (data.status === "success" && data.activeSession) {
        activeLiveSession = data.activeSession;
      }
    } catch (err) {
      console.error("Error checking live session status:", err);
    }
  }

  const isLiveActive = activeLiveSession && activeLiveSession.status === "ACTIVE";

  container.innerHTML = `
    <div style="min-height: calc(100vh - 70px); background: #f1f5f9; padding: 24px; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif;">
      
      <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
        
        <!-- TOP BANNER: ACTIVE TEACHER LIVE SESSION -->
        ${isLiveActive ? `
          <div style="background: #f0fdf4; border: 2px solid #22c55e; padding: 20px 24px; border-radius: 20px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; animation: pulse 1.5s infinite;"></span>
                <span style="background: #22c55e; color: #ffffff; padding: 3px 10px; border-radius: 8px; font-weight: 800; font-size: 0.78rem;">🔴 LIVE PRACTICE SESSION</span>
              </div>
              <h3 style="margin: 6px 0 0 0; color: #0f172a; font-size: 1.25rem; font-weight: 800;">Class ${studentClass} Teacher Assignment Active!</h3>
              <p style="color: #166534; font-size: 0.88rem; margin: 4px 0 0 0;">Your teacher launched a live practice session. Click to join now!</p>
            </div>
            <button id="btn-banner-join-live" type="button" style="background: #16a34a; color: #ffffff; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
              🚀 Join Live Practice ➔
            </button>
          </div>
          <style>@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }</style>
        ` : ''}

        <!-- 4-CARD BENTO GRID DASHBOARD -->
        <main style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; width: 100%;">
          
          <!-- CARD 1: TEACHER LIVE PRACTICE -->
          <section style="background: #ffffff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid ${isLiveActive ? '#86efac' : '#cbd5e1'};">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <span style="background: ${isLiveActive ? '#dcfce7' : '#f1f5f9'}; color: ${isLiveActive ? '#15803d' : '#64748b'}; padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 800;">
                  ${isLiveActive ? '🔴 Active Session' : 'Teacher Mode'}
                </span>
              </div>

              <h3 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
                📡 Teacher Practice
              </h3>

              <p style="color: #475569; line-height: 1.5; font-size: 0.95rem;">
                ${isLiveActive 
                  ? 'Your teacher has assigned skills for live class practice right now!' 
                  : 'Join real-time practice sessions assigned directly by your teacher.'}
              </p>
            </div>

            <button id="btn-card-live-practice" type="button" style="
              width: 100%;
              padding: 14px;
              font-size: 1rem;
              font-weight: 800;
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.2s ease;
              ${isLiveActive 
                ? 'background: #16a34a; color: #ffffff; border: none; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);' 
                : 'background: #f8fafc; color: #475569; border: 1.5px solid #cbd5e1;'}
            ">
              ${isLiveActive ? 'Join Live Practice ➔' : 'Check for Live Session ➔'}
            </button>
          </section>

          <!-- CARD 2: DAILY PRACTICE / DAILY QUEST -->
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

          <!-- CARD 3: ADAPTIVE MEMORY / SMART REVIEW -->
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

          <!-- CARD 4: SELF-PACED / SKILL TREE -->
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
    </div>
  `;

  function startLiveSessionPractice() {
    renderQuestionView(container, {
      mode: "liveSession",
      sessionId: activeLiveSession.sessionId,
      queue: activeLiveSession.skillPaths,
      targetMastery: 90,
      onExit: () => renderStudentDashboard(container)
    });
  }

  // Event Listeners
  container.querySelector("#btn-banner-join-live")?.addEventListener("click", () => {
    startLiveSessionPractice();
  });

  container.querySelector("#btn-card-live-practice")?.addEventListener("click", () => {
    if (isLiveActive) {
      startLiveSessionPractice();
    } else {
      alert("No live practice session is currently assigned by your teacher. Sit tight! Your teacher will launch one soon.");
    }
  });

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
