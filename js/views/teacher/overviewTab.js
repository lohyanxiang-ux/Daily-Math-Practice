import { safeGetMasteryMetadata, getStudentClass, analyzeAtRiskStudents } from "./helperUtils.js";
import { openStudentDrawer } from "./studentDrawer.js";
import { processRedemptionClaim } from "../../services/backend.js";
import { state } from "../../state.js";

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
  const pendingRedemptions = state.teacherData?.pendingRedemptions || [];

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

  const skillsByTopic = {};
  filteredSkills.forEach(sk => {
    const topic = sk.topic || "General Topics";
    if (!skillsByTopic[topic]) skillsByTopic[topic] = [];
    skillsByTopic[topic].push(sk);
  });

  const topicEntries = Object.entries(skillsByTopic);

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

    <!-- PENDING REAL-WORLD PERKS REWARD CLAIMS -->
    ${pendingRedemptions.length > 0 ? `
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; padding: 16px;">
        <h3 style="font-size: 1.05rem; color: #0369a1; margin: 0 0 12px 0; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          🎁 Pending Real-World Reward Claims (${pendingRedemptions.filter(r => r.status === 'PENDING').length})
        </h3>
        
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto;">
          ${pendingRedemptions.filter(r => r.status === 'PENDING').map(claim => `
            <div style="background: #ffffff; padding: 10px 16px; border-radius: 10px; border: 1px solid #e0f2fe; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <div>
                <span style="font-weight: 800; color: #0f172a;">${claim.studentEmail}</span>
                <span style="color: #475569; font-size: 0.88rem;"> requested <strong>"${claim.itemTitle}"</strong> (${claim.gemCost} 💎)</span>
              </div>
              
              <div style="display: flex; gap: 6px;">
                <button class="btn-approve-claim" data-id="${claim.id}" style="background: #16a34a; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.80rem;">✓ Approve</button>
                <button class="btn-reject-claim" data-id="${claim.id}" style="background: #dc2626; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.80rem;">✕ Reject & Refund</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

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
            <option value="Current" ${selectedMatrixTag === 'Current' ? 'selected' : ''}>🟢 Current Skill</option>
            <option value="Past" ${selectedMatrixTag === 'Past' ? 'selected' : ''}>🔵 Past Skill</option>
            <option value="Future" ${selectedMatrixTag === 'Future' ? 'selected' : ''}>⚪ Future Skill</option>
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
            <tr style="background: #f1f5f9;">
              <th rowspan="2" style="padding: 12px 16px; position: sticky; left: 0; background: #f8fafc; z-index: 3; min-width: 220px; border-right: 1px solid #cbd5e1; border-bottom: 2px solid #e2e8f0;">
                Student Profile
              </th>
              <th rowspan="2" style="padding: 12px 10px; text-align: center; background: #f8fafc; border-right: 2px solid #cbd5e1; border-bottom: 2px solid #e2e8f0;">
                Class
              </th>

              ${topicEntries.map(([topicName, skills], tIdx) => `
                <th colspan="${skills.length}" style="padding: 8px 12px; text-align: center; background: #e2e8f0; color: #0f172a; font-weight: 800; font-size: 0.84rem; border-bottom: 1px solid #cbd5e1; border-right: ${tIdx === topicEntries.length - 1 ? '1px solid #cbd5e1' : '2px solid #94a3b8'};">
                  📂 ${topicName} (${skills.length})
                </th>
              `).join('')}

              <th rowspan="2" style="padding: 12px 14px; text-align: center; min-width: 110px; background: #f8fafc; border-left: 2px solid #cbd5e1; border-bottom: 2px solid #e2e8f0;">
                Avg Score
              </th>
            </tr>

            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              ${topicEntries.map(([topicName, skills], tIdx) => `
                ${skills.map((sk, sIdx) => {
                  const tagVal = selectedClass !== "All" ? (currentClassTagsBuffer[sk.generatorPath] || "Future") : "";
                  const tagBadge = tagVal === "Current" ? "🟢" : (tagVal === "Past" ? "🔵" : (tagVal === "Future" ? "⚪" : ""));
                  const isLastInTopic = sIdx === skills.length - 1;
                  const borderRight = isLastInTopic ? '2px solid #94a3b8' : '1px solid #e2e8f0';

                  return `
                    <th class="skill-header-cell" data-path="${sk.generatorPath}" data-title="${sk.title}" style="padding: 10px 8px; text-align: center; min-width: 140px; cursor: pointer; user-select: none; background: #f8fafc; border-right: ${borderRight};" title="Click to preview sample questions">
                      <div style="display: flex; flex-direction: column; gap: 2px; align-items: center;">
                        <span style="font-weight: 700; color: #2563eb; text-decoration: underline; font-size: 0.82rem;">${tagBadge} ${sk.title} 🔍</span>
                        <span style="font-size: 0.72rem; color: #64748b; font-weight: 500;">${sk.strand || ''}</span>
                      </div>
                    </th>
                  `;
                }).join('')}
              `).join('')}
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
                <tr class="student-matrix-row" data-email="${emailKey}" style="border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: background 0.15s;" title="Click student name to open Diagnostic & Rewards Drawer">
                  <td class="cell-student-drawer-trigger" data-email="${emailKey}" style="padding: 10px 14px; position: sticky; left: 0; background: #ffffff; z-index: 2; border-right: 1px solid #e2e8f0;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                      <span style="font-weight: 800; color: #2563eb; text-decoration: underline; font-size: 0.9rem;">${st.displayName || st.name || 'Student'}</span>
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.76rem; color: #64748b;">
                        <span>⭐ ${st.xp || 0} XP</span>
                        <span>💎 ${st.gems || 0}</span>
                        <span>🔥 ${st.streakCount || 0}d</span>
                        <span class="btn-toggle-pin" data-email="${emailKey}" style="cursor: pointer; background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; user-select: none; border: 1px solid #cbd5e1;" title="Click to reveal/hide PIN">
                          🔑 ${pinDisplay}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td style="padding: 12px 10px; text-align: center; color: #475569; font-weight: 600; border-right: 2px solid #cbd5e1;">${getStudentClass(st)}</td>

                  ${topicEntries.map(([topicName, skills], tIdx) => `
                    ${skills.map((sk, sIdx) => {
                      const m = stMastery[sk.generatorPath];
                      const isLastInTopic = sIdx === skills.length - 1;
                      const borderRight = isLastInTopic ? '2px solid #cbd5e1' : '1px solid #e2e8f0';

                      if (m && m.totalAttempted > 0) {
                        sumScore += m.score;
                        countSkills++;
                        const meta = safeGetMasteryMetadata(m.score);
                        return `
                          <td style="padding: 10px; text-align: center; border-right: ${borderRight};">
                            <span style="${meta.badgeCss} padding: 4px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 700;">
                              ${meta.score}
                            </span>
                          </td>
                        `;
                      } else {
                        return `
                          <td style="padding: 10px; text-align: center; color: #cbd5e1; font-weight: 600; border-right: ${borderRight};">
                            -
                          </td>
                        `;
                      }
                    }).join('')}
                  `).join('')}

                  ${(() => {
                    const studentAvg = countSkills > 0 ? Math.round(sumScore / countSkills) : 0;
                    const avgMeta = safeGetMasteryMetadata(studentAvg);
                    return `
                      <td style="padding: 10px; text-align: center; border-left: 2px solid #cbd5e1;">
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
