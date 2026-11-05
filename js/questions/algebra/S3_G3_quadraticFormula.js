/**
 * Question Generator: Solve Quadratic Equations using Quadratic Formula
 * Curriculum Skill: Sec 3 G3 - Algebra
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function format3SF(val) {
  return parseFloat(val.toPrecision(3)).toString();
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Direct Standard Form ax^2 + bx + c = 0)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      const a = randInt(1, 6);
      const b = randInt(-9, 9, true);
      const c = randInt(-9, -1);

      const a_str = a === 1 ? "x^2" : `${a}x^2`;
      const b_str = b === 1 ? " + x" : (b === -1 ? " - x" : (b > 0 ? ` + ${b}x` : ` - ${Math.abs(b)}x`));
      const c_str = c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
      const eq = `${a_str}${b_str}${c_str} = 0`;

      const disc = b * b - 4 * a * c;
      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);

      const ans1 = format3SF(Math.min(x1, x2));
      const ans2 = format3SF(Math.max(x1, x2));

      const step1 = `a = ${a}, \\ b = ${b}, \\ c = ${c}`;
      const step2 = `x = \\frac{-(${b < 0 ? '(' + b + ')' : b}) \\pm \\sqrt{(${b})^2 - 4(${a})(${c < 0 ? '(' + c + ')' : c})}}{2(${a})}`;
      const step3 = `x = ${ans1} \\text{ or } x = ${ans2}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Solve Quadratic Equations using Quadratic Formula",
        prompt: `Solve the following equation using the quadratic formula. Give your answers correct to 3 significant figures.\n\n$$${eq}$$`,
        inputCount: 2,
        inputLabels: ["x =", "x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1} \\text{ or } x = ${ans2}`,
        steps: [
          `Identify the coefficients $a$, $b$, and $c$ from $ax^2 + bx + c = 0$: $$${step1}$$`,
          `Substitute $a$, $b$, and $c$ into the quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$: $$${step2}$$`,
          `Evaluate using a calculator (rounding to 3 significant figures): $$${step3}$$`
        ]
      };
    } else {
      const a = randInt(2, 5);
      const b_raw = randInt(6, 10);
      const c = randInt(1, 3);

      let b_eff = b_raw;
      if (b_raw * b_raw <= 4 * a * c) {
        b_eff = Math.ceil(Math.sqrt(4 * a * c)) + 3;
      }

      const eq = `${a}x^2 + ${b_eff}x + ${c} = 0`;

      const disc = b_eff * b_eff - 4 * a * c;
      const x1 = (-b_eff + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b_eff - Math.sqrt(disc)) / (2 * a);

      const ans1 = format3SF(Math.min(x1, x2));
      const ans2 = format3SF(Math.max(x1, x2));

      const step1 = `a = ${a}, \\ b = ${b_eff}, \\ c = ${c}`;
      const step2 = `x = \\frac{-(${b_eff}) \\pm \\sqrt{(${b_eff})^2 - 4(${a})(${c})}}{2(${a})}`;
      const step3 = `x = ${ans1} \\text{ or } x = ${ans2}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Solve Quadratic Equations using Quadratic Formula",
        prompt: `Solve the following equation using the quadratic formula. Give your answers correct to 3 significant figures.\n\n$$${eq}$$`,
        inputCount: 2,
        inputLabels: ["x =", "x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1} \\text{ or } x = ${ans2}`,
        steps: [
          `Identify the coefficients $a$, $b$, and $c$: $$${step1}$$`,
          `Substitute into the quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$: $$${step2}$$`,
          `Evaluate using a calculator to find the roots rounded to 3 significant figures: $$${step3}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Non-Standard / Bracket Forms)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      const a = randInt(2, 5);
      const b = randInt(-6, 6, true);
      const c = randInt(3, 12);

      const b_str_in = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const eq = `x(${a}x ${b_str_in}) = ${c}`;

      const a_quad = a;
      const b_quad = b;
      const c_quad = -c;

      const b_str_std = b > 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`;
      const std_eq = `${a}x^2 ${b_str_std} - ${c} = 0`;

      const disc = b_quad * b_quad - 4 * a_quad * c_quad;
      const x1 = (-b_quad + Math.sqrt(disc)) / (2 * a_quad);
      const x2 = (-b_quad - Math.sqrt(disc)) / (2 * a_quad);

      const ans1 = format3SF(Math.min(x1, x2));
      const ans2 = format3SF(Math.max(x1, x2));

      const step1 = std_eq;
      const step2 = `a = ${a_quad}, \\ b = ${b_quad}, \\ c = ${c_quad}`;
      const step3 = `x = \\frac{-(${b_quad < 0 ? '(' + b_quad + ')' : b_quad}) \\pm \\sqrt{(${b_quad})^2 - 4(${a_quad})(${c_quad < 0 ? '(' + c_quad + ')' : c_quad})}}{2(${a_quad})}`;
      const step4 = `x = ${ans1} \\text{ or } x = ${ans2}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solve Quadratic Equations using Quadratic Formula",
        prompt: `Solve the following equation using the quadratic formula. Give your answers correct to 3 significant figures.\n\n$$${eq}$$`,
        inputCount: 2,
        inputLabels: ["x =", "x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1} \\text{ or } x = ${ans2}`,
        steps: [
          `Expand the brackets and express the equation in standard form $ax^2 + bx + c = 0$: $$${step1}$$`,
          `State $a$, $b$, and $c$: $$${step2}$$`,
          `Substitute values into $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$: $$${step3}$$`,
          `Evaluate using a calculator (rounding to 3 significant figures): $$${step4}$$`
        ]
      };
    } else {
      const m = randInt(-5, 5, true);
      const n = randInt(-5, 5, true);
      const k = randInt(5, 15);

      const a_quad = 1;
      const b_quad = m + n;
      const c_quad = m * n - k;

      const m_str = m > 0 ? `+ ${m}` : `- ${Math.abs(m)}`;
      const n_str = n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
      const eq = `(x ${m_str})(x ${n_str}) = ${k}`;

      const b_str = b_quad === 0 ? '' : (b_quad === 1 ? ' + x' : (b_quad === -1 ? ' - x' : (b_quad > 0 ? ` + ${b_quad}x` : ` - ${Math.abs(b_quad)}x`)));
      const c_str = c_quad > 0 ? ` + ${c_quad}` : ` - ${Math.abs(c_quad)}`;
      const std_eq = `x^2${b_str}${c_str} = 0`;

      const disc = b_quad * b_quad - 4 * a_quad * c_quad;
      const x1 = (-b_quad + Math.sqrt(disc)) / (2 * a_quad);
      const x2 = (-b_quad - Math.sqrt(disc)) / (2 * a_quad);

      const ans1 = format3SF(Math.min(x1, x2));
      const ans2 = format3SF(Math.max(x1, x2));

      const step1 = std_eq;
      const step2 = `a = ${a_quad}, \\ b = ${b_quad}, \\ c = ${c_quad}`;
      const step3 = `x = \\frac{-(${b_quad < 0 ? '(' + b_quad + ')' : b_quad}) \\pm \\sqrt{(${b_quad})^2 - 4(${a_quad})(${c_quad < 0 ? '(' + c_quad + ')' : c_quad})}}{2(${a_quad})}`;
      const step4 = `x = ${ans1} \\text{ or } x = ${ans2}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solve Quadratic Equations using Quadratic Formula",
        prompt: `Solve the following equation using the quadratic formula. Give your answers correct to 3 significant figures.\n\n$$${eq}$$`,
        inputCount: 2,
        inputLabels: ["x =", "x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1} \\text{ or } x = ${ans2}`,
        steps: [
          `Expand the brackets and rearrange to standard form $ax^2 + bx + c = 0$: $$${step1}$$`,
          `Identify $a$, $b$, and $c$: $$${step2}$$`,
          `Substitute values into the quadratic formula: $$${step3}$$`,
          `Evaluate using a calculator (rounding to 3 significant figures): $$${step4}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Multi-Term Equations)
  // =========================================================
  const m = randInt(2, 6);
  const n = randInt(1, 4);
  const p = randInt(2, 5);
  const q = randInt(10, 30);

  const a_quad = m;
  const b_quad = p - 1 - m * n;
  const c_quad = -q;

  const eq = `x + ${m}x(${n} - x) = ${p}x - ${q}`;
  const b_str = b_quad === 0 ? '' : (b_quad === 1 ? ' + x' : (b_quad === -1 ? ' - x' : (b_quad > 0 ? ` + ${b_quad}x` : ` - ${Math.abs(b_quad)}x`)));
  const std_eq = `${a_quad}x^2${b_str} - ${q} = 0`;

  const disc = b_quad * b_quad - 4 * a_quad * c_quad;
  const x1 = (-b_quad + Math.sqrt(disc)) / (2 * a_quad);
  const x2 = (-b_quad - Math.sqrt(disc)) / (2 * a_quad);

  const ans1 = format3SF(Math.min(x1, x2));
  const ans2 = format3SF(Math.max(x1, x2));

  const step1 = std_eq;
  const step2 = `a = ${a_quad}, \\ b = ${b_quad}, \\ c = ${c_quad}`;
  const step3 = `x = \\frac{-(${b_quad < 0 ? '(' + b_quad + ')' : b_quad}) \\pm \\sqrt{(${b_quad})^2 - 4(${a_quad})(${c_quad < 0 ? '(' + c_quad + ')' : c_quad})}}{2(${a_quad})}`;
  const step4 = `x = ${ans1} \\text{ or } x = ${ans2}`;

  return {
    strand: "Algebra",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Solve Quadratic Equations using Quadratic Formula",
    prompt: `Solve the equation using the quadratic formula. Give your answers correct to 3 significant figures.\n\n$$${eq}$$`,
    inputCount: 2,
    inputLabels: ["x =", "x ="],
    expectedAnswer: [ans1, ans2],
    displayAnswer: `x = ${ans1} \\text{ or } x = ${ans2}`,
    steps: [
      `Expand all terms, collect like terms, and rearrange to $ax^2 + bx + c = 0$: $$${step1}$$`,
      `State $a$, $b$, and $c$: $$${step2}$$`,
      `Substitute into the quadratic formula: $$${step3}$$`,
      `Evaluate using a calculator (rounding to 3 significant figures): $$${step4}$$`
    ]
  };
}

export const quadraticFormula = { generate: generateQuestion };
export default generateQuestion;
