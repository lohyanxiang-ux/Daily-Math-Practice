import { safeGetMasteryMetadata, getStudentClass } from "./helperUtils.js";
import { adjustStudentBalance } from "../services/backend.js";
import { state, CONFIG } from "../state.js";

export function renderStudentDrawerHTML() {
  return `
    <div id="student-detail-drawer" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 99990; justify-content: flex-end;">
      <div style="background: #ffffff; width: 440px; max-width: 100%; height: 100%; padding: 24px; box-shadow: -4px 0 24px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 16px; overflow-y: auto; box-sizing: border-box;">
        
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
          <h3 id="drawer-student-name" style="margin: 0; font-size: 1.2rem; color: #0f172a; font-weight: 800;">Student Details</h3>
          <button id="btn-close-drawer" type="button" style="background: #f1f5f9; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b; padding: 4px 10px; border-radius: 8px; font-weight: 700;">✕</button>
        </div>

        <!-- CONTENT AREA -->
        <div id="drawer-content" style="display: flex; flex-direction: column; gap: 16px;"></div>

      </div>
    </div>
  `;
}

let activeStudentEmail = null;

export function openStudentDrawer(container, emailKey, students, classMastery, curriculum) {
  const student = students.find(s => (s.email || s.id || "").toLowerCase() === emailKey.toLowerCase());
  if (!student) return;

  activeStudentEmail = emailKey.toLowerCase();

  const drawerEl = container.querySelector("#student-detail-drawer");
  const nameEl = container.querySelector("#drawer-student-name");
  const contentEl = container.querySelector("#drawer-content");

  if (nameEl) {
    nameEl.innerText = `${student.displayName || student.name || 'Student'} (${getStudentClass(student)})`;
  }

  const stMastery = classMastery[emailKey.toLowerCase()] || {};
  const skillKeys = Object.keys(stMastery);

  if (contentEl) {
    contentEl.innerHTML = `
      <!-- 1. PROFILE & XP/GEM STATS SUMMARY -->
      <div style="background: #f8fafc; padding: 14px; border-radius: 12px; font-size: 0.88rem; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; border: 1px solid #e2e8f0;">
        <div><strong>XP:</strong> <span id="drawer-val-xp" style="color: #2563eb; font-weight: 800;">${student.xp || 0}</span></div>
        ${(CONFIG && CONFIG.ENABLE_GEMS !== false) ? `<div><strong>Gems:</strong> <span id="drawer-val-gems" style="color: #0284c7; font-weight: 800;">💎 ${student.gems || 0}</span></div>` : ''}
        <div><strong>Streak:</strong> 🔥 ${student.streakCount || 0} days</div>
        <div><strong>Last Active:</strong> ${student.lastActive ? new Date(student.lastActive).toLocaleDateString() : 'Never'}</div>
      </div>

      <!-- 2. TEACHER BALANCE ADJUSTMENT TOOL -->
      <div style="background: #ffffff; border: 1.5px solid #2563eb; border-radius: 14px; padding: 16px; box-shadow: 0 4px 12px rgba(37,99,235,0.06);">
        <h4 style="margin: 0 0 10px 0; font-size: 0.92rem; color: #0f172a; font-weight: 800; display: flex; align-items: center; gap: 6px;">
          ⚖️ Adjust XP & Gem Balance
        </h4>
        
        <!-- QUICK ADJUSTMENT BUTTONS -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px;">
          <button type="button" class="btn-drawer-quick-adj" data-xp="10" data-gem="0" style="padding: 8px 4px; background: #dcfce7; color: #15803d; border: 1px solid #86efac; border-radius: 8px; font-weight: 800; font-size: 0.78rem; cursor: pointer;">+10 XP</button>
          <button type="button" class="btn-drawer-quick-adj" data-xp="-10" data-gem="0" style="padding: 8px 4px; background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 8px; font-weight: 800; font-size: 0.78rem; cursor: pointer;">-10 XP</button>
          <button type="button" class="btn-drawer-quick-adj" data-xp="0" data-gem="1" style="padding: 8px 4px; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; border-radius: 8px; font-weight: 800; font-size: 0.78rem; cursor: pointer;">+1 💎</button>
          <button type="button" class="btn-drawer-quick-adj" data-xp="0" data-gem="-1" style="padding: 8px 4px; background: #fef3c7; color: #92400e; border: 1px solid #fde047; border-radius: 8px; font-weight: 800; font-size: 0.78rem; cursor: pointer;">-1 💎</button>
        </div>

        <!-- CUSTOM ADJUSTMENT INPUTS -->
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <div style="flex: 1;">
            <label style="font-size: 0.72rem; font-weight: 700; color: #64748b;">XP Δ:</label>
            <input id="drawer-adj-xp" type="number" placeholder="0" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 700; font-size: 0.85rem; box-sizing: border-box;" />
          </div>
          <div style="flex: 1;">
            <label style="font-size: 0.72rem; font-weight: 700; color: #64748b;">Gems Δ:</label>
            <input id="drawer-adj-gems" type="number" placeholder="0" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 700; font-size: 0.85rem; box-sizing: border-box;" />
          </div>
        </div>

        <input id="drawer-adj-reason" type="text" placeholder="Reason (e.g. Class Helper, Perk Claim)..." style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.82rem; margin-bottom: 10px; box-sizing: border-box;" />

        <button id="btn-submit-drawer-adj" type="button" style="width: 100%; padding: 10px; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-weight: 800; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 10px rgba(37,99,235,0.2);">
          Apply Adjustment ➔
        </button>
      </div>

      <!-- 3. SKILL DIAGNOSTIC BREAKDOWN -->
      <h4 style="margin: 10px 0 4px 0; font-size: 0.95rem; color: #0f172a; font-weight: 800;">Skill Diagnostic Breakdown</h4>

      ${skillKeys.length === 0 ? `
        <div style="color: #64748b; font-size: 0.88rem; padding: 12px 0;">No practice data logged yet.</div>
      ` : skillKeys.map(path => {
        const m = stMastery[path];
        const skillObj = curriculum.find(c => c.generatorPath === path);
        const meta = safeGetMasteryMetadata(m.score);

        return `
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 6px; background: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; font-size: 0.9rem; color: #0f172a;">${skillObj?.title || path}</span>
              <span style="${meta.badgeCss} padding: 2px 8px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">
                ${meta.score}/100
              </span>
            </div>

            <div style="font-size: 0.8rem; color: #64748b; display: flex; justify-content: space-between;">
              <span>Accuracy: <strong>${m.accuracy || 0}%</strong></span>
              <span>Attempted: <strong>${m.totalAttempted || 0}</strong></span>
              <span>Correct: <strong>${m.totalCorrect || 0}</strong></span>
            </div>
          </div>
        `;
      }).join('')}
    `;
  }

  // Bind Close Drawer Button
  const closeBtn = drawerEl.querySelector("#btn-close-drawer");
  if (closeBtn) {
    closeBtn.onclick = () => {
      drawerEl.style.display = "none";
    };
  }

  // Close Drawer on Overlay Click
  drawerEl.onclick = (e) => {
    if (e.target === drawerEl) {
      drawerEl.style.display = "none";
    }
  };

  // Bind Quick Adjustment Buttons (+10/-10 XP, +1/-1 Gem)
  drawerEl.querySelectorAll(".btn-drawer-quick-adj").forEach(btn => {
    btn.onclick = async () => {
      const xpDelta = Number(btn.getAttribute("data-xp")) || 0;
      const gemDelta = Number(btn.getAttribute("data-gem")) || 0;
      await processDrawerBalanceAdjustment(container, student, xpDelta, gemDelta, "Quick Teacher Adjustment", students, classMastery, curriculum);
    };
  });

  // Bind Custom Adjustment Form Submission
  const submitBtn = drawerEl.querySelector("#btn-submit-drawer-adj");
  if (submitBtn) {
    submitBtn.onclick = async () => {
      const xpInput = drawerEl.querySelector("#drawer-adj-xp");
      const gemInput = drawerEl.querySelector("#drawer-adj-gems");
      const reasonInput = drawerEl.querySelector("#drawer-adj-reason");

      const xpDelta = Number(xpInput?.value) || 0;
      const gemDelta = Number(gemInput?.value) || 0;
      const reason = reasonInput?.value || "Teacher Adjustment";

      if (xpDelta === 0 && gemDelta === 0) {
        alert("Please enter an XP or Gem adjustment amount.");
        return;
      }

      submitBtn.innerText = "Applying...";
      submitBtn.disabled = true;

      await processDrawerBalanceAdjustment(container, student, xpDelta, gemDelta, reason, students, classMastery, curriculum);
      
      if (xpInput) xpInput.value = "";
      if (gemInput) gemInput.value = "";
      if (reasonInput) reasonInput.value = "";
      submitBtn.innerText = "Apply Adjustment ➔";
      submitBtn.disabled = false;
    };
  }

  if (drawerEl) drawerEl.style.display = "flex";
}

async function processDrawerBalanceAdjustment(container, student, xpDelta, gemDelta, reason, students, classMastery, curriculum) {
  try {
    const res = await adjustStudentBalance(state.userToken, student.email || activeStudentEmail, xpDelta, gemDelta, reason);
    if (res && res.status === "success") {
      student.xp = res.result.newXP;
      student.gems = res.result.newGems;

      // Automatically refresh drawer content with updated numbers
      openStudentDrawer(container, student.email || activeStudentEmail, students, classMastery, curriculum);
    } else {
      alert("Failed to adjust balance: " + (res?.message || "Unknown error"));
    }
  } catch (err) {
    alert("Network Error: " + err.message);
  }
}
