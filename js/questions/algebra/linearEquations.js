function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

export const linearEquations = {
  generate: (tier = 1) => {
    // TIER 1: Basic
    if (tier === 1) {
      const a = randInt(2, 5);
      const x = randInt(1, 8);
      const b = randInt(1, 10);
      const c = a * x + b;
      
      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Linear Equations",
        prompt: `Solve for $x$:\n\n$$${a}x + ${b} = ${c}$$`,
        expectedAnswer: String(x),
        keypad: ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "(-)", "⌫", "Clear"],
        steps: [
          `Subtract $${b}$ from both sides:\n\n$$${a}x = ${c - b}$$`,
          `Divide both sides by $${a}$:\n\n$$x = ${x}$$`
        ]
      };
    }

    // TIER 2: Intermediate
    if (tier === 2) {
      const a = randInt(-6, 6, true);
      const x = randInt(-9, 9, true);
      const b = randInt(-15, 15, true);
      const c = a * x + b;
      const bStr = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Linear Equations",
        prompt: `Solve for $x$:\n\n$$${a}x ${bStr} = ${c}$$`,
        expectedAnswer: String(x),
        keypad: ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "(-)", "⌫", "Clear"],
        steps: [
          `Isolate the term $${a}x$:\n\n$$${a}x = ${c - b}$$`,
          `Divide both sides by $${a}$:\n\n$$x = ${x}$$`
        ]
      };
    }

    // TIER 3: Advanced
    const a = randInt(4, 8);
    const cCoeff = randInt(1, 3);
    const x = randInt(-8, 8, true);
    const b = randInt(-10, 10, true);
    const d = (a - cCoeff) * x + b;

    const bStr = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const dStr = d > 0 ? `+ ${d}` : `- ${Math.abs(d)}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Linear Equations",
      prompt: `Solve for $x$:\n\n$$${a}x ${bStr} = ${cCoeff}x ${dStr}$$`,
      expectedAnswer: String(x),
      keypad: ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "(-)", "⌫", "Clear"],
      steps: [
        `Subtract $${cCoeff}x$ from both sides:\n\n$$${a - cCoeff}x ${bStr} = ${d}$$`,
        `Isolate the term with $x$:\n\n$$${a - cCoeff}x = ${d - b}$$`,
        `Divide by $${a - cCoeff}$:\n\n$$x = ${x}$$`
      ]
    };
  }
};
