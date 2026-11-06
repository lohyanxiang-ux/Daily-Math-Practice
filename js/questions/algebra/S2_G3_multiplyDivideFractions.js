/**
 * Question Generator: Multiplication & Division of Algebraic Fractions
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
  return a;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Monomial Algebraic Fractions)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Structure 1: Monomial Multiplication
      const a = randInt(2, 6);
      const b = randInt(2, 6);
      const c = randInt(2, 6);
      const d = randInt(2, 6);

      const num_raw = a * c;
      const den_raw = b * d;
      const g = gcd(num_raw, den_raw);
      const num = num_raw / g;
      const den = den_raw / g;

      const expr = `\\frac{${a}x}{${b}} \\times \\frac{${c}y}{${d}x^2}`;
      const step1 = `\\frac{${num_raw}xy}{${den_raw}x^2}`;
      const num_str = num === 1 ? "y" : `${num}y`;
      const den_str = den === 1 ? "x" : `${den}x`;
      const step2 = `\\frac{${num_str}}{${den_str}}`;
      const ans = `\\frac{${num_str}}{${den_str}}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Multiplication & Division of Algebraic Fractions",
        prompt: `Simplify the algebraic expression:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: ["x", "y", "a", "b", "c"],
        steps: [
          `Multiply numerators and denominators respectively: $$${step1}$$`,
          `Simplify by canceling common terms and factors: $$${step2}$$`
        ]
      };
    } else if (subType === 2) {
      // Structure 2: Monomial Division (x and y)
      const a = randInt(2, 6);
      const b = randInt(2, 6);
      const c = randInt(2, 6);
      const d = randInt(2, 6);

      const num_raw = a * d;
      const den_raw = b * c;
      const g = gcd(num_raw, den_raw);
      const num = num_raw / g;
      const den = den_raw / g;

      const expr = `\\frac{${a}x}{${b}y} \\div \\frac{${c}x^2}{${d}}`;
      const kcf = `\\frac{${a}x}{${b}y} \\times \\frac{${d}}{${c}x^2}`;
      const step2 = `\\frac{${num_raw}x}{${den_raw}x^2y}`;
      const num_str = num === 1 ? "1" : num.toString();
      const den_str = den === 1 ? "xy" : `${den}xy`;
      const step3 = `\\frac{${num_str}}{${den_str}}`;
      const ans = `\\frac{${num_str}}{${den_str}}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Multiplication & Division of Algebraic Fractions",
        prompt: `Simplify the algebraic expression:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: ["x", "y", "a", "b", "c"],
        steps: [
          `Apply Keep-Change-Flip (KCF) to convert division into multiplication: $$${kcf}$$`,
          `Multiply numerators and denominators respectively: $$${step2}$$`,
          `Simplify by canceling common terms: $$${step3}$$`
        ]
      };
    } else {
      // Structure 3: Monomial Division (a, b, and c)
      const a = randInt(2, 5);
      const b = randInt(2, 5);
      const c = randInt(2, 5);
      const d = randInt(2, 5);

      const num_raw = a * d;
      const den_raw = b * c;
      const g = gcd(num_raw, den_raw);
      const num = num_raw / g;
      const den = den_raw / g;

      const expr = `\\frac{${a}ab}{${b}c} \\div \\frac{${c}b}{${d}c^2}`;
      const kcf = `\\frac{${a}ab}{${b}c} \\times \\frac{${d}c^2}{${c}b}`;
      const step2 = `\\frac{${num_raw}abc^2}{${den_raw}bc}`;
      const num_str = num === 1 ? "ac" : `${num}ac`;
      const den_str = den === 1 ? "b" : `${den}b`;
      const step3 = `\\frac{${num_str}}{${den_str}}`;
      const ans = `\\frac{${num_str}}{${den_str}}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Multiplication & Division of Algebraic Fractions",
        prompt: `Simplify the algebraic expression:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: ["a", "b", "c", "x", "y"],
        steps: [
          `Apply Keep-Change-Flip (KCF) to convert division into multiplication: $$${kcf}$$`,
          `Multiply numerators and denominators respectively: $$${step2}$$`,
          `Simplify by canceling common variables and numerical factors: $$${step3}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Linear Terms & Difference of Squares)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Structure 1: Linear Term Multiplication
      const a = randInt(1, 5);
      const b = randInt(2, 4);
      const c = randInt(1, 5);
      const d = randInt(2, 4);

      const denCoeff = b * d;
      const g = gcd(c, denCoeff);
      const num = c / g;
      const den = denCoeff / g;

      const expr = `\\frac{x + ${a}}{${b}x} \\times \\frac{${c}}{${d}(x + ${a})}`;
      const step1 = `\\frac{${c}(x + ${a})}{${denCoeff}x(x + ${a})}`;
      const den_str = den === 1 ? "x" : `${den}x`;
      const step2 = `\\frac{${num}}{${den_str}}`;
      const ans = `\\frac{${num}}{${den_str}}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Multiplication & Division of Algebraic Fractions",
        prompt: `Simplify the algebraic fraction:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: ["x", "y", "a", "b", "c"],
        steps: [
          `Multiply numerators and denominators respectively: $$${step1}$$`,
          `Cancel the common linear factor $(x + ${a})$: $$${step2}$$`
        ]
      };
    } else if (subType === 2) {
      // Structure 2: Factorizing Linear Numerator Division
      const a = randInt(2, 5);
      const b = randInt(1, 5);
      const c = randInt(2, 5);
      const d = randInt(2, 5);

      const ab = a * b;
      const num_raw = a * d;
      const g = gcd(num_raw, c);
      const num = num_raw / g;
      const den = c / g;

      const expr = `\\frac{${a}x - ${ab}}{${c}x} \\div \\frac{x - ${b}}{${d}}`;
      const kcf = `\\frac{${a}x - ${ab}}{${c}x} \\times \\frac{${d}}{x - ${b}}`;
      const step2 = `\\frac{${a}(x - ${b})}{${c}x} \\times \\frac{${d}}{x - ${b}}`;
      const den_str = den === 1 ? "x" : `${den}x`;
      const step3 = `\\frac{${num}}{${den_str}}`;
      const ans = `\\frac{${num}}{${den_str}}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Multiplication & Division of Algebraic Fractions",
        prompt: `Simplify the algebraic fraction:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: ["x", "y", "a", "b", "c"],
        steps: [
          `Apply Keep-Change-Flip (KCF) to convert division into multiplication: $$${kcf}$$`,
          `Factorize linear terms in the numerator: $$${step2}$$`,
          `Cancel common factor $(x - ${b})$: $$${step3}$$`
        ]
      };
    } else {
      // Structure 3: Difference of Two Squares Division
      const a = randInt(1, 5);
      const b = randInt(1, 5);
      const c = randInt(2, 5);

      const b2 = b * b;
      const expr = `\\frac{x - ${a}}{x^2 - ${b2}} \\div \\frac{${c}}{x + ${b}}`;
      const kcf = `\\frac{x - ${a}}{x^2 - ${b2}} \\times \\frac{x + ${b}}{${c}}`;
      const step2 = `\\frac{x - ${a}}{(x - ${b})(x + ${b})} \\times \\frac{x + ${b}}{${c}}`;
      const den_str = c === 1 ? `x - ${b}` : `${c}(x - ${b})`;
      const step3 = `\\frac{x - ${a}}{${den_str}}`;
      const ans = `\\frac{x - ${a}}{${den_str}}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Multiplication & Division of Algebraic Fractions",
        prompt: `Simplify the algebraic fraction:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: ["x", "y", "a", "b", "c"],
        steps: [
          `Apply Keep-Change-Flip (KCF) to convert division into multiplication: $$${kcf}$$`,
          `Factorize the difference of two squares $x^2 - ${b2}$: $$${step2}$$`,
          `Cancel common factor $(x + ${b})$: $$${step3}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Quadratic Trinomials & Full Factorization)
  // =========================================================
  const subType = randInt(1, 3);

  if (subType === 1) {
    // Structure 1: Quadratic Trinomial Multiplication
    const a = randInt(1, 5);
    const b = randInt(1, 5);
    const c = randInt(1, 5);

    const sumAB = a + b;
    const prodAB = a * b;

    const expr = `\\frac{x^2 + ${sumAB}x + ${prodAB}}{x + ${c}} \\times \\frac{1}{x + ${a}}`;
    const step1 = `\\frac{(x + ${a})(x + ${b})}{x + ${c}} \\times \\frac{1}{x + ${a}}`;
    const step2 = `\\frac{x + ${b}}{x + ${c}}`;
    const ans = `\\frac{x + ${b}}{x + ${c}}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Multiplication & Division of Algebraic Fractions",
      prompt: `Simplify the expression by factorizing:\n\n$$${expr}$$`,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys: ["x", "y", "a", "b", "c"],
      steps: [
        `Factorize the quadratic trinomial $x^2 + ${sumAB}x + ${prodAB}$: $$${step1}$$`,
        `Cancel common factor $(x + ${a})$: $$${step2}$$`
      ]
    };
  } else if (subType === 2) {
    // Structure 2: Full Quadratic Factorization Division
    const a = randInt(1, 5);
    const b = randInt(1, 5);
    const c = randInt(1, 5);

    const a2 = a * a;
    const sumBC = b + c;
    const prodBC = b * c;

    const expr = `\\frac{x^2 - ${a2}}{x^2 + ${sumBC}x + ${prodBC}} \\div \\frac{x - ${a}}{x + ${b}}`;
    const kcf = `\\frac{x^2 - ${a2}}{x^2 + ${sumBC}x + ${prodBC}} \\times \\frac{x + ${b}}{x - ${a}}`;
    const step2 = `\\frac{(x - ${a})(x + ${a})}{(x + ${b})(x + ${c})} \\times \\frac{x + ${b}}{x - ${a}}`;
    const step3 = `\\frac{x + ${a}}{x + ${c}}`;
    const ans = `\\frac{x + ${a}}{x + ${c}}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Multiplication & Division of Algebraic Fractions",
      prompt: `Simplify the expression completely:\n\n$$${expr}$$`,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys: ["x", "y", "a", "b", "c"],
      steps: [
        `Apply Keep-Change-Flip (KCF) to convert division into multiplication: $$${kcf}$$`,
        `Factorize all numerators and denominators completely: $$${step2}$$`,
        `Cancel common factors $(x - ${a})$ and $(x + ${b})$: $$${step3}$$`
      ]
    };
  } else {
    // Structure 3: Quadratic Denominator Division
    const a = randInt(1, 5);
    const b = randInt(1, 5);
    const c = randInt(1, 5);
    const d = randInt(2, 5);

    const sumBC = b + c;
    const prodBC = b * c;

    const expr = `\\frac{x + ${a}}{x^2 + ${sumBC}x + ${prodBC}} \\div \\frac{${d}}{x + ${b}}`;
    const kcf = `\\frac{x + ${a}}{x^2 + ${sumBC}x + ${prodBC}} \\times \\frac{x + ${b}}{${d}}`;
    const step2 = `\\frac{x + ${a}}{(x + ${b})(x + ${c})} \\times \\frac{x + ${b}}{${d}}`;
    const den_str = d === 1 ? `x + ${c}` : `${d}(x + ${c})`;
    const step3 = `\\frac{x + ${a}}{${den_str}}`;
    const ans = `\\frac{x + ${a}}{${den_str}}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Multiplication & Division of Algebraic Fractions",
      prompt: `Simplify the expression completely:\n\n$$${expr}$$`,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys: ["x", "y", "a", "b", "c"],
      steps: [
        `Apply Keep-Change-Flip (KCF) to convert division into multiplication: $$${kcf}$$`,
        `Factorize the quadratic denominator: $$${step2}$$`,
        `Cancel common factor $(x + ${b})$: $$${step3}$$`
      ]
    };
  }
}

export const multiplicationDivisionAlgebraicFractions = { generate: generateQuestion };
export default generateQuestion;
