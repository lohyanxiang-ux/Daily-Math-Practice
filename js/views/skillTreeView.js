import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { syncBatchMastery } from "../services/backend.js";
import { getMasteryMetadata } from "../utils/masteryScoreEngine.js";
import { renderQuestionView } from "./questionView.js";

export function renderSkillTree(container) {
  const curriculum = state.curriculum || [];
  const studentYear = state.profile?.year ? String(state.profile.year).trim() : "Sec 1";
  const studentStream = state.profile?.stream ? String(state.profile.stream).trim() : "G3";

  // Filter state (Defaults to student profile's year & stream)
  let selectedYear = studentYear;
  let selectedStream = studentStream;
  let activeStrand = "All";

  function flushSync() {
    if (state.pendingMasteryUpdates && state.pendingMasteryUpdates.size > 0 && state.userToken) {
      const updates = Array.from(state.pendingMasteryUpdates).map(path => state.mastery[path]);
      syncBatchMastery(state.userToken, updates);
      state.pendingMasteryUpdates.clear();
    }
  }

  // Extract unique options for filter dropdowns
  const availableYears = Array.from(new Set(curriculum.map(c => String(c.year || c.level || "").trim()).filter(Boolean))).sort();
  const availableStreams = Array.from(new Set(curriculum.map(c => String(c.stream || "").trim()).filter(Boolean))).sort();

  function getStrands() {
    const strands = new Set(["All"]);
    curriculum.forEach(s => {
      const skillYear = String(s.year || s.level || "").trim();
      const skillStream = String(s.stream || "").trim();
      const matchYear = selectedYear === "All" || skillYear === selectedYear;
      const matchStream = selectedStream === "All" || skillStream === selectedStream;

      if (matchYear && matchStream && s.strand) {
        strands.add(s.strand);
      }
    });
    return Array.from(strands);
  }

  function getFilteredCurriculum() {
    return curriculum.filter(s => {
      const skillYear = String(s.year || s.level || "").trim();
      const skillStream = String(s.stream || "").trim();

      const matchYear = selectedYear === "All" || skillYear === selectedYear;
      const matchStream = selectedStream === "All" || skillStream === selectedStream;
      const matchStrand = activeStrand === "All" || s.strand === activeStrand;

      return matchYear && matchStream && matchStrand;
    });
  }

  // Card styling resolver: Out-of-grade gets distinct purple theme
  function getSkillCardStyle(skill, isOutOfGrade) {
    if (isOutOfGrade) {
      return {
        cardStyle: "background: #f5f3ff; border: 2px solid #8b5cf6; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.12);",
        btnText: "Practice Out-of-Grade Skill ➔",
        btnStyle: "background: #7c3aed; color: #ffffff;",
        badgeText: `🌐 ${skill.year || skill.level} (${skill.stream})`,
        badgeStyle: "background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe;"
      };
    }

    const tagRaw = (state.skillTags && state.skillTags[skill.generatorPath]) || "Current";
    const t = String(tagRaw).toUpperCase();

    if (t === "CURRENT") {
      return {
        cardStyle: "background: #f0fdf4; border: 2px solid #22c55e; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.12);",
        btnText: "Practice Current Skill ➔",
        btnStyle: "background: #16a34a; color: #ffffff;",
        badgeText: "🟢 Current Unit",
        badgeStyle: "background: #dcfce7; color: #15803d; border: 1px solid #86efac;"
      };
    } else if (t === "PAST") {
      return {
        cardStyle: "background: #eff6ff; border: 1.5px solid #3b82f6; box-shadow: 0 2px 6px rgba(59, 130, 246, 0.05);",
        btnText: "Review Past Skill ➔",
        btnStyle: "background: #2563eb; color: #ffffff;",
        badgeText: "🔵 Past Topic",
        badgeStyle: "background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd;"
      };
    } else {
      return {
        cardStyle: "background: #f8fafc; border: 1.5px dashed #cbd5e1; opacity: 0.85;",
        btnText: "🔒 Future Unit",
        btnStyle: "background: #94a3b8; color: #ffffff;",
        badgeText: "⚪ Future Unit",
        badgeStyle: "background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1;"
      };
    }
  }

  function renderTree() {
    const filtered = getFilteredCurriculum();
    const strands = getStrands();

    // Reset active strand to "All" if selected strand is no longer in current options
    if (!strands.includes(activeStrand)) {
      activeStrand = "All";
    }

    const groupedByTopic = {};
    filtered.forEach(skill => {
      const topic = skill.topic || "General Topics";
      if (!groupedByTopic[topic]) groupedByTopic[topic] = [];
      groupedByTopic[topic].push(skill);
    });

    const isViewingDefaultGrade = selectedYear === studentYear && selectedStream === studentStream;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 16px; gap: 16px; overflow-y: auto; box-sizing: border-box; background: #f8fafc;">
        
        <!-- HEADER BAR WITH LEVEL & STREAM CONTROLS -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; gap: 12px;">
          <div>
            <h2 style="font-size: 1.5rem; color: #0f172a; margin: 0; font-weight: 800;">🗺️ Skill Mastery Tree</h2>
            <p style="color: #64748b; font-size: 0.88rem; margin: 4px 0 0 0;">
              Enrolled: <strong>${studentYear} (${studentStream})</strong> ${!isViewingDefaultGrade ? `<span style="color: #7c3aed; font-weight: 700;">• Viewing: ${selectedYear} (${selectedStream})</span>` : ''}
            </p>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <!-- Year Selector -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <label style="font-size: 0.82rem; font-weight: 700; color: #475569;">Level:</label>
              <select id="select-tree-year" style="padding: 6px 12px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #ffffff; color: #0f172a; cursor: pointer;">
                <option value="All" ${selectedYear === 'All' ? 'selected' : ''}>All Levels</option>
                ${availableYears.map(y => `<option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y} ${y === studentYear ? '(Current)' : ''}</option>`).join('')}
              </select>
            </div>

            <!-- Stream Selector -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <label style="font-size: 0.82rem; font-weight: 700; color: #475569;">Stream:</label>
              <select id="select-tree-stream" style="padding: 6px 12px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #ffffff; color: #0f172a; cursor: pointer;">
                <option value="All" ${selectedStream === 'All' ? 'selected' : ''}>All Streams</option>
                ${availableStreams.map(s => `<option value="${s}" ${s === selectedStream ? 'selected' : ''}>${s} ${s === studentStream ? '(Current)' : ''}</option>`).join('')}
              </select>
            </div>

            <button id="btn-tree-dashboard" style="padding: 8px 16px; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 700; background: #fff; color: #334155; cursor: pointer;">← Dashboard</button>
          </div>
        </div>

        <!-- TOPIC & OUT-OF-GRADE LEGEND -->
        <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center; background: #ffffff; padding: 12px 20px; border-radius: 14px; border: 1px solid #e2e8f0; font-size: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <span style="font-weight: 800; color: #0f172a;">Card Legend:</span>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 4px; background: #f0fdf4; border: 2px solid #22c55e;"></span>
            <span style="font-weight: 700; color: #15803d;">Current Unit</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 4px; background: #eff6ff; border: 1.5px solid #3b82f6;"></span>
            <span style="font-weight: 700; color: #1e40af;">Past Topic</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 4px; background: #f8fafc; border: 1.5px dashed #cbd5e1;"></span>
            <span style="font-weight: 700; color: #64748b;">Future Unit</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 4px; background: #f5f3ff; border: 2px solid #8b5cf6;"></span>
            <span style="font-weight: 700; color: #6d28d9;">Other Year / Stream</span>
          </div>
        </div>

        <!-- STRAND FILTER TABS (UNBLOCKED) -->
        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px;">
          ${strands.map(strand => `
            <button class="strand-tab ${strand === activeStrand ? 'active' : ''}" data-strand="${strand}" style="
              padding: 8px 18px; border-radius: 20px; border: none; font-weight: 700; cursor: pointer; white-space: nowrap;
              background: ${strand === activeStrand ? '#2563eb' : '#ffffff'};
              color: ${strand === activeStrand ? '#ffffff' : '#0f172a'};
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              border: 1px solid ${strand === activeStrand ? '#2563eb' : '#e2e8f0'};
            ">${strand}</button>
          `).join('')}
        </div>

        <!-- TOPIC GROUPS -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${Object.keys(groupedByTopic).length === 0 ? `
            <div style="background: #fff; padding: 40px; text-align: center; border-radius: 16px; color: #64748b; border: 1px solid #e2e8f0;">
              No active skills available for the selected Level (${selectedYear}), Stream (${selectedStream}), and Strand (${activeStrand}).
            </div>
          ` : Object.entries(groupedByTopic).map(([topicName, skills]) => `
            <div style="background: #ffffff; padding: 20px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <h3 style="font-size: 1.15rem; margin: 0 0 14px 0; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-weight: 800;">
                📂 ${topicName} (${skills.length} Skills)
              </h3>

              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px;">
                ${skills.map(skill => {
                  const m = (state.mastery && state.mastery[skill.generatorPath]) || { score: 0, accuracy: 0, totalAttempted: 0 };
                  
                  const prereqScore = skill.prerequisites && state.mastery && state.mastery[skill.prerequisites] 
                    ? (state.mastery[skill.prerequisites].score || 0) 
                    : 100;
                  const isPrereqLocked = skill.prerequisites ? prereqScore < 40 : false;
                  
                  const skillYearStr = String(skill.year || skill.level || "").trim();
                  const skillStreamStr = String(skill.stream || "").trim();
                  const isOutOfGrade = skillYearStr !== studentYear || skillStreamStr !== studentStream;

                  const cardCfg = getSkillCardStyle(skill, isOutOfGrade);
                  const meta = getMasteryMetadata(m.score || 0);

                  return `
                    <div style="${cardCfg.cardStyle} border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.15s ease;">
                      <div>
                        <!-- CARD HEADER WITH BADGES -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 6px; flex-wrap: wrap;">
                          <span style="${cardCfg.badgeStyle} padding: 2px 8px; border-radius: 6px; font-size: 0.74rem; font-weight: 800;">
                            ${cardCfg.badgeText}
                          </span>
                          <span style="${meta.badgeCss} padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                            ${meta.tierName} • <strong>${meta.score}</strong>/100
                          </span>
                        </div>

                        <h4 style="font-size: 1.02rem; color: #0f172a; margin: 0 0 6px 0; font-weight: 800; line-height: 1.35;">${skill.title}</h4>
                        <div style="font-size: 0.8rem; color: #64748b;">
                          Strand: <strong>${skill.strand || 'General'}</strong> | Accuracy: <strong>${m.accuracy || 0}%</strong> (${m.totalAttempted || 0} attempted)
                        </div>
                      </div>

                      <button class="btn-launch-skill" data-path="${skill.generatorPath}" style="
                        margin-top: 14px; padding: 10px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer;
                        ${cardCfg.btnStyle}
                      ">
                        ${isPrereqLocked ? '🔒 Prerequisites Locked' : cardCfg.btnText}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // --- EVENT LISTENERS ---

    // Year & Stream Filter Changes
    container.querySelector("#select-tree-year")?.addEventListener("change", (e) => {
      selectedYear = e.target.value;
      renderTree();
    });

    container.querySelector("#select-tree-stream")?.addEventListener("change", (e) => {
      selectedStream = e.target.value;
      renderTree();
    });

    // Strand Tab Click Listener
    container.querySelectorAll(".strand-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        activeStrand = tab.getAttribute("data-strand");
        renderTree();
      });
    });

    container.querySelector("#btn-tree-dashboard")?.addEventListener("click", () => {
      flushSync();
      navigateTo("dashboard");
    });

    // Launch Skill Practice via questionView
    container.querySelectorAll(".btn-launch-skill").forEach(btn => {
      btn.addEventListener("click", () => {
        flushSync();
        const selectedPath = btn.getAttribute("data-path");

        renderQuestionView(container, {
          mode: "skillTree",
          generatorPath: selectedPath,
          targetMastery: 90,
          allowSkip: false,
          onComplete: (summary) => renderSkillTreeSummary(container, summary, renderTree),
          onExit: () => renderTree()
        });
      });
    });
  }

  renderTree();
}

function renderSkillTreeSummary(container, summary, onReturnToTree) {
  const summaryRowsHtml = Object.keys(summary.sessionInitialScores).map(path => {
    const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill" };
    const startScore = summary.sessionInitialScores[path] || 0;
    const currentScore = state.mastery && state.mastery[path] ? state.mastery[path].score : startScore;
    const diff = currentScore - startScore;
    const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
    const diffColor = diff >= 0 ? "#16a34a" : "#dc2626";

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border-radius: 10px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
        <div style="font-weight: 700; color: #1e293b; font-size: 0.92rem;">${skillObj.title}</div>
        <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">
          ${startScore} ➔ <span style="color: #2563eb;">${currentScore}</span> 
          <span style="font-size: 0.82rem; color: ${diffColor}; margin-left: 6px;">(${diffText} pts)</span>
        </div>
      </div>
    `;
  }).join("");

  const headerTitle = summary.isMastered ? "🏆 Skill Mastered (90+ Score)!" : "💾 Practice Saved!";

  container.innerHTML = `
    <div class="card" style="max-width: 540px; margin: 40px auto; text-align: center; padding: 32px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
      <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 1.6rem;">${headerTitle}</h2>
      <p style="color: #64748b; margin: 0 0 20px 0; font-size: 0.95rem;">Your updated mastery score has been saved.</p>
      
      <div style="margin-bottom: 24px; text-align: left;">
        <div style="font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px;">Mastery Summary:</div>
        ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.88rem;">Skill practice complete.</div>'}
      </div>

      <div style="display: flex; gap: 10px;">
        <button id="btn-tree-summary-tree" type="button" style="flex: 1; padding: 14px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer;">
          Back to Skill Tree
        </button>
        <button id="btn-tree-summary-dash" type="button" style="flex: 1; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer;">
          Dashboard
        </button>
      </div>
    </div>
  `;

  container.querySelector("#btn-tree-summary-tree")?.addEventListener("click", () => onReturnToTree());
  container.querySelector("#btn-tree-summary-dash")?.addEventListener("click", () => navigateTo("dashboard"));
}
