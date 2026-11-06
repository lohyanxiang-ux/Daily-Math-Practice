import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { getSmartReviewQueue, getSRSMetrics } from "../utils/srsEngine.js";
import { renderQuestionView } from "./questionView.js";

export function renderSmartReviewSetup(container) {
  let selectedLength = 5; // Default batch size
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

    const refreshCount = previewQueue.refreshCount || 0;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100dvh; padding: 16px; box-sizing: border-box; background: #f8fafc;">
        <div class="card" style="background: #ffffff; border-radius: 20px; padding: 28px 24px; max-width: 500px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.08); box-sizing: border-box;">
          
          <!-- HEADER -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 1.5rem; color: #0f172a; margin: 0; font-weight: 800;">🧠 Smart Review</h2>
              <p style="color: #64748b; font-size: 0.88rem; margin: 4px 0 0 0;">Adaptive refresher tuned to your target topics</p>
            </div>
            <button id="btn-close-srs" style="padding: 6px 14px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">← Back</button>
          </div>

          <!-- SETUP OPTIONS -->
          <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
            
            <!-- SESSION LENGTH SELECTOR -->
            <div>
              <label style="font-weight: 700; display: block; margin-bottom: 8px; color: #334155; font-size: 0.88rem;">Select Session Length:</label>
              <div style="display: flex; gap: 10px;">
                ${[5, 10, 15].map(num => `
                  <button type="button" class="opt-length ${num === selectedLength ? 'active' : ''}" data-val="${num}" style="
                    flex: 1; padding: 12px 8px; border-radius: 12px; font-weight: 800; font-size: 0.95rem; cursor: pointer;
                    border: 2px solid ${num === selectedLength ? '#2563eb' : '#cbd5e1'};
                    background: ${num === selectedLength ? '#eff6ff' : '#ffffff'};
                    color: ${num === selectedLength ? '#2563eb' : '#334155'};
                    box-shadow: ${num === selectedLength ? '0 4px 10px rgba(37,99,235,0.15)' : 'none'};
                  ">${num} Qs</button>
                `).join('')}
              </div>
            </div>

            <!-- STRAND FILTER -->
            <div>
              <label style="font-weight: 700; display: block; margin-bottom: 6px; color: #334155; font-size: 0.85rem;">Focus Strand (Optional):</label>
              <select id="select-strand" style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-weight: 600; font-size: 0.88rem; color: #0f172a; background: #fff;">
                ${availableStrands.map(s => `<option value="${s}" ${s === selectedStrand ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>

            <!-- PRIOR YEARS TOGGLE -->
            ${studentYear !== "Sec 1" ? `
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
                <div>
                  <div style="font-weight: 700; color: #0f172a; font-size: 0.85rem;">Include Prior-Year Skills</div>
                  <div style="font-size: 0.75rem; color: #64748b;">Review foundational topics from earlier grades</div>
                </div>
                <input type="checkbox" id="toggle-prior-years" ${includePriorYears ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
              </div>
            ` : ''}

          </div>

          <!-- LAUNCH BUTTON -->
          <button id="btn-start-srs" ${refreshCount === 0 ? 'disabled' : ''} style="
            width: 100%; padding: 14px; font-size: 1rem; font-weight: 800; border-radius: 12px; border: none; color: #ffffff; cursor: pointer; transition: all 0.2s;
            background: ${refreshCount === 0 ? '#9ca3af' : '#2563eb'};
            box-shadow: ${refreshCount === 0 ? 'none' : '0 4px 14px rgba(37,99,235,0.3)'};
          ">
            ${refreshCount === 0 ? '🎉 All Topics Refreshed!' : `🚀 Start Smart Review (${selectedLength} Questions)`}
          </button>

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
      <div class="card" style="max-width: 500px; width: 100%; text-align: center; padding: 28px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
        <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 1.5rem; font-weight: 800;">🧠 Review Complete!</h2>
        <p style="color: #64748b; margin: 0 0 18px 0; font-size: 0.9rem;">
          ${hasMoreTopics ? `Great job! ${remainingRefreshCount} more ${remainingRefreshCount === 1 ? 'topic' : 'topics'} could use a quick review.` : '🎉 Memory Shield Active! All target topics are refreshed.'}
        </p>
        
        <div style="margin-bottom: 20px; text-align: left;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 6px;">Restored Mastery Scores:</div>
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
