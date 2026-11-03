import { renderMath } from "../utils/katexHelper.js";

/**
 * Converts user input string into KaTeX formatting for display readout.
 * e.g., "1/2" -> "\frac{1}{2}", "x^2" -> "x^{2}"
 */
function convertInputToLatex(rawInput) {
  if (!rawInput) return "";

  let formatted = rawInput;

  // Convert simple division fraction: A/B -> \frac{A}{B}
  if (formatted.includes("/")) {
    const parts = formatted.split("/");
    if (parts.length === 2 && parts[0] && parts[1]) {
      formatted = `\\frac{${parts[0]}}{${parts[1]}}`;
    }
  }

  // Convert exponents: x^2 -> x^{2}
  formatted = formatted.replace(/\^([0-9a-zA-Z\+\-]+)/g, "^{$1}");

  // Wrap in inline LaTeX delimiter
  return `$${formatted}$`;
}

export function initKeypad(container, layoutKeys, onInputChange, onSubmit) {
  const displayEl = container.querySelector("#keypad-display");
  const gridEl = container.querySelector(".keypad-grid");
  let currentVal = "";
  let isSubmitted = false;

  const defaultKeys = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "(-)", "⌫",
    "Clear", "Submit"
  ];

  const keysToRender = layoutKeys && layoutKeys.length > 0 ? [...layoutKeys] : defaultKeys;

  // Ensure Submit button exists in key array if not explicitly present
  if (!keysToRender.includes("Submit")) {
    keysToRender.push("Submit");
  }

  function updateDisplay() {
    if (!currentVal) {
      displayEl.innerHTML = `<span style="color: #94a3b8; font-size: 1rem;">Tap keys to enter answer...</span>`;
      onInputChange("");
      return;
    }

    const latexString = convertInputToLatex(currentVal);
    displayEl.innerHTML = latexString;
    renderMath(displayEl);
    onInputChange(currentVal);
  }

  gridEl.innerHTML = keysToRender.map(key => {
    if (key === "Submit") {
      return `<button id="btn-keypad-submit" class="keypad-btn submit">${isSubmitted ? 'Next Question ➔' : 'Submit'}</button>`;
    }
    if (key === "Clear") {
      return `<button class="keypad-btn action" data-key="Clear">Clear</button>`;
    }
    if (key === "⌫") {
      return `<button class="keypad-btn action" data-key="⌫">⌫</button>`;
    }
    return `<button class="keypad-btn" data-key="${key}">${key}</button>`;
  }).join("");

  updateDisplay();

  gridEl.querySelectorAll(".keypad-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");

      // Handle Submit / Next Question Action
      if (btn.id === "btn-keypad-submit") {
        if (!isSubmitted) {
          if (!currentVal) return;
          isSubmitted = true;
          // Trigger evaluation callback
          onSubmit(currentVal);
          // Transform button to Next Question
          btn.innerText = "Next Question ➔";
          btn.style.background = "#10b981";
        } else {
          // Trigger next question event
          const nextEvt = new CustomEvent("triggerNextQuestion");
          container.dispatchEvent(nextEvt);
        }
        return;
      }

      if (isSubmitted) return; // Lock keypad input after submission

      if (key === "Clear") {
        currentVal = "";
      } else if (key === "⌫") {
        currentVal = currentVal.slice(0, -1);
      } else if (key === "(-)") {
        currentVal += "-";
      } else {
        currentVal += key;
      }

      updateDisplay();
    });
  });
}
