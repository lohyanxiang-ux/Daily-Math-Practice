/**
 * Question Generator: Simplify Algebraic Fractions
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

export function generateQuestion(tier = 1) {
  const extraKeys = ["a", "b", "p", "q", "x", "y"];

  // =========================================================
  // TIER 1: BASIC (Level 1 - Common Monomial & Binomial Factors)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // kx / (ax^2 + bx)
      const k = randInt(2, 8);
      const a = randInt(2, 6);
      const b = randInt(1, 9, true);

      const g_den = gcd(a, Math.abs(b));
      const a_sim = a / g_den;
      const b_sim = b / g_den;

      const denCommon = g_den === 1 ? "x" : `${g_den}x`;
      const denInnerNoSpace = `${a_sim === 1 ? "x" : `${a_sim}x`}${b_sim > 0 ? `+${b_sim}` : `-${Math.abs(b_sim)}`}`;
      const denInnerLaTeX = `${a_sim === 1 ? "x" : `${a_sim}x`} ${b_sim > 0 ? `+ ${b_sim}` : `- ${Math.abs(b_sim)}`}`;
      const denFactored = `${denCommon}(${denInnerLaTeX})`;

      const num = `${k}x`;
      const den = `${a === 1 ? "" : a}x^2 ${b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x`;

      const g_common = gcd(k, g_den);
      const cancelFactorStr = g_common === 1 ? "x" : `${g_common}x`;
      const k_ans = k / g_common;
      const g_rem = g_den / g_common;

      const ansDenNoSpace = g_rem === 1 ? denInnerNoSpace : `${g_rem}(${denInnerNoSpace})`;
      const ansDenLaTeX = g_rem === 1 ? denInnerLaTeX : `${g_rem}(${denInnerLaTeX})`;

      const ans = `\\frac{${k_ans}}{${ansDenNoSpace}}`;
      const ansLaTeX = `\\frac{${k_ans}}{${ansDenLaTeX}}`;
      const numFactoredStep = g_common === k ? num : `${cancelFactorStr}(${k_ans})`;
      const step1 = `\\frac{${numFactoredStep}}{${denFactored}}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Simplify Algebraic Fractions",
        prompt: `Express the algebraic fraction in its simplest form:\n\n$$\\frac{${num}}{${den}}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ansLaTeX,
        extraKeys: extraKeys,
        steps: [
          `Factorize both numerator and denominator completely by taking out common factors: $$${step1}$$`,
          `Cancel the common factor $${cancelFactorStr}$ from the numerator and denominator: $$${ansLaTeX}$$`
        ]
      };
    } else {
      // (kx^2 + kxy) / (m_eff*xy + m_eff*y^2)
      const k = randInt(2, 6);
      const m = randInt(2, 7);
      const m_eff = m === k ? m + 1 : m;

      const g = gcd(k, m_eff);
      const k_sim = k / g;
      const m_sim = m_eff / g;

      const num = `${k}x^2 + ${k}xy`;
      const den = `${m_eff}xy + ${m_eff}y^2`;

      const numFactored = `${k}x(x + y)`;
      const denFactored = `${m_eff}y(x + y)`;

      const ansNum = k_sim === 1 ? "x" : `${k_sim}x`;
      const ansDen = m_sim === 1 ? "y" : `${m_sim}y`;

      const ans = `\\frac{${ansNum}}{${ansDen}}`;
      const step1 = `\\frac{${numFactored}}{${denFactored}}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Simplify Algebraic Fractions",
        prompt: `Express the algebraic fraction in its simplest form:\n\n$$\\frac{${num}}{${den}}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: extraKeys,
        steps: [
          `Factorize both numerator and denominator by grouping common factors: $$${step1}$$`,
          `Cancel the common linear factor $(x + y)$ and simplify any common numerical coefficients: $$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Difference of Two Squares)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // (x^2 - a^2) / (x^2 + (b_eff - a)x - ab_eff)
      const a = randInt(2, 6);
      const b = randInt(1, 6);
      const b_eff = b === a ? b + 1 : b;

      const a2 = a * a;
      const b_minus_a = b_eff - a;
      const ab = a * b_eff;

      const num = `x^2 - ${a2}`;
      const denTerm2 = b_minus_a === 0
        ? ""
        : (b_minus_a === 1
          ? "+ x "
          : (b_minus_a === -1
            ? "- x "
            : (b_minus_a > 0 ? `+ ${b_minus_a}x ` : `- ${Math.abs(b_minus_a)}x `)));
      const den = `x^2 ${denTerm2}- ${ab}`;

      const step1 = `\\frac{(x - ${a})(x + ${a})}{(x - ${a})(x + ${b_eff})}`;
      const ans = `\\frac{x+${a}}{x+${b_eff}}`;
      const ansLaTeX = `\\frac{x + ${a}}{x + ${b_eff}}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Simplify Algebraic Fractions",
        prompt: `Simplify the algebraic fraction:\n\n$$\\frac{${num}}{${den}}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ansLaTeX,
        extraKeys: extraKeys,
        steps: [
          `Factorize the numerator using the difference of two squares, and factorize the quadratic trinomial in the denominator: $$${step1}$$`,
          `Cancel the common binomial factor $(x - ${a})$: $$${ansLaTeX}$$`
        ]
      };
    } else {
      // (a^2 x^2 - b^2 y^2) / (a x^2 - b xy)
      const a = randInt(1, 5);
      const b = randInt(1, 5);
      const b_eff = b === a ? b + 1 : b;

      const a2 = a * a;
      const b2 = b_eff * b_eff;

      const num = `${a2 === 1 ? "" : a2}x^2 - ${b2 === 1 ? "" : b2}y^2`;
      const den = `${a === 1 ? "" : a}x^2 - ${b_eff === 1 ? "" : b_eff}xy`;

      const termAX = a === 1 ? "x" : `${a}x`;
      const termBY = b_eff === 1 ? "y" : `${b_eff}y`;

      const step1 = `\\frac{(${termAX} - ${termBY})(${termAX} + ${termBY})}{x(${termAX} - ${termBY})}`;
      const ans = `\\frac{${termAX}+${termBY}}{x}`;
      const ansLaTeX = `\\frac{${termAX} + ${termBY}}{x}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Simplify Algebraic Fractions",
        prompt: `Simplify the algebraic fraction:\n\n$$\\frac{${num}}{${den}}$$`,
        inputCount: 1,
        inputLabels: ["="],
        expectedAnswer: ans,
        displayAnswer: ansLaTeX,
        extraKeys: extraKeys,
        steps: [
          `Factorize the numerator as a difference of two squares and factor out $x$ from the denominator: $$${step1}$$`,
          `Cancel the common factor: $$${ansLaTeX}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Factorisation by Grouping)
  // =========================================================
  const m = randInt(2, 4);
  const n = randInt(3, 6);
  const k = randInt(2, 5);
  const c = randInt(2, 5);

  const n_eff = n === m ? n + 1 : n;
  const km = k * m;
  const kn = k * n_eff;
  const cm = c * m;
  const cn = c * n_eff;

  const num = `${km}ab - ${kn}b^2`;
  const den = `${m}a^2 - ${n_eff}ab + ${cm}a - ${cn}b`;

  const step1 = `\\frac{${k}b(${m}a - ${n_eff}b)}{a(${m}a - ${n_eff}b) + ${c}(${m}a - ${n_eff}b)}`;
  const step2 = `\\frac{${k}b(${m}a - ${n_eff}b)}{(a + ${c})(${m}a - ${n_eff}b)}`;

  const ans = `\\frac{${k}b}{a+${c}}`;
  const ansLaTeX = `\\frac{${k}b}{a + ${c}}`;

  return {
    strand: "Algebra",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Simplify Algebraic Fractions",
    prompt: `Simplify the following algebraic fraction:\n\n$$\\frac{${num}}{${den}}$$`,
    inputCount: 1,
    inputLabels: ["="],
    expectedAnswer: ans,
    displayAnswer: ansLaTeX,
    extraKeys: extraKeys,
    steps: [
      `Factorize the numerator and group terms in the denominator: $$${step1}$$`,
      `Complete factorizing the denominator by grouping: $$${step2}$$`,
      `Cancel the common binomial factor: $$${ansLaTeX}$$`
    ]
  };
}

export const simplifyAlgebraicFractions = { generate: generateQuestion };
export default generateQuestion;
```[cite: 1, 18]
