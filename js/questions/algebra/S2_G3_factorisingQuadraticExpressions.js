/**
 * Question Generator: Factorising Quadratic Expressions
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

function getFactorPairsString(n) {
  let pos = [], neg = [];
  let absN = Math.abs(n);
  for (let i = 1; i * i <= absN; i++) {
    if (absN % i === 0) {
      let j = absN / i;
      if (n > 0) {
        pos.push(`${i} \\times ${j}`);
        neg.push(`${-i} \\times ${-j}`);
      } else {
        pos.push(`${i} \\times ${-j}`);
        neg.push(`${-i} \\times ${j}`);
      }
    }
  }
  return pos.concat(neg).join(', ');
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Standard x^2 + bx + c & Difference of Squares)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Structure: x^2 + bx + c
      const p = randInt(-7, 7, true);
      const q_init = randInt(-7, 7, true);

      let q_eff = (p + q_init === 0) ? (q_init > 0 ? q_init + 1 : q_init - 1) : q_init;
      if (Math.abs(p + q_eff) === 10) {
        q_eff = q_eff > 0 ? q_eff + 1 : q_eff - 1;
      }

      const sum = p + q_eff;
      const prod = p * q_eff;

      const p_str = p > 0 ? `+${p}` : `${p}`;
      const q_str = q_eff > 0 ? `+${q_eff}` : `${q_eff}`;
      const px_str = p === 1 ? '+x' : (p === -1 ? '-x' : (p > 0 ? `+${p}x` : `${p}x`));
      const qx_str = q_eff === 1 ? '+x' : (q_eff === -1 ? '-x' : (q_eff > 0 ? `+${q_eff}x` : `${q_eff}x`));
      const prod_str = prod > 0 ? `+${prod}` : `${prod}`;
      const sumX_str = sum === 0 ? '0x' : (sum === 1 ? '+x' : (sum === -1 ? '-x' : (sum > 0 ? `+${sum}x` : `${sum}x`)));

      const partX = sum === 0 ? '' : (sum === 1 ? '+ x' : (sum === -1 ? '- x' : (sum > 0 ? `+ ${sum}x` : `- ${Math.abs(sum)}x`)));
      const partC = prod > 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
      const expr = `x^2 ${partX} ${partC}`;

      const fact1 = `x${p > 0 ? '+' + p : p}`;
      const fact2 = `x${q_eff > 0 ? '+' + q_eff : q_eff}`;
      const ans = `(${fact1})(${fact2})`;

      const factorsList = getFactorPairsString(prod);
      const blankTable = `$$\\begin{array}{c|c|r} & & \\\\ & & \\\\ \\hline x^2 & ${prod_str} & ${sumX_str} \\end{array}$$`;
      const table = `$$\\begin{array}{c|c|r} x & ${p_str} & ${px_str} \\\\ x & ${q_str} & ${qx_str} \\\\ \\hline x^2 & ${prod_str} & ${sumX_str} \\end{array}$$`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Factorising Quadratic Expressions",
        prompt: `Factorise the expression completely:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Set up the cross method frame with the quadratic expression terms:\n\n${blankTable}`,
          `Identify possible factor pairs for the constant term $$${prod_str}$$: $$${factorsList}$$.`,
          `Fill in the cross method frame:\n\n${table}`,
          `Check that $$${px_str}$$ and $$${qx_str}$$ add up to $$${sumX_str}$$.`,
          `Identify horizontal factors $$(${fact1})$$ and $$(${fact2})$$ from the frame rows.`,
          `Write down the final answer: $$${ans}$$`
        ]
      };
    } else {
      // Structure: Difference of Squares a^2 x^2 - b^2
      const a = randInt(1, 4);
      const b = randInt(1, 9);

      const a2 = a * a;
      const b2 = b * b;
      const gVal = gcd(a, b);
      const g = gVal * gVal;
      const a_eff = a / gVal;
      const b_eff = b / gVal;

      const termA = a === 1 ? 'x' : `${a}x`;
      const termA_eff = a_eff === 1 ? 'x' : `${a_eff}x`;
      const expr = (a === 1 ? 'x^2' : `${a2}x^2`) + ` - ${b2}`;
      const innerExpr = (a_eff === 1 ? 'x^2' : `${a_eff * a_eff}x^2`) + ` - ${b_eff * b_eff}`;

      const formSq = `(${termA})^2 - (${b})^2`;
      const formSqInner = `(${termA_eff})^2 - (${b_eff})^2`;

      const ans = g > 1
        ? `${g}(${termA_eff} - ${b_eff})(${termA_eff} + ${b_eff})`
        : `(${termA} - ${b})(${termA} + ${b})`;

      const step1 = g > 1
        ? `Factorise out the common factor ${g} from all terms:\n\n$$${g}(${innerExpr})$$`
        : `Check for common factors among the terms (there are none).`;

      const step2 = g > 1
        ? `Rewrite the expression inside the brackets in the form $$(a)^2 - (b)^2$$:\n\n$$${g}(${formSqInner})$$`
        : `Rewrite the expression in the form $$(a)^2 - (b)^2$$:\n\n$$${formSq}$$`;

      return {
        strand: "Algebra",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Factorising Quadratic Expressions",
        prompt: `Factorise the expression completely:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          step1,
          step2,
          `Apply the difference of squares formula $$a^2 - b^2 = (a - b)(a + b)$$ to write down the final answer:\n\n$$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Common Factor k, Negative Coefficient, 2-Variable Quadratics)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Structure: k(x^2 + bx + c)
      const k = randInt(2, 4);
      const p = randInt(-6, 6, true);
      const q_init = randInt(-6, 6, true);

      const q_eff = (p + q_init === 0) ? (q_init > 0 ? q_init + 1 : q_init - 1) : q_init;
      const sum = p + q_eff;
      const prod = p * q_eff;

      const c1 = k * sum;
      const c0 = k * prod;

      const partX2 = `${k}x^2`;
      const partX = c1 === 0 ? '' : (c1 === 1 ? '+ x' : (c1 === -1 ? '- x' : (c1 > 0 ? `+ ${c1}x` : `- ${Math.abs(c1)}x`)));
      const partC = c0 > 0 ? `+ ${c0}` : `- ${Math.abs(c0)}`;
      const expr = `${partX2} ${partX} ${partC}`;

      const innerX = sum === 0 ? '' : (sum === 1 ? '+ x' : (sum === -1 ? '- x' : (sum > 0 ? `+ ${sum}x` : `- ${Math.abs(sum)}x`)));
      const innerC = prod > 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
      const innerExpr = `x^2 ${innerX} ${innerC}`;

      const fact1 = `x${p > 0 ? '+' + p : p}`;
      const fact2 = `x${q_eff > 0 ? '+' + q_eff : q_eff}`;
      const ans = `${k}(${fact1})(${fact2})`;

      const p_str = p > 0 ? `+${p}` : `${p}`;
      const q_str = q_eff > 0 ? `+${q_eff}` : `${q_eff}`;
      const px_str = p === 1 ? '+x' : (p === -1 ? '-x' : (p > 0 ? `+${p}x` : `${p}x`));
      const qx_str = q_eff === 1 ? '+x' : (q_eff === -1 ? '-x' : (q_eff > 0 ? `+${q_eff}x` : `${q_eff}x`));
      const prod_str = prod > 0 ? `+${prod}` : `${prod}`;
      const sumX_str = sum === 0 ? '0x' : (sum === 1 ? '+x' : (sum === -1 ? '-x' : (sum > 0 ? `+${sum}x` : `${sum}x`)));

      const table = `$$\\begin{array}{c|c|r} x & ${p_str} & ${px_str} \\\\ x & ${q_str} & ${qx_str} \\\\ \\hline x^2 & ${prod_str} & ${sumX_str} \\end{array}$$`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Factorising Quadratic Expressions",
        prompt: `Factorise the expression completely:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Factorise out the common factor $$${k}$$ from all terms:\n\n$$${k}(${innerExpr})$$`,
          `Factorise the quadratic expression $$${innerExpr}$$ inside the brackets using the cross method frame:\n\n${table}`,
          `Combine the common factor with the factorised expression: $$${ans}$$`
        ]
      };
    } else if (subType === 2) {
      // Structure: -x^2 + bx + c
      const p = randInt(-6, 6, true);
      const q_init = randInt(-6, 6, true);

      const q_eff = (p + q_init === 0) ? (q_init > 0 ? q_init + 1 : q_init - 1) : q_init;
      const sum = p + q_eff;
      const prod = p * q_eff;

      const negSum = -sum;
      const negProd = -prod;

      const partX = negSum === 0 ? '' : (negSum === 1 ? '+ x' : (negSum === -1 ? '- x' : (negSum > 0 ? `+ ${negSum}x` : `- ${Math.abs(negSum)}x`)));
      const partC = negProd > 0 ? `+ ${negProd}` : `- ${Math.abs(negProd)}`;
      const expr = `-x^2 ${partX} ${partC}`;

      const innerX = sum === 0 ? '' : (sum === 1 ? '+ x' : (sum === -1 ? '- x' : (sum > 0 ? `+ ${sum}x` : `- ${Math.abs(sum)}x`)));
      const innerC = prod > 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
      const innerExpr = `x^2 ${innerX} ${innerC}`;

      const fact1 = `x${p > 0 ? '+' + p : p}`;
      const fact2 = `x${q_eff > 0 ? '+' + q_eff : q_eff}`;
      const ans = `-(${fact1})(${fact2})`;

      const p_str = p > 0 ? `+${p}` : `${p}`;
      const q_str = q_eff > 0 ? `+${q_eff}` : `${q_eff}`;
      const px_str = p === 1 ? '+x' : (p === -1 ? '-x' : (p > 0 ? `+${p}x` : `${p}x`));
      const qx_str = q_eff === 1 ? '+x' : (q_eff === -1 ? '-x' : (q_eff > 0 ? `+${q_eff}x` : `${q_eff}x`));
      const prod_str = prod > 0 ? `+${prod}` : `${prod}`;
      const sumX_str = sum === 0 ? '0x' : (sum === 1 ? '+x' : (sum === -1 ? '-x' : (sum > 0 ? `+${sum}x` : `${sum}x`)));

      const table = `$$\\begin{array}{c|c|r} x & ${p_str} & ${px_str} \\\\ x & ${q_str} & ${qx_str} \\\\ \\hline x^2 & ${prod_str} & ${sumX_str} \\end{array}$$`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Factorising Quadratic Expressions",
        prompt: `Factorise the expression completely:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Factorise out $$-1$$ to obtain a positive leading coefficient:\n\n$$-(${innerExpr})$$`,
          `Factorise the quadratic expression $$${innerExpr}$$ inside the brackets using the cross method frame:\n\n${table}`,
          `Combine terms to write down the final answer: $$${ans}$$`
        ]
      };
    } else {
      // Structure: Two-variable quadratic k(a*u^2 + b*uv + c*v^2)
      const vChoice = randInt(1, 3);
      const v1 = vChoice === 1 ? 'x' : (vChoice === 2 ? 'p' : 'm');
      const v2 = vChoice === 1 ? 'y' : (vChoice === 2 ? 'q' : 'n');

      const k = randInt(2, 4);
      const a = randInt(1, 3);
      const p_raw = randInt(-5, 5, true);
      const q_init = randInt(-5, 5, true);

      const p = gcd(a, Math.abs(p_raw)) === 1 ? p_raw : (p_raw > 0 ? 1 : -1);
      const q_eff = (a * q_init + p === 0) ? (q_init > 0 ? q_init + 1 : q_init - 1) : q_init;

      const innerMid = a * q_eff + p;
      const innerLast = p * q_eff;

      const coeffV1 = k * a;
      const coeffMid = k * innerMid;
      const coeffLast = k * innerLast;

      const partV1 = coeffV1 === 1 ? `${v1}^2` : `${coeffV1}${v1}^2`;
      const partMid = coeffMid === 0 ? '' : (coeffMid === 1 ? `+ ${v1}${v2}` : (coeffMid === -1 ? `- ${v1}${v2}` : (coeffMid > 0 ? `+ ${coeffMid}${v1}${v2}` : `- ${Math.abs(coeffMid)}${v1}${v2}`)));
      const partLast = coeffLast > 0 ? `+ ${coeffLast}${v2}^2` : `- ${Math.abs(coeffLast)}${v2}^2`;
      const expr = `${partV1} ${partMid} ${partLast}`;

      const innerPartV1 = a === 1 ? `${v1}^2` : `${a}${v1}^2`;
      const innerPartMid = innerMid === 0 ? '' : (innerMid === 1 ? `+ ${v1}${v2}` : (innerMid === -1 ? `- ${v1}${v2}` : (innerMid > 0 ? `+ ${innerMid}${v1}${v2}` : `- ${Math.abs(innerMid)}${v1}${v2}`)));
      const innerPartLast = innerLast > 0 ? `+ ${innerLast}${v2}^2` : `- ${Math.abs(innerLast)}${v2}^2`;
      const innerExpr = `${innerPartV1} ${innerPartMid} ${innerPartLast}`;

      const fact1 = `${a === 1 ? v1 : a + v1}${p > 0 ? '+' + p : p}${v2}`;
      const fact2 = `${v1}${q_eff > 0 ? '+' + q_eff : q_eff}${v2}`;
      const ans = `${k}(${fact1})(${fact2})`;

      const term1_str = p === 1 ? `+${v1}${v2}` : (p === -1 ? `-${v1}${v2}` : (p > 0 ? `+${p}${v1}${v2}` : `${p}${v1}${v2}`));
      const term2_val = a * q_eff;
      const term2_str = term2_val === 1 ? `+${v1}${v2}` : (term2_val === -1 ? `-${v1}${v2}` : (term2_val > 0 ? `+${term2_val}${v1}${v2}` : `${term2_val}${v1}${v2}`));

      const p_v2_str = p > 0 ? `+${p}${v2}` : `${p}${v2}`;
      const q_v2_str = q_eff > 0 ? `+${q_eff}${v2}` : `${q_eff}${v2}`;
      const sumV1V2_str = innerMid === 0 ? `0${v1}${v2}` : (innerMid === 1 ? `+${v1}${v2}` : (innerMid === -1 ? `-${v1}${v2}` : (innerMid > 0 ? `+${innerMid}${v1}${v2}` : `${innerMid}${v1}${v2}`)));
      const prodV2_str = innerLast > 0 ? `+${innerLast}${v2}^2` : `${innerLast}${v2}^2`;
      const col1_top = a === 1 ? v1 : `${a}${v1}`;

      const table = `$$\\begin{array}{c|c|r} ${col1_top} & ${p_v2_str} & ${term1_str} \\\\ ${v1} & ${q_v2_str} & ${term2_str} \\\\ \\hline ${innerPartV1} & ${prodV2_str} & ${sumV1V2_str} \\end{array}$$`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Factorising Quadratic Expressions",
        prompt: `Factorise the expression completely:\n\n$$${expr}$$`,
        expectedAnswer: ans,
        steps: [
          `Factorise out the common factor $$${k}$$ from all terms:\n\n$$${expr} = ${k}(${innerExpr})$$`,
          `Set up the cross method frame for the inner expression $$${innerExpr}$$:\n\n${table}`,
          `Check that $$${term1_str}$$ and $$${term2_str}$$ add up to $$${sumV1V2_str}$$.`,
          `Combine the common factor $$${k}$$ with the linear factors to get the final answer:\n\n$$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Non-unit ax^2 + bx + c, Expansion-First, Binomial Grouping, Compound Variables)
  // =========================================================
  const subType = randInt(1, 4);

  if (subType === 1) {
    // Structure: ax^2 + bx + c (a > 1, c != 1)
    const a = randInt(2, 3);
    const c = randInt(2, 3);
    const b_init = randInt(-4, 4, true);
    const d_init = randInt(-4, 4, true);

    const b_eff = (Math.abs(b_init) === Math.abs(a)) ? (b_init > 0 ? 1 : -1) : b_init;
    const d_eff = (a * d_init + b_eff * c === 0) ? (d_init > 0 ? d_init + 1 : d_init - 1) : d_init;

    const coeffX2 = a * c;
    const coeffX = a * d_eff + b_eff * c;
    const constTerm = b_eff * d_eff;

    const partX2 = `${coeffX2}x^2`;
    const partX = coeffX === 0 ? '' : (coeffX === 1 ? '+ x' : (coeffX === -1 ? '- x' : (coeffX > 0 ? `+ ${coeffX}x` : `- ${Math.abs(coeffX)}x`)));
    const partC = constTerm > 0 ? `+ ${constTerm}` : `- ${Math.abs(constTerm)}`;
    const expr = `${partX2} ${partX} ${partC}`;

    const fact1 = `${a}x${b_eff > 0 ? '+' + b_eff : b_eff}`;
    const fact2 = `${c}x${d_eff > 0 ? '+' + d_eff : d_eff}`;
    const ans = `(${fact1})(${fact2})`;

    const b_str = b_eff > 0 ? `+${b_eff}` : `${b_eff}`;
    const d_str = d_eff > 0 ? `+${d_eff}` : `${d_eff}`;
    const term1_val = b_eff * c;
    const term1_str = term1_val === 1 ? '+x' : (term1_val === -1 ? '-x' : (term1_val > 0 ? `+${term1_val}x` : `${term1_val}x`));
    const term2_val = a * d_eff;
    const term2_str = term2_val === 1 ? '+x' : (term2_val === -1 ? '-x' : (term2_val > 0 ? `+${term2_val}x` : `${term2_val}x`));
    const prod_str = constTerm > 0 ? `+${constTerm}` : `${constTerm}`;
    const sumX_str = coeffX === 0 ? '0x' : (coeffX === 1 ? '+x' : (coeffX === -1 ? '-x' : (coeffX > 0 ? `+${coeffX}x` : `${coeffX}x`)));

    const blankTable = `$$\\begin{array}{c|c|r} & & \\\\ & & \\\\ \\hline ${partX2} & ${prod_str} & ${sumX_str} \\end{array}$$`;
    const table = `$$\\begin{array}{c|c|r} ${a}x & ${b_str} & ${term1_str} \\\\ ${c}x & ${d_str} & ${term2_str} \\\\ \\hline ${partX2} & ${prod_str} & ${sumX_str} \\end{array}$$`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Factorising Quadratic Expressions",
      prompt: `Factorise the expression completely:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Set up the cross method frame with the quadratic expression terms:\n\n${blankTable}`,
        `Fill in the cross method frame with factor pairs for $$${partX2}$$ and $$${prod_str}$$:\n\n${table}`,
        `Check that $$${term1_str}$$ and $$${term2_str}$$ add up to $$${sumX_str}$$.`,
        `Read off horizontal factors $$(${fact1})$$ and $$(${fact2})$$ from the frame rows.`,
        `Write down the final answer: $$${ans}$$`
      ]
    };
  } else if (subType === 2) {
    // Structure: Expand first (x+m)(x+n) + k -> x^2 + (p+q)x + pq
    const p = randInt(-5, 5, true);
    const q_init = randInt(-5, 5, true);
    const m = randInt(-5, 5, true);

    const q_eff = (p + q_init === m) ? (q_init > 0 ? q_init + 2 : q_init - 2) : q_init;
    const n = p + q_eff - m;
    const sum = p + q_eff;
    const prod = p * q_eff;
    const k = prod - (m * n);

    const k_part = k > 0 ? `+ ${k}` : (k === 0 ? '' : `- ${Math.abs(k)}`);
    const expr = `(x ${m > 0 ? '+' + m : m})(x ${n > 0 ? '+' + n : n}) ${k_part}`;

    const midX = sum === 0 ? '' : (sum === 1 ? '+ x' : (sum === -1 ? '- x' : (sum > 0 ? `+ ${sum}x` : `- ${Math.abs(sum)}x`)));
    const constC = prod > 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
    const expanded = `x^2 ${midX} ${constC}`;

    const ans = `(x${p > 0 ? '+' + p : p})(x${q_eff > 0 ? '+' + q_eff : q_eff})`;

    const p_str = p > 0 ? `+${p}` : `${p}`;
    const q_str = q_eff > 0 ? `+${q_eff}` : `${q_eff}`;
    const px_str = p === 1 ? '+x' : (p === -1 ? '-x' : (p > 0 ? `+${p}x` : `${p}x`));
    const qx_str = q_eff === 1 ? '+x' : (q_eff === -1 ? '-x' : (q_eff > 0 ? `+${q_eff}x` : `${q_eff}x`));
    const prod_str = prod > 0 ? `+${prod}` : `${prod}`;
    const sumX_str = sum === 0 ? '0x' : (sum === 1 ? '+x' : (sum === -1 ? '-x' : (sum > 0 ? `+${sum}x` : `${sum}x`)));

    const table = `$$\\begin{array}{c|c|r} x & ${p_str} & ${px_str} \\\\ x & ${q_str} & ${qx_str} \\\\ \\hline x^2 & ${prod_str} & ${sumX_str} \\end{array}$$`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Factorising Quadratic Expressions",
      prompt: `Factorise the expression completely:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Expand and simplify the given expression into standard quadratic form:\n\n$$${expanded}$$`,
        `Set up and fill the cross method frame for $$${expanded}$$:\n\n${table}`,
        `Check that $$${px_str}$$ and $$${qx_str}$$ add up to $$${sumX_str}$$.`,
        `Read off the horizontal factors to write down the final answer: $$${ans}$$`
      ]
    };
  } else if (subType === 3) {
    // Structure: (ax+b)(cx+d) + k(cx+d)
    const a = randInt(2, 4);
    const b = randInt(-5, 5, true);
    const c = randInt(1, 3);
    const d = randInt(-5, 5, true);
    const k = randInt(-6, 6, true);

    const commonBin = `${c}x${d > 0 ? '+' + d : d}`;
    const part1 = `${a}x${b > 0 ? '+' + b : b}`;
    const k_str = k > 0 ? `+${k}` : `${k}`;
    const expr = `(${part1})(${commonBin}) ${k > 0 ? '+ ' + k : '- ' + Math.abs(k)}(${commonBin})`;

    const simplifiedConst = b + k;
    const simplifiedPart = `${a}x${simplifiedConst > 0 ? '+' + simplifiedConst : (simplifiedConst === 0 ? '' : simplifiedConst)}`;
    const ans = `(${commonBin})(${simplifiedPart})`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Factorising Quadratic Expressions",
      prompt: `Factorise the expression completely:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Identify and factorise out the common binomial factor $$(${commonBin})$$:\n\n$$(${commonBin})[(${part1}) ${k_str}]$$`,
        `Simplify the expression inside the brackets:\n\n$$(${commonBin})(${simplifiedPart})$$`,
        `Write down the final answer: $$${ans}$$`
      ]
    };
  } else {
    // Structure: Compound Variable Quadratic (xy)^2 + b(xy) + c
    const p = randInt(-6, 6, true);
    const q_init = randInt(-6, 6, true);

    const q_eff = (p + q_init === 0) ? (q_init > 0 ? q_init + 1 : q_init - 1) : q_init;
    const sum = p + q_eff;
    const prod = p * q_eff;

    const partMid = sum === 0 ? '' : (sum === 1 ? '+ xy' : (sum === -1 ? '- xy' : (sum > 0 ? `+ ${sum}xy` : `- ${Math.abs(sum)}xy`)));
    const partC = prod > 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
    const expr = `x^2y^2 ${partMid} ${partC}`;

    const fact1 = `xy${p > 0 ? '+' + p : p}`;
    const fact2 = `xy${q_eff > 0 ? '+' + q_eff : q_eff}`;
    const ans = `(${fact1})(${fact2})`;

    const p_str = p > 0 ? `+${p}` : `${p}`;
    const q_str = q_eff > 0 ? `+${q_eff}` : `${q_eff}`;
    const pxy_str = p === 1 ? '+xy' : (p === -1 ? '-xy' : (p > 0 ? `+${p}xy` : `${p}xy`));
    const qxy_str = q_eff === 1 ? '+xy' : (q_eff === -1 ? '-xy' : (q_eff > 0 ? `+${q_eff}xy` : `${q_eff}xy`));
    const prod_str = prod > 0 ? `+${prod}` : `${prod}`;
    const sumXY_str = sum === 0 ? '0xy' : (sum === 1 ? '+xy' : (sum === -1 ? '-xy' : (sum > 0 ? `+${sum}xy` : `${sum}xy`)));

    const table = `$$\\begin{array}{c|c|r} xy & ${p_str} & ${pxy_str} \\\\ xy & ${q_str} & ${qxy_str} \\\\ \\hline x^2y^2 & ${prod_str} & ${sumXY_str} \\end{array}$$`;

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Factorising Quadratic Expressions",
      prompt: `Factorise the expression completely:\n\n$$${expr}$$`,
      expectedAnswer: ans,
      steps: [
        `Treat $$xy$$ as a single compound variable.`,
        `Set up and fill the cross method frame for the quadratic expression in terms of $$xy$$:\n\n${table}`,
        `Check that $$${pxy_str}$$ and $$${qxy_str}$$ add up to $$${sumXY_str}$$.`,
        `Write down the final answer: $$${ans}$$`
      ]
    };
  }
}

export const factorisingQuadraticExpressions = { generate: generateQuestion };
export default generateQuestion;
