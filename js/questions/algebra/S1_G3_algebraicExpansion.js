/**
 * Question Generator: Expansion of Algebraic Expressions
 * Curriculum Skill: Sec 3 G3 - Algebra
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Monomial x Binomial Expansion)
  // =========================================================
  if (tier === 1) {
    const a = randInt(-5, 5, true);
    const b = randInt(2, 6);
    const c = randInt(-7, 7, true);

    const a_eff = Math.abs(a * b) % 10 === 0 ? (a > 0 ? a + 1 : a - 1) : a;
    const term1 = a_eff * b;
    const term2 = a_eff * c;

    const a_str = a_eff === 1 ? 'x' : (a_eff === -1 ? '-x' : `${a_eff}x`);
    const bx_str = b === 1 ? 'x' : `${b}x`;
    const c_str = c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
    const expr = `${a_str}(${bx_str} ${c_str})`;

    const partX2 = term1 === 1 ? 'x^2' : (term1 === -1 ? '-x^2' : `${term1}x^2`);
    const partX = term2 > 0 ? `+${term2}x` : (term2 === -1 ? '-x' : `${term2}x`);
    const ans = `${partX2}${partX}`;

    const frameSetup = `\\begin{array}{c|c|c} \\times & ${bx_str} & ${c} \\\\ \\hline ${a_str} & & \\end{array}`;
    const frameFilled = `\\begin{array}{c|c|c} \\times & ${bx_str} & ${c} \\\\ \\hline ${a_str} & ${partX2} & ${term2 > 0 ? '+' + term2 + 'x' : term2 + 'x'} \\end{array}`;

    return {
      strand: "Algebra",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Expansion",
      prompt: `Expand:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Form the multiplication frame with terms at the top and left side: $$${frameSetup}$$`,
        `Evaluate each cell product in the frame: $$${frameFilled}$$`,
        `Combine terms to obtain the expanded expression: $$${ans}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Binomial x Binomial Expansion)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Structure: (x + a)(x + b)
      const a = randInt(-8, 8, true);
      const b_raw = randInt(-8, 8, true);

      const sumVal = a + b_raw;
      const b_eff = (sumVal === 0 || Math.abs(sumVal) % 10 === 0) ? (b_raw > 0 ? b_raw + 1 : b_raw - 1) : b_raw;

      const coeffX = a + b_eff;
      const constTerm = a * b_eff;

      const a_str = a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
      const b_str = b_eff > 0 ? `+ ${b_eff}` : `- ${Math.abs(b_eff)}`;
      const expr = `(x ${a_str})(x ${b_str})`;

      const partX = coeffX === 1 ? '+x' : (coeffX === -1 ? '-x' : (coeffX > 0 ? `+${coeffX}x` : `${coeffX}x`));
      const partC = constTerm > 0 ? `+${constTerm}` : `${constTerm}`;
      const ans = `x^2${partX}${partC}`;

      const termAx = a > 0 ? `${a}x` : `${a}x`;
      const termBx = b_eff > 0 ? `${b_eff}x` : `${b_eff}x`;

      const frameSetup = `\\begin{array}{c|c|c} \\times & x & ${b_eff} \\\\ \\hline x & & \\\\ \\hline ${a} & & \\end{array}`;
      const frameFilled = `\\begin{array}{c|c|c} \\times & x & ${b_eff} \\\\ \\hline x & x^2 & ${termBx} \\\\ \\hline ${a} & ${termAx} & ${constTerm} \\end{array}`;
      const unsimplified = `x^2 ${b_eff > 0 ? '+ ' + b_eff + 'x' : '- ' + Math.abs(b_eff) + 'x'} ${a > 0 ? '+ ' + a + 'x' : '- ' + Math.abs(a) + 'x'} ${constTerm > 0 ? '+ ' + constTerm : '- ' + Math.abs(constTerm)}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Expansion",
        prompt: `Expand and simplify:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Form the multiplication frame: $$${frameSetup}$$`,
          `Evaluate each term in the grid: $$${frameFilled}$$`,
          `Combine like terms: $$${unsimplified} = ${ans}$$`
        ]
      };
    } else {
      // Structure: (ax + b)(cx + d)
      const a = randInt(2, 5);
      const b = randInt(-6, 6, true);
      const c = randInt(1, 4);
      const d_raw = randInt(-6, 6, true);

      const middleCheck = (a * d_raw) + (b * c);
      const d_eff = (middleCheck === 0 || Math.abs(middleCheck) % 10 === 0) ? (d_raw > 0 ? d_raw + 1 : d_raw - 1) : d_raw;

      const coeffX2 = a * c;
      const coeffX = (a * d_eff) + (b * c);
      const constTerm = b * d_eff;

      const term_ad = a * d_eff;
      const term_bc = b * c;
      const cx_str = c === 1 ? 'x' : `${c}x`;

      const b_str = b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const d_str = d_eff > 0 ? `+ ${d_eff}` : `- ${Math.abs(d_eff)}`;
      const expr = `(${a}x ${b_str})(${cx_str} ${d_str})`;

      const partX2 = coeffX2 === 1 ? 'x^2' : `${coeffX2}x^2`;
      const partX = coeffX === 0 ? '' : (coeffX === 1 ? '+x' : (coeffX === -1 ? '-x' : (coeffX > 0 ? `+${coeffX}x` : `${coeffX}x`)));
      const partC = constTerm > 0 ? `+${constTerm}` : `${constTerm}`;
      const ans = `${partX2}${partX}${partC}`;

      const frameSetup = `\\begin{array}{c|c|c} \\times & ${cx_str} & ${d_eff} \\\\ \\hline ${a}x & & \\\\ \\hline ${b} & & \\end{array}`;
      const frameFilled = `\\begin{array}{c|c|c} \\times & ${cx_str} & ${d_eff} \\\\ \\hline ${a}x & ${partX2} & ${term_ad}x \\\\ \\hline ${b} & ${term_bc}x & ${constTerm} \\end{array}`;
      const unsimplified = `${partX2} ${term_ad > 0 ? '+ ' + term_ad + 'x' : '- ' + Math.abs(term_ad) + 'x'} ${term_bc > 0 ? '+ ' + term_bc + 'x' : '- ' + Math.abs(term_bc) + 'x'} ${constTerm > 0 ? '+ ' + constTerm : '- ' + Math.abs(constTerm)}`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Expansion",
        prompt: `Expand and simplify:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Form the multiplication frame: $$${frameSetup}$$`,
          `Evaluate each cell product: $$${frameFilled}$$`,
          `Combine like terms: $$${unsimplified} = ${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Perfect Squares & Linear x Quadratic Expansion)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Structure: (ax + b)^2
    const a = randInt(2, 6);
    const b_raw = randInt(-7, 7, true);

    const middleCheck = 2 * a * b_raw;
    const b_eff = (Math.abs(middleCheck) % 10 === 0) ? (b_raw > 0 ? b_raw + 1 : b_raw - 1) : b_raw;

    const coeffX2 = a * a;
    const crossTerm = a * b_eff;
    const coeffX = 2 * crossTerm;
    const constTerm = b_eff * b_eff;

    const b_str = b_eff > 0 ? `+ ${b_eff}` : `- ${Math.abs(b_eff)}`;
    const expr = `(${a}x ${b_str})^2`;

    const partX2 = `${coeffX2}x^2`;
    const partX = coeffX > 0 ? `+${coeffX}x` : `${coeffX}x`;
    const partC = `+${constTerm}`;
    const ans = `${partX2}${partX}${partC}`;

    const frameSetup = `\\begin{array}{c|c|c} \\times & ${a}x & ${b_eff} \\\\ \\hline ${a}x & & \\\\ \\hline ${b_eff} & & \\end{array}`;
    const frameFilled = `\\begin{array}{c|c|c} \\times & ${a}x & ${b_eff} \\\\ \\hline ${a}x & ${partX2} & ${crossTerm}x \\\\ \\hline ${b_eff} & ${crossTerm}x & ${constTerm} \\end{array}`;
    const unsimplified = `${partX2} ${crossTerm > 0 ? '+ ' + crossTerm + 'x' : '- ' + Math.abs(crossTerm) + 'x'} ${crossTerm > 0 ? '+ ' + crossTerm + 'x' : '- ' + Math.abs(crossTerm) + 'x'} + ${constTerm}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Expansion",
      prompt: `Expand and simplify:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Form the multiplication frame for squared binomial: $$${frameSetup}$$`,
        `Evaluate each product in the grid: $$${frameFilled}$$`,
        `Combine middle like terms: $$${unsimplified} = ${ans}$$`
      ]
    };
  } else {
    // Structure: (x + a)(bx^2 + cx + d)
    const a = randInt(-4, 4, true);
    const b = randInt(1, 3);
    const c = randInt(-4, 4, true);
    const d = randInt(-5, 5, true);

    const t_x3 = b;
    const t_x2_1 = c;
    const t_x2_2 = a * b;
    const coeffX2 = t_x2_1 + t_x2_2;

    const t_x_1 = d;
    const t_x_2 = a * c;
    const coeffX = t_x_1 + t_x_2;
    const constTerm = a * d;

    const a_str = a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
    const bx2_str = b === 1 ? 'x^2' : `${b}x^2`;
    const cx_str = c > 0 ? `+ ${c === 1 ? '' : c}x` : `- ${Math.abs(c) === 1 ? '' : Math.abs(c)}x`;
    const d_str = d > 0 ? `+ ${d}` : `- ${Math.abs(d)}`;

    const expr = `(x ${a_str})(${bx2_str} ${cx_str} ${d_str})`;

    const partX3 = t_x3 === 1 ? 'x^3' : `${t_x3}x^3`;
    const partX2 = coeffX2 === 0 ? '' : (coeffX2 === 1 ? '+x^2' : (coeffX2 === -1 ? '-x^2' : (coeffX2 > 0 ? `+${coeffX2}x^2` : `${coeffX2}x^2`)));
    const partX = coeffX === 0 ? '' : (coeffX === 1 ? '+x' : (coeffX === -1 ? '-x' : (coeffX > 0 ? `+${coeffX}x` : `${coeffX}x`)));
    const partC = constTerm > 0 ? `+${constTerm}` : `${constTerm}`;
    const ans = `${partX3}${partX2}${partX}${partC}`;

    const cx_grid = c === 1 ? 'x' : (c === -1 ? '-x' : `${c}x`);
    const cx2_grid = c === 1 ? 'x^2' : (c === -1 ? '-x^2' : `${c}x^2`);
    const dx_grid = d === 1 ? 'x' : (d === -1 ? '-x' : `${d}x`);
    const tx2_2_str = t_x2_2 === 1 ? 'x^2' : (t_x2_2 === -1 ? '-x^2' : `${t_x2_2}x^2`);
    const tx_2_str = t_x_2 === 1 ? 'x' : (t_x_2 === -1 ? '-x' : `${t_x_2}x`);

    const frameSetup = `\\begin{array}{c|c|c|c} \\times & ${bx2_str} & ${cx_grid} & ${d} \\\\ \\hline x & & & \\\\ \\hline ${a} & & & \\end{array}`;
    const frameFilled = `\\begin{array}{c|c|c|c} \\times & ${bx2_str} & ${cx_grid} & ${d} \\\\ \\hline x & ${partX3} & ${cx2_grid} & ${dx_grid} \\\\ \\hline ${a} & ${tx2_2_str} & ${tx_2_str} & ${constTerm} \\end{array}`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Expansion",
      prompt: `Expand and simplify:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Form the multiplication frame for linear times quadratic polynomial: $$${frameSetup}$$`,
        `Evaluate grid products: $$${frameFilled}$$`,
        `Combine like terms ($x^2$ and $x$ terms): $$${ans}$$`
      ]
    };
  }
}

export const algebraicExpansion = { generate: generateQuestion };
export default generateQuestion;
