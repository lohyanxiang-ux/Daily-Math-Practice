/**
 * Question Generator: Addition & Subtraction of Polynomials
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

/**
 * Formats polynomial terms into a compact algebraic string for answer verification.
 * e.g. (2, -3, 5, 'x') => "2x^2-3x+5"
 */
function formatAns(coeff2, coeff1, constTerm, varName = 'x') {
  let parts = [];

  // Degree 2 term
  if (coeff2 !== 0) {
    if (coeff2 === 1) parts.push(`${varName}^2`);
    else if (coeff2 === -1) parts.push(`-${varName}^2`);
    else parts.push(`${coeff2}${varName}^2`);
  }

  // Degree 1 term
  if (coeff1 !== 0) {
    if (coeff1 === 1) {
      parts.push(parts.length > 0 ? `+${varName}` : `${varName}`);
    } else if (coeff1 === -1) {
      parts.push(`-${varName}`);
    } else if (coeff1 > 0) {
      parts.push(parts.length > 0 ? `+${coeff1}${varName}` : `${coeff1}${varName}`);
    } else {
      parts.push(`${coeff1}${varName}`);
    }
  }

  // Constant term
  if (constTerm !== 0) {
    if (constTerm > 0) {
      parts.push(parts.length > 0 ? `+${constTerm}` : `${constTerm}`);
    } else {
      parts.push(`${constTerm}`);
    }
  }

  return parts.join('') || '0';
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Combining Un-bracketed Like Terms)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Un-grouped terms in x (x^2, constant, x, x^2, x)
      const a = randInt(-5, 5, true);
      const b = randInt(-8, 8, true);
      const c = randInt(-6, 6, true);
      let d = randInt(-5, 5, true);
      const e = randInt(-6, 6, true);

      // Ensure x^2 terms don't completely cancel out to zero
      const d_eff = (a + d === 0) ? (d > 0 ? d + 1 : d - 1) : d;

      const coeffX2 = a + d_eff;
      const coeffX = c + e;
      const constTerm = b;

      const t1 = a === 1 ? 'x^2' : (a === -1 ? '-x^2' : `${a}x^2`);
      const t2 = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const t3 = c === 1 ? '+ x' : (c === -1 ? '- x' : (c > 0 ? `+ ${c}x` : `- ${Math.abs(c)}x`));
      const t4 = d_eff === 1 ? '+ x^2' : (d_eff === -1 ? '- x^2' : (d_eff > 0 ? `+ ${d_eff}x^2` : `- ${Math.abs(d_eff)}x^2`));
      const t5 = e === 1 ? '+ x' : (e === -1 ? '- x' : (e > 0 ? `+ ${e}x` : `- ${Math.abs(e)}x`));

      const expr = `${t1} ${t2} ${t3} ${t4} ${t5}`;
      const ans = formatAns(coeffX2, coeffX, constTerm, 'x');
      const step1 = `(${t1} ${t4}) + (${t3} ${t5}) ${t2}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Addition & Subtraction",
        prompt: `Simplify the following expression:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Group like terms together (terms with $x^2$, terms with $x$, and constant terms): $$${step1}$$`,
          `Combine the coefficients of like terms: $$${ans}$$`
        ]
      };
    } else {
      // Un-grouped terms in y (constant, y, y^2, constant, y^2)
      const a = randInt(-9, 9, true);
      const b = randInt(-7, 7, true);
      const c = randInt(-5, 5, true);
      const d = randInt(-9, 9, true);
      let e = randInt(-5, 5, true);

      // Ensure y^2 terms don't cancel out completely
      const e_eff = (c + e === 0) ? (e > 0 ? e + 1 : e - 1) : e;

      const coeffY2 = c + e_eff;
      const coeffY = b;
      const constTerm = a + d;

      const t1 = a.toString();
      const t2 = b === 1 ? '+ y' : (b === -1 ? '- y' : (b > 0 ? `+ ${b}y` : `- ${Math.abs(b)}y`));
      const t3 = c === 1 ? '+ y^2' : (c === -1 ? '- y^2' : (c > 0 ? `+ ${c}y^2` : `- ${Math.abs(c)}y^2`));
      const t4 = d > 0 ? `+ ${d}` : `- ${Math.abs(d)}`;
      const t5 = e_eff === 1 ? '+ y^2' : (e_eff === -1 ? '- y^2' : (e_eff > 0 ? `+ ${e_eff}y^2` : `- ${Math.abs(e_eff)}y^2`));

      const expr = `${t1} ${t2} ${t3} ${t4} ${t5}`;
      const ans = formatAns(coeffY2, coeffY, constTerm, 'y');
      const step1 = `(${t3} ${t5}) ${t2} + (${t1} ${t4})`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Addition & Subtraction",
        prompt: `Simplify the following expression:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Group like terms together: $$${step1}$$`,
          `Simplify by combining like terms: $$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Polynomial Addition & Subtraction with Brackets)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Adding two polynomial brackets: (ax^2 + bx + c) + (dx^2 + ex + f)
      const a = randInt(-4, 4, true);
      const b = randInt(-6, 6, true);
      const c = randInt(-8, 8, true);
      let d = randInt(-4, 4, true);
      const e = randInt(-6, 6, true);
      const f = randInt(-8, 8, true);

      const d_eff = (a + d === 0) ? (d > 0 ? d + 1 : d - 1) : d;
      const coeffX2 = a + d_eff;
      const coeffX = b + e;
      const constTerm = c + f;

      const poly1 = `${a === 1 ? 'x^2' : (a === -1 ? '-x^2' : `${a}x^2`)} ${b === 1 ? '+ x' : (b === -1 ? '- x' : (b > 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`))} ${c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`}`;
      const poly2 = `${d_eff === 1 ? 'x^2' : (d_eff === -1 ? '-x^2' : `${d_eff}x^2`)} ${e === 1 ? '+ x' : (e === -1 ? '- x' : (e > 0 ? `+ ${e}x` : `- ${Math.abs(e)}x`))} ${f > 0 ? `+ ${f}` : `- ${Math.abs(f)}`}`;

      const expr = `(${poly1}) + (${poly2})`;
      const step1 = `${poly1} ${d_eff > 0 ? `+ ${d_eff}x^2` : `- ${Math.abs(d_eff)}x^2`} ${e > 0 ? `+ ${e}x` : `- ${Math.abs(e)}x`} ${f > 0 ? `+ ${f}` : `- ${Math.abs(f)}`}`;
      const ans = formatAns(coeffX2, coeffX, constTerm, 'x');

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Addition & Subtraction",
        prompt: `Simplify the following expression:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Remove the brackets when adding polynomials: $$${step1}$$`,
          `Combine like terms: $$${ans}$$`
        ]
      };
    } else {
      // Subtracting two polynomial brackets: (ay^2 + by + c) - (dy^2 + ey + f)
      const a = randInt(-4, 4, true);
      const b = randInt(-6, 6, true);
      const c = randInt(-8, 8, true);
      let d = randInt(-4, 4, true);
      const e = randInt(-6, 6, true);
      const f = randInt(-8, 8, true);

      const d_eff = (a - d === 0) ? (d > 0 ? d + 1 : d - 1) : d;
      const coeffY2 = a - d_eff;
      const coeffY = b - e;
      const constTerm = c - f;

      const poly1 = `${a === 1 ? 'y^2' : (a === -1 ? '-y^2' : `${a}y^2`)} ${b === 1 ? '+ y' : (b === -1 ? '- y' : (b > 0 ? `+ ${b}y` : `- ${Math.abs(b)}y`))} ${c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`}`;
      const poly2 = `${d_eff === 1 ? 'y^2' : (d_eff === -1 ? '-y^2' : `${d_eff}y^2`)} ${e === 1 ? '+ y' : (e === -1 ? '- y' : (e > 0 ? `+ ${e}y` : `- ${Math.abs(e)}y`))} ${f > 0 ? `+ ${f}` : `- ${Math.abs(f)}`}`;

      const expr = `(${poly1}) - (${poly2})`;

      const negD = -d_eff;
      const negE = -e;
      const negF = -f;

      const step1 = `${poly1} ${negD > 0 ? `+ ${negD}y^2` : `- ${Math.abs(negD)}y^2`} ${negE > 0 ? `+ ${negE}y` : `- ${Math.abs(negE)}y`} ${negF > 0 ? `+ ${negF}` : `- ${Math.abs(negF)}`}`;
      const ans = formatAns(coeffY2, coeffY, constTerm, 'y');

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Addition & Subtraction",
        prompt: `Simplify the following expression:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Distribute the minus sign through the second set of brackets: $$${step1}$$`,
          `Combine like terms to simplify: $$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Polynomials with Fractional Coefficients)
  // =========================================================
  const a = randInt(1, 5);
  const b = randInt(-6, -1);
  const c = randInt(1, 8);
  const d = randInt(-8, -1);
  const p = randInt(3, 11);
  const q = randInt(2, 4);

  // Ensure p/q doesn't simplify to a whole number initially
  const p_eff = (p % q === 0) ? p + 1 : p;
  const num_raw = a * q - p_eff;
  const gcdVal = gcd(num_raw, q);
  const simpNum = num_raw / gcdVal;
  const simpDen = q / gcdVal;

  const coeffY = b + d;
  const constTerm = c;
  const fracLaTeX = `\\frac{${p_eff}}{${q}}`;

  const term1 = a === 1 ? 'y^2' : `${a}y^2`;
  const term2 = b === -1 ? '- y' : `${b}y`;
  const term4 = d === -1 ? '- y' : `${d}y`;

  const expr = `${term1} ${term2} + ${c} ${term4} - ${fracLaTeX}y^2`;

  // Format y^2 term fraction for answer string
  let partY2 = "";
  if (simpDen === 1) {
    if (simpNum === 1) partY2 = "y^2";
    else if (simpNum === -1) partY2 = "-y^2";
    else if (simpNum !== 0) partY2 = `${simpNum}y^2`;
  } else {
    if (simpNum === 1) partY2 = `1/${simpDen}y^2`;
    else if (simpNum === -1) partY2 = `-1/${simpDen}y^2`;
    else partY2 = `${simpNum}/${simpDen}y^2`;
  }

  // Format y term
  let partY = "";
  if (coeffY !== 0) {
    if (coeffY === 1) partY = partY2 ? "+y" : "y";
    else if (coeffY === -1) partY = "-y";
    else if (coeffY > 0) partY = partY2 ? `+${coeffY}y` : `${coeffY}y`;
    else partY = `${coeffY}y`;
  }

  // Format constant term
  let partC = "";
  if (constTerm !== 0) {
    if (constTerm > 0) partC = (partY2 || partY) ? `+${constTerm}` : `${constTerm}`;
    else partC = `${constTerm}`;
  }

  const ans = (partY2 + partY + partC) || '0';
  const step1 = `\\left(${a} - ${fracLaTeX}\\right)y^2 + (${b} ${d > 0 ? `+ ${d}` : `- ${Math.abs(d)}`})y + ${c}`;

  return {
    strand: "Algebra",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Addition & Subtraction",
    prompt: `Simplify the expression containing fractional coefficients:\n\n$$${expr}$$`,
    expectedAnswer: ans,
    steps: [
      `Group coefficients for like terms: $$${step1}$$`,
      `Simplify the coefficients: $$${ans}$$`
    ]
  };
}

export const algebraicAdditionSubtraction = { generate: generateQuestion };
export default generateQuestion;
