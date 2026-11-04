import { safeGetMasteryMetadata, getStudentClass } from "./helperUtils.js";

export function renderStudentDrawerHTML() {
  return `
    <div id="student-detail-drawer" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 100; justify-content: flex-end;">
      <div style="background: #ffffff; width: 420px; max-width: 100%; height: 100%; padding: 24px; box-shadow: -4px 0 24px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
          <h3 id="drawer-student-name" style="margin: 0; font-size: 1.2rem; color: #0f172a;">Student Details</h3>
          <button id="btn-close-drawer" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">✕</button>
        </div>
        <div id="drawer-content" style="display: flex; flex-direction: column; gap: 14px;"></div>
      </div>
    </div>
  `;
}

export function openStudentDrawer(container, emailKey, students, classMastery, curriculum) {
  const student = students.find(s => (s.email || s.id || "").toLowerCase() === emailKey);
  if (!student) return;

  const drawerEl = container.querySelector("#student-detail-drawer");
  const nameEl = container.querySelector("#drawer-student-name");
  const contentEl = container.querySelector("#drawer-content");

  if (nameEl) nameEl.innerText = `${student.displayName || student.name || 'Student'} (${getStudentClass(student)})`;

  const stMastery = classMastery[emailKey] || {};
  const skillKeys = Object.keys(stMastery);

  if (contentEl) {
    contentEl.innerHTML = `
      <div style="background: #f8fafc; padding: 14px; border-radius: 12px; font-size: 0.88rem; display: flex; justify-content: space-between; border: 1px solid #e2e8f0;">
        <div><strong>XP:</strong> ${student.xp || 0}</div>
        <div><strong>Streak:</strong> 🔥 ${student.streakCount || 0} days</div>
        <div><strong>Last Active:</strong> ${student.lastActive ? new Date(student.lastActive).toLocaleDateString() : 'Never'}</div>
      </div>

      <h4 style="margin: 10px 0 4px 0; font-size: 0.95rem; color: #0f172a;">Skill Diagnostic Breakdown</h4>

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

  if (drawerEl) drawerEl.style.display = "flex";
}
