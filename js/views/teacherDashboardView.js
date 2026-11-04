import { state } from "../state.js";
import { getMasteryMetadata } from "../utils/masteryScoreEngine.js";

export function renderTeacherDashboard(container, onLogout) {
  if (!container) return;

  // Defensive data extraction
  const teacherData = state.teacherData || {};
  const students = teacherData.students || [];
  const classMastery = teacherData.classMastery || {};
  const classSkillTags = teacherData.classSkillTags || {};
  const curriculum = state.curriculum || [];
  const currentUser = state.currentUser || {};

  const teacherName = currentUser.displayName || currentUser.name || state.user?.name || "Teacher Account";

  // Active UI States
  let activeTab = "overview"; // 'overview' or 'tagging'
  let selectedClass = "All";
  let selectedLevel = "All";
  let selectedStream = "All";
  let selectedStrand = "All";
  let selectedTopic = "All";

  // Buffer for holding tag edits before saving to Google Sheets
  let currentClassTagsBuffer = {};
  let lastLoadedClassForBuffer = null;

  // State for Masked PINs
  const revealedPins = new Set();

  // Helper: Get fallback mastery metadata
  function safeGetMasteryMetadata(score) {
    try {
      const meta = getMasteryMetadata(score);
      if (meta && meta.badgeCss) return meta;
    } catch (e) {
      console.warn("Mastery score metadata fallback:", e);
    }
    return {
      score: score || 0,
      tierName: "Unrated",
      badgeCss: "background: #f1f5f9; color: #64748b;"
    };
  }

  function getStudentClass(st) {
    if (!st) return "Unassigned";
    const c = st.class || st.className || st.gradeClass;
    return (c && String(c).trim()) ? String(c).trim() : "Unassigned";
  }

  // Default Tag Rule: Earlier years = Past | Current year & future years = Future
  function getAutoDefaultTag(skill, className) {
    if (!className || className === "All") return "Future";
    
    const classNumMatch = String(className).match(/\d+/);
    const skillYearMatch = String(skill.year || skill.level || "").match(/\d+/);

    if (classNumMatch && skillYearMatch) {
      const classLevel = parseInt(classNumMatch[0], 10);
      const skillLevel = parseInt(skillYearMatch[0], 10);

      if (skillLevel < classLevel) {
        return "Past";
      } else {
        return "Future";
      }
    }

    return "Future";
  }

  // Filter options
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

  function analyzeAtRiskStudents(filteredStudents) {
    const alerts = [];

    filteredStudents.forEach(st => {
      if (!st) return;
      const emailKey = (st.email || st.id || "").toLowerCase();
      const stMastery = emailKey ? (classMastery[emailKey] || {}) : {};
      
      Object.values(stMastery).forEach(m => {
        if (!m) return;
        if (m.totalAttempted >= 8 && m.score < 40) {
          const skillObj = curriculum.find(c => c.generatorPath === m.generatorPath);
          alerts.push({
            student: st.displayName || st.name || "Student",
            class: getStudentClass(st),
            type: "struggling",
            icon: "⚠️",
            message: `Struggling on <strong>${skillObj?.title || 'a skill'}</strong> (${m.score}/100 score, ${m.accuracy || 0}% accuracy after ${m.totalAttempted} attempts).`
          });
        }

        if (m.rollingHistory && Array.isArray(m.rollingHistory) && m.rollingHistory.length >= 5) {
          const hintHeavyAttempts = m.rollingHistory.filter(h => h && h.hints >= 2).length;
          if (hintHeavyAttempts / m.rollingHistory.length >= 0.6) {
            const skillObj = curriculum.find(c => c.generatorPath === m.generatorPath);
            alerts.push({
              student: st.displayName || st.name || "Student",
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
            student: st.displayName || st.name || "Student",
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

  // Synchronize edit buffer only when selected class changes
  function syncClassTagsBufferIfNeeded() {
    if (selectedClass !== lastLoadedClassForBuffer) {
      if (selectedClass !== "All") {
        const savedTags = classSkillTags[selectedClass] || {};
        currentClassTagsBuffer = { ...savedTags };
        curriculum.forEach(sk => {
          if (!currentClassTagsBuffer[sk.generatorPath]) {
            currentClassTagsBuffer[sk.generatorPath] = getAutoDefaultTag(sk, selectedClass);
          }
        });
      } else {
        currentClassTagsBuffer = {};
      }
      lastLoadedClassForBuffer = selectedClass;
    }
  }

  // Multi-key generator function resolver for sample question modal
  function findGeneratorFunction(path) {
    if (!path) return null;

    const generators = state.skillGenerators || window.skillGenerators || {};
    const clean = path.trim().replace(/\\/g, '/');
    const filename = clean.split('/').pop().replace(/\.js$/, '');

    // 1. Direct match
    if (typeof generators[clean] === 'function') return generators[clean];

    // 2. Prepend 'js/questions/' if missing
    const withPrefix = clean.startsWith('js/questions/') ? clean : `js/questions/${clean}`;
    if (typeof generators[withPrefix] === 'function') return generators[withPrefix];

    // 3. Match with .js extension
    const withJs = clean.endsWith('.js') ? clean : `${clean}.js`;
    if (typeof generators[withJs] === 'function') return generators[withJs];

    const withPrefixAndJs = withPrefix.endsWith('.js') ? withPrefix : `${withPrefix}.js`;
    if (typeof generators[withPrefixAndJs] === 'function') return generators[withPrefixAndJs];

    // 4. Match by filename
    for (const key of Object.keys(generators)) {
      if (typeof generators[key] === 'function') {
        const keyFilename = key.split('/').pop().replace(/\.js$/, '');
        if (keyFilename === filename || key.endsWith(clean)) {
          return generators[key];
        }
      }
    }

    return null;
  }

  function render() {
    if (state.isLoadingTeacherData) {
      container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 60vh; flex-direction: column; gap: 12px; background: #f8fafc; padding: 24px;">
          <div style="width: 44px; height: 44px; border: 4px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <p style="color: #475569; font-weight: 700; font-size: 1rem;">Loading Teacher Dashboard & Student Data...</p>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
      `;
      return;
    }

    syncClassTagsBufferIfNeeded();

    const filteredStudents = getFilteredStudents();
    const filteredSkills = getFilteredSkills();
    const riskAlerts = analyzeAtRiskStudents(filteredStudents);

    let totalScoreSum = 0;
    let totalScoreCount = 0;
    let activeTodayCount = 0;

    const todayStr = new Date().toISOString().split("T")[0];

    filteredStudents.forEach(st => {
      if (!st) return;
      if (st.lastActive && String(st.lastActive).startsWith(todayStr)) activeTodayCount++;
      
      const emailKey = (st.email || st.id || "").toLowerCase();
      const stMastery = emailKey ? (classMastery[emailKey] || {}) : {};
      Object.values(stMastery).forEach(m => {
        if (m && typeof m.score === "number") {
          totalScoreSum += m.score;
          totalScoreCount++;
        }
      });
    });

    const classAvgScore = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : 0;
    const avgMeta = safeGetMasteryMetadata(classAvgScore);

    // Group skills by TOPIC for Tagging Tab view
    const skillsByTopic = {};
    filteredSkills.forEach(sk => {
      const topic = sk.topic || "General Mathematics";
      if (!skillsByTopic[topic]) skillsByTopic[topic] = [];
      skillsByTopic[topic].push(sk);
    });

    container.innerHTML = `
      <div class="teacher-dashboard-container" style="display: flex; flex-direction: column; gap: 16px; padding: 20px; height: 100%; box-sizing: border-box; background: #f8fafc; overflow-y: auto;">
        
        <!-- HEADER BAR -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: #ffffff; padding: 16px 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 style="font-size: 1.35rem; color: #0f172a; margin: 0; font-weight: 800;">🏫 ${teacherName}</h2>
              <span style="background: #2563eb; color: #ffffff; padding: 3px 10px; border-radius: 12px; font-weight: 800; font-size: 0.75rem;">TEACHER DASHBOARD</span>
            </div>
            <p style="color: #64748b; font-size: 0.88rem; margin: 2px 0 0 0;">Monitoring <strong>${filteredStudents.length}</strong> students across <strong>${filteredSkills.length}</strong> skills</p>
          </div>
          
          <div style="display: flex; gap: 14px; align-items: center;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <label style="font-weight: 700; font-size: 0.88rem; color: #334155;">Class Filter:</label>
              <select id="select-class-filter" style="padding: 8px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-weight: 700; cursor: pointer; background: #fff; color: #1e293b;">
                <option value="All">All Classes (${students.length} Students)</option>
                ${classes.map(c => `<option value="${c}" ${c === selectedClass ? 'selected' : ''}>Class ${c}</option>`).join('')}
              </select>
            </div>

            <button id="btn-dashboard-logout" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: background 0.15s;">
              🚪 Logout
            </button>
          </div>
        </div>

        <!-- DASHBOARD TABS -->
        <div style="display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 2px;">
          <button id="tab-btn-overview" style="padding: 10px 20px; border-radius: 12px 12px 0 0; border: none; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; ${activeTab === 'overview' ? 'background: #2563eb; color: #ffffff;' : 'background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-bottom: none;'}">
            📊 Student Class Overview
          </button>
          <button id="tab-btn-tagging" style="padding: 10px 20px; border-radius: 12px 12px 0 0; border: none; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; ${activeTab === 'tagging' ? 'background: #2563eb; color: #ffffff;' : 'background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-bottom: none;'}">
            📌 Class Skill Tagging ${selectedClass !== 'All' ? `(${selectedClass})` : ''}
          </button>
        </div>

        <!-- TAB 1: OVERVIEW CONTENT -->
        ${activeTab === 'overview' ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
            <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
              <div style="font-size: 0.82rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Total Students</div>
              <div style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-top: 4px;">${filteredStudents.length}</div>
            </div>

            <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
              <div style="font-size: 0.82rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Class Avg Mastery</div>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                <span style="font-size: 1.8rem; font-weight: 800; color: #0f172a;">${classAvgScore}</span>
                <span style="${avgMeta.badgeCss} padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">${avgMeta.tierName}</span>
              </div>
            </div>

            <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
              <div style="font-size: 0.82rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Active Today</div>
              <div style="font-size: 1.8rem; font-weight: 800; color: #10b981; margin-top: 4px;">
                ${activeTodayCount} <span style="font-size: 0.95rem; color: #64748b; font-weight: 600;">/ ${filteredStudents.length}</span>
              </div>
            </div>

            <div style="background: #fff; padding: 16px; border-radius: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
              <div style="font-size: 0.82rem; color: #64748b; font-weight: 700; text-transform: uppercase;">At-Risk Alerts</div>
              <div style="font-size: 1.8rem; font-weight: 800; color: ${riskAlerts.length > 0 ? '#dc2626' : '#10b981'}; margin-top: 4px;">
                ${riskAlerts.length} <span style="font-size: 0.82rem; font-weight: 600;">${riskAlerts.length > 0 ? 'Action Needed' : 'All Clear'}</span>
              </div>
            </div>
          </div>

          ${riskAlerts.length > 0 ? `
            <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; padding: 16px;">
              <h3 style="font-size: 1rem; color: #9f1239; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px; font-weight: 800;">
                🚨 Students Needing Attention (${riskAlerts.length})
              </h3>
              <div style="display: flex; flex-direction: column; gap: 8px; max-height: 150px; overflow-y: auto;">
                ${riskAlerts.map(a => `
                  <div style="background: #ffffff; padding: 8px 14px; border-radius: 8px; border-left: 4px solid #f43f5e; font-size: 0.86rem; display: flex; align-items: center; justify-content: space-between;">
                    <div><span style="font-weight: 700; color: #0f172a;">${a.student}</span> (${a.class}): ${a.message}</div>
                    <span style="font-size: 1.1rem;">${a.icon}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="background: #ffffff; border-radius: 16px; padding: 18px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; display: flex; flex-direction: column; min-height: 420px;">
            
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px;">
              <h3 style="font-size: 1.1rem; color: #0f172a; margin: 0; font-weight: 800;">🗺️ Class Skill Mastery Matrix</h3>
              
              <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                <select id="filter-level" style="padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 600; background: #fff;">
                  <option value="All">Level: All</option>
                  ${levels.map(l => `<option value="${l}" ${String(l) === String(selectedLevel) ? 'selected' : ''}>${l}</option>`).join('')}
                </select>

                <select id="filter-stream" style="padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 600; background: #fff;">
                  <option value="All">Stream: All</option>
                  ${streams.map(s => `<option value="${s}" ${s === selectedStream ? 'selected' : ''}>${s}</option>`).join('')}
                </select>

                <select id="filter-strand" style="padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 600; background: #fff;">
                  <option value="All">Strand: All</option>
                  ${strands.map(s => `<option value="${s}" ${s === selectedStrand ? 'selected' : ''}>${s}</option>`).join('')}
                </select>

                <select id="filter-topic" style="padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 600; background: #fff;">
                  <option value="All">Topic: All</option>
                  ${topics.map(t => `<option value="${t}" ${t === selectedTopic ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="overflow-x: auto; overflow-y: auto; flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; min-height: 320px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; text-align: left;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <th style="padding: 12px 16px; position: sticky; left: 0; background: #f8fafc; z-index: 3; min-width: 220px; border-right: 1px solid #e2e8f0;">
                      Student Profile
                    </th>
                    <th style="padding: 12px 10px; text-align: center; background: #f8fafc;">Class</th>
                    ${filteredSkills.map(sk => {
                      const tagVal = selectedClass !== "All" ? (currentClassTagsBuffer[sk.generatorPath] || "Future") : "";
                      const tagBadge = tagVal === "Current" ? "🟢" : (tagVal === "Past" ? "🔵" : (tagVal === "Future" ? "⚪" : ""));

                      return `
                        <th class="skill-header-cell" data-path="${sk.generatorPath}" data-title="${sk.title}" style="padding: 12px; text-align: center; min-width: 140px; cursor: pointer; user-select: none; background: #f8fafc;" title="Click to preview sample questions">
                          <div style="display: flex; flex-direction: column; gap: 2px; align-items: center;">
                            <span style="font-weight: 700; color: #2563eb; text-decoration: underline;">${tagBadge} ${sk.title} 🔍</span>
                            <span style="font-size: 0.72rem; color: #64748b; font-weight: 500;">${sk.strand || ''}</span>
                          </div>
                        </th>
                      `;
                    }).join('')}
                    <th style="padding: 12px 14px; text-align: center; min-width: 110px; background: #f8fafc;">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredStudents.length === 0 ? `
                    <tr>
                      <td colspan="${filteredSkills.length + 3}" style="text-align: center; padding: 40px; color: #64748b;">
                        No students found for the selected class/filters.
                      </td>
                    </tr>
                  ` : filteredStudents.map(st => {
                    const emailKey = (st.email || st.id || "").toLowerCase();
                    const stMastery = emailKey ? (classMastery[emailKey] || {}) : {};
                    let sumScore = 0;
                    let countSkills = 0;
                    const isPinRevealed = revealedPins.has(emailKey);
                    const pinDisplay = isPinRevealed ? (st.pinCode || st.pin || 'N/A') : '••••';

                    return `
                      <tr class="student-matrix-row" data-email="${emailKey}" style="border-bottom: 1px solid #e2e8f0; transition: background 0.15s;">
                        <td style="padding: 10px 14px; position: sticky; left: 0; background: #ffffff; z-index: 2; border-right: 1px solid #e2e8f0;">
                          <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-weight: 700; color: #0f172a; font-size: 0.9rem;">${st.displayName || st.name || 'Student'}</span>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.76rem; color: #64748b;">
                              <span>⭐ ${st.xp || 0} XP</span>
                              <span>🔥 ${st.streakCount || 0}d</span>
                              <span class="btn-toggle-pin" data-email="${emailKey}" style="cursor: pointer; background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; user-select: none; border: 1px solid #cbd5e1;" title="Click to reveal/hide PIN">
                                🔑 ${pinDisplay}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td style="padding: 12px 10px; text-align: center; color: #475569; font-weight: 600;">${getStudentClass(st)}</td>

                        ${filteredSkills.map(sk => {
                          const m = stMastery[sk.generatorPath];
                          if (m && m.totalAttempted > 0) {
                            sumScore += m.score;
                            countSkills++;
                            const meta = safeGetMasteryMetadata(m.score);
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
                          const avgMeta = safeGetMasteryMetadata(studentAvg);
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
        ` : `
          <!-- TAB 2: CLASS SKILL TAGGING CONTENT (ARRANGED BY TOPIC) -->
          <div style="background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 16px;">
            
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px;">
              <div>
                <h3 style="margin: 0; font-size: 1.2rem; color: #0f172a; font-weight: 800;">
                  📌 Class Skill Tagging for ${selectedClass === 'All' ? 'All Classes' : `Class ${selectedClass}`}
                </h3>
                <p style="margin: 4px 0 0 0; font-size: 0.86rem; color: #64748b;">
                  Tag skills as <strong>Current</strong> (Daily quest priority), <strong>Past</strong> (Spaced review), or <strong>Future</strong> (Excluded from Daily Quest & greyed out in Skill Tree).
                </p>
              </div>

              ${selectedClass !== "All" ? `
                <button id="btn-save-class-tags" style="background: #2563eb; color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); transition: background 0.15s;">
                  💾 Save Skill Tags to Google Sheet
                </button>
              ` : ''}
            </div>

            ${selectedClass === "All" ? `
              <div style="background: #fffbebf5; border: 1px solid #fde047; padding: 16px 20px; border-radius: 12px; font-size: 0.9rem; color: #854d0e; font-weight: 600;">
                ⚠️ Please select a specific class from the top <strong>Class Filter</strong> dropdown above to configure skill tags for that class.
              </div>
            ` : `
              <!-- GROUPED SKILLS BY TOPIC -->
              <div style="display: flex; flex-direction: column; gap: 20px;">
                ${Object.entries(skillsByTopic).map(([topicName, skills]) => `
                  <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #fafafa;">
                    <h4 style="margin: 0 0 12px 0; font-size: 1.05rem; color: #0f172a; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                      📂 ${topicName} (${skills.length} Skills)
                    </h4>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                      ${skills.map(sk => {
                        const currentTag = currentClassTagsBuffer[sk.generatorPath] || getAutoDefaultTag(sk, selectedClass);

                        return `
                          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; padding: 12px 16px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; gap: 12px;">
                            
                            <div style="flex: 1; min-width: 240px;">
                              <div style="font-size: 0.95rem; font-weight: 700; color: #0f172a; line-height: 1.4; word-break: break-word;">
                                ${sk.title}
                              </div>
                              <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">
                                Strand: <strong>${sk.strand || 'General'}</strong> | Level: <strong>${sk.year || sk.level || 'All'}</strong> (${sk.stream || 'Express'})
                              </div>
                            </div>

                            <!-- IN-PLACE TAG BUTTON GROUP -->
                            <div style="display: flex; gap: 6px; flex-shrink: 0;" class="tag-toggle-group" data-path="${sk.generatorPath}">
                              <button type="button" class="btn-tag-toggle ${currentTag === 'Past' ? 'active' : ''}" data-tag="Past" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; ${currentTag === 'Past' ? 'background:#0284c7; color:#fff; border-color:#0284c7;' : 'background:#fff; color:#475569;'}">
                                🔵 Past Topic
                              </button>
                              <button type="button" class="btn-tag-toggle ${currentTag === 'Current' ? 'active' : ''}" data-tag="Current" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; ${currentTag === 'Current' ? 'background:#16a34a; color:#fff; border-color:#16a34a;' : 'background:#fff; color:#475569;'}">
                                🟢 Current Unit
                              </button>
                              <button type="button" class="btn-tag-toggle ${currentTag === 'Future' ? 'active' : ''}" data-tag="Future" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; ${currentTag === 'Future' ? 'background:#64748b; color:#fff; border-color:#64748b;' : 'background:#fff; color:#475569;'}">
                                ⚪ Future Unit
                              </button>
                            </div>

                          </div>
                        `;
                      }).join('')}
                    </div>

                  </div>
                `).join('')}
              </div>
            `}

          </div>
        `}

      </div>

      <!-- STUDENT DETAIL DRAWER -->
      <div id="student-detail-drawer" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 100; justify-content: flex-end;">
        <div style="background: #ffffff; width: 420px; max-width: 100%; height: 100%; padding: 24px; box-shadow: -4px 0 24px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
            <h3 id="drawer-student-name" style="margin: 0; font-size: 1.2rem; color: #0f172a;">Student Details</h3>
            <button id="btn-close-drawer" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">✕</button>
          </div>
          <div id="drawer-content" style="display: flex; flex-direction: column; gap: 14px;"></div>
        </div>
      </div>

      <!-- SKILL QUESTION PREVIEW MODAL -->
      <div id="skill-preview-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); z-index: 110; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: #ffffff; width: 680px; max-width: 100%; max-height: 90vh; border-radius: 16px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 12px;">
            <div>
              <h3 id="modal-skill-title" style="margin: 0; font-size: 1.25rem; color: #0f172a;">Skill Preview</h3>
              <span id="modal-skill-strand" style="font-size: 0.82rem; color: #64748b;">Curriculum Skill</span>
            </div>
            <button id="btn-close-skill-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">✕</button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 8px 12px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <span style="font-weight: 700; font-size: 0.88rem; color: #334155;">Select Difficulty Tier:</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn-tier-select" data-tier="1" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 1 (Basic)</button>
              <button class="btn-tier-select" data-tier="2" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 2 (Int.)</button>
              <button class="btn-tier-select" data-tier="3" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 3 (Adv.)</button>
            </div>
          </div>

          <div id="modal-question-container" style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #fafafa; min-height: 200px; display: flex; flex-direction: column; gap: 12px;"></div>

          <button id="btn-regen-question" style="align-self: flex-end; padding: 8px 16px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
            🔄 Generate Another Sample
          </button>

        </div>
      </div>
    `;

    // --- EVENT LISTENERS ---

    container.querySelector("#tab-btn-overview")?.addEventListener("click", () => {
      activeTab = "overview";
      render();
    });

    container.querySelector("#tab-btn-tagging")?.addEventListener("click", () => {
      activeTab = "tagging";
      render();
    });

    container.querySelector("#btn-dashboard-logout")?.addEventListener("click", () => {
      if (typeof onLogout === "function") onLogout();
      else if (typeof state.logout === "function") state.logout();
      else window.location.reload();
    });

    container.querySelector("#select-class-filter")?.addEventListener("change", (e) => {
      selectedClass = e.target.value;
      render();
    });

    // IN-PLACE TAG BUTTON TOGGLE HANDLER (PREVENTS SCROLL JUMP)
    container.querySelectorAll(".tag-toggle-group").forEach(group => {
      const path = group.getAttribute("data-path");
      const buttons = group.querySelectorAll(".btn-tag-toggle");

      buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const selectedTag = btn.getAttribute("data-tag");

          if (path && selectedTag) {
            currentClassTagsBuffer[path] = selectedTag;

            // Mutate DOM styles directly without re-rendering the whole page
            buttons.forEach(b => {
              const t = b.getAttribute("data-tag");
              if (t === selectedTag) {
                b.classList.add("active");
                if (t === "Past") {
                  b.style.background = "#0284c7";
                  b.style.color = "#ffffff";
                  b.style.borderColor = "#0284c7";
                } else if (t === "Current") {
                  b.style.background = "#16a34a";
                  b.style.color = "#ffffff";
                  b.style.borderColor = "#16a34a";
                } else if (t === "Future") {
                  b.style.background = "#64748b";
                  b.style.color = "#ffffff";
                  b.style.borderColor = "#64748b";
                }
              } else {
                b.classList.remove("active");
                b.style.background = "#ffffff";
                b.style.color = "#475569";
                b.style.borderColor = "#cbd5e1";
              }
            });
          }
        });
      });
    });

    // SAVE CLASS TAGS HANDLER WITH FALLBACK URL & PERSISTENCE
    container.querySelector("#btn-save-class-tags")?.addEventListener("click", async (e) => {
      const saveBtn = e.target;

      // Robust URL Resolution
      let apiUrl = state.apiUrl || 
                     state.config?.apiUrl || 
                     state.backendUrl || 
                     state.scriptUrl || 
                     window.APP_CONFIG?.apiUrl || 
                     window.API_URL || 
                     localStorage.getItem("math_app_api_url") || "";

      // Fallback Prompt if API URL is not set in app state
      if (!apiUrl) {
        const inputUrl = prompt("Please enter your Google Apps Script Web App URL:");
        if (inputUrl && inputUrl.trim()) {
          apiUrl = inputUrl.trim();
          state.apiUrl = apiUrl;
          localStorage.setItem("math_app_api_url", apiUrl);
        } else {
          alert("Save cancelled: Web App API URL is required.");
          return;
        }
      }

      if (apiUrl && !apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
        apiUrl = "https://" + apiUrl;
      }

      saveBtn.disabled = true;
      saveBtn.innerText = "⏳ Saving...";

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "saveClassSkillTags",
            token: state.userToken || state.token || (state.profile?.email ? ("PIN_AUTH_" + state.profile.email) : "TEACHER_SESSION"),
            className: selectedClass,
            tags: currentClassTagsBuffer
          })
        });

        const resData = await response.json();

        if (resData.status === "success") {
          if (!state.teacherData.classSkillTags) state.teacherData.classSkillTags = {};
          state.teacherData.classSkillTags[selectedClass] = { ...currentClassTagsBuffer };
          saveBtn.innerText = "✅ Saved Successfully!";
          setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.innerText = "💾 Save Skill Tags to Google Sheet";
          }, 2000);
        } else {
          alert("Failed to save tags: " + (resData.message || "Unknown error"));
          saveBtn.disabled = false;
          saveBtn.innerText = "💾 Save Skill Tags to Google Sheet";
        }
      } catch (err) {
        console.error("Save class tags error:", err);
        alert("Network error while saving skill tags: " + err.message + "\n\nPlease ensure Google Apps Script is deployed with 'Who has access: Anyone'.");
        saveBtn.disabled = false;
        saveBtn.innerText = "💾 Save Skill Tags to Google Sheet";
      }
    });

    // Matrix Filters
    container.querySelector("#filter-level")?.addEventListener("change", (e) => { selectedLevel = e.target.value; render(); });
    container.querySelector("#filter-stream")?.addEventListener("change", (e) => { selectedStream = e.target.value; render(); });
    container.querySelector("#filter-strand")?.addEventListener("change", (e) => { selectedStrand = e.target.value; render(); });
    container.querySelector("#filter-topic")?.addEventListener("change", (e) => { selectedTopic = e.target.value; render(); });

    container.querySelectorAll(".btn-toggle-pin").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const email = btn.getAttribute("data-email");
        if (revealedPins.has(email)) {
          revealedPins.delete(email);
        } else {
          revealedPins.add(email);
        }
        render();
      });
    });

    container.querySelectorAll(".student-matrix-row").forEach(row => {
      row.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-toggle-pin")) return;
        const email = row.getAttribute("data-email");
        openStudentDrawer(email);
      });
    });

    const drawerEl = container.querySelector("#student-detail-drawer");
    container.querySelector("#btn-close-drawer")?.addEventListener("click", () => {
      if (drawerEl) drawerEl.style.display = "none";
    });

    // Skill Sample Preview Modal Trigger
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

    const skillModalEl = container.querySelector("#skill-preview-modal");
    container.querySelector("#btn-close-skill-modal")?.addEventListener("click", () => {
      if (skillModalEl) skillModalEl.style.display = "none";
    });

    container.querySelectorAll(".btn-tier-select").forEach(btn => {
      btn.addEventListener("click", () => {
        activeTierForModal = parseInt(btn.getAttribute("data-tier"), 10);
        updateTierButtons();
        renderSampleQuestion();
      });
    });

    container.querySelector("#btn-regen-question")?.addEventListener("click", () => {
      renderSampleQuestion();
    });

    function updateTierButtons() {
      container.querySelectorAll(".btn-tier-select").forEach(btn => {
        const tier = parseInt(btn.getAttribute("data-tier"), 10);
        if (tier === activeTierForModal) {
          btn.style.background = "#2563eb";
          btn.style.color = "#ffffff";
        } else {
          btn.style.background = "#ffffff";
          btn.style.color = "#1e293b";
        }
      });
    }

    function openSkillPreviewModal() {
      if (!activeSkillForModal) return;
      container.querySelector("#modal-skill-title").innerText = activeSkillForModal.title;
      container.querySelector("#modal-skill-strand").innerText = `${activeSkillForModal.strand || 'General'} | Level ${activeSkillForModal.level || 'All'} (${activeSkillForModal.stream || 'Express'})`;
      updateTierButtons();
      renderSampleQuestion();
      if (skillModalEl) skillModalEl.style.display = "flex";
    }

    function renderSampleQuestion() {
      const qContainer = container.querySelector("#modal-question-container");
      if (!qContainer) return;

      qContainer.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">Generating sample question...</div>`;

      try {
        const rawPath = activeSkillForModal.generatorPath || "";
        const generatorFn = findGeneratorFunction(rawPath);
        
        if (typeof generatorFn === "function") {
          const qData = generatorFn(activeTierForModal);

          qContainer.innerHTML = `
            <div style="font-weight: 700; font-size: 0.95rem; line-height: 1.5; color: #0f172a;">${qData.prompt || qData.questionTemplate || ''}</div>
            ${qData.diagramSvg ? `<div style="text-align: center; margin: 10px 0;">${qData.diagramSvg}</div>` : ''}
            
            <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 10px 14px; border-radius: 6px; font-size: 0.88rem; color: #0369a1;">
              <strong>Expected Answer:</strong> <code>${qData.expectedAnswer || 'N/A'}</code>
            </div>

            ${qData.steps && qData.steps.length > 0 ? `
              <div style="margin-top: 8px;">
                <strong style="font-size: 0.88rem; color: #1e293b;">Step-by-step Solution:</strong>
                <ol style="margin: 6px 0 0 18px; padding: 0; font-size: 0.85rem; color: #475569;">
                  ${qData.steps.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
                </ol>
              </div>
            ` : ''}
          `;
        } else {
          const availableKeys = Object.keys(state.skillGenerators || window.skillGenerators || {});
          qContainer.innerHTML = `
            <div style="color: #dc2626; padding: 14px; text-align: left; background: #fef2f2; border-radius: 8px; border: 1px solid #fca5a5;">
              <strong>⚠️ Question Generator Module Not Found</strong>
              <p style="margin: 6px 0; font-size: 0.85rem;">Target Path: <code>${rawPath}</code></p>
              <details style="margin-top: 8px; font-size: 0.8rem; color: #7f1d1d;">
                <summary style="cursor: pointer; font-weight: 700;">View ${availableKeys.length} Loaded Generator Keys</summary>
                <div style="max-height: 120px; overflow-y: auto; margin-top: 6px; background: #fff; padding: 6px; border-radius: 4px; font-family: monospace;">
                  ${availableKeys.length > 0 ? availableKeys.map(k => `<div>• ${k}</div>`).join('') : 'No generator functions currently registered in state.skillGenerators.'}
                </div>
              </details>
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

  function openStudentDrawer(emailKey) {
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

  render();
}
