// Globally disable MathLive error beep audio alerts
if (window.MathfieldElement) {
  window.MathfieldElement.soundsDirectory = null;
}

export const STANDARD_KEYPADS = {
  basic: [
    "x", "y", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "×",
    "1", "2", "3", "-",
    "0", ".", "=", "+",
    "←", "→", "⌫", "Clear"
  ],
  math: [
    "x²", "xⁿ", "√", "π",
    "<", ">", "≤", "≥",
    "a", "b", "c", "θ",
    "no solution", "", "", "",
    "", "", "", "",
    "←", "→", "⌫", "Clear"
  ]
};

export function initKeypad(container, customKeys = null, onInputChange, onSubmit) {
  const displayContainer = container.querySelector("#keypad-display");
  const gridEl = container.querySelector(".keypad-grid");
  if (!displayContainer || !gridEl) return;

  let activeTab = "basic"; // 'basic' or 'math'
  let isSubmitted = false;

  // 1. MOUNT INPUT FIELD & TOGGLE BUTTON HTML (ONCE)
  displayContainer.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: center; width: 100%;">
      <!-- INPUT FIELD (Min-height 52px prevents UI shifts when fractions expand) -->
      <div id="math-field-wrapper" style="
        flex: 1;
        min-height: 52px;
        max-height: 72px;
        padding: 4px 10px;
        background: #ffffff;
        border: 2px solid #cbd5e1;
        border-radius: 10px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        transition: all 0.15s ease-in-out;
        overflow-y: auto;
      ">
        <math-field id="math-input" style="
          width: 100%;
          font-size: 1.2rem;
          border: none;
          outline: none;
          background: transparent;
        "></math-field>
      </div>

      <!-- MODE TOGGLE BUTTON (BESIDE INPUT) -->
      <button type="button" id="btn-toggle-keypad-mode" style="
        height: 52px;
        padding: 0 12px;
        font-size: 0.82rem;
        font-weight: 800;
        border-radius: 10px;
        border: 1.5px solid #cbd5e1;
        background: #f8fafc;
        color: #1e293b;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      ">
        ∛ Math
      </button>
    </div>
  `;

  const mathField = displayContainer.querySelector("#math-input");
  const fieldWrapper = displayContainer.querySelector("#math-field-wrapper");
  const toggleBtn = displayContainer.querySelector("#btn-toggle-keypad-mode");

  // 2. MATHLIVE INPUT LISTENER (ATTACHED ONCE)
  if (mathField) {
    mathField.mathVirtualKeyboardPolicy = "manual";

    mathField.addEventListener("input", () => {
      const val = mathField.value || "";
      
      if (val.includes("\\frac") || val.includes("^{")) {
        fieldWrapper.style.minHeight = "66px";
      } else {
        fieldWrapper.style.minHeight = "52px";
      }

      if (typeof onInputChange === "function") {
        onInputChange(val);
      }
    });
  }

  // 3. MODE TOGGLE LISTENER (ATTACHED ONCE)
  toggleBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    activeTab = activeTab === "basic" ? "math" : "basic";

    if (toggleBtn) {
      toggleBtn.innerText = activeTab === 'basic' ? '∛ Math' : '🔢 Basic';
      toggleBtn.style.background = activeTab === 'math' ? '#eff6ff' : '#f8fafc';
      toggleBtn.style.color = activeTab === 'math' ? '#1d4ed8' : '#1e293b';
      toggleBtn.style.borderColor = activeTab === 'math' ? '#93c5fd' : '#cbd5e1';
    }

    renderGrid();
  });

  // Helper to retrieve keys per mode tab
  function getKeysForTab(tab) {
    if (tab === "basic") return STANDARD_KEYPADS.basic;

    const baseMath = [...STANDARD_KEYPADS.math];
    if (Array.isArray(customKeys) && customKeys.length > 0) {
      const flatCustom = customKeys.flat();
      flatCustom.forEach(k => {
        if (!baseMath.includes(k) && !STANDARD_KEYPADS.basic.includes(k) && k !== "Submit" && k !== "Skip") {
          const emptyIdx = baseMath.indexOf("");
          if (emptyIdx !== -1) {
            baseMath[emptyIdx] = k;
          }
        }
      });
    }
    return baseMath;
  }

  // 4. GRID RENDERER (ONLY UPDATES HTML - NO EVENT BINDING HERE)
  function renderGrid() {
    const keysToRender = getKeysForTab(activeTab);

    const buttonsHTML = keysToRender.map(key => {
      if (key === "") {
        return `<div style="background: #f8fafc; border-radius: 8px; border: 1px dashed #e2e8f0; opacity: 0.4;"></div>`;
      }

      const isClear = key === "Clear";
      const isBack = key === "⌫";
      const isAction = isBack || isClear;
      const isNav = key === "←" || key === "→";
      const isSpecial = key === "no solution";

      return `
        <button type="button" class="keypad-btn ${isAction ? 'action' : ''} ${isNav ? 'nav-btn' : ''}" data-key="${key}" style="
          padding: ${isSpecial ? '4px 2px' : '7px 2px'};
          font-size: ${isSpecial ? '0.75rem' : '1.05rem'};
          font-weight: 700;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          cursor: pointer;
          background: ${isAction ? '#fee2e2' : '#ffffff'};
          color: ${isAction ? '#991b1b' : '#0f172a'};
          box-shadow: 0 2px 0 #cbd5e1;
          touch-action: manipulation;
        ">
          ${key}
        </button>
      `;
    }).join("");

    const submitHTML = `
      <button id="btn-keypad-submit" type="button" class="keypad-btn submit" style="
        grid-column: span 4;
        margin-top: 4px;
        padding: 10px;
        font-size: 0.98rem;
        font-weight: 800;
        background: ${isSubmitted ? '#10b981' : '#2563eb'};
        color: #ffffff;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0 3px 8px rgba(37, 99, 235, 0.25);
      ">
        ${isSubmitted ? 'Next Question ➔' : 'Submit'}
      </button>
    `;

    gridEl.style.display = "grid";
    gridEl.style.gridTemplateColumns = "repeat(4, minmax(0, 1fr))";
    gridEl.style.gap = "5px";
    gridEl.innerHTML = buttonsHTML + submitHTML;
  }

  // 5. EVENT DELEGATION FOR KEYPAD GRID (ATTACHED ONCE TO gridEl)
  gridEl.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".keypad-btn")) {
      e.preventDefault();
    }
  });

  gridEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".keypad-btn");
    if (!btn) return;
    e.preventDefault();

    const key = btn.getAttribute("data-key");

    // Handle Submit / Next Action
    if (btn.id === "btn-keypad-submit") {
      if (!isSubmitted) {
        const val = mathField ? (mathField.value || "") : "";
        if (!val.trim()) return;
        isSubmitted = true;
        if (typeof onSubmit === "function") onSubmit(val);
        btn.innerText = "Next Question ➔";
        btn.style.background = "#10b981";
      } else {
        container.dispatchEvent(new CustomEvent("triggerNextQuestion"));
      }
      return;
    }

    if (isSubmitted || !mathField) return;

    mathField.focus();

    // MathLive Command Execution
    if (key === "/" || key === "a/b") {
      mathField.executeCommand(["insert", "\\frac{#0}{#?}"]);
    } else if (key === "^" || key === "xⁿ") {
      mathField.executeCommand(["insert", "^{#?}"]);
    } else if (key === "x²") {
      mathField.executeCommand(["insert", "^{2}"]);
    } else if (key === "√") {
      mathField.executeCommand(["insert", "\\sqrt{#?}"]);
    } else if (key === "←") {
      mathField.executeCommand("moveToPreviousChar");
    } else if (key === "→") {
      mathField.executeCommand("moveToNextChar");
    } else if (key === "⌫") {
      mathField.executeCommand("deleteBackward");
    } else if (key === "Clear") {
      mathField.setValue("");
    } else if (key === "×") {
      mathField.executeCommand(["insert", "\\times"]);
    } else if (key === "≤") {
      mathField.executeCommand(["insert", "\\le"]);
    } else if (key === "≥") {
      mathField.executeCommand(["insert", "\\ge"]);
    } else if (key === "π") {
      mathField.executeCommand(["insert", "\\pi"]);
    } else if (key === "θ") {
      mathField.executeCommand(["insert", "\\theta"]);
    } else {
      mathField.executeCommand(["insert", key]);
    }

    if (typeof onInputChange === "function") {
      onInputChange(mathField.value || "");
    }
  });

  // Initial render call
  renderGrid();
}
