import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { syncBatchMastery } from "../services/backend.js";
import { getMasteryMetadata } from "../utils/masteryScoreEngine.js";
import { renderQuestionView } from "./questionView.js";

export function renderSkillTree(container) {
  let activeStrand = "All";

  function flushSync() {
    if (state.pendingMasteryUpdates && state.pendingMasteryUpdates.size > 0 && state.userToken) {
      const updates = Array.from(state.pendingMasteryUpdates).map(path => state.mastery[path]);
      syncBatchMastery(state.userToken, updates);
      state.pendingMasteryUpdates.clear();
    }
  }

  function getStrands() {
    const strands = new Set(["All"]);
    (state.curriculum || []).forEach(s => {
      if (s.strand) strands.add(s.strand);
    });
    return Array.from(strands);
  }

  function getFilteredCurriculum() {
    const studentYear = state.profile ? String(state.profile.year).trim() : "";
    const studentStream = state.profile ? String(state.profile.stream).trim() : "";

    return (state.curriculum || []).filter(s => {
      const matchLevel = String(s.year).trim() === studentYear && String(s.stream).trim() === studentStream;
      const matchStrand = activeStrand === "All" || s.strand === activeStrand;
      return matchLevel && matchStrand;
    });
  }

  // Returns full card background, border, button styling based on tag
  function getTagConfig(tagStr) {
    const t = (tagStr || "Current").toUpperCase();
    
    if (t === "CURRENT") {
      return {
        // Green color palette for Current Unit
        cardStyle: "background: #f0fdf4; border: 2px solid #22c55e; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.12);",
        btnText: "Practice Current Skill ➔",
        btnStyle: "background: #16a34a; color: #ffffff;"
      };
    } else if (t === "PAST") {
      return {
        // Blue color palette for Past Topics
        cardStyle: "background: #eff6ff; border: 1.5px solid #3b82f6; box-shadow: 0 2px 6px rgba(59, 130, 246, 0.05);",
        btnText: "Review Past Skill ➔",
        btnStyle: "background: #2563eb; color: #ffffff;"
      };
    } else {
      // Light grey color palette with dashed border for Future Topics
      return {
        cardStyle: "background: #f8fafc; border: 1.5px dashed #cbd5e1; opacity: 0.85;",
        btnText: "🔒 Future Unit",
        btnStyle: "background: #94a3b8; color: #ffffff;"
      };
    }
  }

  function renderTree() {
    const filtered = getFilteredCurriculum();
    const strands = getStrands();
    const skillTags = state.skillTags || {};

    const groupedByTopic = {};
    filtered.forEach(skill => {
      const topic = skill.topic || "General Topics";
      if (!groupedByTopic[topic]) groupedByTopic[topic] = [];
      groupedByTopic[topic].push(skill);
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 16px; gap: 16px; overflow-y: auto; box-sizing: border-box; background: #f8fafc;">
        
        <!-- HEADER BAR -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div>
            <h2 style="font-size: 1.5rem; color: #0f172a; margin: 0; font-weight: 800;">🗺️ Skill Mastery Tree</h2>
            <p style="color: #64748b; font-size: 0.88rem; margin: 4px 0 0 0;">${state.profile?.year || 'Sec 1'} (${state.profile?.stream || 'G3'}) • Class ${state.profile?.class || 'Syllabus'}</p>
          </div>
          <button id="btn-tree-dashboard" style="padding: 8px 16px; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 700; background: #fff; color: #334155; cursor: pointer;">← Back to Dashboard</button>
        </div>

        <!-- SYLLABUS TAG COLOR LEGEND -->
        <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center; background: #ffffff; padding: 12px 20px; border-radius: 14px; border: 1px solid #e2e8f0; font-size: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <span style="font-weight: 800; color: #0f172a;">Topic Legend:</span>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 16px; height: 16px; border-radius: 4px; background: #f0fdf4; border: 2px solid #22c55e;"></span>
            <span style="font-weight: 700; color: #15803d;">Current Unit</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 16px; height: 16px; border-radius: 4px; background: #eff6ff; border: 1.5px solid #3b82f6;"></span>
            <span style="font-weight: 700; color: #1e40af;">Past Topic</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 16px; height: 16px; border-radius: 4px; background: #f8fafc; border: 1.5px dashed #cbd5e1;"></span>
            <span style="font-weight: 700; color: #64748b;">Future Unit</span>
          </div>
        </div>

        <!-- STRAND FILTER TABS -->
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
              No active skills available for this topic filter.
            </div>
          ` : Object.entries(groupedByTopic).map(([topicName, skills]) => `
            <div style="background: #ffffff; padding: 20px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <h3 style="font-size: 1.15rem; margin: 0 0 14px 0; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-weight: 800;">
                📂 ${topicName}
              </h3>

              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px;">
                ${skills.map(skill => {
                  const m = (state.mastery && state.mastery[skill.generatorPath]) || { score: 0, accuracy: 0, totalAttempted: 0 };
                  
                  const prereqScore = skill.prerequisites && state.mastery && state.mastery[skill.prerequisites] 
                    ? (state.mastery[skill.prerequisites].score || 0) 
                    : 100;
                  const isPrereqLocked = skill.prerequisites ? prereqScore < 40 : false;
                  
                  const tagRaw = skillTags[skill.generatorPath] || "Current";
                  const tagCfg = getTagConfig(tagRaw);
                  const meta = getMasteryMetadata(m.score || 0);

                  return `
                    <!-- FULL SKILL CARD COLORED BY TAG -->
                    <div style="${tagCfg.cardStyle} border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.15s ease;">
                      <div>
                        <!-- CARD HEADER (MASTERY BADGE ONLY) -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                          <span style="font-size: 0.78rem; font-weight: 700; color: #64748b;">${skill.strand || ''}</span>
                          <span style="${meta.badgeCss} padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                            ${meta.tierName} • <strong>${meta.score}</strong>/100
                          </span>
                        </div>

                        <h4 style="font-size: 1.02rem; color: #0f172a; margin: 0 0 6px 0; font-weight: 800; line-height: 1.35;">${skill.title}</h4>
                        <div style="font-size: 0.8rem; color: #64748b;">
                          Accuracy: <strong>${m.accuracy || 0}%</strong> (${m.totalAttempted || 0} attempted)
                        </div>
                      </div>

                      <button class="btn-launch-skill" data-path="${skill.generatorPath}" style="
                        margin-top: 14px; padding: 10px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer;
                        ${tagCfg.btnStyle}
                      ">
                        ${isPrereqLocked ? '🔒 Prerequisites Locked' : tagCfg.btnText}
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
