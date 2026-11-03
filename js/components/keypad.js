export function initKeypad(container, layoutKeys, onInputChange, onSubmit) {
  const displayContainer = container.querySelector("#keypad-display");
  const gridEl = container.querySelector(".keypad-grid");
  let isSubmitted = false;

  // Mount MathLive interactive field inside display container
  displayContainer.innerHTML = `<math-field id="math-input" read-only="false"></math-field>`;
  const mathField = displayContainer.querySelector("#math-input");

  // Suppress iPad default soft keyboard so only our custom math keypad is used
  mathField.mathVirtualKeyboardPolicy = "manual";

  // Notify parent on change
  mathField.addEventListener("input", () => {
    onInputChange(mathField.getValue("latex"));
  });

  const defaultKeys = [
    "x", "y", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "+",
    "1", "2", "3", "-",
    "0", "^", "√", "⌫",
    "←", "→", "Clear", "Submit"
  ];

  const keysToRender = layoutKeys && layoutKeys.length > 0 ? [...layoutKeys] : defaultKeys;

  // Add navigation keys if missing
  if (!keysToRender.includes("←")) {
    const clearIdx = keysToRender.indexOf("Clear");
    if (clearIdx !== -1) {
      keysToRender.splice(clearIdx, 0, "←", "→");
    }
  }

  if (!keysToRender.includes("Submit")) {
    keysToRender.push("Submit");
  }

  gridEl.innerHTML = keysToRender.map(key => {
    if (key === "Submit") {
      return `<button id="btn-keypad-submit" class="keypad-btn submit">${isSubmitted ? 'Next Question ➔' : 'Submit'}</button>`;
    }
    if (key === "Clear" || key === "⌫") {
      return `<button class="keypad-btn action" data-key="${key}">${key}</button>`;
    }
    if (key === "←" || key === "→") {
      return `<button class="keypad-btn nav-btn" data-key="${key}">${key}</button>`;
    }
    return `<button class="keypad-btn" data-key="${key}">${key}</button>`;
  }).join("");

  gridEl.querySelectorAll(".keypad-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const key = btn.getAttribute("data-key");

      // Handle Submit / Next Question Flow
      if (btn.id === "btn-keypad-submit") {
        if (!isSubmitted) {
          const val = mathField.getValue("latex");
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

      if (isSubmitted) return;

      // MATHLIVE COMMAND EXECUTION FOR FRACTIONS, EXPONENTS & CURSOR MOVEMENT
      if (key === "/") {
        // Instantly creates stacked fraction and moves cursor into numerator
        mathField.executeCommand(["insert", "\\frac{#?}{#?}"]);
      } else if (key === "^") {
        // Instantly creates superscript exponent slot
        mathField.executeCommand(["insert", "^{#?}"]);
      } else if (key === "√") {
        // Instantly creates square root with top bar covering slot
        mathField.executeCommand(["insert", "\\sqrt{#?}"]);
      } else if (key === "←") {
        mathField.executeCommand("moveBackward");
      } else if (key === "→") {
        mathField.executeCommand("moveForward");
      } else if (key === "⌫") {
        mathField.executeCommand("deleteBackward");
      } else if (key === "Clear") {
        mathField.setValue("");
      } else if (key === "(-)") {
        mathField.insert("-");
      } else {
        mathField.insert(key);
      }

      mathField.focus();
      onInputChange(mathField.getValue("latex"));
    });
  });
}
