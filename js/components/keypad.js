// Globally disable MathLive error beep audio alerts
if (window.MathfieldElement) {
  window.MathfieldElement.soundsDirectory = null;
}

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

      // NATIVE MATHLIVE EXECUTE COMMANDS
      if (key === "/") {
        // Automatically moves preceding typed text into numerator (#0) & moves cursor to denominator (#?)
        mathField.executeCommand(["insert", "\\frac{#0}{#?}"]);
      } else if (key === "^") {
        // Inserts exponent slot
        mathField.executeCommand(["insert", "^{#?}"]);
      } else if (key === "√") {
        // Inserts square root with radical bar over slot
        mathField.executeCommand(["insert", "\\sqrt{#?}"]);
      } else if (key === "←") {
        // FIX: Correct MathLive command for Left Navigation
        mathField.executeCommand("moveToPreviousChar");
      } else if (key === "→") {
        // FIX: Correct MathLive command for Right Navigation
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
