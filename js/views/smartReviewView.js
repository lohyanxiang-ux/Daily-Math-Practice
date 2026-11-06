import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { getSmartReviewQueue, getSRSMetrics } from "../utils/srsEngine.js";
import { renderQuestionView } from "./questionView.js";

export function renderSmartReviewSetup(container) {
  let selectedLength = 5;
  let selectedStrand = "All";

  const availableStrands = ["All", ...new Set((state.curriculum || []).map(s => s.strand).filter(Boolean))];

  function renderSetup() {
    const previewQueue = getSmartReviewQueue({
      questionCount: selectedLength,
      selectedStrand
    });

    const candidateTopics = previewQueue.candidateSkills || [];
    const top10Topics = candidateTopics.slice(0, 10);
    const refreshCount = candidateTopics.length;

    const top10Html = top10Topics.length === 0 ? `
      <div style="text-align: center; padding: 24px; color: #64748b; font-weight: 600;">
        No active topics match the current filter.
      </div>
    ` : top10Topics.map((item, index) => {
      const { title, skill, srsScore, breakdown } = item;
      const strand = skill.strand || "General";
      const year = skill.year || "Sec 1";
      const b = breakdown;

      let tagBadgeBg = "#e0f2fe";
      let tagBadgeColor = "#0369a1";
      if (b.tag === "PRIORITY") { tagBadgeBg = "#ffedd5"; tagBadgeColor = "#c2410c"; }
      else if (b.tag === "CURRENT") { tagBadgeBg = "#dcfce7"; tagBadgeColor = "#15803d"; }

      return `
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-weight: 800; color: #475569; font-size: 0.82rem;">#${index + 1}</span>
                <span style="font-size: 0.90rem; font-weight: 800; color: #0f172a;">${title}</span>
                <span style="background: ${tagBadgeBg}; color: ${tagBadgeColor}; font-weight: 800; font-size: 0.70rem; padding: 2px 6px; border-radius: 6px;">${b.tag}</span>
              </div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                ${strand} • ${year} | Mastery: <strong>${b.currentScore}</strong>/100
              </div>
            </div>

            <div style="text-align: right; flex-shrink: 0;">
              <div style="background: #2563eb; color: #ffffff; font-weight: 800; font-size: 0.92rem; padding: 3px 10px; border-radius: 12px; display: inline-block;">
                SRS: ${srsScore} / 100
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #e2e8f0; font-size: 0.73rem; font-weight: 700;">
            <span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px;">🏷️ Tag: +${b.tagWeight}</span>
            <span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px;">🎯 Deficit: +${b.masteryDeficit}</span>
            <span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px;">⏳ Time: +${b.timeDecay}</span>
            <span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px;">⚠️ Struggle: +${b.struggleFactor}</span>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(100dvh - 80px); max-height: calc(100dvh - 80px); padding: 12px; box-sizing: border-box; background: #f8fafc; overflow: hidden;">
        
        <div class="card" style="background: #ffffff; border-radius: 20px; padding: 20px; max-width: 640px; width: 100%; height: calc(100dvh - 110px); max-height: calc(100dvh - 110px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden;">
          
          <!-- TOP HEADER -->
          <div style="flex: 0 0 auto; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h2 style="font-size: 1.35rem; color: #0f172a; margin: 0; font-weight: 800;">🧠 Smart Review</h2>
              <p style="color: #64748b; font-size: 0.82rem; margin: 2px 0 0 0;">Adaptive refresher tuned to target topics</p>
            </div>
            <button id="btn-close-srs" style="padding: 6px 14px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">← Back</button>
          </div>

          <!-- SETUP FILTERS -->
          <div style="flex: 0 0 auto; display: flex; gap: 10px; align-items: center; margin-bottom: 12px;">
            <div style="flex: 1;">
              <label style="font-weight: 700; display: block; margin-bottom: 4px; color: #334155; font-size: 0.80rem;">Session Length:</label>
              <div style="display: flex; gap: 6px;">
                ${[5, 10, 15].map(num => `
                  <button type="button" class="opt-length ${num === selectedLength ? 'active' : ''}" data-val="${num}" style="
                    flex: 1; padding: 6px 4px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; cursor: pointer;
                    border: 2px solid ${num === selectedLength ? '#2563eb' : '#cbd5e1'};
                    background: ${num === selectedLength ? '#eff6ff' : '#ffffff'};
                    color: ${num === selectedLength ? '#2563eb' : '#334155'};
                  ">${num} Qs</button>
                `).join('')}
              </div>
            </div>

            <div style="flex: 1;">
              <label style="font-weight: 700; display: block; margin-bottom: 4px; color: #334155; font-size: 0.80rem;">Focus Strand:</label>
              <select id="select-strand" style="width: 100%; padding: 6px 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-weight: 600; font-size: 0.82rem; color: #0f172a; background: #fff;">
                ${availableStrands.map(s => `<option value="${s}" ${s === selectedStrand ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- ACTION BUTTON (POSITIONED ABOVE PRIORITY TOPICS) -->
          <div style="flex: 0 0 auto; width: 100%; margin-bottom: 12px;">
            <button id="btn-start-srs" ${refreshCount === 0 ? 'disabled' : ''} style="
              width: 100%; padding: 12px; font-size: 0.95rem; font-weight: 800; border-radius: 10px; border: none; color: #ffffff; cursor: pointer; transition: all 0.2s;
              background: ${refreshCount === 0 ? '#9ca3af' : '#2563eb'};
              box-shadow: ${refreshCount === 0 ? 'none' : '0 4px 12px rgba(37,99,235,0.25)'};
            ">
              ${refreshCount === 0 ? '🎉 All Topics Refreshed!' : `🚀 Start Smart Review (${selectedLength} Questions)`}
            </button>
          </div>

          <!-- SCROLLABLE TOPICS LIST -->
          <div style="flex: 1 1 0px; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 800; font-size: 0.85rem; color: #0f172a;">📊 Top Priority Topics by SRS Score:</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #2563eb;">${refreshCount} Total Candidate Topics</span>
            </div>
            ${top10Html}
          </div>

        </div>
      </div>
    `;

    container.querySelectorAll(".opt-length").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedLength = Number(btn.getAttribute("data-val"));
        renderSetup();
      });
    });

    container.querySelector("#select-strand")?.addEventListener("change", (e) => {
      selectedStrand = e.target.value;
      renderSetup();
    });

    container.querySelector("#btn-close-srs")?.addEventListener("click", () => navigateTo("dashboard"));

    const startBtn = container.querySelector("#btn-start-srs");
    if (startBtn && refreshCount > 0) {
      startBtn.addEventListener("click", () => {
        renderQuestionView(container, {
          mode: "smartReview",
          queue: previewQueue,
          maxQuestions: previewQueue.length,
          allowSkip: false,
          onComplete: (summary) => renderSRSSummary(container, summary, renderSetup),
          onExit: () => renderSetup()
        });
      });
    }
  }

  renderSetup();
}

function renderSRSSummary(container, summary, onReturnToSetup) {
  const remainingMetrics = getSRSMetrics();
  const hasMoreTopics = (remainingMetrics.totalRefreshNeeded || 0) > 0;

  let totalNetPoints = 0;
  const summaryRowsHtml = Object.keys(summary.sessionInitialScores).map(path => {
    const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill" };
    const startScore = summary.sessionInitialScores[path] || 0;
    const currentScore = state.mastery[path] ? state.mastery[path].score : startScore;
    const diff = currentScore - startScore;
    totalNetPoints += diff;
    const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
    const diffColor = diff >= 0 ? "#16a34a" : "#dc2626";

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #ffffff; border-radius: 10px; margin-bottom: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
        <div style="font-weight: 700; color: #1e293b; font-size: 0.88rem; text-align: left; flex: 1; padding-right: 8px;">${skillObj.title}</div>
        <div style="font-weight: 800; font-size: 0.90rem; color: #0f172a; white-space: nowrap;">
          ${startScore} ➔ <span style="color: #2563eb;">${currentScore}</span> 
          <span style="font-size: 0.80rem; color: ${diffColor}; margin-left: 6px;">(${diffText} pts)</span>
        </div>
      </div>
    `;
  }).join("");

  const totalXP = (summary.sessionScore * 10) + (summary.bonusXP || 0);
  const netGainText = totalNetPoints >= 0 ? `+${totalNetPoints}` : `${totalNetPoints}`;
  const netGainColor = totalNetPoints >= 0 ? "#16a34a" : "#dc2626";

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(100dvh - 80px); max-height: calc(100dvh - 80px); padding: 12px; box-sizing: border-box; background: #f8fafc; overflow: hidden;">
      <div class="card" style="max-width: 520px; width: 100%; height: calc(100dvh - 110px); max-height: calc(100dvh - 110px); background: #ffffff; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden; text-align: center;">
        
        <!-- HEADER -->
        <div style="flex: 0 0 auto; margin-bottom: 10px;">
          <h2 style="color: #0f172a; margin: 0 0 4px 0; font-size: 1.4rem; font-weight: 800;">🧠 Review Complete!</h2>
          <p style="color: #64748b; margin: 0; font-size: 0.84rem; font-weight: 600;">
            Great job reinforcing your memory retention and skill mastery!
          </p>
        </div>

        <!-- KEY STATS FEEDBACK BAR -->
        <div style="flex: 0 0 auto; display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 90px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 6px 8px;">
            <div style="font-size: 0.70rem; font-weight: 700; color: #1e40af; text-transform: uppercase;">Correct Rate</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: #1d4ed8;">${summary.sessionScore} / ${summary.totalQuestions}</div>
          </div>

          <div style="flex: 1; min-width: 90px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 6px 8px;">
            <div style="font-size: 0.70rem; font-weight: 700; color: #166534; text-transform: uppercase;">XP Earned</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: #15803d;">+${totalXP} XP</div>
          </div>

          <div style="flex: 1; min-width: 90px; background: #fefce8; border: 1px solid #fef08a; border-radius: 10px; padding: 6px 8px;">
            <div style="font-size: 0.70rem; font-weight: 700; color: #854d0e; text-transform: uppercase;">Net Mastery</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: ${netGainColor};">${netGainText} pts</div>
          </div>
        </div>

        <!-- ACTION BUTTONS (PLACED ABOVE SCROLLABLE TOPIC LIST FOR GUARANTEED VISIBILITY) -->
        <div style="flex: 0 0 auto; display: flex; gap: 8px; width: 100%; margin-bottom: 12px;">
          <button id="btn-srs-summary-exit" type="button" style="flex: 1; padding: 10px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.88rem; font-weight: 700; cursor: pointer;">
            Return to Dashboard
          </button>
          ${hasMoreTopics ? `
            <button id="btn-srs-next-batch" type="button" style="flex: 1.3; padding: 10px; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
              Review Next Batch ➔
            </button>
          ` : ''}
        </div>

        <!-- SCROLLABLE TOPICS LIST -->
        <div style="flex: 1 1 0px; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; background: #f8fafc;">
          <div style="font-size: 0.82rem; font-weight: 800; color: #475569; margin-bottom: 8px; text-align: left;">
            📈 Restored Mastery Scores:
          </div>
          ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.88rem;">Review session completed.</div>'}
        </div>

      </div>
    </div>
  `;

  container.querySelector("#btn-srs-summary-exit")?.addEventListener("click", () => navigateTo("dashboard"));
  container.querySelector("#btn-srs-next-batch")?.addEventListener("click", () => onReturnToSetup());
}
