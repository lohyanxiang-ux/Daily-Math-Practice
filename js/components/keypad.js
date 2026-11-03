export function initKeypad(container, layoutKeys, onInputChange, onSubmit) {
  const displayContainer = container.querySelector("#keypad-display");
  const gridEl = container.querySelector(".keypad-grid");
  let isSubmitted = false;

  // Mount MathLive interactive input field
  displayContainer.innerHTML = `<math-field id="math-input" style="width: 100%; display: block;"></math-field>`;
  const mathField = displayContainer.querySelector("#math-input");

  if (mathField) {
    // Disable iPad system soft keyboard so custom keypad is used
    mathField.mathVirtualKeyboardPolicy = "manual";

    // Broadcast change to parent
    mathField.addEventListener("input", () => {
      onInputChange(mathField.value || "");
    });
  }

  // Base Keypad Layout
  const defaultKeys = [
    "x", "y", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "+",
    "1", "2", "3", "-",
    "0", "^", "√", "⌫",
    "←", "→", "Clear", "Submit"
  ];

  let keysToRender = layoutKeys && layoutKeys.length > 0 ? [...layoutKeys] : defaultKeys;

  // Ensure navigation keys (←, →) are included
  if (!keysToRender.includes("←")) {
    const clearIdx = keysToRender.indexOf("Clear");
    if (clearIdx !== -1) {
      keysToRender.splice(clearIdx, 0, "←", "→");
    } else {
      keysToRender.push("←", "→");
    }
  }

  // Ensure Submit button is included
  if (!keysToRender.includes("Submit")) {
    keysToRender.push("Submit");
  }

  // Render Grid Buttons
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

  // Attach Input Handlers
  gridEl.querySelectorAll(".keypad-btn").forEach(btn => {
    // Prevent button tap from stealing focus away from Mathfield
    btn.addEventListener("pointerdown", (e) => e.preventDefault());

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const key = btn.getAttribute("data-key");

      // Handle Submit / Next Question Flow
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

      if (isSubmitted || !mathField) return;

      // Maintain active caret focus inside Mathfield
      mathField.focus();

      // MATHLIVE TEMPLATE INJECTION WITH FORMAT LATEX
      if (key === "/") {
        // Inserts stacked fraction with active numerator placeholder
        mathField.insert("\\frac{#?}{#?}", { format: "latex", selectionMode: "placeholder" });
      } else if (key === "^") {
        // Inserts superscript exponent slot with placeholder
        mathField.insert("^{#?}", { format: "latex", selectionMode: "placeholder" });
      } else if (key === "√") {
        // Inserts square root with top bar covering slot
        mathField.insert("\\sqrt{#?}", { format: "latex", selectionMode: "placeholder" });
      } else if (key === "←") {
        if (typeof mathField.executeCommand === "function") {
          mathField.executeCommand("moveBackward");
        }
      } else if (key === "→") {
        if (typeof mathField.executeCommand === "function") {
          mathField.executeCommand("moveForward");
        }
      } else if (key === "⌫") {
        if (typeof mathField.executeCommand === "function") {
          mathField.executeCommand("deleteBackward");
        }
      } else if (key === "Clear") {
        mathField.value = "";
      } else if (key === "(-)") {
        mathField.insert("-");
      } else {
        mathField.insert(key);
      }

      onInputChange(mathField.value || "");
    });
  });
}
