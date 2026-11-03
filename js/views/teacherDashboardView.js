import { state } from "../state.js";
import { getMasteryMetadata } from "../utils/masteryScoreEngine.js";

export function renderTeacherDashboard(container) {
  const students = state.teacherData?.students || [];
  const classMastery = state.teacherData?.classMastery || {};
  const curriculum = state.curriculum || [];

  let selectedClass = "All";
  let activeStrand = "All";

  // Get distinct classes & strands for dropdown filters
  const classes = Array.from(new Set(students.map(s => s.class || "Unassigned")));
  const strands = Array.from(new Set(["All", ...curriculum.map(c => c.strand).filter(Boolean)]));

  function getFilteredStudents() {
    return students.filter(s => selectedClass === "All" || s.class === selectedClass);
  }

  function getFilteredSkills() {
    return curriculum.filter(c => activeStrand === "All" || c.strand === activeStrand);
  }

  // Diagnostic Risk Calculation Engine
  function analyzeAtRiskStudents(filteredStudents) {
    const alerts = [];

    filteredStudents.forEach(st => {
      const stMastery = classMastery[st.email.toLowerCase()] || {};
      
      // 1. Check for skills with high attempts but low mastery score (< 40)
      Object.values(stMastery).forEach(m => {
        if (m.totalAttempted >= 8 && m.score < 40) {
          const skillObj = curriculum.find(c => c.generatorPath === m.generatorPath);
          alerts.push({
            student: st.displayName,
            class: st.class,
            type: "struggling",
            icon: "⚠️",
            message: `Struggling on <strong>${skillObj?.title || 'a skill'}</strong> (${m.score}/100 score, ${m.accuracy}% accuracy after ${m.totalAttempted} attempts).`
          });
        }

        // 2. High Hint Dependency
        if (m.rollingHistory && m.rollingHistory.length >= 5) {
          const hintHeavyAttempts = m.rollingHistory.filter(h => h.hints >= 2).length;
          if (hintHeavyAttempts / m.rollingHistory.length >= 0.6) {
            const skillObj = curriculum.find(c => c.generatorPath === m.generatorPath);
            alerts.push({
              student: st.displayName,
              class: st.class,
              type: "hints",
              icon: "💡",
              message: `Relying heavily on step hints for <strong>${skillObj?.title || 'skills'}</strong>.`
            });
          }
        }
      });

      // 3. Inactivity Alert (>= 5 days)
      if (st.lastActive) {
        const daysInactive = Math.floor((new Date() - new Date(st.lastActive)) / (1000 * 60 * 60 * 24));
        if (daysInactive >= 5) {
          alerts.push({
            student: st.displayName,
            class: st.class,
            type: "inactive",
            icon: "💤",
            message: `Inactive for <strong>${daysInactive} days</strong>. Skill scores are actively decaying.`
          });
        }
      }
    });

    return alerts;
  }

  function render() {
    const filteredStudents = getFilteredStudents();
    const filteredSkills = getFilteredSkills();
    const riskAlerts = analyzeAtRiskStudents(filteredStudents);

    // Compute Class Averages
    let totalScoreSum = 0;
    let totalScoreCount = 0;
    let activeTodayCount = 0;

    const todayStr = new Date().toISOString().split("T")[0];

    filteredStudents.forEach(st => {
      if (st.lastActive && st.lastActive.startsWith(todayStr)) activeTodayCount++;
      
      const stMastery = classMastery[st.email.toLowerCase()] || {};
      Object.values(stMastery).forEach(m => {
        totalScoreSum += m.score;
        totalScoreCount++;
      });
    });

    const classAvgScore = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : 0;
    const avgMeta = getMasteryMetadata(classAvgScore);

    container.innerHTML = `
      <div class="teacher-dashboard-container" style="display: flex; flex-direction: column; gap: 16px; padding: 16px; height: 100%; overflow-y: auto;">
        
        <!-- TOP HEADER & CLASS SELECTOR -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 16px; box-shadow: var(--shadow);">
          <div>
            <h2 style="font-size: 1.5rem; color: var(--text-main); margin: 0;">🏫 Teacher Analytics Dashboard</h2>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin: 2px 0 0 0;">Monitoring ${filteredStudents.length} Students across Curriculum Skills</p>
          </div>
          
          <div style="display: flex; gap: 12px; align-items: center;">
            <label style="font-weight: 700; font-size: 0.9rem;">Class:</label>
            <select id="select-class-filter" style="padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--border); font-weight: 600; cursor: pointer;">
              <option value="All">All Classes (${students.length})</option>
              ${classes.map(c => `<option value="${c}" ${c === selectedClass ? 'selected' : ''}>Class ${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- SUMMARY CARDS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: var(--shadow);">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Total Students</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">${filteredStudents.length}</div>
          </div>

          <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: var(--shadow);">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Class Average Mastery</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span style="font-size: 1.8rem; font-weight: 800; color: var(--text-main);">${classAvgScore}</span>
              <span style="${avgMeta.badgeCss} padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 700;">${avgMeta.tierName}</span>
            </div>
          </div>

          <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: var(--shadow);">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Active Today</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #10b981; margin-top: 4px;">
              ${activeTodayCount} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;">/ ${filteredStudents.length}</span>
            </div>
          </div>

          <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: var(--shadow);">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">At-Risk Alerts</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: ${riskAlerts.length > 0 ? '#dc2626' : '#10b981'}; margin-top: 4px;">
              ${riskAlerts.length} <span style="font-size: 0.85rem; font-weight: 600;">${riskAlerts.length > 0 ? 'Requires Action' : 'All Clear'}</span>
            </div>
          </div>
        </div>

        <!-- NEEDS ATTENTION / RISK ALERTS PANEL -->
        ${riskAlerts.length > 0 ? `
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; padding: 16px;">
            <h3 style="font-size: 1.05rem; color: #9f1239; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
              🚨 Students Needing Attention (${riskAlerts.length})
            </h3>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto;">
              ${riskAlerts.map(a => `
                <div style="background: #ffffff; padding: 8px 14px; border-radius: 8px; border-left: 4px solid #f43f5e; font-size: 0.88rem; display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <span style="font-weight: 700;">${a.student}</span> (${a.class}): ${a.message}
                  </div>
                  <span style="font-size: 1.1rem;">${a.icon}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- SKILL HEATMAP & MATRIX TABLE -->
        <div style="background: #ffffff; border-radius: 16px; padding: 18px; box-shadow: var(--shadow); flex: 1; display: flex; flex-direction: column; min-height: 400px;">
          
          <!-- MATRIX STRAND FILTER TABS -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 1.15rem; color: var(--text-main); margin: 0;">🗺️ Class Skill Mastery Matrix</h3>
            
            <div style="display: flex; gap: 8px;">
              ${strands.map(str => `
                <button class="matrix-strand-tab" data-strand="${str}" style="
                  padding: 6px 14px; border-radius: 16px; border: none; font-size: 0.82rem; font-weight: 700; cursor: pointer;
                  background: ${str === activeStrand ? 'var(--primary)' : '#f1f5f9'};
                  color: ${str === activeStrand ? '#ffffff' : 'var(--text-main)'};
                ">${str}</button>
              `).join('')}
            </div>
          </div>

          <!-- HEATMAP TABLE CONTAINER -->
          <div style="overflow-x: auto; overflow-y: auto; flex: 1; border: 1px solid var(--border); border-radius: 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid var(--border);">
                  <th style="padding: 12px 16px; position: sticky; left: 0; background: #f8fafc; z-index: 2; min-width: 160px;">Student Name</th>
                  <th style="padding: 12px 10px; text-align: center;">Class</th>
                  ${filteredSkills.map(sk => `
                    <th style="padding: 12px 12px; text-align: center; min-width: 130px;" title="${sk.title}">
                      ${sk.title}
                    </th>
                  `).join('')}
                  <th style="padding: 12px 14px; text-align: center; min-width: 110px;">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStudents.length === 0 ? `
                  <tr>
                    <td colspan="${filteredSkills.length + 3}" style="text-align: center; padding: 30px; color: var(--text-muted);">
                      No students found for this class filter.
                    </td>
                  </tr>
                ` : filteredStudents.map(st => {
                  const stMastery = classMastery[st.email.toLowerCase()] || {};
                  let sumScore = 0;
                  let countSkills = 0;

                  return `
                    <tr class="student-matrix-row" data-email="${st.email}" style="border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s;">
                      <td style="padding: 12px 16px; font-weight: 700; position: sticky; left: 0; background: #ffffff; z-index: 1;">
                        ${st.displayName}
                      </td>
                      <td style="padding: 12px 10px; text-align: center; color: var(--text-muted);">${st.class}</td>

                      ${filteredSkills.map(sk => {
                        const m = stMastery[sk.generatorPath];
                        if (m && m.totalAttempted > 0) {
                          sumScore += m.score;
                          countSkills++;
                          const meta = getMasteryMetadata(m.score);
                          return `
                            <td style="padding: 10px; text-align: center;">
                              <span style="${meta.badgeCss} padding: 4px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 700;">
                                ${meta.score}
                              </span>
                            </td>
                          `;
                        } else {
                          return `
                            <td style="padding: 10px; text-align: center; color: #cbd5e1; font-weight: 600;">
                              -
                            </td>
                          `;
                        }
                      }).join('')}

                      ${(() => {
                        const studentAvg = countSkills > 0 ? Math.round(sumScore / countSkills) : 0;
                        const avgMeta = getMasteryMetadata(studentAvg);
                        return `
                          <td style="padding: 10px; text-align: center;">
                            <span style="${countSkills > 0 ? avgMeta.badgeCss : 'color:#94a3b8;'} padding: 4px 8px; border-radius: 10px; font-size: 0.82rem; font-weight: 800;">
                              ${countSkills > 0 ? studentAvg : 'N/A'}
                            </span>
                          </td>
                        `;
                      })()}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      <!-- STUDENT DETAIL MODAL DRAWER -->
      <div id="student-detail-drawer" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 100; justify-content: flex-end;">
        <div style="background: #ffffff; width: 420px; max-width: 100%; height: 100%; padding: 24px; box-shadow: -4px 0 24px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--bg-main); padding-bottom: 12px;">
            <h3 id="drawer-student-name" style="margin: 0; font-size: 1.3rem;">Student Details</h3>
            <button id="btn-close-drawer" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
          </div>

          <div id="drawer-content" style="display: flex; flex-direction: column; gap: 14px;"></div>
        </div>
      </div>
    `;

    // Class Filter Listener
    container.querySelector("#select-class-filter").addEventListener("change", (e) => {
      selectedClass = e.target.value;
      render();
    });

    // Matrix Strand Filter Tabs
    container.querySelectorAll(".matrix-strand-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        activeStrand = tab.getAttribute("data-strand");
        render();
      });
    });

    // Student Detail Drawer Trigger
    container.querySelectorAll(".student-matrix-row").forEach(row => {
      row.addEventListener("click", () => {
        const email = row.getAttribute("data-email");
        openStudentDrawer(email);
      });
    });

    // Drawer Close
    const drawerEl = container.querySelector("#student-detail-drawer");
    container.querySelector("#btn-close-drawer").addEventListener("click", () => {
      drawerEl.style.display = "none";
    });
  }

  function openStudentDrawer(email) {
    const student = students.find(s => s.email === email);
    if (!student) return;

    const drawerEl = container.querySelector("#student-detail-drawer");
    const nameEl = container.querySelector("#drawer-student-name");
    const contentEl = container.querySelector("#drawer-content");

    nameEl.innerText = `${student.displayName} (${student.class})`;

    const stMastery = classMastery[email.toLowerCase()] || {};
    const skillKeys = Object.keys(stMastery);

    contentEl.innerHTML = `
      <div style="background: #f8fafc; padding: 14px; border-radius: 12px; font-size: 0.9rem; display: flex; justify-content: space-between;">
        <div><strong>XP:</strong> ${student.xp}</div>
        <div><strong>Streak:</strong> 🔥 ${student.streakCount} days</div>
        <div><strong>Last Active:</strong> ${student.lastActive ? new Date(student.lastActive).toLocaleDateString() : 'Never'}</div>
      </div>

      <h4 style="margin: 10px 0 4px 0; font-size: 1rem;">Skill Diagnostic Breakdown</h4>

      ${skillKeys.length === 0 ? `
        <div style="color: var(--text-muted); font-size: 0.9rem; padding: 12px 0;">No practice data logged yet.</div>
      ` : skillKeys.map(path => {
        const m = stMastery[path];
        const skillObj = curriculum.find(c => c.generatorPath === path);
        const meta = getMasteryMetadata(m.score);

        return `
          <div style="border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; font-size: 0.92rem;">${skillObj?.title || path}</span>
              <span style="${meta.badgeCss} padding: 2px 8px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">
                ${meta.score}/100
              </span>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Accuracy: <strong>${m.accuracy}%</strong></span>
              <span>Attempted: <strong>${m.totalAttempted}</strong></span>
              <span>Correct: <strong>${m.totalCorrect}</strong></span>
            </div>
          </div>
        `;
      }).join('')}
    `;

    drawerEl.style.display = "flex";
  }

  render();
}
