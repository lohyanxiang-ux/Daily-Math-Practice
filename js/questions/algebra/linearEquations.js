function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

export const linearEquations = {
  generate: () => {
    // Generate ax + b = c linear equations
    const a = randInt(2, 6);
    const x = randInt(-9, 9, true);
    const b = randInt(-12, 12, true);
    const c = a * x + b;

    const bStr = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const step1Rhs = c - b;

    return {
      strand: "Algebra",
      skillTitle: "Linear Equations",
      prompt: `Solve the linear equation for $x$:\n\n$$${a}x ${bStr} = ${c}$$`,
      expectedAnswer: String(x),
      keypad: [
        "7", "8", "9", "/",
        "4", "5", "6", "*",
        "1", "2", "3", "-",
        "0", ".", "(-)", "⌫",
        "Clear"
      ],
      steps: [
        `Subtract $${b}$ from both sides:\n\n$$${a}x = ${c} - (${b}) = ${step1Rhs}$$`,
        `Divide both sides by $${a}$:\n\n$$x = \\frac{${step1Rhs}}{${a}}$$`,
        `Write down the final answer:\n\n$$x = ${x}$$`
      ]
    };
  }
};
