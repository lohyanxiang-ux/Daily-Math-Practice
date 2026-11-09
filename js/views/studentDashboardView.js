import { state, CONFIG } from "../state.js";
import { navigateTo } from "../router.js";
import { 
  isDailyQuestCompletedToday, 
  checkStreakStatus, 
  preserveStreakWithXP, 
  declineStreakPreservation 
} from "../utils/dailyQuestEngine.js";
import { renderQuestionView } from "./questionView.js";
import { redeemShopItem, syncUserProgress } from "../services/backend.js";

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
      <div style="min-height: calc(100vh - 70px); background: var(--bg-main, #f1f5f9); padding: 24px; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif;">
        
        <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
          
          ${CONFIG.ENABLE_GEMS ? `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--card-bg, #ffffff); padding: 14px 22px; border-radius: 16px; border: 1px solid var(--border, #cbd5e1); box-shadow: var(--shadow);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4rem;">💎</span>
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main, #0f172a);">Gem Balance: <span style="color: #0284c7;">${state.profile.gems || 0} Gems</span></div>
                  <div style="font-size: 0.78rem; color: var(--text-muted, #64748b);">Earn 1 Gem for every 100 XP gained!</div>
                </div>
              </div>

              <button id="btn-open-gem-shop" type="button" style="background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 800; font-size: 0.90rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                🛍️ Open Gem Shop
              </button>
            </div>
          ` : ''}

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

          <main style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; width: 100%;">
            
            <section style="background: var(--card-bg, #ffffff); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px; box-shadow: var(--shadow); border: 1px solid var(--border, #cbd5e1);">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                  <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-muted, #64748b);">Daily Practice</span>
                  ${dailyCompleted ? `<span style="background: #d1fae5; color: #047857; padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 800;">✅ Completed Today</span>` : ''}
                </div>

                <h3 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main, #0f172a); margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
                  ⚡ Daily Quest
                </h3>

                <p style="color: var(--text-muted, #475569); line-height: 1.5; font-size: 0.95rem;">
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
                  : 'background: var(--bg-main, #f8fafc); color: var(--text-main, #0f172a); border: 1.5px solid var(--border, #94a3b8);'}
              ">
                ${dailyCompleted ? '✓ Completed Today 🎉' : 'Start Quest ➔'}
              </button>
            </section>

            <section style="background: var(--card-bg, #ffffff); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px; box-shadow: var(--shadow); border: 1px solid var(--border, #cbd5e1);">
              <div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #b45309; margin-bottom: 24px;">
                  <span style="background: #fef3c7; padding: 4px 10px; border-radius: 12px;">Adaptive Memory</span>
                </div>

                <h3 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main, #0f172a); margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
                  🧠 Smart Review
                </h3>

                <p style="color: var(--text-muted, #475569); line-height: 1.5; font-size: 0.95rem;">
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

            <section style="background: var(--card-bg, #ffffff); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px; box-shadow: var(--shadow); border: 1px solid var(--border, #cbd5e1);">
              <div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #0369a1; margin-bottom: 24px;">
                  <span style="background: #e0f2fe; padding: 4px 10px; border-radius: 12px;">Self-Paced</span>
                </div>

                <h3 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main, #0f172a); margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
                  🗺️ Skill Tree
                </h3>

                <p style="color: var(--text-muted, #475569); line-height: 1.5; font-size: 0.95rem;">
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

  function openGemShopModal() {
    const existing = document.querySelector("#gem-shop-modal-overlay");
    if (existing) existing.remove();

    const items = state.shopItems || [
      { id: "theme_dark", title: "Midnight Dark", type: "DIGITAL", cost: 10, icon: "🌙", description: "Sleek dark mode theme" },
      { id: "theme_cyberpunk", title: "Neon Cyberpunk", type: "DIGITAL", cost: 15, icon: "🌆", description: "Vibrant neon cyberpunk aesthetic" },
      { id: "perk_seat_pass", title: "Choose Your Seat (1 Week)", type: "REAL_PERK", cost: 20, icon: "🪑", description: "Pick your seat in class for 1 week" }
    ];

    const overlay = document.createElement("div");
    overlay.id = "gem-shop-modal-overlay";
    overlay.style.cssText = "position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(6px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;";

    overlay.innerHTML = `
      <div style="background: #ffffff; border-radius: 24px; max-width: 640px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 2px solid #0284c7;">
        
        <div style="padding: 20px 24px; border-bottom: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
          <div>
            <h3 style="margin: 0; font-size: 1.3rem; color: #0f172a; font-weight: 800;">🛍️ Gem Shop & Rewards</h3>
            <div style="font-size: 0.85rem; color: #0284c7; font-weight: 700; margin-top: 2px;">Your Balance: 💎 ${state.profile.gems || 0} Gems</div>
          </div>
          <button id="btn-close-shop" style="background: #f1f5f9; color: #475569; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">✕ Close</button>
        </div>

        <div style="padding: 20px; overflow-y: auto; flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; background: #f1f5f9;">
          ${items.map(item => {
            const isUnlocked = (state.profile.unlockedThemes || []).includes(item.id);
            const isActive = state.profile.activeTheme === item.id;
            const canAfford = (state.profile.gems || 0) >= item.cost;

            let btnText = `Redeem (${item.cost} 💎)`;
            let btnStyle = "background: #0284c7; color: #fff;";

            if (item.type === "DIGITAL") {
              if (isActive) {
                btnText = "Active Theme";
                btnStyle = "background: #dcfce7; color: #15803d; border: 1.5px solid #86efac;";
              } else if (isUnlocked) {
                btnText = "Apply Theme";
                btnStyle = "background: #2563eb; color: #fff;";
              } else if (!canAfford) {
                btnText = `Need ${item.cost} 💎`;
                btnStyle = "background: #cbd5e1; color: #64748b; cursor: not-allowed;";
              }
            } else if (!canAfford) {
              btnText = `Need ${item.cost} 💎`;
              btnStyle = "background: #cbd5e1; color: #64748b; cursor: not-allowed;";
            }

            return `
              <div style="background: #ffffff; border-radius: 16px; padding: 18px; border: 1.5px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                <div>
                  <div style="font-size: 2.2rem; margin-bottom: 8px;">${item.icon}</div>
                  <h4 style="margin: 0 0 4px 0; font-size: 1.05rem; color: #0f172a; font-weight: 800;">${item.title}</h4>
                  <p style="margin: 0 0 12px 0; font-size: 0.82rem; color: #64748b; line-height: 1.4;">${item.description}</p>
                </div>

                <div>
                  <div style="font-size: 0.78rem; font-weight: 800; color: #0284c7; margin-bottom: 8px;">
                    ${item.type === 'DIGITAL' ? '🎨 Digital App Theme' : '🎁 Classroom Perk'}
                  </div>
                  <button class="btn-shop-action" data-item-id="${item.id}" data-type="${item.type}" data-cost="${item.cost}" style="width: 100%; padding: 10px; border-radius: 10px; border: none; font-weight: 800; font-size: 0.88rem; cursor: pointer; ${btnStyle}" ${(!canAfford && !isUnlocked) || isActive ? 'disabled' : ''}>
                    ${btnText}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#btn-close-shop")?.addEventListener("click", () => overlay.remove());

    overlay.querySelectorAll(".btn-shop-action").forEach(btn => {
      btn.addEventListener("click", async () => {
        const itemId = btn.getAttribute("data-item-id");
        const type = btn.getAttribute("data-type");
        const isUnlocked = (state.profile.unlockedThemes || []).includes(itemId);

        if (type === "DIGITAL" && isUnlocked) {
          state.profile.activeTheme = itemId;
          document.body.className = itemId !== "default" ? itemId : "";
          if (state.userToken) {
            syncUserProgress(state.userToken, state.profile.xp, state.profile.streakCount, state.profile.lastDailyQuestDate, state.profile.gems, itemId);
          }
          overlay.remove();
          renderUI();
          return;
        }

        btn.innerText = "Processing...";
        btn.disabled = true;

        try {
          const res = await redeemShopItem(state.userToken, itemId);
          if (res && res.status === "success") {
            const r = res.result;
            state.profile.gems = r.newGems;
            if (r.unlockedThemes) state.profile.unlockedThemes = r.unlockedThemes;
            if (r.activeTheme) {
              state.profile.activeTheme = r.activeTheme;
              document.body.className = r.activeTheme !== "default" ? r.activeTheme : "";
            }
            alert(r.message);
            overlay.remove();
            renderUI();
          } else {
            alert("Redemption failed: " + (res?.message || "Unknown error"));
          }
        } catch (err) {
          alert("Network error: " + err.message);
        }
      });
    });
  }

  function checkAndDisplayStreakBrokenBanner() {
    const streakStatus = checkStreakStatus();
    if (!streakStatus.isBroken || state.streakRepairHandled) return;

    const existingModal = document.querySelector("#streak-repair-modal-overlay");
    if (existingModal) existingModal.remove();

    const overlay = document.createElement("div");
    overlay.id = "streak-repair-modal-overlay";
    overlay.style.cssText = "position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(6px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;";

    overlay.innerHTML = `
      <div style="background: #ffffff; border-radius: 24px; max-width: 440px; width: 100%; padding: 28px 24px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25); border: 2px solid #f97316; box-sizing: border-box;">
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
          <button id="btn-preserve-streak" type="button" style="width: 100%; padding: 14px; font-size: 1rem; font-weight: 800; border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); ${streakStatus.canAfford ? 'background: #f97316; color: #ffffff; cursor: pointer;' : 'background: #cbd5e1; color: #64748b; cursor: not-allowed;'}" ${!streakStatus.canAfford ? 'disabled' : ''}>
            ${streakStatus.canAfford ? `🛡️ Preserve Streak (-50 XP)` : `Not Enough XP (Requires 50 XP)`}
          </button>
          <button id="btn-decline-streak" type="button" style="width: 100%; padding: 12px; font-size: 0.92rem; font-weight: 700; background: #f1f5f9; color: #64748b; border: 1.5px solid #cbd5e1; border-radius: 12px; cursor: pointer;">
            Reset Streak to 0
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#btn-preserve-streak")?.addEventListener("click", () => {
      if (preserveStreakWithXP()) { overlay.remove(); renderUI(); }
    });

    overlay.querySelector("#btn-decline-streak")?.addEventListener("click", () => {
      declineStreakPreservation(); overlay.remove(); renderUI();
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
    container.querySelector("#btn-open-gem-shop")?.addEventListener("click", openGemShopModal);
    container.querySelector("#btn-banner-join-live")?.addEventListener("click", startLiveSessionPractice);

    container.querySelector("#btn-start-daily-quest")?.addEventListener("click", () => {
      stopPolling(); navigateTo("daily");
    });

    container.querySelector("#btn-start-smart-review")?.addEventListener("click", () => {
      stopPolling(); navigateTo("smartReviewSetup");
    });

    container.querySelector("#btn-start-skill-tree")?.addEventListener("click", () => {
      stopPolling(); navigateTo("skillTree");
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
