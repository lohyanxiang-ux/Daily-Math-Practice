import { state } from "../state.js";
import { getMasteryMetadata } from "../utils/masteryScoreEngine.js";

export function renderTeacherDashboard(container) {
  const students = state.teacherData?.students || [];
  const classMastery = state.teacherData?.classMastery || {};
  const curriculum = state.curriculum || [];

  // Filter States
  let selectedClass = "All";
  let selectedLevel = "All";
  let selectedStream = "All";
  let selectedStrand = "All";
  let selectedTopic = "All";

  // State for Masked PINs
  const revealedPins = new Set();

  // Helper: Normalize Class Name
  function getStudentClass(st) {
    return (st.class && st.class.trim()) ? st.class.trim() : "Unassigned";
  }

  // Filter Dropdown Options Extraction
  const classes = Array.from(new Set(students.map(getStudentClass))).sort();
  const levels = Array.from(new Set(curriculum.map(c => c.level).filter(Boolean))).sort();
  const streams = Array.from(new Set(curriculum.map(c => c.stream).filter(Boolean))).sort();
  const strands = Array.from(new Set(curriculum.map(c => c.strand).filter(Boolean))).sort();
  const topics = Array.from(new Set(curriculum.map(c => c.topic).filter(Boolean))).sort();

  function getFilteredStudents() {
    return students.filter(s => selectedClass === "All" || getStudentClass(s) === selectedClass);
  }

  function getFilteredSkills() {
    return curriculum.filter(c => {
      const matchLevel = selectedLevel === "All" || String(c.level) === String(selectedLevel);
      const matchStream = selectedStream === "All" || String(c.stream) === String(selectedStream);
      const matchStrand = selectedStrand === "All" || String(c.strand) === String(selectedStrand);
      const matchTopic = selectedTopic === "All" || String(c.topic) === String(selectedTopic);
      return matchLevel && matchStream && matchStrand && matchTopic;
    });
  }

  // Diagnostic Risk Calculation Engine
  function analyzeAtRiskStudents(filteredStudents) {
    const alerts = [];

    filteredStudents.forEach(st => {
      const stMastery = classMastery[st.email.toLowerCase()] || {};
      
      Object.values(stMastery).forEach(m => {
        if (m.totalAttempted >= 8 && m.score < 40) {
          const skillObj = curriculum.find(c => c.generatorPath === m.generatorPath);
          alerts.push({
            student: st.displayName,
            class: getStudentClass(st),
            type: "struggling",
            icon: "⚠️",
            message: `Struggling on <strong>${skillObj?.title || 'a skill'}</strong> (${m.score}/100 score, ${m.accuracy}% accuracy after ${m.totalAttempted} attempts).`
          });
        }

        if (m.rollingHistory && m.rollingHistory.length >= 5) {
          const hintHeavyAttempts = m.rollingHistory.filter(h => h.hints >= 2).length;
          if (hintHeavyAttempts / m.rollingHistory.length >= 0.6) {
            const skillObj = curriculum.find(c => c.generatorPath === m.generatorPath);
            alerts.push({
              student: st.displayName,
              class: getStudentClass(st),
              type: "hints",
              icon: "💡",
              message: `Relying heavily on step hints for <strong>${skillObj?.title || 'skills'}</strong>.`
            });
          }
        }
      });

      if (st.lastActive) {
        const daysInactive = Math.floor((new Date() - new Date(st.lastActive)) / (1000 * 60 * 60 * 24));
        if (daysInactive >= 5) {
          alerts.push({
            student: st.displayName,
            class: getStudentClass(st),
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
            <label style="font-weight: 700; font-size: 0.9rem;">Class Filter:</label>
            <select id="select-class-filter" style="padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--border); font-weight: 600; cursor: pointer;">
              <option value="All">All Classes (${students.length})</option>
              ${classes.map(c => `<option value="${c}" ${c === selectedClass ? 'selected' : ''}>Class ${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- SUMMARY CARDS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: var(--shadow);">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Total Students</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">${filteredStudents.length}</div>
          </div>

          <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: var(--shadow);">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Class Avg Mastery</div>
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

        <!-- RISK ALERTS PANEL -->
        ${riskAlerts.length > 0 ? `
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; padding: 16px;">
            <h3 style="font-size: 1.05rem; color: #9f1239; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
              🚨 Students Needing Attention (${riskAlerts.length})
            </h3>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto;">
              ${riskAlerts.map(a => `
                <div style="background: #ffffff; padding: 8px 14px; border-radius: 8px; border-left: 4px solid #f43f5e; font-size: 0.88rem; display: flex; align-items: center; justify-content: space-between;">
                  <div><span style="font-weight: 700;">${a.student}</span> (${a.class}): ${a.message}</div>
                  <span style="font-size: 1.1rem;">${a.icon}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- SKILL HEATMAP & MATRIX TABLE -->
        <div style="background: #ffffff; border-radius: 16px; padding: 18px; box-shadow: var(--shadow); flex: 1; display: flex; flex-direction: column; min-height: 420px;">
          
          <!-- MULTI-FILTER BAR FOR MATRIX SKILLS -->
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px;">
            <h3 style="font-size: 1.15rem; color: var(--text-main); margin: 0;">🗺️ Class Skill Mastery Matrix</h3>
            
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
              <!-- Level Filter -->
              <select id="filter-level" style="padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.82rem; font-weight: 600;">
                <option value="All">Level: All</option>
                ${levels.map(l => `<option value="${l}" ${String(l) === String(selectedLevel) ? 'selected' : ''}>${l}</option>`).join('')}
              </select>

              <!-- Stream Filter -->
              <select id="filter-stream" style="padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.82rem; font-weight: 600;">
                <option value="All">Stream: All</option>
                ${streams.map(s => `<option value="${s}" ${s === selectedStream ? 'selected' : ''}>${s}</option>`).join('')}
              </select>

              <!-- Strand Filter -->
              <select id="filter-strand" style="padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.82rem; font-weight: 600;">
                <option value="All">Strand: All</option>
                ${strands.map(s => `<option value="${s}" ${s === selectedStrand ? 'selected' : ''}>${s}</option>`).join('')}
              </select>

              <!-- Topic Filter -->
              <select id="filter-topic" style="padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.82rem; font-weight: 600;">
                <option value="All">Topic: All</option>
                ${topics.map(t => `<option value="${t}" ${t === selectedTopic ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- HEATMAP TABLE CONTAINER -->
          <div style="overflow-x: auto; overflow-y: auto; flex: 1; border: 1px solid var(--border); border-radius: 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid var(--border);">
                  <th style="padding: 12px 16px; position: sticky; left: 0; background: #f8fafc; z-index: 3; min-width: 220px;">
                    Student Profile
                  </th>
                  <th style="padding: 12px 10px; text-align: center;">Class</th>
                  ${filteredSkills.map(sk => `
                    <th class="skill-header-cell" data-path="${sk.generatorPath}" data-title="${sk.title}" style="padding: 12px; text-align: center; min-width: 140px; cursor: pointer; user-select: none;" title="Click to preview sample questions">
                      <div style="display: flex; flex-direction: column; gap: 2px; align-items: center;">
                        <span style="font-weight: 700; color: var(--primary); hover: underline;">${sk.title} 🔍</span>
                        <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">${sk.strand || ''}</span>
                      </div>
                    </th>
                  `).join('')}
                  <th style="padding: 12px 14px; text-align: center; min-width: 110px;">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStudents.length === 0 ? `
                  <tr>
                    <td colspan="${filteredSkills.length + 3}" style="text-align: center; padding: 30px; color: var(--text-muted);">
                      No students found for the selected filter.
                    </td>
                  </tr>
                ` : filteredStudents.map(st => {
                  const stMastery = classMastery[st.email.toLowerCase()] || {};
                  let sumScore = 0;
                  let countSkills = 0;
                  const isPinRevealed = revealedPins.has(st.email);
                  const pinDisplay = isPinRevealed ? (st.pinCode || st.pin || 'N/A') : '••••';

                  return `
                    <tr class="student-matrix-row" data-email="${st.email}" style="border-bottom: 1px solid var(--border); transition: background 0.15s;">
                      <!-- Sticky Student Info Column -->
                      <td style="padding: 10px 14px; position: sticky; left: 0; background: #ffffff; z-index: 2; border-right: 1px solid var(--border);">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                          <span style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">${st.displayName}</span>
                          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.76rem; color: var(--text-muted);">
                            <span>⭐ ${st.xp || 0} XP</span>
                            <span>🔥 ${st.streakCount || 0}d</span>
                            <span class="btn-toggle-pin" data-email="${st.email}" style="cursor: pointer; background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; user-select: none;" title="Click to reveal/hide PIN">
                              🔑 ${pinDisplay}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style="padding: 12px 10px; text-align: center; color: var(--text-muted); font-weight: 600;">${getStudentClass(st)}</td>

                      <!-- Skill Scores -->
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

                      <!-- Average Column -->
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

      <!-- STUDENT DETAIL DRAWER -->
      <div id="student-detail-drawer" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 100; justify-content: flex-end;">
        <div style="background: #ffffff; width: 420px; max-width: 100%; height: 100%; padding: 24px; box-shadow: -4px 0 24px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--bg-main); padding-bottom: 12px;">
            <h3 id="drawer-student-name" style="margin: 0; font-size: 1.3rem;">Student Details</h3>
            <button id="btn-close-drawer" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
          </div>
          <div id="drawer-content" style="display: flex; flex-direction: column; gap: 14px;"></div>
        </div>
      </div>

      <!-- SKILL QUESTION PREVIEW MODAL -->
      <div id="skill-preview-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); z-index: 110; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: #ffffff; width: 680px; max-width: 100%; max-height: 90vh; border-radius: 16px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--border); padding-bottom: 12px;">
            <div>
              <h3 id="modal-skill-title" style="margin: 0; font-size: 1.25rem; color: var(--text-main);">Skill Preview</h3>
              <span id="modal-skill-strand" style="font-size: 0.82rem; color: var(--text-muted);">Curriculum Skill</span>
            </div>
            <button id="btn-close-skill-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
          </div>

          <!-- TIER SELECTION TABS -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 8px 12px; border-radius: 10px;">
            <span style="font-weight: 700; font-size: 0.88rem;">Select Difficulty Tier:</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn-tier-select" data-tier="1" style="padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.82rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 1 (Basic)</button>
              <button class="btn-tier-select" data-tier="2" style="padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.82rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 2 (Int.)</button>
              <button class="btn-tier-select" data-tier="3" style="padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.82rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 3 (Adv.)</button>
            </div>
          </div>

          <!-- GENERATED QUESTION DISPLAY -->
          <div id="modal-question-container" style="border: 1px solid var(--border); border-radius: 12px; padding: 16px; background: #fafafa; min-height: 200px; display: flex; flex-direction: column; gap: 12px;">
            <!-- Question prompt & SVG will render here -->
          </div>

          <button id="btn-regen-question" style="align-self: flex-end; padding: 8px 16px; background: var(--primary); color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
            🔄 Generate Another Sample
          </button>

        </div>
      </div>
    `;

    // --- EVENT LISTENERS ---

    // Class Filter Listener
    container.querySelector("#select-class-filter").addEventListener("change", (e) => {
      selectedClass = e.target.value;
      render();
    });

    // Multi-Filter Skill Listeners
    container.querySelector("#filter-level").addEventListener("change", (e) => { selectedLevel = e.target.value; render(); });
    container.querySelector("#filter-stream").addEventListener("change", (e) => { selectedStream = e.target.value; render(); });
    container.querySelector("#filter-strand").addEventListener("change", (e) => { selectedStrand = e.target.value; render(); });
    container.querySelector("#filter-topic").addEventListener("change", (e) => { selectedTopic = e.target.value; render(); });

    // PIN Mask Toggle Listener
    container.querySelectorAll(".btn-toggle-pin").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevents row click drawer trigger
        const email = btn.getAttribute("data-email");
        if (revealedPins.has(email)) {
          revealedPins.delete(email);
        } else {
          revealedPins.add(email);
        }
        render();
      });
    });

    // Student Detail Drawer Trigger (Row click)
    container.querySelectorAll(".student-matrix-row").forEach(row => {
      row.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-toggle-pin")) return;
        const email = row.getAttribute("data-email");
        openStudentDrawer(email);
      });
    });

    // Drawer Close
    const drawerEl = container.querySelector("#student-detail-drawer");
    container.querySelector("#btn-close-drawer").addEventListener("click", () => {
      drawerEl.style.display = "none";
    });

    // Skill Header Preview Modal Trigger
    let activeSkillForModal = null;
    let activeTierForModal = 1;

    container.querySelectorAll(".skill-header-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const generatorPath = cell.getAttribute("data-path");
        const skillObj = curriculum.find(c => c.generatorPath === generatorPath);
        if (skillObj) {
          activeSkillForModal = skillObj;
          activeTierForModal = 1;
          openSkillPreviewModal();
        }
      });
    });

    // Skill Modal Element Handlers
    const skillModalEl = container.querySelector("#skill-preview-modal");
    container.querySelector("#btn-close-skill-modal").addEventListener("click", () => {
      skillModalEl.style.display = "none";
    });

    container.querySelectorAll(".btn-tier-select").forEach(btn => {
      btn.addEventListener("click", () => {
        activeTierForModal = parseInt(btn.getAttribute("data-tier"), 10);
        updateTierButtons();
        renderSampleQuestion();
      });
    });

    container.querySelector("#btn-regen-question").addEventListener("click", () => {
      renderSampleQuestion();
    });

    function updateTierButtons() {
      container.querySelectorAll(".btn-tier-select").forEach(btn => {
        const tier = parseInt(btn.getAttribute("data-tier"), 10);
        if (tier === activeTierForModal) {
          btn.style.background = "var(--primary)";
          btn.style.color = "#ffffff";
        } else {
          btn.style.background = "#ffffff";
          btn.style.color = "var(--text-main)";
        }
      });
    }

    function openSkillPreviewModal() {
      if (!activeSkillForModal) return;
      container.querySelector("#modal-skill-title").innerText = activeSkillForModal.title;
      container.querySelector("#modal-skill-strand").innerText = `${activeSkillForModal.strand || 'General'} | Level ${activeSkillForModal.level || 'All'} (${activeSkillForModal.stream || 'Express'})`;
      updateTierButtons();
      renderSampleQuestion();
      skillModalEl.style.display = "flex";
    }

    function renderSampleQuestion() {
      const qContainer = container.querySelector("#modal-question-container");
      qContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">Generating sample question...</div>`;

      try {
        // Attempt to generate from global generator registry or module generator
        const generatorFn = state.skillGenerators?.[activeSkillForModal.generatorPath] || activeSkillForModal.generate;
        
        if (typeof generatorFn === "function") {
          const qData = generatorFn(activeTierForModal);

          qContainer.innerHTML = `
            <div style="font-weight: 700; font-size: 0.95rem; line-height: 1.5;">${qData.prompt || qData.questionTemplate || ''}</div>
            ${qData.diagramSvg ? `<div style="text-align: center; margin: 10px 0;">${qData.diagramSvg}</div>` : ''}
            
            <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 10px 14px; border-radius: 6px; font-size: 0.88rem;">
              <strong>Expected Answer:</strong> <code>${qData.expectedAnswer || 'N/A'}</code>
            </div>

            ${qData.steps && qData.steps.length > 0 ? `
              <div style="margin-top: 8px;">
                <strong style="font-size: 0.88rem;">Step-by-step Solution:</strong>
                <ol style="margin: 6px 0 0 18px; padding: 0; font-size: 0.85rem; color: var(--text-muted);">
                  ${qData.steps.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
                </ol>
              </div>
            ` : ''}
          `;
        } else {
          qContainer.innerHTML = `
            <div style="color: #dc2626; padding: 14px; text-align: center;">
              Question generator module not found for path: <code>${activeSkillForModal.generatorPath}</code>
            </div>
          `;
        }
      } catch (err) {
        console.error("Error generating sample question:", err);
        qContainer.innerHTML = `
          <div style="color: #dc2626; padding: 14px; text-align: center;">
            Failed to generate sample question: ${err.message}
          </div>
        `;
      }
    }
  }

  render();
}
