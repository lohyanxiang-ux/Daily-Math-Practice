/**
 * Question Generator: Solving Quadratic Equations using Factorisation
 * Curriculum Skill: Sec 3 G3 - Algebra
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function formatFracLaTeX(num, den) {
  const g = gcd(num, den);
  const sNum = num / g;
  const sDen = den / g;
  if (sDen === 1) return `${sNum}`;
  return sNum < 0 ? `-\\frac{${Math.abs(sNum)}}{${sDen}}` : `\\frac{${sNum}}{${sDen}}`;
}

function formatFracPlain(num, den) {
  const g = gcd(num, den);
  const sNum = num / g;
  const sDen = den / g;
  if (sDen === 1) return `${sNum}`;
  return `${sNum}/${sDen}`;
}

export function generateQuestion(tier = 1) {
  const extraKeys = ["x"];

  // =========================================================
  // TIER 1: BASIC (Factored form, Standard form, Linear RHS & Expanded Brackets)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 4);

    if (subType === 1) {
      // Factored form: (ax + b)(cx + d) = 0
      const a = randInt(1, 3);
      const b = randInt(-7, 7, true);
      const c = randInt(1, 3);
      const d = randInt(-7, 7, true);
      const d_eff = b === d ? (d === 7 ? -6 : d + 1) : d;

      const factor1 = `${a === 1 ? "x" : `${a}x`} ${b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`}`;
      const factor2 = `${c === 1 ? "x" : `${c}x`} ${d_eff > 0 ? `+ ${d_eff}` : `- ${Math.abs(d_eff)}`}`;

      const ans1_tex = formatFracLaTeX(-b, a);
      const ans2_tex = formatFracLaTeX(-d_eff, c);
      const ans1 = formatFracPlain(-b, a);
      const ans2 = formatFracPlain(-d_eff, c);

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Solving Quadratic Equations using Factorisation",
        prompt: `Solve the equation by factorisation:\n\n$$(${factor1})(${factor2}) = 0$$`,
        inputCount: 2,
        inputLabels: ["x =", "or  x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}`,
        extraKeys,
        steps: [
          `The quadratic expression is already factorised into linear factors: $$${factor1} = 0 \\quad \\text{or} \\quad ${factor2} = 0$$`,
          `Solve each linear factor for $x$: $$x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}$$`
        ]
      };
    }

    if (subType === 2) {
      // Standard quadratic form: ax^2 + bx + c = 0
      const a = randInt(1, 3);
      const b = randInt(-6, 6, true);
      const c = randInt(1, 2);
      const d = randInt(-6, 6, true);
      const d_eff = ((Math.abs(a * d + b * c) % 10 === 0) || (b === d))
        ? (d === 6 ? -5 : d + 1)
        : d;

      const coeffA = a * c;
      const coeffB = a * d_eff + b * c;
      const coeffC = b * d_eff;

      const partA = coeffA === 1 ? "x^2" : `${coeffA}x^2`;
      const partB = coeffB === 0 ? "" : (coeffB === 1 ? " + x" : (coeffB === -1 ? " - x" : (coeffB > 0 ? ` + ${coeffB}x` : ` - ${Math.abs(coeffB)}x`)));
      const partC = coeffC === 0 ? "" : (coeffC > 0 ? ` + ${coeffC}` : ` - ${Math.abs(coeffC)}`);
      const eqn = `${partA}${partB}${partC} = 0`;

      const factor1 = `${a === 1 ? "x" : `${a}x`} ${b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`}`;
      const factor2 = `${c === 1 ? "x" : `${c}x`} ${d_eff > 0 ? `+ ${d_eff}` : `- ${Math.abs(d_eff)}`}`;

      const ans1_tex = formatFracLaTeX(-b, a);
      const ans2_tex = formatFracLaTeX(-d_eff, c);
      const ans1 = formatFracPlain(-b, a);
      const ans2 = formatFracPlain(-d_eff, c);

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Solving Quadratic Equations using Factorisation",
        prompt: `Solve the quadratic equation by factorisation:\n\n$$${eqn}$$`,
        inputCount: 2,
        inputLabels: ["x =", "or  x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}`,
        extraKeys,
        steps: [
          `Factorise the quadratic expression: $$(${factor1})(${factor2}) = 0$$`,
          `Set each factor equal to zero: $$${factor1} = 0 \\quad \\text{or} \\quad ${factor2} = 0$$`,
          `Solve for $x$: $$x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}$$`
        ]
      };
    }

    if (subType === 3) {
      // x(x + a) = x + c
      const r1 = randInt(-8, 8, true);
      const r2_raw = randInt(-8, 8, true);
      const r2 = r2_raw === r1 ? (r1 === 8 ? 7 : r1 + 1) : r2_raw;

      const sum = r1 + r2;
      const prod = r1 * r2;
      const a = 1 - sum;
      const c = -prod;

      const eqLHS = `x ${a > 0 ? `+ ${a}` : (a < 0 ? `- ${Math.abs(a)}` : "")}`;
      const eqRHS = `x ${c > 0 ? `+ ${c}` : (c < 0 ? `- ${Math.abs(c)}` : "")}`;

      const negSum = -sum;
      const step1 = `x^2 ${negSum > 0 ? `+ ${negSum}` : (negSum < 0 ? `- ${Math.abs(negSum)}` : "")}x ${prod > 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`} = 0`;
      const f1 = `x ${-r1 > 0 ? `+ ${-r1}` : `- ${Math.abs(-r1)}`}`;
      const f2 = `x ${-r2 > 0 ? `+ ${-r2}` : `- ${Math.abs(-r2)}`}`;
      const step2 = `(${f1})(${f2}) = 0`;
      const step3 = `${f1} = 0 \\quad \\text{or} \\quad ${f2} = 0`;
      const step4 = `x = ${r1} \\quad \\text{or} \\quad x = ${r2}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Solving Quadratic Equations using Factorisation",
        prompt: `Solve the equation by factorisation:\n\n$$x(${eqLHS}) = ${eqRHS}$$`,
        inputCount: 2,
        inputLabels: ["x_1 =", "x_2 ="],
        expectedAnswer: [`${r1}`, `${r2}`],
        displayAnswer: step4,
        extraKeys,
        steps: [
          `Expand and rearrange the equation into standard quadratic form: $$${step1}$$`,
          `Factorise the quadratic expression: $$${step2}$$`,
          `Set each factor to zero: $$${step3}$$`,
          `Solve for $x$: $$${step4}$$`
        ]
      };
    }

    // subType === 4: (x + a)(x + b) = c
    const r1 = randInt(-7, 7, true);
    const r2_raw = randInt(-7, 7, true);
    const r2 = r2_raw === r1 ? (r1 === 7 ? 6 : r1 + 1) : r2_raw;
    const a = randInt(-6, 6, true);

    const b = -(r1 + r2) - a;
    const c = (a * b) - (r1 * r2);

    const lhs1 = `x ${a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`}`;
    const lhs2 = `x ${b > 0 ? `+ ${b}` : (b < 0 ? `- ${Math.abs(b)}` : "")}`;

    const sum = -(r1 + r2);
    const prod = r1 * r2;

    const step1 = `x^2 ${sum > 0 ? `+ ${sum}` : (sum < 0 ? `- ${Math.abs(sum)}` : "")}x ${prod > 0 ? `+ ${prod}` : (prod < 0 ? `- ${Math.abs(prod)}` : "")} = 0`;
    const f1 = `x ${-r1 > 0 ? `+ ${-r1}` : `- ${Math.abs(-r1)}`}`;
    const f2 = `x ${-r2 > 0 ? `+ ${-r2}` : `- ${Math.abs(-r2)}`}`;
    const step2 = `(${f1})(${f2}) = 0`;
    const step3 = `${f1} = 0 \\quad \\text{or} \\quad ${f2} = 0`;
    const step4 = `x = ${r1} \\quad \\text{or} \\quad x = ${r2}`;

    return {
      strand: "Algebra",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Solving Quadratic Equations using Factorisation",
      prompt: `Solve the equation by factorisation:\n\n$$(${lhs1})(${lhs2}) = ${c}$$`,
      inputCount: 2,
      inputLabels: ["x_1 =", "x_2 ="],
      expectedAnswer: [`${r1}`, `${r2}`],
      displayAnswer: step4,
      extraKeys,
      steps: [
        `Expand brackets and rearrange into standard form: $$${step1}$$`,
        `Factorise the quadratic expression: $$${step2}$$`,
        `Set each factor to zero: $$${step3}$$`,
        `Solve for $x$: $$${step4}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Difference of Squares, Common Binomial & Rearrangement)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 4);

    if (subType === 1) {
      // a^2 x^2 - b^2 = 0
      const a = randInt(1, 5);
      const b = randInt(1, 9);
      const a2 = a * a;
      const b2 = b * b;

      const partA = a2 === 1 ? "x^2" : `${a2}x^2`;
      const eqn = `${partA} - ${b2} = 0`;

      const f1 = `${a === 1 ? "x" : `${a}x`} - ${b}`;
      const f2 = `${a === 1 ? "x" : `${a}x`} + ${b}`;

      const ans1_tex = formatFracLaTeX(b, a);
      const ans2_tex = formatFracLaTeX(-b, a);
      const ans1 = formatFracPlain(b, a);
      const ans2 = formatFracPlain(-b, a);

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solving Quadratic Equations using Factorisation",
        prompt: `Solve the quadratic equation by factorisation:\n\n$$${eqn}$$`,
        inputCount: 2,
        inputLabels: ["x =", "or  x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}`,
        extraKeys,
        steps: [
          `Factorise using the difference of two squares identity: $$(${f1})(${f2}) = 0$$`,
          `Set each factor equal to zero: $$${f1} = 0 \\quad \\text{or} \\quad ${f2} = 0$$`,
          `Solve for $x$: $$x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}$$`
        ]
      };
    }

    if (subType === 2) {
      // x(ax + b) = cx + d
      const p = randInt(1, 2);
      const q = randInt(-5, 5, true);
      const r = randInt(1, 3);
      const s = randInt(-5, 5, true);
      const c = randInt(1, 4);

      const s_eff = (p === r && q === s) ? (s === 5 ? -4 : s + 1) : s;
      const a = p * r;
      const c_eff = (Math.abs((p * s_eff + q * r)) % 10 === 0) ? c + 1 : c;
      const b = (p * s_eff + q * r) + c_eff;
      const d = -1 * q * s_eff;

      const LHS_bracket = `${a === 1 ? "x" : `${a}x`} ${b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`}`;
      const LHS = `x(${LHS_bracket})`;
      const RHS = `${c_eff === 1 ? "x" : `${c_eff}x`} ${d > 0 ? `+ ${d}` : `- ${Math.abs(d)}`}`;

      const std_coeffB = b - c_eff;
      const std_coeffC = -d;
      const std_partA = a === 1 ? "x^2" : `${a}x^2`;
      const std_partB = std_coeffB === 0 ? "" : (std_coeffB === 1 ? " + x" : (std_coeffB === -1 ? " - x" : (std_coeffB > 0 ? ` + ${std_coeffB}x` : ` - ${Math.abs(std_coeffB)}x`)));
      const std_partC = std_coeffC === 0 ? "" : (std_coeffC > 0 ? ` + ${std_coeffC}` : ` - ${Math.abs(std_coeffC)}`);
      const std_eqn = `${std_partA}${std_partB}${std_partC} = 0`;

      const factor1 = `${p === 1 ? "x" : `${p}x`} ${q > 0 ? `+ ${q}` : `- ${Math.abs(q)}`}`;
      const factor2 = `${r === 1 ? "x" : `${r}x`} ${s_eff > 0 ? `+ ${s_eff}` : `- ${Math.abs(s_eff)}`}`;

      const ans1_tex = formatFracLaTeX(-q, p);
      const ans2_tex = formatFracLaTeX(-s_eff, r);
      const ans1 = formatFracPlain(-q, p);
      const ans2 = formatFracPlain(-s_eff, r);

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solving Quadratic Equations using Factorisation",
        prompt: `Solve the quadratic equation by factorisation:\n\n$$${LHS} = ${RHS}$$`,
        inputCount: 2,
        inputLabels: ["x =", "or  x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}`,
        extraKeys,
        steps: [
          `Expand the bracket and rearrange into standard quadratic form: $$${std_eqn}$$`,
          `Factorise the quadratic expression: $$(${factor1})(${factor2}) = 0$$`,
          `Set each factor equal to zero and solve for $x$: $$x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}$$`
        ]
      };
    }

    if (subType === 3) {
      // ax(px + q) = b(px + q)
      const p = randInt(1, 4);
      const q = randInt(-7, 7, true);
      const a = randInt(2, 5);
      const b = randInt(-6, 6, true);

      const ans1 = formatFracPlain(b, a);
      const ans2 = formatFracPlain(-q, p);
      const f1_latex = formatFracLaTeX(b, a);
      const f2_latex = formatFracLaTeX(-q, p);

      const pxq = `${p === 1 ? "x" : `${p}x`} ${q > 0 ? `+ ${q}` : `- ${Math.abs(q)}`}`;
      const negB = -b;
      const step1 = `${a}x(${pxq}) ${negB > 0 ? `+ ${negB}` : `- ${Math.abs(negB)}`} = 0`
        .replace(`- ${Math.abs(negB)} = 0`, `${negB > 0 ? `+ ${negB}` : `- ${Math.abs(negB)}`}(${pxq}) = 0`);
      const factorLeft = `${a}x ${negB > 0 ? `+ ${negB}` : `- ${Math.abs(negB)}`}`;
      const step2 = `(${factorLeft})(${pxq}) = 0`;
      const step3 = `${factorLeft} = 0 \\quad \\text{or} \\quad ${pxq} = 0`;
      const step4 = `x = ${f1_latex} \\quad \\text{or} \\quad x = ${f2_latex}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solving Quadratic Equations using Factorisation",
        prompt: `Solve the quadratic equation by factorisation:\n\n$$${a}x(${pxq}) = ${b}(${pxq})$$`,
        inputCount: 2,
        inputLabels: ["x_1 =", "x_2 ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: step4,
        extraKeys,
        steps: [
          `Rearrange all terms to set the equation equal to zero: $$${step1}$$`,
          `Factorise out the common binomial factor $(${pxq})$: $$${step2}$$`,
          `Set each factor to zero: $$${step3}$$`,
          `Solve for $x$: $$${step4}$$`
        ]
      };
    }

    // subType === 4: a^2 - b^2 x^2 = 0
    const b = randInt(2, 6);
    const a = randInt(1, 7);
    const a2 = a * a;
    const b2 = b * b;

    const ans1 = formatFracPlain(a, b);
    const ans2 = formatFracPlain(-a, b);
    const f1_latex = formatFracLaTeX(a, b);
    const f2_latex = formatFracLaTeX(-a, b);

    const step1 = `${a2} - ${b2}x^2 = 0`;
    const f1 = `${a} - ${b}x`;
    const f2 = `${a} + ${b}x`;
    const step2 = `(${f1})(${f2}) = 0`;
    const step3 = `${f1} = 0 \\quad \\text{or} \\quad ${f2} = 0`;
    const step4 = `x = ${f1_latex} \\quad \\text{or} \\quad x = ${f2_latex}`;

    return {
      strand: "Algebra",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Solving Quadratic Equations using Factorisation",
      prompt: `Solve the quadratic equation by factorisation:\n\n$$${step1}$$`,
      inputCount: 2,
      inputLabels: ["x_1 =", "x_2 ="],
      expectedAnswer: [ans1, ans2],
      displayAnswer: step4,
      extraKeys,
      steps: [
        `Write the equation in factorised form using difference of two squares: $$${step2}$$`,
        `Set each factor to zero: $$${step3}$$`,
        `Solve for $x$: $$${step4}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Common Binomial Factor Across Products & Squared Binomial)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // (ax + b)(x + c) = (dx + e)(x + c)
    const a = randInt(3, 6);
    const b = randInt(-6, 6, true);
    const c = randInt(-5, 5, true);
    const d = randInt(1, 2);
    const e = randInt(-6, 6, true);

    const b_eff = b === e ? (b === 6 ? -5 : b + 1) : b;

    const LHS_f1 = `${a === 1 ? "x" : `${a}x`} ${b_eff > 0 ? `+ ${b_eff}` : `- ${Math.abs(b_eff)}`}`;
    const LHS_f2 = `x ${c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`}`;
    const RHS_f1 = `${d === 1 ? "x" : `${d}x`} ${e > 0 ? `+ ${e}` : `- ${Math.abs(e)}`}`;

    const LHS = `(${LHS_f1})(${LHS_f2})`;
    const RHS = `(${RHS_f1})(${LHS_f2})`;

    const coeffA2 = a - d;
    const coeffB2 = b_eff - e;
    const simplified_f1 = `${coeffA2 === 1 ? "x" : `${coeffA2}x`} ${coeffB2 > 0 ? `+ ${coeffB2}` : `- ${Math.abs(coeffB2)}`}`;

    const ans1 = `${-c}`;
    const ans1_tex = `${-c}`;
    const ans2_tex = formatFracLaTeX(e - b_eff, a - d);
    const ans2 = formatFracPlain(e - b_eff, a - d);

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Solving Quadratic Equations using Factorisation",
      prompt: `Solve the quadratic equation by factorisation:\n\n$$${LHS} = ${RHS}$$`,
      inputCount: 2,
      inputLabels: ["x =", "or  x ="],
      expectedAnswer: [ans1, ans2],
      displayAnswer: `x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}`,
      extraKeys,
      steps: [
        `Rearrange all terms to one side of the equation: $$(${LHS_f1})(${LHS_f2}) - (${RHS_f1})(${LHS_f2}) = 0$$`,
        `Factorise out the common factor $(${LHS_f2})$: $$(${LHS_f2})[(${LHS_f1}) - (${RHS_f1})] = 0$$`,
        `Simplify inside the square bracket to complete factorisation: $$(${LHS_f2})(${simplified_f1}) = 0$$`,
        `Set each factor equal to zero and solve for $x$: $$x = ${ans1_tex} \\quad \\text{or} \\quad x = ${ans2_tex}$$`
      ]
    };
  }

  // subType === 2: (x + a)^2 = b(x + a)
  const a = randInt(-6, 6, true);
  const b = randInt(2, 9);

  const r1 = -a;
  const r2 = b - a;
  const diffAB = a - b;

  const xa = `x ${a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`}`;
  const x_ab = `x ${diffAB > 0 ? `+ ${diffAB}` : `- ${Math.abs(diffAB)}`}`;

  const step1 = `(${xa})^2 - ${b}(${xa}) = 0`;
  const step2 = `(${xa})(${x_ab}) = 0`;
  const step3 = `${xa} = 0 \\quad \\text{or} \\quad ${x_ab} = 0`;
  const step4 = `x = ${r1} \\quad \\text{or} \\quad x = ${r2}`;

  return {
    strand: "Algebra",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Solving Quadratic Equations using Factorisation",
    prompt: `Solve the quadratic equation by factorisation:\n\n$$(${xa})^2 = ${b}(${xa})$$`,
    inputCount: 2,
    inputLabels: ["x_1 =", "x_2 ="],
    expectedAnswer: [`${r1}`, `${r2}`],
    displayAnswer: step4,
    extraKeys,
    steps: [
      `Rearrange the equation to set it equal to zero: $$${step1}$$`,
      `Factorise out the common factor $(${xa})$: $$${step2}$$`,
      `Set each factor to zero: $$${step3}$$`,
      `Solve for $x$: $$${step4}$$`
    ]
  };
}

export const solveQuadraticEquationByFactorisation = { generate: generateQuestion };
export default generateQuestion;
