import { state } from "../../state.js";
import { loadQuestionGenerator } from "../../questions/loader.js";
import { renderKaTeX } from "../../utils/katexHelper.js";
import { findGeneratorFunction } from "./helperUtils.js";

export function renderQuestionPreviewModalHTML() {
  return `
    <div id="skill-preview-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); z-index: 110; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px);">
      <div id="modal-card-container" style="background: #ffffff; width: 94vw; max-width: 1100px; height: 88vh; border-radius: 18px; padding: 20px 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column; gap: 12px; position: relative; transition: all 0.2s ease; box-sizing: border-box;">
        
        <!-- HEADER TOOLBAR -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px;">
          <div>
            <h3 id="modal-skill-title" style="margin: 0; font-size: 1.3rem; color: #0f172a; font-weight: 800;">Skill Preview</h3>
            <span id="modal-skill-strand" style="font-size: 0.84rem; color: #64748b; font-weight: 600;">Curriculum Skill</span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-toggle-fullscreen" style="padding: 6px 14px; border-radius: 8px; border: 1.5px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 0.85rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              ⛶ Fullscreen
            </button>
            <button id="btn-close-skill-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer; color: #64748b; padding: 0 4px;">✕</button>
          </div>
        </div>

        <!-- CONTROLS & ANNOTATION TOOLBAR -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: #f8fafc; padding: 8px 14px; border-radius: 12px; border: 1px solid #e2e8f0; gap: 10px;">
          
          <!-- Difficulty Tier Selectors -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 800; font-size: 0.84rem; color: #334155;">Difficulty:</span>
            <button class="btn-tier-select" data-tier="1" style="padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.8rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 1 (Basic)</button>
            <button class="btn-tier-select" data-tier="2" style="padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.8rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 2 (Int.)</button>
            <button class="btn-tier-select" data-tier="3" style="padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.8rem; font-weight: 700; cursor: pointer; background: #ffffff;">Tier 3 (Adv.)</button>
          </div>

          <!-- Annotation Toolset -->
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span style="font-weight: 800; font-size: 0.84rem; color: #334155;">Tools:</span>
            
            <button id="btn-tool-move" class="btn-annotation-tool active" style="padding: 5px 12px; border-radius: 8px; border: 1.5px solid #2563eb; background: #eff6ff; color: #1d4ed8; font-size: 0.82rem; font-weight: 700; cursor: pointer;" title="Scroll and interact with working">
              ✋ Move / Scroll
            </button>
            
            <button id="btn-tool-pen" class="btn-annotation-tool" style="padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 0.82rem; font-weight: 700; cursor: pointer;" title="Draw on screen">
              ✏️ Pen
            </button>
            
            <button id="btn-tool-eraser" class="btn-annotation-tool" style="padding: 5px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 0.82rem; font-weight: 700; cursor: pointer;" title="Erase annotations">
              🧹 Eraser
            </button>

            <input id="draw-color" type="color" value="#dc2626" style="width: 30px; height: 30px; border: none; cursor: pointer; border-radius: 6px; background: none;" title="Pen Color" />

            <button id="btn-tool-clear" style="padding: 5px 10px; border-radius: 8px; border: 1px solid #fca5a5; background: #fef2f2; color: #991b1b; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
              🗑️ Clear
            </button>
          </div>
        </div>

        <!-- MAXIMIZED WORKSPACE VIEWPORT WITH SCROLLABLE CONTENT & CANVAS OVERLAY -->
        <div style="flex: 1; min-height: 0; position: relative; border: 1.5px solid #cbd5e1; border-radius: 14px; background: #ffffff; overflow: hidden;">
          
          <div id="modal-workspace-scroll" style="height: 100%; overflow-y: auto; overflow-x: hidden; position: relative; padding: 20px; box-sizing: border-box;">
            
            <canvas id="annotation-canvas" style="position: absolute; top: 0; left: 0; z-index: 5; pointer-events: none; touch-action: none;"></canvas>
            
            <div id="modal-question-container" style="position: relative; z-index: 1; display: flex; flex-direction: column; gap: 16px;"></div>

          </div>

        </div>

        <!-- BOTTOM ACTIONS & REVEAL TOGGLES -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; gap: 10px; flex: 1; min-width: 280px;">
            <button id="btn-toggle-answer" style="flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid #3b82f6; background: #eff6ff; color: #1d4ed8; font-weight: 800; cursor: pointer; font-size: 0.88rem;">
              👁️ Show Expected Answer
            </button>
            <button id="btn-toggle-steps" style="flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid #059669; background: #ecfdf5; color: #047857; font-weight: 800; cursor: pointer; font-size: 0.88rem;">
              📝 Show Step-by-Step Solution
            </button>
          </div>

          <button id="btn-regen-question" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 0.88rem; box-shadow: 0 2px 6px rgba(37,99,235,0.2);">
            🔄 Generate Another Sample
          </button>
        </div>

      </div>
    </div>
  `;
}

export function initQuestionPreviewModal(container, activeSkill) {
  let activeTierForModal = 1;
  let isAnswerVisible = false;
  let isStepsVisible = false;
  let isFullscreen = false;
  
  // Canvas Annotation State: 'move' | 'pen' | 'eraser'
  let currentTool = "move";
  let isDrawing = false;

  const modalEl = container.querySelector("#skill-preview-modal");
  const cardEl = container.querySelector("#modal-card-container");
  const scrollEl = container.querySelector("#modal-workspace-scroll");
  const canvas = container.querySelector("#annotation-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  // Offscreen canvas buffer to preserve drawings when canvas sizes dynamically
  const offscreenCanvas = document.createElement("canvas");
  const offscreenCtx = offscreenCanvas.getContext("2d");

  function syncCanvasSize() {
    if (!canvas || !scrollEl || !ctx) return;

    const newWidth = scrollEl.clientWidth;
    const newHeight = Math.max(scrollEl.scrollHeight, scrollEl.clientHeight);

    if (canvas.width === newWidth && canvas.height === newHeight) return;

    // Store existing artwork in offscreen buffer
    if (canvas.width > 0 && canvas.height > 0) {
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      offscreenCtx.drawImage(canvas, 0, 0);
    }

    // Resize main canvas
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Restore artwork
    if (offscreenCanvas.width > 0 && offscreenCanvas.height > 0) {
      ctx.drawImage(offscreenCanvas, 0, 0);
    }
  }

  function updateToolState() {
    const moveBtn = container.querySelector("#btn-tool-move");
    const penBtn = container.querySelector("#btn-tool-pen");
    const eraserBtn = container.querySelector("#btn-tool-eraser");

    [moveBtn, penBtn, eraserBtn].forEach(btn => {
      if (!btn) return;
      btn.style.background = "#ffffff";
      btn.style.color = "#334155";
      btn.style.borderColor = "#cbd5e1";
    });

    if (!canvas) return;

    if (currentTool === "move") {
      canvas.style.pointerEvents = "none";
      if (moveBtn) {
        moveBtn.style.background = "#eff6ff";
        moveBtn.style.color = "#1d4ed8";
        moveBtn.style.borderColor = "#2563eb";
      }
    } else if (currentTool === "pen") {
      canvas.style.pointerEvents = "auto";
      canvas.style.cursor = "crosshair";
      if (penBtn) {
        penBtn.style.background = "#eff6ff";
        penBtn.style.color = "#1d4ed8";
        penBtn.style.borderColor = "#2563eb";
      }
    } else if (currentTool === "eraser") {
      canvas.style.pointerEvents = "auto";
      canvas.style.cursor = "cell";
      if (eraserBtn) {
        eraserBtn.style.background = "#fef2f2";
        eraserBtn.style.color = "#991b1b";
        eraserBtn.style.borderColor = "#fca5a5";
      }
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
      if (currentTool === "move") return;
      isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!isDrawing || currentTool === "move") return;
      const pos = getPos(e);

      if (currentTool === "pen") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = container.querySelector("#draw-color")?.value || "#dc2626";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      } else if (currentTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 20;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }

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

  // Toolbar Tool Handlers
  container.querySelector("#btn-tool-move")?.addEventListener("click", () => { currentTool = "move"; updateToolState(); });
  container.querySelector("#btn-tool-pen")?.addEventListener("click", () => { currentTool = "pen"; syncCanvasSize(); updateToolState(); });
  container.querySelector("#btn-tool-eraser")?.addEventListener("click", () => { currentTool = "eraser"; syncCanvasSize(); updateToolState(); });

  container.querySelector("#btn-tool-clear")?.addEventListener("click", () => {
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      offscreenCanvas.width = 0;
      offscreenCanvas.height = 0;
    }
  });

  // Fullscreen Handler
  container.querySelector("#btn-toggle-fullscreen")?.addEventListener("click", () => {
    isFullscreen = !isFullscreen;
    const fsBtn = container.querySelector("#btn-toggle-fullscreen");

    if (isFullscreen) {
      cardEl.style.width = "100vw";
      cardEl.style.maxWidth = "100vw";
      cardEl.style.height = "100vh";
      cardEl.style.borderRadius = "0";
      cardEl.style.padding = "16px 20px";
      if (fsBtn) fsBtn.innerText = "🗗 Exit Fullscreen";
    } else {
      cardEl.style.width = "94vw";
      cardEl.style.maxWidth = "1100px";
      cardEl.style.height = "88vh";
      cardEl.style.borderRadius = "18px";
      cardEl.style.padding = "20px 24px";
      if (fsBtn) fsBtn.innerText = "⛶ Fullscreen";
    }

    setTimeout(syncCanvasSize, 100);
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
    setTimeout(syncCanvasSize, 50);
  });

  container.querySelector("#btn-toggle-steps")?.addEventListener("click", () => {
    isStepsVisible = !isStepsVisible;
    updateRevealButtons();
    const stepsContainer = container.querySelector("#modal-steps-solution-box");
    if (stepsContainer) {
      stepsContainer.style.display = isStepsVisible ? "block" : "none";
      if (isStepsVisible) renderKaTeX(stepsContainer);
    }
    setTimeout(syncCanvasSize, 50);
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
        btn.style.borderColor = "#2563eb";
      } else {
        btn.style.background = "#ffffff";
        btn.style.color = "#1e293b";
        btn.style.borderColor = "#cbd5e1";
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

  // Ensures KaTeX math formatting for strings missing math delimiters
  function formatMathString(str) {
    if (!str) return 'N/A';
    const trimmed = String(str).trim();
    if (trimmed.startsWith('$') || trimmed.includes('\\(')) return trimmed;
    return `$${trimmed}$`;
  }

  async function renderSampleQuestion() {
    const qContainer = container.querySelector("#modal-question-container");
    if (!qContainer) return;

    qContainer.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px; font-weight: 700;">Generating sample question...</div>`;

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
          <!-- Question Prompt & Optional Diagram -->
          <div id="modal-prompt-box" style="font-weight: 700; font-size: 1.1rem; line-height: 1.65; color: #0f172a; background: #fafafa; padding: 16px 20px; border-radius: 12px; border: 1px solid #f1f5f9;">
            ${qData.prompt || qData.questionTemplate || ''}
          </div>

          ${qData.diagramSvg ? `<div style="text-align: center; margin: 10px 0;">${qData.diagramSvg}</div>` : ''}
          
          <!-- Expected Answer Container with KaTeX Math Formatting -->
          <div id="modal-expected-answer-box" style="display: ${isAnswerVisible ? 'block' : 'none'}; background: #e0f2fe; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 10px; font-size: 1rem; color: #0369a1;">
            <strong style="font-size: 0.95rem; color: #0369a1; display: block; margin-bottom: 4px;">Expected Answer:</strong>
            <div class="math-answer-content" style="font-size: 1.1rem; font-weight: 700; color: #0f172a;">
              ${formatMathString(qData.expectedAnswer)}
            </div>
          </div>

          <!-- Step-by-Step Solution Container -->
          <div id="modal-steps-solution-box" style="display: ${isStepsVisible ? 'block' : 'none'}; background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 10px; font-size: 0.95rem; color: #14532d;">
            <strong style="font-size: 1rem; color: #15803d; display: block; margin-bottom: 8px;">Step-by-step Solution:</strong>
            ${qData.steps && qData.steps.length > 0 ? `
              <ol style="margin: 0; padding-left: 22px; display: flex; flex-direction: column; gap: 8px;">
                ${qData.steps.map(s => `<li style="line-height: 1.6;">${s}</li>`).join('')}
              </ol>
            ` : '<p style="margin: 0;">No steps provided for this question.</p>'}
          </div>
        `;

        renderKaTeX(qContainer);

      } else {
        const availableKeys = Object.keys(state.skillGenerators || window.skillGenerators || {});
        qContainer.innerHTML = `
          <div style="color: #dc2626; padding: 16px; text-align: left; background: #fef2f2; border-radius: 10px; border: 1px solid #fca5a5;">
            <strong>⚠️ Question Generator Module Not Found</strong>
            <p style="margin: 6px 0; font-size: 0.88rem;">Target Path: <code>${rawPath}</code></p>
            <details style="margin-top: 8px; font-size: 0.82rem; color: #7f1d1d;">
              <summary style="cursor: pointer; font-weight: 700;">View ${availableKeys.length} Loaded Generator Keys</summary>
              <div style="max-height: 140px; overflow-y: auto; margin-top: 6px; background: #fff; padding: 8px; border-radius: 6px; font-family: monospace;">
                ${availableKeys.length > 0 ? availableKeys.map(k => `<div>• ${k}</div>`).join('') : 'No generator functions currently registered.'}
              </div>
            </details>
          </div>
        `;
      }
    } catch (err) {
      console.error("Error generating sample question:", err);
      qContainer.innerHTML = `
        <div style="color: #dc2626; padding: 16px; text-align: center;">
          Failed to generate sample question: ${err.message}
        </div>
      `;
    }

    setTimeout(syncCanvasSize, 100);
  }

  container.querySelector("#modal-skill-title").innerText = activeSkill.title;
  container.querySelector("#modal-skill-strand").innerText = `${activeSkill.strand || 'General'} | Level ${activeSkill.level || 'All'} (${activeSkill.stream || 'Express'})`;
  
  updateTierButtons();
  updateRevealButtons();
  updateToolState();
  renderSampleQuestion();
  
  if (modalEl) modalEl.style.display = "flex";
  setTimeout(syncCanvasSize, 120);
}
