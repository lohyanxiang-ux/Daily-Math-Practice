/**
 * Question Generator: Addition & Subtraction of Algebraic Fractions
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

function gcd3(a, b, c) {
  return gcd(gcd(a, b), c);
}

export function generateQuestion(tier = 1) {
  const extraKeys = ["x", "y", "z", "a", "b", "c"];

  // =========================================================
  // TIER 1: BASIC (Level 1 - Numerical & Simple Monomial Denominators)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Numerical denominators with linear numerators: (x + a)/b +/- (x + c)/d
      const b = randInt(2, 5);
      let d = randInt(2, 5);
      if (b === d) d = b + 1;

      const a = randInt(-5, 5, true);
      const c = randInt(-5, 5, true);
      const isAdd = randInt(0, 1) === 1;
      const opSym = isAdd ? "+" : "-";

      const lcm = (b * d) / gcd(b, d);
      const m1 = lcm / b;
      const m2 = lcm / d;

      const coeffX = isAdd ? (m1 + m2) : (m1 - m2);
      const constVal = isAdd ? (m1 * a + m2 * c) : (m1 * a - m2 * c);

      const g = gcd3(coeffX, constVal, lcm);
      const simpCoeffX = coeffX / g;
      const simpConstVal = constVal / g;
      const simpDen = lcm / g;

      const term1_num = `x ${a > 0 ? '+ ' + a : '- ' + Math.abs(a)}`;
      const term2_num = `x ${c > 0 ? '+ ' + c : '- ' + Math.abs(c)}`;
      const expr = `\\frac{${term1_num}}{${b}} ${opSym} \\frac{${term2_num}}{${d}}`;

      let numStr = "";
      if (simpCoeffX === 1) numStr = "x";
      else if (simpCoeffX === -1) numStr = "-x";
      else if (simpCoeffX !== 0) numStr = `${simpCoeffX}x`;

      if (simpConstVal > 0) {
        numStr = numStr ? `${numStr} + ${simpConstVal}` : `${simpConstVal}`;
      } else if (simpConstVal < 0) {
        numStr = numStr ? `${numStr} - ${Math.abs(simpConstVal)}` : `-${Math.abs(simpConstVal)}`;
      }

      const ans = simpDen === 1 ? numStr : `\\frac{${numStr}}{${simpDen}}`;

      const step1 = `\\frac{${m1}(${term1_num}) ${opSym} ${m2}(${term2_num})}{${lcm}}`;
      const step2 = `\\frac{${m1 * 1}x ${m1 * a > 0 ? '+' : ''}${m1 * a} ${isAdd ? '+' : '-'}(${m2 * 1}x ${m2 * c > 0 ? '+' : ''}${m2 * c})}{${lcm}}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: extraKeys,
        steps: [
          `Find the common denominator ($${lcm}$) and rewrite as a single fraction: $$${step1}$$`,
          `Expand the numerators: $$${step2}$$`,
          `Simplify by combining like terms: $$${ans}$$`
        ]
      };
    } else {
      // Monomial denominators with variables: a/(bx) +/- c/(dx)
      const a = randInt(1, 5);
      const c = randInt(1, 5);
      const b = randInt(2, 4);
      const d = randInt(2, 4);
      const isAdd = randInt(0, 1) === 1;
      const opSym = isAdd ? "+" : "-";

      const lcmCoeff = (b * d) / gcd(b, d);
      const m1 = lcmCoeff / b;
      const m2 = lcmCoeff / d;

      const numRaw = isAdd ? (a * m1 + c * m2) : (a * m1 - c * m2);
      const g = gcd(numRaw, lcmCoeff);
      const simpNum = numRaw / g;
      const simpDenCoeff = lcmCoeff / g;

      const expr = `\\frac{${a}}{${b}x} ${opSym} \\frac{${c}}{${d}x}`;
      const denStr = simpDenCoeff === 1 ? "x" : `${simpDenCoeff}x`;
      const ans = `\\frac{${simpNum}}{${denStr}}`;

      const step1 = `\\frac{${a * m1} ${opSym} ${c * m2}}{${lcmCoeff}x}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: extraKeys,
        steps: [
          `Find the lowest common denominator ($${lcmCoeff}x$): $$${step1}$$`,
          `Simplify the numerator and reduce to simplest form: $$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Linear Binomials & Difference of Squares)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Linear binomial denominators: a/(x + b) + c/(x + d)
      const a = randInt(1, 4);
      const c = randInt(1, 4);
      const b = randInt(-4, 4, true);
      let d = randInt(-4, 4, true);
      if (b === d) d = b + 1;

      const isAdd = randInt(0, 1) === 1;
      const opSym = isAdd ? "+" : "-";

      const coeffX = isAdd ? (a + c) : (a - c);
      const constVal = isAdd ? (a * d + c * b) : (a * d - c * b);

      let numStr = "";
      if (coeffX === 1) numStr = "x";
      else if (coeffX === -1) numStr = "-x";
      else if (coeffX !== 0) numStr = `${coeffX}x`;

      if (constVal > 0) {
        numStr = numStr ? `${numStr} + ${constVal}` : `${constVal}`;
      } else if (constVal < 0) {
        numStr = numStr ? `${numStr} - ${Math.abs(constVal)}` : `-${Math.abs(constVal)}`;
      }

      const den1 = `x ${b > 0 ? '+ ' + b : '- ' + Math.abs(b)}`;
      const den2 = `x ${d > 0 ? '+ ' + d : '- ' + Math.abs(d)}`;
      const expr = `\\frac{${a}}{${den1}} ${opSym} \\frac{${c}}{${den2}}`;

      const denAns = `(${den1.replace(/\s+/g, "")})(${den2.replace(/\s+/g, "")})`;
      const ans = `\\frac{${numStr}}{${denAns}}`;

      const step1 = `\\frac{${a}(${den2}) ${opSym} ${c}(${den1})}{(${den1.replace(/\s+/g, "")})(${den2.replace(/\s+/g, "")})}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: extraKeys,
        steps: [
          `Combine over a common denominator: $$${step1}$$`,
          `Expand and simplify the numerator: $$${ans}$$`
        ]
      };
    } else {
      // Difference of two squares denominator: a/(x - b) - c/(x^2 - b^2)
      const a = randInt(1, 4);
      const b = randInt(1, 4);
      const c = randInt(1, 6);
      const b2 = b * b;

      const constVal = a * b - c;

      let numStr = a === 1 ? "x" : `${a}x`;
      if (constVal > 0) numStr += ` + ${constVal}`;
      else if (constVal < 0) numStr += ` - ${Math.abs(constVal)}`;

      const expr = `\\frac{${a}}{x - ${b}} - \\frac{${c}}{x^2 - ${b2}}`;
      const step1 = `\\frac{${a}}{x - ${b}} - \\frac{${c}}{(x - ${b})(x + ${b})}`;
      const step2 = `\\frac{${a}(x + ${b}) - ${c}}{(x - ${b})(x + ${b})}`;
      const ans = `\\frac{${numStr.replace(/\s+/g, "")}}{(x-${b})(x+${b})}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: extraKeys,
        steps: [
          `Factorize the quadratic denominator $x^2 - ${b2}$: $$${step1}$$`,
          `Write over a common denominator $(x - ${b})(x + ${b})$: $$${step2}$$`,
          `Expand and simplify the numerator: $$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Quadratic Trinomials & Opposite Sign Denominators)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Quadratic Trinomial Denominator: a/(x + b) + c/(x^2 + (b+d)x + bd)
    const a = randInt(1, 4);
    const b = randInt(1, 4);
    const d = randInt(1, 4);
    const c = randInt(1, 5);

    const sumBD = b + d;
    const prodBD = b * d;
    const constVal = a * d + c;

    const expr = `\\frac{${a}}{x + ${b}} + \\frac{${c}}{x^2 + ${sumBD}x + ${prodBD}}`;
    const numStr = a === 1 ? `x + ${constVal}` : `${a}x + ${constVal}`;
    const ans = `\\frac{${numStr.replace(/\s+/g, "")}}{(x+${b})(x+${d})}`;

    const step1 = `\\frac{${a}}{x + ${b}} + \\frac{${c}}{(x + ${b})(x + ${d})}`;
    const step2 = `\\frac{${a}(x + ${d}) + ${c}}{(x + ${b})(x + ${d})}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Addition & Subtraction of Algebraic Fractions",
      prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys: extraKeys,
      steps: [
        `Factorize the quadratic denominator $x^2 + ${sumBD}x + ${prodBD}$: $$${step1}$$`,
        `Combine numerators over the common denominator: $$${step2}$$`,
        `Simplify to state final answer: $$${ans}$$`
      ]
    };
  } else {
    // Opposite Sign Binomial Denominators: a/(x - b) - c/(b - x) = (a + c)/(x - b)
    const a = randInt(2, 6);
    const c = randInt(2, 6);
    const b = randInt(1, 5);

    const sumAC = a + c;
    const expr = `\\frac{${a}}{x - ${b}} - \\frac{${c}}{${b} - x}`;
    const step1 = `\\frac{${a}}{x - ${b}} - \\frac{${c}}{-(x - ${b})}`;
    const step2 = `\\frac{${a}}{x - ${b}} + \\frac{${c}}{x - ${b}}`;
    const ans = `\\frac{${sumAC}}{x-${b}}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Addition & Subtraction of Algebraic Fractions",
      prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
      inputCount: 1,
      inputLabels: ["="],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys: extraKeys,
      steps: [
        `Factor out $-1$ from the second denominator: $$${step1}$$`,
        `Convert to addition of fractions with identical denominators: $$${step2}$$`,
        `Combine numerators to simplify: $$${ans}$$`
      ]
    };
  }
}

export const additionSubtractionAlgebraicFractions = { generate: generateQuestion };
export default generateQuestion;
