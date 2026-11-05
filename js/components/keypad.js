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
    "", "", "", "",
    "", "", "", "",
    "←", "→", "⌫", "Clear"
  ]
};

/**
 * Returns color-coding styles based on key type
 */
function getKeyStyle(key) {
  // 1. Delete & Clear
  if (key === "Clear" || key === "⌫") {
    return { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5", shadow: "#f87171" };
  }
  // 2. Navigation
  if (key === "←" || key === "→") {
    return { bg: "#f1f5f9", color: "#334155", border: "#cbd5e1", shadow: "#94a3b8" };
  }
  // 3. Basic Arithmetic Operators
  if (["+", "-", "×", "/", "="].includes(key)) {
    return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", shadow: "#93c5fd" };
  }
  // 4. Algebraic Variables & Constants
  if (["x", "y", "a", "b", "c", "π", "θ"].includes(key)) {
    return { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe", shadow: "#c4b5fd" };
  }
  // 5. Parentheses, Powers & Roots
  if (["(", ")", "x²", "xⁿ", "√"].includes(key)) {
    return { bg: "#ecfeff", color: "#0891b2", border: "#a5f3fc", shadow: "#67e8f9" };
  }
  // 6. Inequality Relations
  if (["<", ">", "≤", "≥"].includes(key)) {
    return { bg: "#fffbeb", color: "#b45309", border: "#fde68a", shadow: "#fcd34d" };
  }
  // 7. Numerals & Decimal (Default)
  return { bg: "#ffffff", color: "#0f172a", border: "#cbd5e1", shadow: "#cbd5e1" };
}

export function initKeypad(container, config = null, onInputChange, onSubmit) {
  const displayContainer = container.querySelector("#keypad-display");
  const gridEl = container.querySelector(".keypad-grid");
  if (!displayContainer || !gridEl) return;

  // Extract Multi-Input Configuration
  const isConfigObj = config && typeof config === "object" && !Array.isArray(config);
  const inputCount = isConfigObj && config.inputCount ? config.inputCount : 1;
  const inputLabels = isConfigObj && config.inputLabels ? config.inputLabels : ["x =", "or x ="];
  const customKeys = Array.isArray(config) ? config : (isConfigObj ? config.customKeys || config.keys || null : null);

  let activeTab = "basic"; // 'basic' or 'math'
  let isSubmitted = false;
  let activeFieldIndex = 0;

  function cleanValue(rawVal) {
    if (!rawVal) return "";
    return rawVal
      .replace(/\u2212|\u2013|\u2014|\\text\{-\}/g, "-")
      .replace(/\\placeholder(\{[^{}]*\}|\[[^{}]*\])?/g, "")
      .replace(/#\?/g, "")
      .replace(/#0/g, "");
  }

  // 1. RENDER DYNAMIC INPUT FIELD HTML
  let inputsHTML = "";
  if (inputCount > 1) {
    inputsHTML = `
      <div style="display: flex; gap: 6px; width: 100%; min-width: 0; align-items: center; flex: 1;">
        ${Array.from({ length: inputCount }).map((_, idx) => `
          <div class="math-field-wrapper" data-index="${idx}" style="
            flex: 1;
            min-width: 0;
            min-height: 46px;
            max-height: 64px;
            padding: 2px 8px;
            background: #ffffff;
            border: 2px solid ${idx === 0 ? '#2563eb' : '#cbd5e1'};
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 4px;
            box-sizing: border-box;
            transition: all 0.15s ease-in-out;
            overflow: hidden;
            cursor: pointer;
          ">
            <span style="font-size: 0.82rem; font-weight: 800; color: #475569; white-space: nowrap; flex-shrink: 0;">${inputLabels[idx] || `x<sub>${idx + 1}</sub> =`}</span>
            <math-field class="math-input" data-index="${idx}" style="
              width: 100%;
              min-width: 0;
              font-size: 1.1rem;
              border: none;
              outline: none;
              background: transparent;
            "></math-field>
          </div>
        `).join("")}
      </div>
    `;
  } else {
    inputsHTML = `
      <div class="math-field-wrapper active" data-index="0" style="
        flex: 1;
        min-width: 0;
        min-height: 46px;
        max-height: 64px;
        padding: 2px 8px;
        background: #ffffff;
        border: 2px solid #cbd5e1;
        border-radius: 10px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        transition: all 0.15s ease-in-out;
        overflow: hidden;
      ">
        <math-field class="math-input" data-index="0" style="
          width: 100%;
          min-width: 0;
          font-size: 1.15rem;
          border: none;
          outline: none;
          background: transparent;
        "></math-field>
      </div>
    `;
  }

  displayContainer.innerHTML = `
    <div style="display: flex; gap: 6px; align-items: center; width: 100%; box-sizing: border-box;">
      ${inputsHTML}

      <!-- MODE TOGGLE BUTTON -->
      <button type="button" id="btn-toggle-keypad-mode" style="
        height: 46px;
        padding: 0 10px;
        font-size: 0.8rem;
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
        gap: 2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      ">
        ∛ Math
      </button>
    </div>
  `;

  const mathFields = Array.from(displayContainer.querySelectorAll(".math-input"));
  const wrappers = Array.from(displayContainer.querySelectorAll(".math-field-wrapper"));
  const toggleBtn = displayContainer.querySelector("#btn-toggle-keypad-mode");

  function getCurrentValues() {
    if (inputCount > 1) {
      return mathFields.map(f => cleanValue(f.value || ""));
    }
    return mathFields[0] ? cleanValue(mathFields[0].value || "") : "";
  }

  function setActiveField(index) {
    activeFieldIndex = index;
    wrappers.forEach((wrap, idx) => {
      if (idx === activeFieldIndex) {
        wrap.style.borderColor = "#2563eb";
        wrap.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.15)";
      } else {
        wrap.style.borderColor = "#cbd5e1";
        wrap.style.boxShadow = "none";
      }
    });
  }

  // 2. ATTACH LISTENERS TO MATHLIVE FIELDS
  mathFields.forEach((mf, idx) => {
    mf.mathVirtualKeyboardPolicy = "manual";
    mf.menuItems = [];
    
    if ("smartFence" in mf) {
      mf.smartFence = false;
    }

    mf.addEventListener("focus", () => setActiveField(idx));
    mf.parentElement?.addEventListener("click", () => {
      setActiveField(idx);
      mf.focus();
    });

    mf.addEventListener("input", () => {
      const val = mf.value || "";
      const wrapper = wrappers[idx];
      
      if (wrapper) {
        if (val.includes("\\frac") || val.includes("^{")) {
          wrapper.style.minHeight = "58px";
        } else {
          wrapper.style.minHeight = "46px";
        }
      }

      if (typeof onInputChange === "function") {
        onInputChange(getCurrentValues());
      }
    });
  });

  setActiveField(0);

  // 3. MODE TOGGLE LISTENER
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

  // 4. GRID RENDERER WITH COLOR CODING
  function renderGrid() {
    const keysToRender = getKeysForTab(activeTab);

    const buttonsHTML = keysToRender.map(key => {
      if (key === "") {
        return `<div style="background: #f8fafc; border-radius: 6px; border: 1px dashed #e2e8f0; opacity: 0.4;"></div>`;
      }

      const style = getKeyStyle(key);

      return `
        <button type="button" class="keypad-btn" data-key="${key}" style="
          padding: 5px 2px;
          font-size: 0.95rem;
          font-weight: 700;
          border: 1px solid ${style.border};
          border-radius: 8px;
          cursor: pointer;
          background: ${style.bg};
          color: ${style.color};
          box-shadow: 0 1.5px 0 ${style.shadow};
          touch-action: manipulation;
          box-sizing: border-box;
          transition: transform 0.05s ease;
        ">
          ${key}
        </button>
      `;
    }).join("");

    const submitHTML = `
      <button id="btn-keypad-submit" type="button" class="keypad-btn submit" style="
        grid-column: span 4;
        margin-top: 2px;
        padding: 8px 10px;
        font-size: 0.92rem;
        font-weight: 800;
        background: ${isSubmitted ? '#10b981' : '#2563eb'};
        color: #ffffff;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
        touch-action: manipulation;
      ">
        ${isSubmitted ? 'Next Question ➔' : 'Submit'}
      </button>
    `;

    gridEl.style.display = "grid";
    gridEl.style.gridTemplateColumns = "repeat(4, minmax(0, 1fr))";
    gridEl.style.gap = "4px";
    gridEl.style.boxSizing = "border-box";
    gridEl.innerHTML = buttonsHTML + submitHTML;
  }

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

    if (btn.id === "btn-keypad-submit") {
      if (!isSubmitted) {
        const currentVals = getCurrentValues();
        const isEmpty = Array.isArray(currentVals) 
          ? currentVals.every(v => !v.trim()) 
          : !currentVals.trim();

        if (isEmpty) return;
        isSubmitted = true;
        if (typeof onSubmit === "function") onSubmit(currentVals);
        btn.innerText = "Next Question ➔";
        btn.style.background = "#10b981";
      } else {
        container.dispatchEvent(new CustomEvent("triggerNextQuestion"));
      }
      return;
    }

    if (isSubmitted) return;

    const currentMathField = mathFields[activeFieldIndex] || mathFields[0];
    if (!currentMathField) return;

    currentMathField.focus();

    if (key === "/" || key === "a/b") {
      currentMathField.executeCommand(["insert", "\\frac{#0}{#?}"]);
    } else if (key === "^" || key === "xⁿ") {
      currentMathField.executeCommand(["insert", "^{#?}"]);
    } else if (key === "x²") {
      currentMathField.executeCommand(["insert", "^{2}"]);
    } else if (key === "√") {
      currentMathField.executeCommand(["insert", "\\sqrt{#?}"]);
    } else if (key === "←") {
      currentMathField.executeCommand("moveToPreviousChar");
    } else if (key === "→") {
      currentMathField.executeCommand("moveToNextChar");
    } else if (key === "⌫") {
      currentMathField.executeCommand("deleteBackward");
    } else if (key === "Clear") {
      currentMathField.setValue("");
      currentMathField.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (key === "-") {
      currentMathField.executeCommand(["insert", "-"]);
    } else if (key === "(") {
      currentMathField.executeCommand(["insert", "("]);
    } else if (key === ")") {
      currentMathField.executeCommand(["insert", ")"]);
    } else if (key === "×") {
      currentMathField.executeCommand(["insert", "\\times"]);
    } else if (key === "≤") {
      currentMathField.executeCommand(["insert", "\\le"]);
    } else if (key === "≥") {
      currentMathField.executeCommand(["insert", "\\ge"]);
    } else if (key === "π") {
      currentMathField.executeCommand(["insert", "\\pi"]);
    } else if (key === "θ") {
      currentMathField.executeCommand(["insert", "\\theta"]);
    } else {
      currentMathField.executeCommand(["insert", key]);
    }

    if (typeof onInputChange === "function") {
      onInputChange(getCurrentValues());
    }
  });

  renderGrid();
}
