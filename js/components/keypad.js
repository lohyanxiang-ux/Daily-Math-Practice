// Globally disable MathLive error beep audio alerts
if (window.MathfieldElement) {
  window.MathfieldElement.soundsDirectory = null;
}

export const STANDARD_KEYPADS = {
  basic: [
    "(", ")", "/", "×",
    "7", "8", "9", "-",
    "4", "5", "6", "+",
    "1", "2", "3", ".",
    "0", "⌫", "←", "→",
    "Clear"
  ],
  math: [
    "x", "y", "z", "=",
    "x²", "xⁿ", "√", "π",
    "<", ">", "≤", "≥",
    "a", "b", "c", "θ",
    "no solution", "", "", "",
    "Clear"
  ]
};

export function initKeypad(container, customKeys = null, onInputChange, onSubmit) {
  const displayContainer = container.querySelector("#keypad-display");
  const gridEl = container.querySelector(".keypad-grid");
  if (!displayContainer || !gridEl) return;

  let activeTab = "basic"; // 'basic' or 'math'
  let isSubmitted = false;

  // Mount Auto-Expanding MathLive Field
  displayContainer.innerHTML = `
    <div id="math-field-wrapper" style="
      width: 100%;
      min-height: 44px;
      max-height: 85px;
      padding: 4px 8px;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      transition: all 0.2s ease-in-out;
      overflow-y: auto;
    ">
      <math-field id="math-input" style="
        width: 100%;
        font-size: 1.15rem;
        border: none;
        outline: none;
        background: transparent;
      "></math-field>
    </div>
  `;

  const mathField = displayContainer.querySelector("#math-input");
  const fieldWrapper = displayContainer.querySelector("#math-field-wrapper");

  if (mathField) {
    mathField.mathVirtualKeyboardPolicy = "manual";

    mathField.addEventListener("input", () => {
      const val = mathField.value || "";
      
      // Auto-expand field height when fraction or power structure is present
      if (val.includes("\\frac") || val.includes("^{")) {
        fieldWrapper.style.minHeight = "72px";
      } else {
        fieldWrapper.style.minHeight = "44px";
      }

      if (typeof onInputChange === "function") {
        onInputChange(val);
      }
    });
  }

  // Generate combined Math mode keys (merging custom keys like 'no solution' if provided)
  function getKeysForTab(tab) {
    if (tab === "basic") return STANDARD_KEYPADS.basic;

    const baseMath = [...STANDARD_KEYPADS.math];
    if (Array.isArray(customKeys) && customKeys.length > 0) {
      const flatCustom = customKeys.flat();
      flatCustom.forEach(k => {
        if (!baseMath.includes(k) && !STANDARD_KEYPADS.basic.includes(k) && k !== "Submit" && k !== "Skip") {
          // Fill first available blank slot
          const emptyIdx = baseMath.indexOf("");
          if (emptyIdx !== -1) {
            baseMath[emptyIdx] = k;
          }
        }
      });
    }
    return baseMath;
  }

  function renderGrid() {
    const keysToRender = getKeysForTab(activeTab);

    // Mode Switcher Header Row
    const headerHTML = `
      <div style="grid-column: span 4; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">
          ${activeTab === 'basic' ? '🔢 Basic Mode' : '∛ Math Symbols'}
        </span>
        <button type="button" id="btn-toggle-keypad-mode" style="
          padding: 4px 10px;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #f1f5f9;
          color: #1e293b;
          cursor: pointer;
        ">
          ${activeTab === 'basic' ? 'Switch to ∛ Math' : 'Switch to 🔢 Basic'}
        </button>
      </div>
    `;

    // 4-Column Grid Buttons
    const buttonsHTML = keysToRender.map(key => {
      if (key === "") {
        return `<div style="background: #f8fafc; border-radius: 8px; border: 1px dashed #e2e8f0; opacity: 0.5;"></div>`;
      }

      const isClear = key === "Clear";
      const isAction = key === "⌫" || isClear;
      const isNav = key === "←" || key === "→";
      const isSpecial = key === "no solution";

      const gridSpan = isClear ? "grid-column: span 4;" : "";

      return `
        <button type="button" class="keypad-btn ${isAction ? 'action' : ''} ${isNav ? 'nav-btn' : ''}" data-key="${key}" style="
          ${gridSpan}
          padding: ${isSpecial ? '6px 2px' : '10px 4px'};
          font-size: ${isSpecial ? '0.78rem' : '1.02rem'};
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

    // Bottom Full-Width Submit Button
    const submitHTML = `
      <button id="btn-keypad-submit" type="button" class="keypad-btn submit" style="
        grid-column: span 4;
        margin-top: 6px;
        padding: 12px;
        font-size: 1rem;
        font-weight: 800;
        background: ${isSubmitted ? '#10b981' : '#2563eb'};
        color: #ffffff;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
      ">
        ${isSubmitted ? 'Next Question ➔' : 'Submit'}
      </button>
    `;

    gridEl.style.display = "grid";
    gridEl.style.gridTemplateColumns = "repeat(4, 1fr)";
    gridEl.style.gap = "6px";
    gridEl.innerHTML = headerHTML + buttonsHTML + submitHTML;

    attachEvents();
  }

  function attachEvents() {
    // Mode Switcher Toggle
    gridEl.querySelector("#btn-toggle-keypad-mode")?.addEventListener("click", () => {
      activeTab = activeTab === "basic" ? "math" : "basic";
      renderGrid();
    });

    // Key Buttons Event Handlers
    gridEl.querySelectorAll(".keypad-btn").forEach(btn => {
      btn.addEventListener("pointerdown", (e) => e.preventDefault());

      btn.addEventListener("click", (e) => {
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
    });
  }

  renderGrid();
}
