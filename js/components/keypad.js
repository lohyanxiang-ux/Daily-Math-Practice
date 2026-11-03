export function initKeypad(containerEl, keypadLayout, onValueChange, onSubmit) {
  let currentValue = "";

  const displayEl = containerEl.querySelector("#keypad-display");
  const keypadGrid = containerEl.querySelector(".keypad-grid");

  // Default fallback layout if none provided
  const keys = keypadLayout || [
    "x", "y", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "+",
    "1", "2", "3", "-",
    "0", ".", "^", "⌫",
    "Clear", "Submit ➔"
  ];

  // Render keypad buttons dynamically
  keypadGrid.innerHTML = keys.map(key => {
    let btnClass = "keypad-btn";
    let action = "";
    let val = key;

    if (key === "Clear") {
      btnClass += " action";
      action = "clear";
      val = "";
    } else if (key === "⌫" || key === "Backspace") {
      btnClass += " action";
      action = "backspace";
      val = "";
    } else if (key === "Submit ➔" || key === "Submit") {
      btnClass += " submit";
      action = "submit";
      val = "";
    } else if (["+", "-", "*", "/", "^"].includes(key)) {
      btnClass += " operator";
    } else if (["x", "y", "p", "q", "m", "n", "(", ")"].includes(key)) {
      btnClass += " variable";
    }

    return `<button class="${btnClass}" data-val="${val}" data-action="${action}">${key}</button>`;
  }).join("") + `<button class="keypad-btn submit" data-action="submit">Submit ➔</button>`;

  function updateDisplay() {
    displayEl.innerText = currentValue || " ";
    onValueChange(currentValue);
  }

  keypadGrid.querySelectorAll(".keypad-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-val");
      const action = btn.getAttribute("data-action");

      if (action === "clear") {
        currentValue = "";
      } else if (action === "backspace") {
        currentValue = currentValue.slice(0, -1);
      } else if (action === "submit") {
        onSubmit(currentValue);
        return;
      } else if (val) {
        currentValue += val;
      }

      updateDisplay();
    });
  });

  return {
    reset: () => {
      currentValue = "";
      updateDisplay();
    }
  };
}
