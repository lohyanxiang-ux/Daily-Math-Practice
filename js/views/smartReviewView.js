import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { getSmartReviewQueue } from "../utils/srsEngine.js";
import { renderQuestionView } from "./questionView.js";

export function renderSmartReviewSetup(container) {
  let selectedLength = 10;
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

    const dueCount = previewQueue.filter(q => q.isDue).length;

    const topicsPreviewHtml = previewQueue.length === 0 
      ? `<div style="text-align: center; padding: 24px; color: #64748b; background: #f8fafc; border-radius: 12px; font-weight: 600;">🎉 No skills currently need review under these filters.</div>`
      : previewQueue.map(item => {
          const { title, strand, topic } = item.skill;
          const score = item.effectiveScore;

          let badgeBg = "#eff6ff";
          let badgeColor = "#1d4ed8";
          if (score < 40) { badgeBg = "#fef2f2"; badgeColor = "#b91c1c"; }
          else if (score < 70) { badgeBg = "#fffbeb"; badgeColor = "#b45309"; }
          else if (score >= 90) { badgeBg = "#ecfdf5"; badgeColor = "#047857"; }

          return `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="flex: 1; padding-right: 12px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">${strand || ''} • ${topic || ''}</div>
                <div style="font-size: 1rem; font-weight: 700; color: #0f172a; margin: 2px 0 6px 0;">${title}</div>
                <div style="font-size: 0.82rem; color: #1e3a8a; background: #eff6ff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 6px; display: inline-block; font-weight: 600;">
                  🎯 Reason: ${item.primaryReason}
                </div>
              </div>
              <div style="text-align: right; min-width: 90px;">
                <div style="background: ${badgeBg}; color: ${badgeColor}; font-weight: 800; font-size: 0.95rem; padding: 6px 12px; border-radius: 20px; display: inline-block;">
                  ${score} / 100
                </div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 4px;">Mastery Score</div>
              </div>
            </div>
          `;
        }).join("");

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; padding: 20px;">
        <div style="background: #ffffff; border-radius: 24px; padding: 32px; max-width: 680px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 1.6rem; color: #0f172a; margin: 0;">🧠 Smart Review (SRS)</h2>
              <p style="color: #64748b; font-size: 0.9rem; margin: 4px 0 0 0;">Target memory decay & strengthen weak topics</p>
            </div>
            <button id="btn-close-srs" style="padding: 8px 16px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">← Back</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <div>
              <label style="font-weight: 700; display: block; margin-bottom: 8px; color: #334155;">Target Questions:</label>
              <div style="display: flex; gap: 10px;">
                ${[5, 10, 15].map(num => `
                  <button type="button" class="opt-length ${num === selectedLength ? 'active' : ''}" data-val="${num}" style="
                    flex: 1; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer;
                    border: 2px solid ${num === selectedLength ? '#2563eb' : '#cbd5e1'};
                    background: ${num === selectedLength ? '#eff6ff' : '#ffffff'};
                    color: ${num === selectedLength ? '#2563eb' : '#334155'};
                  ">${num} Questions</button>
                `).join('')}
              </div>
            </div>

            <div>
              <label style="font-weight: 700; display: block; margin-bottom: 8px; color: #334155;">Filter by Strand:</label>
              <select id="select-strand" style="width: 100%; padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-weight: 600; color: #0f172a;">
                ${availableStrands.map(s => `<option value="${s}" ${s === selectedStrand ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>

            ${studentYear !== "Sec 1" ? `
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 14px 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div>
                  <div style="font-weight: 700; color: #0f172a;">Include Prior-Year Skills</div>
                  <div style="font-size: 0.82rem; color: #64748b;">Include attempted topics from earlier grades</div>
                </div>
                <input type="checkbox" id="toggle-prior-years" ${includePriorYears ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
              </div>
            ` : ''}

            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <label style="font-weight: 700; color: #334155;">📋 Review Queue Preview (${previewQueue.length} topics):</label>
                <span style="font-size: 0.82rem; font-weight: 700; color: #16a34a; background: #f0fdf4; padding: 2px 8px; border-radius: 6px;">${dueCount} Overdue</span>
              </div>
              <div style="max-height: 260px; overflow-y: auto; padding-right: 4px;">
                ${topicsPreviewHtml}
              </div>
            </div>

            <button id="btn-start-srs" ${previewQueue.length === 0 ? 'disabled' : ''} style="
              width: 100%; padding: 14px; font-size: 1.05rem; font-weight: 700; border-radius: 12px; border: none; color: #ffffff; cursor: pointer; transition: all 0.2s;
              background: ${previewQueue.length === 0 ? '#9ca3af' : '#2563eb'};
              box-shadow: ${previewQueue.length === 0 ? 'none' : '0 4px 12px rgba(37,99,235,0.25)'};
            ">
              ${previewQueue.length === 0 ? 'No Skills Available for Review' : `Start Smart Review (${previewQueue.length} Questions) ➔`}
            </button>

          </div>
        </div>
      </div>
    `;

    // Event Handlers
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
    if (startBtn && previewQueue.length > 0) {
      startBtn.addEventListener("click", () => {
        renderQuestionView(container, {
          mode: "smartReview",
          queue: previewQueue,
          allowSkip: true,
          onComplete: (summary) => renderSRSSummary(container, summary, renderSetup),
          onExit: () => renderSetup()
        });
      });
    }
  }

  renderSetup();
}

function renderSRSSummary(container, summary, onReturnToSetup) {
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

  container.innerHTML = `
    <div class="card" style="max-width: 540px; margin: 40px auto; text-align: center; padding: 32px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
      <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 1.6rem;">🧠 Smart Review Complete!</h2>
      <p style="color: #64748b; margin: 0 0 20px 0; font-size: 0.95rem;">Memory refreshed! Overdue topics have been updated.</p>
      
      <div style="margin-bottom: 24px; text-align: left;">
        <div style="font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px;">Restored Score Summary:</div>
        ${summaryRowsHtml || '<div style="color: #64748b; font-size: 0.88rem;">Review complete.</div>'}
      </div>

      <button id="btn-srs-summary-exit" type="button" style="width: 100%; padding: 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer;">
        Return to Dashboard
      </button>
    </div>
  `;

  container.querySelector("#btn-srs-summary-exit")?.addEventListener("click", () => navigateTo("dashboard"));
}
