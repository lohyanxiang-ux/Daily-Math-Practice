import { state } from "../state.js";
import { navigateTo } from "../router.js";
import { getSmartReviewQueue } from "../utils/srsEngine.js";

export function renderSmartReviewSetup(container) {
  let selectedLength = 10;
  let includePriorYears = false;
  let selectedStrand = "All";

  const studentYear = state.profile ? state.profile.year : "Sec 1";

  function render() {
    const previewQueue = getSmartReviewQueue({
      questionCount: selectedLength,
      includePriorYears,
      selectedStrand
    });

    const dueCount = previewQueue.filter(q => q.isDue).length;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; padding: 20px;">
        <div style="background: #ffffff; border-radius: 24px; padding: 32px; max-width: 600px; width: 100%; box-shadow: var(--shadow);">
          
          <!-- HEADER -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 1.6rem; color: var(--text-main);">🧠 Smart Review (SRS)</h2>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Target memory decay & close learning gaps</p>
            </div>
            <button id="btn-close-srs" class="secondary-btn">← Back</button>
          </div>

          <!-- SETUP CONFIGURATION -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- SESSION LENGTH -->
            <div>
              <label style="font-weight: 700; display: block; margin-bottom: 8px;">Target Questions:</label>
              <div style="display: flex; gap: 10px;">
                ${[5, 10, 15].map(num => `
                  <button class="opt-length ${num === selectedLength ? 'active' : ''}" data-val="${num}" style="
                    flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer;
                    border: 2px solid ${num === selectedLength ? 'var(--primary)' : 'var(--border)'};
                    background: ${num === selectedLength ? '#eff6ff' : '#ffffff'};
                    color: ${num === selectedLength ? 'var(--primary)' : 'var(--text-main)'};
                  ">${num} Questions</button>
                `).join('')}
              </div>
            </div>

            <!-- PRIOR YEARS TOGGLE (Visible for Sec 2, Sec 3, Sec 4) -->
            ${studentYear !== "Sec 1" ? `
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 16px; border-radius: 14px; border: 1px solid var(--border);">
                <div>
                  <div style="font-weight: 700; color: var(--text-main);">Include Prior-Year Skills</div>
                  <div style="font-size: 0.82rem; color: var(--text-muted);">Include attempted topics from earlier grades</div>
                </div>
                <input type="checkbox" id="toggle-prior-years" ${includePriorYears ? 'checked' : ''} style="width: 22px; height: 22px; cursor: pointer;">
              </div>
            ` : ''}

            <!-- QUEUE SUMMARY PREVIEW -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 14px; color: #166534;">
              <div style="font-weight: 700;">📊 Review Queue Summary:</div>
              <div style="font-size: 0.9rem; margin-top: 4px;">
                <strong>${dueCount}</strong> overdue topics scheduled for review out of <strong>${previewQueue.length}</strong> total topics queued.
              </div>
            </div>

            <!-- LAUNCH ACTION -->
            <button id="btn-start-srs" ${previewQueue.length === 0 ? 'disabled' : ''} class="btn-next-question" style="
              width: 100%; padding: 16px; font-size: 1.1rem; border-radius: 14px;
              background: ${previewQueue.length === 0 ? '#9ca3af' : '#2563eb'};
            ">
              ${previewQueue.length === 0 ? 'No Skills Available for Review' : 'Start Smart Review ➔'}
            </button>

          </div>
        </div>
      </div>
    `;

    // Event Listeners
    container.querySelectorAll(".opt-length").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedLength = Number(btn.getAttribute("data-val"));
        render();
      });
    });

    const priorToggle = container.querySelector("#toggle-prior-years");
    if (priorToggle) {
      priorToggle.addEventListener("change", (e) => {
        includePriorYears = e.target.checked;
        render();
      });
    }

    container.querySelector("#btn-close-srs").addEventListener("click", () => navigateTo("dashboard"));

    const startBtn = container.querySelector("#btn-start-srs");
    if (startBtn && previewQueue.length > 0) {
      startBtn.addEventListener("click", () => {
        // Pass generated queue paths into practice session
        navigateTo("daily", {
          mode: "smartReview",
          queue: previewQueue.map(q => q.generatorPath),
          targetQuestions: previewQueue.length
        });
      });
    }
  }

  render();
}
