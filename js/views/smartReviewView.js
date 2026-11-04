import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { getSmartReviewQueue, getSRSMetrics } from "../utils/srsEngine.js";
import { renderQuestionView } from "./questionView.js";

export function renderSmartReviewSetup(container) {
  let selectedLength = 5; // Default micro-batch size
  let includePriorYears = false;
  let selectedStrand = "All";

  const studentYear = state.profile ? state.profile.year : "Sec 1";
  const availableStrands = ["All", ...new Set((state.curriculum || []).map(s => s.strand).filter(Boolean))];

  function renderSetup() {
    const previewQueue = getSmartReviewQueue({
      questionCount: selectedLength,
      includePriorYears,
      selectedStrand
    });

    const candidateTopics = previewQueue.candidateSkills || [];
    const refreshCount = candidateTopics.length;

    const topicsPreviewHtml = refreshCount === 0 
      ? `
        <div style="text-align: center; padding: 28px 16px; color: #047857; background: #ecfdf5; border: 1.5px dashed #a7f3d0; border-radius: 12px; font-weight: 700;">
          🎉 Memory Shield Active!<br>
          <span style="font-size: 0.82rem; font-weight: 500; color: #059669; margin-top: 4px; display: block;">All target topics are currently up to date.</span>
        </div>
      `
      : candidateTopics.map(item => {
          const { title, strand, topic } = item.skill;
          const score = item.effectiveScore;

          let badgeBg = "#eff6ff";
          let badgeColor = "#1d4ed8";
          if (score < 40) { badgeBg = "#fef2f2"; badgeColor = "#b91c1c"; }
          else if (score < 70) { badgeBg = "#fffbeb"; badgeColor = "#b45309"; }

          return `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <div style="flex: 1; padding-right: 10px;">
                <div style="font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase;">${strand || ''} • ${topic || ''}</div>
                <div style="font-size: 0.92rem; font-weight: 700; color: #0f172a; margin: 2px 0 4px 0;">${title}</div>
                <div style="font-size: 0.78rem; color: #1e3a8a; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 6px; display: inline-block; font-weight: 600;">
                  🎯 ${item.primaryReason}
                </div>
              </div>
              <div style="text-align: right; min-width: 80px;">
                <div style="background: ${badgeBg}; color: ${badgeColor}; font-weight: 800; font-size: 0.88rem; padding: 4px 10px; border-radius: 16px; display: inline-block;">
                  ${score} / 100
                </div>
                <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">Retained Score</div>
              </div>
            </div>
          `;
        }).join("");

    const actionButtonText = refreshCount === 0
      ? 'No Skills Needing Refresh'
      : `Start Smart Review (${selectedLength} Questions across ${refreshCount} ${refreshCount === 1 ? 'Topic' : 'Topics'}) ➔`;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100dvh; padding: 12px; box-sizing: border-box;">
        <div class="card" style="background: #ffffff; border-radius: 20px; padding: 20px 24px; max-width: 640px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.08); display: flex; flex-direction: column; max-height: calc(100vh - 40px); box-sizing: border-box;">
          
          <!-- HEADER -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0;">
            <div>
              <h2 style="font-size: 1.4rem; color: #0f172a; margin: 0;">🧠 Smart Review</h2>
              <p style="color: #64748b; font-size: 0.82rem; margin: 2px 0 0 0;">Target memory decay & refresh key topics</p>
            </div>
            <button id="btn-close-srs" style="padding: 6px 14px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">← Back</button>
          </div>

          <!-- SETUP CONFIGURATION (SCROLLABLE AREA) -->
          <div style="overflow-y: auto; flex: 1; padding-right: 4px; display: flex; flex-direction: column; gap: 12px;">
            
            <!-- QUESTION LENGTH TOGGLE -->
            <div>
              <label style="font-weight: 700; display: block; margin-bottom: 6px; color: #334155; font-size: 0.82rem;">Target Questions:</label>
              <div style="display: flex; gap: 8px;">
                ${[5, 10, 15].map(num => `
                  <button type="button" class="opt-length ${num === selectedLength ? 'active' : ''}" data-val="${num}" style="
                    flex: 1; padding: 8px; border-radius: 8px; font-weight: 700; font-size: 0.88rem; cursor: pointer;
                    border: 2px solid ${num === selectedLength ? '#2563eb' : '#cbd5e1'};
                    background: ${num === selectedLength ? '#eff6ff' : '#ffffff'};
                    color: ${num === selectedLength ? '#2563eb' : '#334155'};
                  ">${num} Questions</button>
                `).join('')}
              </div>
            </div>

            <!-- STRAND FILTER -->
            <div>
              <label style="font-weight: 700; display: block; margin-bottom: 6px; color: #334155; font-size: 0.82rem;">Filter by Strand:</label>
              <select id="select-strand" style="width: 100%; padding: 8px 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-weight: 600; font-size: 0.88rem; color: #0f172a;">
                ${availableStrands.map(s => `<option value="${s}" ${s === selectedStrand ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>

            <!-- PRIOR YEARS TOGGLE -->
            ${studentYear !== "Sec 1" ? `
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div>
                  <div style="font-weight: 700; color: #0f172a; font-size: 0.82rem;">Include Prior-Year Skills</div>
                  <div style="font-size: 0.75rem; color: #64748b;">Include attempted topics from earlier grades</div>
                </div>
                <input type="checkbox" id="toggle-prior-years" ${includePriorYears ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
              </div>
            ` : ''}

            <!-- REFRESH TOPICS PREVIEW SECTION -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-weight: 700; color: #334155; font-size: 0.82rem;">
                  📋 Refresh Topics (${refreshCount}):
                </label>
                <span style="font-size: 0.75rem; font-weight: 700; color: #16a34a; background: #f0fdf4; padding: 2px 8px; border-radius: 6px;">${refreshCount} Active</span>
              </div>
              <div style="max-height: 180px; overflow-y: auto; padding-right: 4px; border: 1px solid #f1f5f9; border-radius: 10px; padding: 6px;">
                ${topicsPreviewHtml}
              </div>
            </div>

          </div>

          <!-- FIXED ACTION FOOTER -->
          <div style="margin-top: 14px; flex-shrink: 0;">
            <button id="btn-start-srs" ${refreshCount === 0 ? 'disabled' : ''} style="
              width: 100%; padding: 12px; font-size: 0.98rem; font-weight: 700; border-radius: 10px; border: none; color: #ffffff; cursor: pointer; transition: all 0.2s;
              background: ${refreshCount === 0 ? '#9ca3af' : '#2563eb'};
              box-shadow: ${refreshCount === 0 ? 'none' : '0 4px 12px rgba(37,99,235,0.25)'};
            ">
              ${actionButtonText}
            </button>
          </div>

        </div>
      </div>
    `;

    // Event Listeners
    container.querySelectorAll(".opt-length").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedLength = Number(btn.getAttribute("data-val"));
        renderSetup();
      });
    });

    const strandSelect = container.querySelector("#select-strand");
    if (strandSelect) {
      strandSelect.addEventListener("change", (e) => {
        selectedStrand = e.target.value;
        renderSetup();
      });
    }

    const priorToggle = container.querySelector("#toggle-prior-years");
    if (priorToggle) {
      priorToggle.addEventListener("change", (e) => {
        includePriorYears = e.target.checked;
        renderSetup();
      });
    }

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

/**
 * Summary View showing restored scores and option to review next batch
 */
function renderSRSSummary(container, summary, onReturnToSetup) {
  const remainingMetrics = getSRSMetrics();
  const remainingRefreshCount = remainingMetrics.totalRefreshNeeded;

  const summaryRowsHtml = Object.keys(summary.sessionInitialScores).map(path => {
    const skillObj = (state.curriculum || []).find(s => s.generatorPath === path) || { title: "Practice Skill" };
    const startScore = summary.sessionInitialScores[path] || 0;
    const currentScore = state.mastery[path] ? state.mastery[path].score : startScore;
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

  const hasMoreTopics = remainingRefreshCount > 0;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100dvh; padding: 20px;">
      <div class="card" style="max-width: 540px; width: 100%; text-align: center; padding: 28px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
        <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 1.5rem;">🧠 Batch Complete!</h2>
        <p style="color: #64748b; margin: 0 0 18px 0; font-size: 0.9rem;">
          ${hasMoreTopics ? `Great job! ${remainingRefreshCount} more ${remainingRefreshCount === 1 ? 'topic' : 'topics'} could use a quick refresh.` : '🎉 Memory Shield Active! All target topics are refreshed.'}
        </p>
        
        <div style="margin-bottom: 20px; text-align: left;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 6px;">Restored Score Summary:</div>
          ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.88rem;">Review session completed.</div>'}
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="btn-srs-summary-exit" type="button" style="flex: 1; padding: 12px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; font-size: 0.92rem; font-weight: 700; cursor: pointer;">
            Return to Dashboard
          </button>
          ${hasMoreTopics ? `
            <button id="btn-srs-next-batch" type="button" style="flex: 1.2; padding: 12px; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; font-size: 0.92rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
              Review Next Batch ➔
            </button>
          ` : ''}
        </div>

      </div>
    </div>
  `;

  container.querySelector("#btn-srs-summary-exit")?.addEventListener("click", () => navigateTo("dashboard"));
  container.querySelector("#btn-srs-next-batch")?.addEventListener("click", () => onReturnToSetup());
}
