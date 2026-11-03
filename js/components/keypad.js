export function initKeypad(containerEl, onValueChange, onSubmit) {
  let currentValue = "";

  const displayEl = containerEl.querySelector("#keypad-display");
  const buttons = containerEl.querySelectorAll(".keypad-btn");

  function updateDisplay() {
    displayEl.innerText = currentValue || " ";
    onValueChange(currentValue);
  }

  buttons.forEach(btn => {
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
