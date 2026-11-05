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

  // Helper to sanitize value (remove unfilled placeholders & normalize minus)
  function cleanValue(rawVal) {
    if (!rawVal) return "";
    return rawVal
      .replace(/\u2212|\u2013|\u2014|\\text\{-\}/g, "-")
      .replace(/\\placeholder(\{[^{}]*\}|\[[^{}]*\])?/g, "")
      .replace(/#\?/g, "")
      .replace(/#0/g, "");
  }

  // 1. RENDER DYNAMIC INPUT FIELD HTML (SINGLE vs MULTI-INPUT)
  let inputsHTML = "";
  if (inputCount > 1) {
    inputsHTML = `
      <div style="display: flex; gap: 8px; width: 100%; align-items: center;">
        ${Array.from({ length: inputCount }).map((_, idx) => `
          <div class="math-field-wrapper" data-index="${idx}" style="
            flex: 1;
            min-height: 52px;
            max-height: 72px;
            padding: 4px 10px;
            background: #ffffff;
            border: 2px solid ${idx === 0 ? '#2563eb' : '#cbd5e1'};
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
            box-sizing: border-box;
            transition: all 0.15s ease-in-out;
            overflow-y: auto;
            cursor: pointer;
          ">
            <span style="font-size: 0.85rem; font-weight: 800; color: #475569; white-space: nowrap;">${inputLabels[idx] || `x<sub>${idx + 1}</sub> =`}</span>
            <math-field class="math-input" data-index="${idx}" style="
              width: 100%;
              font-size: 1.15rem;
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
        <math-field class="math-input" data-index="0" style="
          width: 100%;
          font-size: 1.2rem;
          border: none;
          outline: none;
          background: transparent;
        "></math-field>
      </div>
    `;
  }

  displayContainer.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: center; width: 100%;">
      ${inputsHTML}

      <!-- MODE TOGGLE BUTTON -->
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

  const mathFields = Array.from(displayContainer.querySelectorAll(".math-input"));
  const wrappers = Array.from(displayContainer.querySelectorAll(".math-field-wrapper"));
  const toggleBtn = displayContainer.querySelector("#btn-toggle-keypad-mode");

  // Helper to collect current field values cleanly
  function getCurrentValues() {
    if (inputCount > 1) {
      return mathFields.map(f => cleanValue(f.value || ""));
    }
    return mathFields[0] ? cleanValue(mathFields[0].value || "") : "";
  }

  // Focus & Active Field Switcher
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

  // 2. ATTACH LISTENERS TO MATHLIVE FIELDS & DISABLE SMART FENCE
  mathFields.forEach((mf, idx) => {
    mf.mathVirtualKeyboardPolicy = "manual";
    
    // Disable auto smart-fences to prevent duplicate parenthesis insertion
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
          wrapper.style.minHeight = "66px";
        } else {
          wrapper.style.minHeight = "52px";
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

  // 4. GRID RENDERER
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

      return `
        <button type="button" class="keypad-btn ${isAction ? 'action' : ''} ${isNav ? 'nav-btn' : ''}" data-key="${key}" style="
          padding: 7px 2px;
          font-size: 1.05rem;
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

  // Prevent iPad focus loss on touch
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

    // Keypad Commands Execution
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
      // DISPATCH INPUT EVENT SO QUESTIONVIEW UPDATE SUBSCRIBERS AGREE
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
