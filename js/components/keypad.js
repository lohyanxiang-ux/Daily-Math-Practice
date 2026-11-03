export function initKeypad(container, layoutKeys, onInputChange, onSubmit) {
  const displayContainer = container.querySelector("#keypad-display");
  const gridEl = container.querySelector(".keypad-grid");
  let isSubmitted = false;

  // Mount MathLive interactive field
  displayContainer.innerHTML = `<math-field id="math-input" style="display: block; width: 100%;"></math-field>`;
  const mathField = displayContainer.querySelector("#math-input");

  // Disable iPad soft keyboard so only our custom virtual keypad is active
  if (mathField) {
    mathField.mathVirtualKeyboardPolicy = "manual";

    // Broadcast input changes to parent
    mathField.addEventListener("input", () => {
      const latexVal = mathField.value || "";
      onInputChange(latexVal);
    });
  }

  const defaultKeys = [
    "x", "y", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "+",
    "1", "2", "3", "-",
    "0", "^", "√", "⌫",
    "←", "→", "Clear", "Submit"
  ];

  const keysToRender = layoutKeys && layoutKeys.length > 0 ? [...layoutKeys] : defaultKeys;

  if (!keysToRender.includes("←")) {
    const clearIdx = keysToRender.indexOf("Clear");
    if (clearIdx !== -1) {
      keysToRender.splice(clearIdx, 0, "←", "→");
    }
  }

  if (!keysToRender.includes("Submit")) {
    keysToRender.push("Submit");
  }

  // Render Keypad Buttons
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

  // Attach Event Listeners
  gridEl.querySelectorAll(".keypad-btn").forEach(btn => {
    // PREVENT FOCUS LOSS: Prevent button click from stealing focus away from MathLive field
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
    });

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const key = btn.getAttribute("data-key");

      // Handle Submit / Next Question Flow
      if (btn.id === "btn-keypad-submit") {
        if (!isSubmitted) {
          const val = mathField.value || "";
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

      // Ensure focus remains inside MathLive field for cursor positioning
      mathField.focus();

      // MATHLIVE TEMPLATE INJECTION HANDLERS
      if (key === "/") {
        // Inserts stacked fraction with active numerator placeholder
        if (typeof mathField.insert === "function") {
          mathField.insert("\\frac{#?}{#?}");
        }
      } else if (key === "^") {
        // Inserts superscript exponent box with active placeholder
        if (typeof mathField.insert === "function") {
          mathField.insert("^{#?}");
        }
      } else if (key === "√") {
        // Inserts square root with radical top bar over placeholder
        if (typeof mathField.insert === "function") {
          mathField.insert("\\sqrt{#?}");
        }
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
        if (typeof mathField.setValue === "function") {
          mathField.setValue("");
        } else {
          mathField.value = "";
        }
      } else if (key === "(-)") {
        if (typeof mathField.insert === "function") {
          mathField.insert("-");
        }
      } else {
        if (typeof mathField.insert === "function") {
          mathField.insert(key);
        }
      }

      onInputChange(mathField.value || "");
    });
  });
}
