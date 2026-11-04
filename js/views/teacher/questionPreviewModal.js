import { state } from "../../state.js";
import { loadQuestionGenerator } from "../../questions/loader.js";
import { renderKaTeX } from "../../utils/katexHelper.js";
import { findGeneratorFunction } from "./helperUtils.js";

export function renderQuestionPreviewModalHTML() {
  return `
    <div id="skill-preview-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); z-index: 110; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: #ffffff; width: 720px; max-width: 100%; max-height: 90vh; border-radius: 16px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 14px; overflow-y: auto; position: relative;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 12px;">
          <div>
            <h3 id="modal-skill-title" style="margin: 0; font-size: 1.25rem; color: #0f172a;">Skill Preview</h3>
            <span id="modal-skill-strand" style="font-size: 0.82rem; color: #64748b;">Curriculum Skill</span>
          </div>
          <button id="btn-close-skill-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">✕</button>
        </div>

        <!-- CONTROLS & ANNOTATION TOOLBAR -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 700; font-size: 0.85rem; color: #334155;">Difficulty:</span>
            <button class="btn-tier-select" data-tier="1" style="padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.8rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 1 (Basic)</button>
            <button class="btn-tier-select" data-tier="2" style="padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.8rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 2 (Int.)</button>
            <button class="btn-tier-select" data-tier="3" style="padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.8rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 3 (Adv.)</button>
          </div>

          <div style="display: flex; align-items: center; gap: 6px;">
            <button id="btn-toggle-draw" style="padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.82rem; font-weight: 700; cursor: pointer; background: #ffffff; color: #0f172a;">
              ✏️ Draw Annotation
            </button>
            
            <div id="draw-tools-panel" style="display: none; align-items: center; gap: 6px;">
              <input id="draw-color" type="color" value="#dc2626" style="width: 28px; height: 28px; border: none; cursor: pointer; border-radius: 4px; background: none;" title="Pen Color" />
              <button id="btn-clear-draw" style="padding: 5px 10px; border-radius: 6px; border: 1px solid #fca5a5; background: #fef2f2; color: #991b1b; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>

        <!-- QUESTION WORKSPACE WRAPPER WITH ANNOTATION OVERLAY CANVAS -->
        <div style="position: relative; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; overflow: hidden; min-height: 220px;">
          <canvas id="annotation-canvas" style="display: none; position: absolute; inset: 0; z-index: 10; cursor: crosshair; touch-action: none;"></canvas>
          <div id="modal-question-container" style="padding: 18px; display: flex; flex-direction: column; gap: 14px;"></div>
        </div>

        <!-- PROGRESSIVE REVEAL TOGGLES -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px;">
          <button id="btn-toggle-answer" style="flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #3b82f6; background: #eff6ff; color: #1d4ed8; font-weight: 800; cursor: pointer; font-size: 0.88rem;">
            👁️ Show Expected Answer
          </button>
          <button id="btn-toggle-steps" style="flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #059669; background: #ecfdf5; color: #047857; font-weight: 800; cursor: pointer; font-size: 0.88rem;">
            📝 Show Step-by-Step Solution
          </button>
        </div>

        <button id="btn-regen-question" style="align-self: flex-end; padding: 8px 18px; background: #2563eb; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 4px;">
          🔄 Generate Another Sample
        </button>

      </div>
    </div>
  `;
}

export function initQuestionPreviewModal(container, activeSkill) {
  let activeTierForModal = 1;
  let isAnswerVisible = false;
  let isStepsVisible = false;
  let isDrawingActive = false;

  const modalEl = container.querySelector("#skill-preview-modal");
  const canvas = container.querySelector("#annotation-canvas");
  let ctx = canvas ? canvas.getContext("2d") : null;
  let isDrawing = false;

  function resizeAnnotationCanvas() {
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
  }

  function initCanvasListeners() {
    if (!canvas || !ctx) return;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (e) => {
      if (!isDrawingActive) return;
      isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!isDrawing || !isDrawingActive) return;
      const pos = getPos(e);
      const strokeColor = container.querySelector("#draw-color")?.value || "#dc2626";
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDraw = () => { isDrawing = false; };

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);

    canvas.addEventListener("touchstart", startDraw, { passive: true });
    canvas.addEventListener("touchmove", draw, { passive: true });
    canvas.addEventListener("touchend", stopDraw);
  }

  initCanvasListeners();

  container.querySelector("#btn-toggle-draw")?.addEventListener("click", () => {
    isDrawingActive = !isDrawingActive;
    const drawBtn = container.querySelector("#btn-toggle-draw");
    const toolsPanel = container.querySelector("#draw-tools-panel");

    if (isDrawingActive) {
      if (canvas) {
        resizeAnnotationCanvas();
        canvas.style.display = "block";
      }
      if (drawBtn) {
        drawBtn.innerText = "🛑 Stop Annotation";
        drawBtn.style.background = "#dc2626";
        drawBtn.style.color = "#ffffff";
      }
      if (toolsPanel) toolsPanel.style.display = "flex";
    } else {
      if (canvas) canvas.style.display = "none";
      if (drawBtn) {
        drawBtn.innerText = "✏️ Draw Annotation";
        drawBtn.style.background = "#ffffff";
        drawBtn.style.color = "#0f172a";
      }
      if (toolsPanel) toolsPanel.style.display = "none";
    }
  });

  container.querySelector("#btn-clear-draw")?.addEventListener("click", () => {
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  container.querySelector("#btn-close-skill-modal")?.addEventListener("click", () => {
    if (modalEl) modalEl.style.display = "none";
  });

  container.querySelectorAll(".btn-tier-select").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTierForModal = parseInt(btn.getAttribute("data-tier"), 10);
      updateTierButtons();
      renderSampleQuestion();
    });
  });

  container.querySelector("#btn-toggle-answer")?.addEventListener("click", () => {
    isAnswerVisible = !isAnswerVisible;
    updateRevealButtons();
    const ansContainer = container.querySelector("#modal-expected-answer-box");
    if (ansContainer) {
      ansContainer.style.display = isAnswerVisible ? "block" : "none";
      if (isAnswerVisible) renderKaTeX(ansContainer);
    }
  });

  container.querySelector("#btn-toggle-steps")?.addEventListener("click", () => {
    isStepsVisible = !isStepsVisible;
    updateRevealButtons();
    const stepsContainer = container.querySelector("#modal-steps-solution-box");
    if (stepsContainer) {
      stepsContainer.style.display = isStepsVisible ? "block" : "none";
      if (isStepsVisible) renderKaTeX(stepsContainer);
    }
  });

  container.querySelector("#btn-regen-question")?.addEventListener("click", () => {
    renderSampleQuestion();
  });

  function updateTierButtons() {
    container.querySelectorAll(".btn-tier-select").forEach(btn => {
      const tier = parseInt(btn.getAttribute("data-tier"), 10);
      if (tier === activeTierForModal) {
        btn.style.background = "#2563eb";
        btn.style.color = "#ffffff";
      } else {
        btn.style.background = "#ffffff";
        btn.style.color = "#1e293b";
      }
    });
  }

  function updateRevealButtons() {
    const btnAns = container.querySelector("#btn-toggle-answer");
    const btnSteps = container.querySelector("#btn-toggle-steps");

    if (btnAns) {
      btnAns.innerText = isAnswerVisible ? "🙈 Hide Expected Answer" : "👁️ Show Expected Answer";
      btnAns.style.background = isAnswerVisible ? "#3b82f6" : "#eff6ff";
      btnAns.style.color = isAnswerVisible ? "#ffffff" : "#1d4ed8";
    }

    if (btnSteps) {
      btnSteps.innerText = isStepsVisible ? "🙈 Hide Step-by-Step Solution" : "📝 Show Step-by-Step Solution";
      btnSteps.style.background = isStepsVisible ? "#059669" : "#ecfdf5";
      btnSteps.style.color = isStepsVisible ? "#ffffff" : "#047857";
    }
  }

  async function renderSampleQuestion() {
    const qContainer = container.querySelector("#modal-question-container");
    if (!qContainer) return;

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    qContainer.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">Generating sample question...</div>`;

    try {
      const rawPath = activeSkill.generatorPath || "";
      let generatorFn = findGeneratorFunction(rawPath);

      if (!generatorFn && typeof loadQuestionGenerator === "function") {
        try {
          const loadedModule = await loadQuestionGenerator(rawPath);
          if (loadedModule) {
            const genFn = loadedModule.generate || loadedModule.generateQuestion;
            if (typeof genFn === "function") {
              generatorFn = genFn;
              
              if (!state.skillGenerators) state.skillGenerators = {};
              state.skillGenerators[rawPath] = generatorFn;
              const clean = rawPath.trim().replace(/^js\/questions\//, '').replace(/^\/+/, '');
              state.skillGenerators[clean] = generatorFn;
            }
          }
        } catch (loadErr) {
          console.warn("Dynamic generator module import error:", loadErr);
        }
      }
      
      if (typeof generatorFn === "function") {
        const qData = generatorFn(activeTierForModal);

        qContainer.innerHTML = `
          <!-- Question Prompt & Diagram -->
          <div id="modal-prompt-box" style="font-weight: 700; font-size: 1.05rem; line-height: 1.6; color: #0f172a;">
            ${qData.prompt || qData.questionTemplate || ''}
          </div>

          ${qData.diagramSvg ? `<div style="text-align: center; margin: 10px 0;">${qData.diagramSvg}</div>` : ''}
          
          <!-- Expected Answer Container (Progressive Reveal) -->
          <div id="modal-expected-answer-box" style="display: ${isAnswerVisible ? 'block' : 'none'}; background: #e0f2fe; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 8px; font-size: 0.92rem; color: #0369a1;">
            <strong>Expected Answer:</strong> <code>${qData.expectedAnswer || 'N/A'}</code>
          </div>

          <!-- Step-by-Step Solution Container (Progressive Reveal) -->
          <div id="modal-steps-solution-box" style="display: ${isStepsVisible ? 'block' : 'none'}; background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; color: #14532d;">
            <strong style="font-size: 0.92rem;">Step-by-step Solution:</strong>
            ${qData.steps && qData.steps.length > 0 ? `
              <ol style="margin: 8px 0 0 20px; padding: 0;">
                ${qData.steps.map(s => `<li style="margin-bottom: 6px;">${s}</li>`).join('')}
              </ol>
            ` : '<p style="margin: 4px 0 0 0;">No steps provided for this question.</p>'}
          </div>
        `;

        renderKaTeX(qContainer);

      } else {
        const availableKeys = Object.keys(state.skillGenerators || window.skillGenerators || {});
        qContainer.innerHTML = `
          <div style="color: #dc2626; padding: 14px; text-align: left; background: #fef2f2; border-radius: 8px; border: 1px solid #fca5a5;">
            <strong>⚠️ Question Generator Module Not Found</strong>
            <p style="margin: 6px 0; font-size: 0.85rem;">Target Path: <code>${rawPath}</code></p>
            <details style="margin-top: 8px; font-size: 0.8rem; color: #7f1d1d;">
              <summary style="cursor: pointer; font-weight: 700;">View ${availableKeys.length} Loaded Generator Keys</summary>
              <div style="max-height: 120px; overflow-y: auto; margin-top: 6px; background: #fff; padding: 6px; border-radius: 4px; font-family: monospace;">
                ${availableKeys.length > 0 ? availableKeys.map(k => `<div>• ${k}</div>`).join('') : 'No generator functions currently registered in state.skillGenerators.'}
              </div>
            </details>
          </div>
        `;
      }
    } catch (err) {
      console.error("Error generating sample question:", err);
      qContainer.innerHTML = `
        <div style="color: #dc2626; padding: 14px; text-align: center;">
          Failed to generate sample question: ${err.message}
        </div>
      `;
    }
  }

  container.querySelector("#modal-skill-title").innerText = activeSkill.title;
  container.querySelector("#modal-skill-strand").innerText = `${activeSkill.strand || 'General'} | Level ${activeSkill.level || 'All'} (${activeSkill.stream || 'Express'})`;
  
  updateTierButtons();
  updateRevealButtons();
  renderSampleQuestion();
  
  if (modalEl) modalEl.style.display = "flex";
  setTimeout(resizeAnnotationCanvas, 100);
}
