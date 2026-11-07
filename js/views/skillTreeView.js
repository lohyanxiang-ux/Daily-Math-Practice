import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { syncBatchMastery } from "../services/backend.js";
import { getMasteryMetadata } from "../utils/masteryScoreEngine.js";
import { renderQuestionView } from "./questionView.js";

/**
 * Extracts numeric level from academic grade strings or class codes.
 * e.g., "Sec 3" -> 3, "P6" -> 6, "301" -> 3, "3A" -> 3, 2 -> 2
 */
function parseYearNumber(val) {
  if (typeof val === "number") return val;
  if (!val) return null;
  const str = String(val).trim();
  
  const secMatch = str.match(/(?:Sec|P|Grade|Year)\s*(\d+)/i);
  if (secMatch) return parseInt(secMatch[1], 10);
  
  const digitMatch = str.match(/\d+/);
  if (digitMatch) {
    const num = parseInt(digitMatch[0], 10);
    if (num >= 100 && num <= 999) {
      return Math.floor(num / 100);
    }
    return num;
  }
  return null;
}

/**
 * Smart Auto-Default Tag Rule:
 * - Previous years (skillYear < studentYear) -> "Past"
 * - Current or future years (skillYear >= studentYear) -> "Future"
 */
function getAutoDefaultTag(skill, studentYearOrClass) {
  const studentYearNum = parseYearNumber(studentYearOrClass || state.profile?.year || "Sec 1");
  const skillYearNum = parseYearNumber(skill.year || skill.level);

  if (studentYearNum !== null && skillYearNum !== null) {
    if (skillYearNum < studentYearNum) {
      return "Past";
    } else {
      return "Future";
    }
  }
  return "Future";
}

/**
 * Flexible Path Tag Resolver:
 * 1. Checks for explicit teacher tag mapping in state.skillTags.
 * 2. Falls back to automatic year comparison (Past vs Future).
 */
function resolveSkillTag(skill, studentYearOrClass) {
  const rawPath = (skill.generatorPath || "").trim().replace(/\\/g, '/');
  
  if (state.skillTags && Object.keys(state.skillTags).length > 0 && rawPath) {
    const rawFilename = rawPath.split('/').pop().replace(/\.js$/, '');

    if (state.skillTags[rawPath]) return state.skillTags[rawPath];

    for (const [key, tag] of Object.entries(state.skillTags)) {
      const cleanKey = key.trim().replace(/\\/g, '/');
      const keyFilename = cleanKey.split('/').pop().replace(/\.js$/, '');

      if (
        cleanKey === rawPath ||
        cleanKey.endsWith(rawPath) ||
        rawPath.endsWith(cleanKey) ||
        (keyFilename && keyFilename === rawFilename)
      ) {
        return tag;
      }
    }
  }

  return getAutoDefaultTag(skill, studentYearOrClass);
}

export function renderSkillTree(container) {
  const curriculum = state.curriculum || [];
  const studentYear = state.profile?.year ? String(state.profile.year).trim() : "Sec 1";
  const studentStream = state.profile?.stream ? String(state.profile.stream).trim() : "G3";
  const studentClass = state.profile?.class ? String(state.profile.class).trim() : "";

  let selectedYear = studentYear;
  let selectedStream = studentStream;
  let selectedStrand = "All";
  let searchQuery = "";

  const activeTagFilters = {
    PRIORITY: true,
    CURRENT: true,
    PAST: true,
    FUTURE: true,
    OUT_OF_GRADE: true
  };

  function flushSync() {
    if (state.pendingMasteryUpdates && state.pendingMasteryUpdates.size > 0 && state.userToken) {
      const updates = Array.from(state.pendingMasteryUpdates).map(path => state.mastery[path]);
      syncBatchMastery(state.userToken, updates);
      state.pendingMasteryUpdates.clear();
    }
  }

  // Determine tag key: only skills in a different stream get OUT_OF_GRADE (purple)
  function getSkillTagKey(skill) {
    const skillStreamStr = String(skill.stream || "").trim();
    const isOtherStream = studentStream && skillStreamStr && skillStreamStr !== studentStream;

    if (isOtherStream) return "OUT_OF_GRADE";

    const resolvedTag = String(resolveSkillTag(skill, studentClass || studentYear)).toUpperCase();
    if (resolvedTag === "PRIORITY") return "PRIORITY";
    if (resolvedTag === "CURRENT") return "CURRENT";
    if (resolvedTag === "PAST") return "PAST";
    return "FUTURE";
  }

  const availableYears = Array.from(new Set(curriculum.map(c => String(c.year || c.level || "").trim()).filter(Boolean))).sort();
  const availableStreams = Array.from(new Set(curriculum.map(c => String(c.stream || "").trim()).filter(Boolean))).sort();
  const availableStrands = Array.from(new Set(curriculum.map(c => String(c.strand || "").trim()).filter(Boolean))).sort();

  function getFilteredCurriculum() {
    return curriculum.filter(s => {
      const skillYear = String(s.year || s.level || "").trim();
      const skillStream = String(s.stream || "").trim();
      const skillStrand = String(s.strand || "").trim();
      const skillTitle = String(s.title || "").toLowerCase();
      const skillTopic = String(s.topic || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchYear = selectedYear === "All" || skillYear === selectedYear;
      const matchStream = selectedStream === "All" || skillStream === selectedStream;
      const matchStrand = selectedStrand === "All" || skillStrand === selectedStrand;
      const matchSearch = !query || skillTitle.includes(query) || skillTopic.includes(query);

      const tagKey = getSkillTagKey(s);
      const matchTag = !!activeTagFilters[tagKey];

      return matchYear && matchStream && matchStrand && matchSearch && matchTag;
    });
  }

  function getSkillCardStyle(skill, isOtherStream) {
    if (isOtherStream) {
      return {
        cardStyle: "background: #f5f3ff; border: 2px solid #8b5cf6; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.12);",
        btnText: "Practice Other Stream Skill ➔",
        btnStyle: "background: #7c3aed; color: #ffffff;",
        badgeText: `🌐 ${skill.year || skill.level} (${skill.stream})`,
        badgeStyle: "background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe;"
      };
    }

    const resolvedTag = resolveSkillTag(skill, studentClass || studentYear);
    const t = String(resolvedTag).toUpperCase();

    if (t === "PRIORITY") {
      return {
        cardStyle: "background: #fff7ed; border: 2px solid #ea580c; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.12);",
        btnText: "Practice Priority Skill ➔",
        btnStyle: "background: #ea580c; color: #ffffff;",
        badgeText: "🔥 Priority Skill",
        badgeStyle: "background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa;"
      };
    } else if (t === "CURRENT") {
      return {
        cardStyle: "background: #f0fdf4; border: 2px solid #22c55e; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.12);",
        btnText: "Practice Current Skill ➔",
        btnStyle: "background: #16a34a; color: #ffffff;",
        badgeText: "🟢 Current Skill",
        badgeStyle: "background: #dcfce7; color: #15803d; border: 1px solid #86efac;"
      };
    } else if (t === "PAST") {
      return {
        cardStyle: "background: #eff6ff; border: 1.5px solid #3b82f6; box-shadow: 0 2px 6px rgba(59, 130, 246, 0.05);",
        btnText: "Review Past Skill ➔",
        btnStyle: "background: #2563eb; color: #ffffff;",
        badgeText: "🔵 Past Skill",
        badgeStyle: "background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd;"
      };
    } else {
      return {
        cardStyle: "background: #f8fafc; border: 1.5px dashed #cbd5e1; opacity: 0.85;",
        btnText: "🔒 Future Skill",
        btnStyle: "background: #94a3b8; color: #ffffff;",
        badgeText: "⚪ Future Skill",
        badgeStyle: "background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1;"
      };
    }
  }

  function renderSkillCardHtml(skill) {
    const m = (state.mastery && state.mastery[skill.generatorPath]) || { score: 0, accuracy: 0, totalAttempted: 0 };
    
    const prereqScore = skill.prerequisites && state.mastery && state.mastery[skill.prerequisites] 
      ? (state.mastery[skill.prerequisites].score || 0) 
      : 100;
    const isPrereqLocked = skill.prerequisites ? prereqScore < 40 : false;
    
    const skillStreamStr = String(skill.stream || "").trim();
    const isOtherStream = studentStream && skillStreamStr && skillStreamStr !== studentStream;

    const cardCfg = getSkillCardStyle(skill, isOtherStream);
    const meta = getMasteryMetadata(m.score || 0);

    return `
      <div style="${cardCfg.cardStyle} border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.15s ease;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 6px; flex-wrap: wrap;">
            <span style="${cardCfg.badgeStyle} padding: 2px 8px; border-radius: 6px; font-size: 0.74rem; font-weight: 800;">
              ${cardCfg.badgeText}
            </span>
            <span style="${meta.badgeCss} padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
              ${meta.tierName} • <strong>${meta.score}</strong>/100
            </span>
          </div>

          <h4 style="font-size: 1.02rem; color: #0f172a; margin: 0 0 6px 0; font-weight: 800; line-height: 1.35;">${skill.title}</h4>
          
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
            <span style="background: #e2e8f0; color: #334155; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">
              ${skill.year || skill.level || ''} • ${skill.stream || ''}
            </span>
            <span style="font-size: 0.78rem; color: #64748b; font-weight: 600;">
              ${skill.strand || ''}
            </span>
          </div>

          <div style="font-size: 0.8rem; color: #64748b;">
            Accuracy: <strong>${m.accuracy || 0}%</strong> (${m.totalAttempted || 0} attempted)
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
  }

  function renderTree() {
    const filtered = getFilteredCurriculum();

    const groupedByTopic = {};
    filtered.forEach(skill => {
      const topic = skill.topic || "General Topics";
      if (!groupedByTopic[topic]) groupedByTopic[topic] = [];
      groupedByTopic[topic].push(skill);
    });

    const isViewingDefaultGrade = selectedYear === studentYear && selectedStream === studentStream;

    let topicGroupsHtml = '';
    const topicKeys = Object.keys(groupedByTopic);
    
    if (topicKeys.length === 0) {
      topicGroupsHtml = `
        <div style="background: #fff; padding: 40px; text-align: center; border-radius: 16px; color: #64748b; border: 1px solid #e2e8f0;">
          No active skills match your current search and tag filter criteria.
        </div>
      `;
    } else {
      topicGroupsHtml = Object.entries(groupedByTopic).map(([topicName, skills]) => `
        <div style="background: #ffffff; padding: 20px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <h3 style="font-size: 1.15rem; margin: 0 0 14px 0; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-weight: 800;">
            📂 ${topicName} (${skills.length} Skills)
          </h3>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px;">
            ${skills.map(renderSkillCardHtml).join('')}
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; padding: 16px; gap: 16px; overflow-y: auto; box-sizing: border-box; background: #f8fafc;">
        
        <!-- HEADER BAR WITH COMBINED FILTERS & SEARCH -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; gap: 12px;">
          <div>
            <h2 style="font-size: 1.5rem; color: #0f172a; margin: 0; font-weight: 800;">🗺️ Skill Mastery Tree</h2>
            <p style="color: #64748b; font-size: 0.88rem; margin: 4px 0 0 0;">
              Enrolled: <strong>${studentYear} (${studentStream})</strong> ${!isViewingDefaultGrade ? `<span style="color: #7c3aed; font-weight: 700;">• Viewing: ${selectedYear} (${selectedStream})</span>` : ''}
            </p>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <input id="input-search-skill" type="text" value="${searchQuery}" placeholder="🔍 Search skill or topic..." style="padding: 7px 12px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 0.88rem; font-weight: 600; min-width: 180px; outline: none;" />

            <div style="display: flex; align-items: center; gap: 4px;">
              <label style="font-size: 0.82rem; font-weight: 700; color: #475569;">Level:</label>
              <select id="select-tree-year" style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #ffffff; color: #0f172a; cursor: pointer;">
                <option value="All" ${selectedYear === 'All' ? 'selected' : ''}>All Levels</option>
                ${availableYears.map(y => `<option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y} ${y === studentYear ? '(Current)' : ''}</option>`).join('')}
              </select>
            </div>

            <div style="display: flex; align-items: center; gap: 4px;">
              <label style="font-size: 0.82rem; font-weight: 700; color: #475569;">Stream:</label>
              <select id="select-tree-stream" style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #ffffff; color: #0f172a; cursor: pointer;">
                <option value="All" ${selectedStream === 'All' ? 'selected' : ''}>All Streams</option>
                ${availableStreams.map(s => `<option value="${s}" ${s === selectedStream ? 'selected' : ''}>${s} ${s === studentStream ? '(Current)' : ''}</option>`).join('')}
              </select>
            </div>

            <div style="display: flex; align-items: center; gap: 4px;">
              <label style="font-size: 0.82rem; font-weight: 700; color: #475569;">Strand:</label>
              <select id="select-tree-strand" style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #ffffff; color: #0f172a; cursor: pointer;">
                <option value="All" ${selectedStrand === 'All' ? 'selected' : ''}>All Strands</option>
                ${availableStrands.map(st => `<option value="${st}" ${st === selectedStrand ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>

            <button id="btn-tree-dashboard" style="padding: 8px 16px; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 700; background: #fff; color: #334155; cursor: pointer;">← Dashboard</button>
          </div>
        </div>

        <!-- INTERACTIVE CARD LEGEND FILTER BAR -->
        <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; background: #ffffff; padding: 12px 20px; border-radius: 14px; border: 1px solid #e2e8f0; font-size: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <span style="font-weight: 800; color: #0f172a; margin-right: 4px;">Filter by Tag:</span>
          
          <button class="btn-legend-toggle ${activeTagFilters.PRIORITY ? 'active' : ''}" data-tag-key="PRIORITY" style="
            display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 10px; cursor: pointer; user-select: none; transition: all 0.15s ease;
            ${activeTagFilters.PRIORITY 
              ? 'background: #ffedd5; color: #c2410c; border: 1.5px solid #ea580c; font-weight: 800;' 
              : 'background: #f1f5f9; color: #94a3b8; border: 1.5px solid #cbd5e1; font-weight: 600; opacity: 0.55; text-decoration: line-through;'}
          ">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${activeTagFilters.PRIORITY ? '#ea580c' : '#cbd5e1'};"></span>
            Priority Skill
          </button>

          <button class="btn-legend-toggle ${activeTagFilters.CURRENT ? 'active' : ''}" data-tag-key="CURRENT" style="
            display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 10px; cursor: pointer; user-select: none; transition: all 0.15s ease;
            ${activeTagFilters.CURRENT 
              ? 'background: #dcfce7; color: #15803d; border: 1.5px solid #22c55e; font-weight: 800;' 
              : 'background: #f1f5f9; color: #94a3b8; border: 1.5px solid #cbd5e1; font-weight: 600; opacity: 0.55; text-decoration: line-through;'}
          ">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${activeTagFilters.CURRENT ? '#22c55e' : '#cbd5e1'};"></span>
            Current Skill
          </button>

          <button class="btn-legend-toggle ${activeTagFilters.PAST ? 'active' : ''}" data-tag-key="PAST" style="
            display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 10px; cursor: pointer; user-select: none; transition: all 0.15s ease;
            ${activeTagFilters.PAST 
              ? 'background: #dbeafe; color: #1e40af; border: 1.5px solid #3b82f6; font-weight: 800;' 
              : 'background: #f1f5f9; color: #94a3b8; border: 1.5px solid #cbd5e1; font-weight: 600; opacity: 0.55; text-decoration: line-through;'}
          ">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${activeTagFilters.PAST ? '#3b82f6' : '#cbd5e1'};"></span>
            Past Skill
          </button>

          <button class="btn-legend-toggle ${activeTagFilters.FUTURE ? 'active' : ''}" data-tag-key="FUTURE" style="
            display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 10px; cursor: pointer; user-select: none; transition: all 0.15s ease;
            ${activeTagFilters.FUTURE 
              ? 'background: #f1f5f9; color: #475569; border: 1.5px dashed #64748b; font-weight: 800;' 
              : 'background: #f1f5f9; color: #94a3b8; border: 1.5px solid #cbd5e1; font-weight: 600; opacity: 0.55; text-decoration: line-through;'}
          ">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${activeTagFilters.FUTURE ? '#64748b' : '#cbd5e1'};"></span>
            Future Skill
          </button>

          <button class="btn-legend-toggle ${activeTagFilters.OUT_OF_GRADE ? 'active' : ''}" data-tag-key="OUT_OF_GRADE" style="
            display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 10px; cursor: pointer; user-select: none; transition: all 0.15s ease;
            ${activeTagFilters.OUT_OF_GRADE 
              ? 'background: #ede9fe; color: #6d28d9; border: 1.5px solid #8b5cf6; font-weight: 800;' 
              : 'background: #f1f5f9; color: #94a3b8; border: 1.5px solid #cbd5e1; font-weight: 600; opacity: 0.55; text-decoration: line-through;'}
          ">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${activeTagFilters.OUT_OF_GRADE ? '#8b5cf6' : '#cbd5e1'};"></span>
            Other Stream
          </button>
        </div>

        <!-- TOPIC GROUPS -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${topicGroupsHtml}
        </div>
      </div>
    `;

    const searchInput = container.querySelector("#input-search-skill");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        const cursorPos = e.target.selectionStart;
        renderTree();
        const reattachedInput = container.querySelector("#input-search-skill");
        if (reattachedInput) {
          reattachedInput.focus();
          reattachedInput.setSelectionRange(cursorPos, cursorPos);
        }
      });
    }

    container.querySelector("#select-tree-year")?.addEventListener("change", (e) => {
      selectedYear = e.target.value;
      renderTree();
    });

    container.querySelector("#select-tree-stream")?.addEventListener("change", (e) => {
      selectedStream = e.target.value;
      renderTree();
    });

    container.querySelector("#select-tree-strand")?.addEventListener("change", (e) => {
      selectedStrand = e.target.value;
      renderTree();
    });

    container.querySelectorAll(".btn-legend-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-tag-key");
        if (key && activeTagFilters.hasOwnProperty(key)) {
          activeTagFilters[key] = !activeTagFilters[key];
          renderTree();
        }
      });
    });

    container.querySelector("#btn-tree-dashboard")?.addEventListener("click", () => {
      flushSync();
      navigateTo("dashboard");
    });

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
