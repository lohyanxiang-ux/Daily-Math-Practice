/**
 * Question Generator: Addition & Subtraction of Algebraic Fractions
 * Curriculum Skill: Sec 3 G3 - Algebra
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Single Variable & Monomial Denominators)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Structure: a/(kx) +/- b/(xy)
      const a = randInt(1, 9);
      const b = randInt(1, 9);
      const k = randInt(2, 5);
      const isAdd = randInt(0, 1);

      const op = isAdd === 1 ? '+' : '-';
      const bk = b * k;
      const expr = `\\frac{${a}}{${k}x} ${op} \\frac{${b}}{xy}`;
      const s2 = `The lowest common denominator is $${k}xy$.`;
      const s3 = `\\frac{${a}y}{${k}xy} ${op} \\frac{${bk}}{${k}xy}`;
      const s4 = `\\frac{${a}y ${op} ${bk}}{${k}xy}`;
      const ans = `\\frac{${a}y ${op} ${bk}}{${k}xy}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Identify the lowest common denominator among the terms: ${s2}`,
          `Manipulate each term to have the lowest common denominator: $$${s3}$$`,
          `Combine numerators over the common denominator: $$${s4}$$`,
          `Final simplified fraction: $$${ans}$$`
        ]
      };
    } else if (subType === 2) {
      // Structure: a/(xy) +/- b/(yz)
      const a = randInt(1, 9);
      const b = randInt(1, 9);
      const isAdd = randInt(0, 1);

      const op = isAdd === 1 ? '+' : '-';
      const expr = `\\frac{${a}}{xy} ${op} \\frac{${b}}{yz}`;
      const s2 = `The lowest common denominator is $xyz$.`;
      const s3 = `\\frac{${a}z}{xyz} ${op} \\frac{${b}x}{xyz}`;
      const s4 = `\\frac{${a}z ${op} ${b}x}{xyz}`;
      const ans = `\\frac{${a}z ${op} ${b}x}{xyz}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Identify the lowest common denominator among the terms: ${s2}`,
          `Manipulate each term to have the lowest common denominator: $$${s3}$$`,
          `Combine numerators over the common denominator: $$${s4}$$`,
          `Final simplified fraction: $$${ans}$$`
        ]
      };
    } else {
      // Structure: a +/- b/(kxy)
      const a = randInt(1, 5);
      const b = randInt(1, 15);
      const k = randInt(2, 5);
      const isAdd = randInt(0, 1);

      const op = isAdd === 1 ? '+' : '-';
      const ak = a * k;
      const expr = `${a} ${op} \\frac{${b}}{${k}xy}`;
      const s2 = `The lowest common denominator is $${k}xy$.`;
      const s3 = `\\frac{${ak}xy}{${k}xy} ${op} \\frac{${b}}{${k}xy}`;
      const s4 = `\\frac{${ak}xy ${op} ${b}}{${k}xy}`;
      const ans = `\\frac{${ak}xy ${op} ${b}}{${k}xy}`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Identify the lowest common denominator among the terms: ${s2}`,
          `Manipulate each term to have the lowest common denominator: $$${s3}$$`,
          `Combine numerators over the common denominator: $$${s4}$$`,
          `Final simplified fraction: $$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Binomial Numerators & Opposite Denominators)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Structure: (1 - x)/y +/- (1 - y)/x
      const isAdd = randInt(0, 1);
      const op = isAdd === 1 ? '+' : '-';
      const expr = `\\frac{1 - x}{y} ${op} \\frac{1 - y}{x}`;
      const s2 = `The lowest common denominator is $xy$.`;
      const s3 = `\\frac{x(1 - x)}{xy} ${op} \\frac{y(1 - y)}{xy}`;
      const s4 = `\\frac{x(1 - x) ${op} y(1 - y)}{xy}`;
      const ans = isAdd === 1 
        ? `\\frac{x - x^2 + y - y^2}{xy}` 
        : `\\frac{x - x^2 - y + y^2}{xy}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Identify the lowest common denominator among the terms: ${s2}`,
          `Manipulate each term to have the lowest common denominator: $$${s3}$$`,
          `Combine numerators over the common denominator: $$${s4}$$`,
          `Expand and simplify the numerator: $$${ans}$$`
        ]
      };
    } else if (subType === 2) {
      // Structure: a/(6ab^3) +/- b/(21a^2b)
      const a = randInt(2, 15);
      const b = randInt(2, 15);
      const isAdd = randInt(0, 1);

      const op = isAdd === 1 ? '+' : '-';
      const term1_num = a * 7;
      const term2_num = b * 2;
      const expr = `\\frac{${a}}{6ab^3} ${op} \\frac{${b}}{21a^2b}`;
      const s2 = `The lowest common denominator is $42a^2b^3$.`;
      const s3 = `\\frac{${a} \\times 7a}{42a^2b^3} ${op} \\frac{${b} \\times 2b^2}{42a^2b^3}`;
      const s4 = `\\frac{${term1_num}a ${op} ${term2_num}b^2}{42a^2b^3}`;
      const ans = `\\frac{${term1_num}a ${op} ${term2_num}b^2}{42a^2b^3}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Identify the lowest common denominator among the terms: ${s2}`,
          `Manipulate each term to have the lowest common denominator: $$${s3}$$`,
          `Combine numerators over the common denominator: $$${s4}$$`,
          `Final simplified fraction: $$${ans}$$`
        ]
      };
    } else {
      // Structure: a/(bx - c) +/- d/(c - bx) (Opposite denominator sign change)
      const a = randInt(2, 9);
      const b = randInt(2, 5);
      const c = randInt(1, 9);
      const d = randInt(1, 8);
      const isAdd = randInt(0, 1);

      const op = isAdd === 1 ? '+' : '-';
      const opFlipped = isAdd === 1 ? '-' : '+';
      const eff_d = isAdd === 1 ? a - d : a + d;

      const expr = `\\frac{${a}}{${b}x - ${c}} ${op} \\frac{${d}}{${c} - ${b}x}`;
      const s2 = `The lowest common denominator is $${b}x - ${c}$.`;
      const s3 = `\\frac{${a}}{${b}x - ${c}} ${opFlipped} \\frac{${d}}{${b}x - ${c}}`;
      const s4 = `\\frac{${a} ${opFlipped} ${d}}{${b}x - ${c}}`;
      const ans = `\\frac{${eff_d}}{${b}x - ${c}}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Addition & Subtraction of Algebraic Fractions",
        prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Note that $(${c} - ${b}x) = -(${b}x - ${c})$. Rewrite with lowest common denominator: ${s2}`,
          `Adjust the operation sign accordingly: $$${s3}$$`,
          `Combine the numerators over the LCD: $$${s4}$$`,
          `Simplify the numerator: $$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Quadratic Denominators & Difference of Squares)
  // =========================================================
  const subType = randInt(1, 3);

  if (subType === 1) {
    // Structure: a/(x + k)^2 +/- b/(x + k)
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    const k = randInt(1, 5);
    const isAdd = randInt(0, 1);

    const op = isAdd === 1 ? '+' : '-';
    const bk = b * k;
    const constNum = isAdd === 1 ? a + bk : a - bk;

    const expr = `\\frac{${a}}{(x + ${k})^2} ${op} \\frac{${b}}{x + ${k}}`;
    const s1 = `Denominators $(x + ${k})^2$ and $x + ${k}$ are already factorised.`;
    const s2 = `The lowest common denominator is $(x + ${k})^2$.`;
    const s3 = `\\frac{${a}}{(x + ${k})^2} ${op} \\frac{${b}(x + ${k})}{(x + ${k})^2}`;
    const s4 = `\\frac{${a} ${op} ${b}(x + ${k})}{(x + ${k})^2}`;

    let numStr = "";
    if (isAdd === 1) {
      numStr = `${b}x + ${constNum}`;
    } else {
      const constPart = constNum >= 0 ? `+ ${constNum}` : `- ${Math.abs(constNum)}`;
      numStr = `-${b}x ${constPart}`;
    }

    const ans = `\\frac{${numStr}}{(x + ${k})^2}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Addition & Subtraction of Algebraic Fractions",
      prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Factorise denominators: ${s1}`,
        `Identify the lowest common denominator: ${s2}`,
        `Manipulate terms to match the LCD: $$${s3}$$`,
        `Combine numerators: $$${s4}$$`,
        `Expand and simplify the numerator: $$${ans}$$`
      ]
    };
  } else if (subType === 2) {
    // Structure: Quadratic perfect square denominator
    const k = randInt(1, 5);
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    const isAdd = randInt(0, 1);
    const isMinusBin = randInt(0, 1);
    const firstIsQuad = randInt(0, 1);

    const sign = isMinusBin === 1 ? '-' : '+';
    const k2 = k * k;
    const twoK = 2 * k;
    const quad = isMinusBin === 1 ? `x^2 - ${twoK}x + ${k2}` : `x^2 + ${twoK}x + ${k2}`;
    const lin = `x ${sign} ${k}`;
    const op = isAdd === 1 ? '+' : '-';

    const expr = firstIsQuad === 1
      ? `\\frac{${a}}{${quad}} ${op} \\frac{${b}}{${lin}}`
      : `\\frac{${a}}{${lin}} ${op} \\frac{${b}}{${quad}}`;

    const s1 = `Factorise $${quad} = (${lin})^2$.`;
    const s2 = `The lowest common denominator is $(${lin})^2$.`;

    const s3 = firstIsQuad === 1
      ? `\\frac{${a}}{(${lin})^2} ${op} \\frac{${b}(${lin})}{(${lin})^2}`
      : `\\frac{${a}(${lin})}{(${lin})^2} ${op} \\frac{${b}}{(${lin})^2}`;

    const s4 = firstIsQuad === 1
      ? `\\frac{${a} ${op} ${b}(${lin})}{(${lin})^2}`
      : `\\frac{${a}(${lin}) ${op} ${b}}{(${lin})^2}`;

    // Compute simplified numerator
    let numSimp = "";
    if (firstIsQuad === 1) {
      if (isAdd === 1) {
        const c = isMinusBin === 1 ? a - b * k : a + b * k;
        numSimp = `${b}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`;
      } else {
        const c = isMinusBin === 1 ? a + b * k : a - b * k;
        numSimp = `-${b}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`;
      }
    } else {
      if (isAdd === 1) {
        const c = isMinusBin === 1 ? -a * k + b : a * k + b;
        numSimp = `${a}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`;
      } else {
        const c = isMinusBin === 1 ? -a * k - b : a * k - b;
        numSimp = `${a}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`;
      }
    }

    const ans = `\\frac{${numSimp}}{(${lin})^2}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Addition & Subtraction of Algebraic Fractions",
      prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Factorise quadratic denominator: ${s1}`,
        `Identify the lowest common denominator: ${s2}`,
        `Manipulate each term to match the LCD: $$${s3}$$`,
        `Combine numerators over LCD: $$${s4}$$`,
        `Expand and simplify numerator: $$${ans}$$`
      ]
    };
  } else {
    // Structure: a/(x + b) +/- c/(x^2 - b^2) (Difference of two squares)
    const a = randInt(2, 6);
    const b = randInt(2, 5);
    const c = randInt(1, 9);
    const isAdd = randInt(0, 1);

    const b2 = b * b;
    const op = isAdd === 1 ? '+' : '-';
    const ab = a * b;
    const constNum = isAdd === 1 ? -ab + c : -ab - c;

    const expr = `\\frac{${a}}{x + ${b}} ${op} \\frac{${c}}{x^2 - ${b2}}`;
    const s1 = `Factorise $x^2 - ${b2} = (x + ${b})(x - ${b})$.`;
    const s2 = `The lowest common denominator is $(x + ${b})(x - ${b})$.`;
    const s3 = `\\frac{${a}(x - ${b})}{(x + ${b})(x - ${b})} ${op} \\frac{${c}}{(x + ${b})(x - ${b})}`;
    const s4 = `\\frac{${a}(x - ${b}) ${op} ${c}}{(x + ${b})(x - ${b})}`;
    const partC = constNum >= 0 ? ` + ${constNum}` : ` - ${Math.abs(constNum)}`;
    const ans = `\\frac{${a}x${partC}}{(x + ${b})(x - ${b})}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Addition & Subtraction of Algebraic Fractions",
      prompt: `Express as a single fraction in its simplest form:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Factorise quadratic denominator: ${s1}`,
        `Identify the lowest common denominator: ${s2}`,
        `Manipulate terms to match the LCD: $$${s3}$$`,
        `Combine numerators over LCD: $$${s4}$$`,
        `Expand and simplify numerator: $$${ans}$$`
      ]
    };
  }
}

export const algebraicFractionsAdditionSubtraction = { generate: generateQuestion };
export default generateQuestion;
