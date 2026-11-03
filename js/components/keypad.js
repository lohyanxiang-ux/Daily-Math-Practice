// Globally disable MathLive error beep audio alerts
if (window.MathfieldElement) {
  window.MathfieldElement.soundsDirectory = null;
}

export function initKeypad(container, layoutKeys, onInputChange, onSubmit, onSkip) {
  const displayContainer = container.querySelector("#keypad-display");
  const gridEl = container.querySelector(".keypad-grid");
  let isSubmitted = false;

  // Mount MathLive interactive input field
  displayContainer.innerHTML = `<math-field id="math-input" style="width: 100%; display: block;"></math-field>`;
  const mathField = displayContainer.querySelector("#math-input");

  if (mathField) {
    mathField.mathVirtualKeyboardPolicy = "manual";
    mathField.addEventListener("input", () => {
      onInputChange(mathField.value || "");
    });
  }

  // 1. DETERMINE IF KEYPAD SHOULD BE 3-COLUMN (NUMERIC) OR 4-COLUMN (ALGEBRAIC)
  const isAlgebraic = layoutKeys && layoutKeys.some(k => ["x", "y", "/", "^", "√", "(", ")"].includes(k));
  const is3Col = !isAlgebraic;

  // Configure grid layout class
  gridEl.className = is3Col ? "keypad-grid numeric-3col" : "keypad-grid algebraic-4col";

  // Default key sets
  const defaultNumericKeys = [
    "7", "8", "9",
    "4", "5", "6",
    "1", "2", "3",
    "0", ".", "⌫",
    "←", "→", "Clear"
  ];

  const defaultAlgebraicKeys = [
    "x", "y", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "+",
    "1", "2", "3", "-",
    "0", "^", "√", "⌫",
    "←", "→", "Clear"
  ];

  let keysToRender = layoutKeys && layoutKeys.length > 0 ? [...layoutKeys] : (is3Col ? defaultNumericKeys : defaultAlgebraicKeys);

  // Clean out any old Submit/Skip entries from key list so they render exclusively in the bottom action row
  keysToRender = keysToRender.filter(k => k !== "Submit" && k !== "Skip");

  // Ensure navigation keys exist
  if (!keysToRender.includes("←")) {
    const clearIdx = keysToRender.indexOf("Clear");
    if (clearIdx !== -1) {
      keysToRender.splice(clearIdx, 0, "←", "→");
    } else {
      keysToRender.push("←", "→");
    }
  }

  // Render keypad grid with Submit + Skip in the bottom row
  const gridHTML = keysToRender.map(key => {
    if (key === "Clear" || key === "⌫") {
      return `<button class="keypad-btn action" data-key="${key}">${key}</button>`;
    }
    if (key === "←" || key === "→") {
      return `<button class="keypad-btn nav-btn" data-key="${key}">${key}</button>`;
    }
    return `<button class="keypad-btn" data-key="${key}">${key}</button>`;
  }).join("");

  // Bottom action row: Submit (Primary) + Skip (Secondary)
  const submitSpanClass = is3Col ? "span-2" : "span-3";
  const actionRowHTML = `
    <button id="btn-keypad-submit" class="keypad-btn submit ${submitSpanClass}">${isSubmitted ? 'Next Question ➔' : 'Submit'}</button>
    <button id="btn-keypad-skip" class="keypad-btn skip">Skip ⏭️</button>
  `;

  gridEl.innerHTML = gridHTML + actionRowHTML;

  // Attach Input & Event Handlers
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
          onSubmit(val);
          btn.innerText = "Next Question ➔";
          btn.style.background = "#10b981";
        } else {
          container.dispatchEvent(new CustomEvent("triggerNextQuestion"));
        }
        return;
      }

      // Handle Skip Action
      if (btn.id === "btn-keypad-skip") {
        if (typeof onSkip === "function") onSkip();
        return;
      }

      if (isSubmitted || !mathField) return;

      mathField.focus();

      // MathLive command handlers
      if (key === "/") {
        mathField.executeCommand(["insert", "\\frac{#0}{#?}"]);
      } else if (key === "^") {
        mathField.executeCommand(["insert", "^{#?}"]);
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
      } else if (key === "(-)") {
        mathField.executeCommand(["insert", "-"]);
      } else {
        mathField.executeCommand(["insert", key]);
      }

      onInputChange(mathField.value || "");
    });
  });
}
