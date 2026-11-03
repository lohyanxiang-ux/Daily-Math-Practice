import { renderMath } from "../utils/katexHelper.js";

/**
 * Transforms raw string input into LaTeX format:
 * - "/" converts to stacked fractions: \frac{num}{den}
 * - "^" converts to powers: ^{exp}
 * - "√" or "sqrt" converts to square roots with top bar: \sqrt{term}
 */
function parseInputToLatex(rawInput) {
  if (!rawInput) return "";

  let str = rawInput;

  // 1. Convert square roots: √x or √(x+1) -> \sqrt{x} or \sqrt{x+1}
  str = str.replace(/√\(([^)]+)\)/g, "\\sqrt{$1}");
  str = str.replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}");
  str = str.replace(/√([0-9a-zA-Z]+)/g, "\\sqrt{$1}");

  // 2. Convert exponents: x^2 or x^(a+b) -> x^{2} or x^{a+b}
  str = str.replace(/\^([0-9a-zA-Z]+)/g, "^{$1}");
  str = str.replace(/\^\(([^)]+)\)/g, "^{$1}");

  // 3. Convert stacked fractions: A/B or (A)/(B) -> \frac{A}{B}
  if (str.includes("/")) {
    const parts = str.split("/");
    if (parts.length === 2 && parts[0] && parts[1]) {
      let num = parts[0].trim();
      let den = parts[1].trim();
      if (num.startsWith("(") && num.endsWith(")")) num = num.slice(1, -1);
      if (den.startsWith("(") && den.endsWith(")")) den = den.slice(1, -1);
      str = `\\frac{${num}}{${den}}`;
    }
  }

  return `$${str}$`;
}

export function initKeypad(container, layoutKeys, onInputChange, onSubmit) {
  const displayEl = container.querySelector("#keypad-display");
  const gridEl = container.querySelector(".keypad-grid");
  let currentVal = "";
  let isSubmitted = false;

  const defaultKeys = [
    "x", "y", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "+",
    "1", "2", "3", "-",
    "0", "^", "√", "⌫",
    "Clear", "Submit"
  ];

  const keysToRender = layoutKeys && layoutKeys.length > 0 ? [...layoutKeys] : defaultKeys;

  if (!keysToRender.includes("Submit")) {
    keysToRender.push("Submit");
  }

  function updateDisplay() {
    if (!currentVal) {
      displayEl.innerHTML = `<span style="color: #94a3b8; font-size: 0.95rem;">Tap keys to enter answer...</span>`;
      onInputChange("");
      return;
    }

    const latexString = parseInputToLatex(currentVal);
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

      if (btn.id === "btn-keypad-submit") {
        if (!isSubmitted) {
          if (!currentVal) return;
          isSubmitted = true;
          onSubmit(currentVal);
          btn.innerText = "Next Question ➔";
          btn.style.background = "#10b981";
        } else {
          container.dispatchEvent(new CustomEvent("triggerNextQuestion"));
        }
        return;
      }

      if (isSubmitted) return;

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
