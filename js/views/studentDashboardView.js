import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { 
  isDailyQuestCompletedToday, 
  checkStreakStatus, 
  preserveStreakWithXP, 
  declineStreakPreservation 
} from "../utils/dailyQuestEngine.js";
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

let studentLivePollTimer = null;

export async function renderStudentDashboard(container) {
  const dailyCompleted = isDailyQuestCompletedToday();
  const studentClass = state.profile?.class || state.profile?.className || state.user?.class || "";
  const studentEmail = state.profile?.email || state.profile?.studentEmail || state.user?.email || "";

  let activeLiveSession = null;

  if (studentLivePollTimer) {
    clearInterval(studentLivePollTimer);
    studentLivePollTimer = null;
  }

  async function checkLiveSession() {
    if (!studentClass) return null;
    try {
      const response = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "getLiveSessionData",
          token: state.userToken || state.token || (studentEmail ? ("PIN_AUTH_" + studentEmail) : "STUDENT_SESSION"),
          className: studentClass
        })
      });
      const data = await response.json();
      if (data.status === "success" && data.activeSession) {
        return data.activeSession;
      }
    } catch (err) {
      console.error("Error checking live session status:", err);
    }
    return null;
  }

  activeLiveSession = await checkLiveSession();

  function renderUI() {
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

          <!-- 3-CARD BENTO GRID DASHBOARD -->
          <main style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; width: 100%;">
            
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
      </div>
    `;

    bindEvents();
    checkAndDisplayStreakBrokenBanner();
  }

  function checkAndDisplayStreakBrokenBanner() {
    const streakStatus = checkStreakStatus();
    if (!streakStatus.isBroken || state.streakRepairHandled) return;

    const existingModal = document.querySelector("#streak-repair-modal-overlay");
    if (existingModal) existingModal.remove();

    const overlay = document.createElement("div");
    overlay.id = "streak-repair-modal-overlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(6px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      animation: fadeIn 0.2s ease-out;
    `;

    overlay.innerHTML = `
      <div style="
        background: #ffffff;
        border-radius: 24px;
        max-width: 440px;
        width: 100%;
        padding: 28px 24px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
        border: 2px solid #f97316;
        box-sizing: border-box;
      ">
        <div style="font-size: 3.5rem; margin-bottom: 8px; line-height: 1;">🔥💔</div>
        
        <h3 style="margin: 0 0 8px 0; font-size: 1.5rem; font-weight: 800; color: #0f172a;">Streak Broken!</h3>
        
        <p style="margin: 0 0 16px 0; font-size: 0.95rem; color: #475569; line-height: 1.5;">
          You missed a daily quest! Your <strong>${streakStatus.previousStreak}-day streak</strong> will reset to 0 unless you preserve it.
        </p>

        <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 12px; margin-bottom: 20px; color: #c2410c; font-size: 0.9rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
          <span>💰 Your Balance:</span>
          <span style="font-size: 1rem; color: #9a3412;">${streakStatus.userXp} XP</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="btn-preserve-streak" type="button" style="
            width: 100%;
            padding: 14px;
            font-size: 1rem;
            font-weight: 800;
            border-radius: 12px;
            border: none;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
            transition: all 0.15s ease;
            ${streakStatus.canAfford 
              ? 'background: #f97316; color: #ffffff; cursor: pointer;' 
              : 'background: #cbd5e1; color: #64748b; cursor: not-allowed;'}
          " ${!streakStatus.canAfford ? 'disabled' : ''}>
            ${streakStatus.canAfford ? `🛡️ Preserve Streak (-50 XP)` : `Not Enough XP (Requires 50 XP)`}
          </button>

          <button id="btn-decline-streak" type="button" style="
            width: 100%;
            padding: 12px;
            font-size: 0.92rem;
            font-weight: 700;
            background: #f1f5f9;
            color: #64748b;
            border: 1.5px solid #cbd5e1;
            border-radius: 12px;
            cursor: pointer;
          ">
            Reset Streak to 0
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#btn-preserve-streak")?.addEventListener("click", () => {
      const success = preserveStreakWithXP();
      if (success) {
        overlay.remove();
        renderUI();
      }
    });

    overlay.querySelector("#btn-decline-streak")?.addEventListener("click", () => {
      declineStreakPreservation();
      overlay.remove();
      renderUI();
    });
  }

  function stopPolling() {
    if (studentLivePollTimer) {
      clearInterval(studentLivePollTimer);
      studentLivePollTimer = null;
    }
  }

  function startLiveSessionPractice() {
    stopPolling();
    renderQuestionView(container, {
      mode: "liveSession",
      sessionId: activeLiveSession.sessionId,
      queue: activeLiveSession.skillPaths,
      targetMastery: 90,
      onExit: () => renderStudentDashboard(container)
    });
  }

  function bindEvents() {
    container.querySelector("#btn-banner-join-live")?.addEventListener("click", startLiveSessionPractice);

    container.querySelector("#btn-start-daily-quest")?.addEventListener("click", () => {
      stopPolling();
      navigateTo("daily");
    });

    container.querySelector("#btn-start-smart-review")?.addEventListener("click", () => {
      stopPolling();
      navigateTo("smartReviewSetup");
    });

    container.querySelector("#btn-start-skill-tree")?.addEventListener("click", () => {
      stopPolling();
      navigateTo("skillTree");
    });
  }

  renderUI();

  studentLivePollTimer = setInterval(async () => {
    const freshSession = await checkLiveSession();
    const wasActive = !!activeLiveSession;
    const isNowActive = !!freshSession;

    if (wasActive !== isNowActive || (freshSession && freshSession.sessionId !== activeLiveSession?.sessionId)) {
      activeLiveSession = freshSession;
      renderUI();
    }
  }, 4000);
}
