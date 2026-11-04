import { safeGetMasteryMetadata, getStudentClass, analyzeAtRiskStudents } from "./helperUtils.js";

export function renderOverviewTabHTML(props) {
  const {
    filteredStudents,
    filteredSkills,
    classMastery,
    curriculum,
    levels,
    streams,
    strands,
    topics,
    selectedClass,
    selectedLevel,
    selectedStream,
    selectedStrand,
    selectedTopic,
    selectedMatrixTag,
    currentClassTagsBuffer,
    revealedPins
  } = props;

  const riskAlerts = analyzeAtRiskStudents(filteredStudents, classMastery, curriculum);

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

  return `
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
          <select id="filter-matrix-tag" style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid #2563eb; font-size: 0.82rem; font-weight: 700; background: #eff6ff; color: #1e40af;">
            <option value="All">Tag: All</option>
            <option value="Current" ${selectedMatrixTag === 'Current' ? 'selected' : ''}>🟢 Current Unit</option>
            <option value="Past" ${selectedMatrixTag === 'Past' ? 'selected' : ''}>🔵 Past Topic</option>
            <option value="Future" ${selectedMatrixTag === 'Future' ? 'selected' : ''}>⚪ Future Unit</option>
          </select>

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
  `;
}
