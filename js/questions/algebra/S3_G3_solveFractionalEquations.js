/**
 * Question Generator: Solving Fractional Equations
 * Curriculum Skill: Sec 3 G3 - Algebra
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function formatSignedSpaced(val, varSuffix = "") {
  if (val === 0) return "";
  const absVal = Math.abs(val);
  if (varSuffix) {
    if (absVal === 1) {
      return val > 0 ? `+ ${varSuffix}` : `- ${varSuffix}`;
    }
    return val > 0 ? `+ ${absVal}${varSuffix}` : `- ${absVal}${varSuffix}`;
  }
  return val > 0 ? `+ ${absVal}` : `- ${absVal}`;
}

function formatCoeff(val) {
  if (val === 1) return "";
  if (val === -1) return "-";
  return val.toString();
}

export function generateQuestion(tier = 1) {
  const extraKeys = ["x", "="];

  // =========================================================
  // TIER 1: BASIC (Linear Numerator Over Constant = Linear Over Linear)
  // =========================================================
  if (tier === 1) {
    const r1 = randInt(2, 6);
    const r2 = randInt(-6, -2);
    const r1_val = r1;
    const r2_val = r1 + r2 === 0 ? r2 - 1 : r2;

    const a = r1_val;
    const d = r2_val;
    const c = r1_val + r2_val;

    const ans1 = Math.min(r1_val, r2_val).toString();
    const ans2 = Math.max(r1_val, r2_val).toString();

    const a_str = formatSignedSpaced(a);
    const d_str = formatSignedSpaced(d);
    const c_str = formatCoeff(c);

    const lhs_frac = `\\frac{x ${a_str}}{2}`;
    const rhs_frac = `\\frac{${c_str}x}{x ${d_str}}`;
    const eq = `${lhs_frac} = ${rhs_frac}`;

    const step1_cross = `(x ${a_str})(x ${d_str}) = 2(${c_str}x)`;
    const sum_ad = a + d;
    const prod_ad = a * d;
    const sum_ad_str = formatSignedSpaced(sum_ad, "x");
    const prod_ad_str = formatSignedSpaced(prod_ad);
    const rhs_exp = `${2 * c}x`;
    const step2_expand = `x^2 ${sum_ad_str} ${prod_ad_str} = ${rhs_exp}`.replace(/\s+/g, " ").trim();

    const b_quad = -(r1_val + r2_val);
    const b_quad_str = formatSignedSpaced(b_quad, "x");
    const step3_quad = `x^2 ${b_quad_str} ${prod_ad_str} = 0`.replace(/\s+/g, " ").trim();

    const f1 = -r1_val;
    const f2 = -r2_val;
    const f1_str = formatSignedSpaced(f1);
    const f2_str = formatSignedSpaced(f2);
    const step4_factor = `(x ${f1_str})(x ${f2_str}) = 0`;

    return {
      strand: "Algebra",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Solving Fractional Equations",
      prompt: `Solve the fractional equation:\n\n$$${eq}$$`,
      diagramSvg: null,
      inputCount: 2,
      inputLabels: ["x =", "or x ="],
      expectedAnswer: [ans1, ans2],
      displayAnswer: `x = ${ans1} \\quad \\text{or} \\quad x = ${ans2}`,
      extraKeys,
      steps: [
        `Cross-multiply to remove the denominators: $$${step1_cross}$$`,
        `Expand terms on both sides: $$${step2_expand}$$`,
        `Rearrange into a standard quadratic equation ($ax^2 + bx + c = 0$): $$${step3_quad}$$`,
        `Factorise the quadratic expression: $$${step4_factor}$$`,
        `Solve for $x$: $$x = ${ans1} \\quad \\text{or} \\quad x = ${ans2}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Linear + Single Fraction & Two Fractions Over Difference of Squares)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // x ± a/(x + b) = c
      const r1 = randInt(3, 7);
      const r2 = randInt(-6, -2);
      const b = randInt(1, 3);

      const r2_eff = r2 === -b || r1 + r2 === 0 ? r2 - 1 : r2;
      const sumR = r1 + r2_eff;
      const prodR = r1 * r2_eff;
      const c = b + sumR;
      const a = prodR + b * c;

      const ans1 = Math.min(r1, r2_eff).toString();
      const ans2 = Math.max(r1, r2_eff).toString();

      const b_str = `+ ${b}`;
      const a_abs = Math.abs(a);
      const frac_part = `${a > 0 ? "+ " : "- "}\\frac{${a_abs}}{x ${b_str}}`;
      const eq = `x ${frac_part} = ${c}`;

      const a_signed_str = formatSignedSpaced(a);
      const comb_num_exp = `x^2 + ${b}x ${a_signed_str}`.trim();
      const step1_single = `\\frac{${comb_num_exp}}{x ${b_str}} = ${c}`;
      const step2_cross = `${comb_num_exp} = ${c}(x ${b_str})`;
      const bc_val = b * c;
      const bc_str = formatSignedSpaced(bc_val);
      const step2_expand = `${comb_num_exp} = ${c}x ${bc_str}`.trim();

      const b_quad = -sumR;
      const b_quad_str = formatSignedSpaced(b_quad, "x");
      const c_quad_str = formatSignedSpaced(prodR);
      const step3_quad = `x^2 ${b_quad_str} ${c_quad_str} = 0`.replace(/\s+/g, " ").trim();

      const f1 = -r1;
      const f2 = -r2_eff;
      const f1_str = formatSignedSpaced(f1);
      const f2_str = formatSignedSpaced(f2);
      const step4_factor = `(x ${f1_str})(x ${f2_str}) = 0`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solving Fractional Equations",
        prompt: `Solve the fractional equation:\n\n$$${eq}$$`,
        diagramSvg: null,
        inputCount: 2,
        inputLabels: ["x =", "or x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1} \\quad \\text{or} \\quad x = ${ans2}`,
        extraKeys,
        steps: [
          `Combine the terms on the left-hand side into a single fraction: $$${step1_single}$$`,
          `Cross-multiply to remove the denominator: $$${step2_cross}$$`,
          `Expand terms: $$${step2_expand}$$`,
          `Rearrange into a standard quadratic equation ($ax^2 + bx + c = 0$): $$${step3_quad}$$`,
          `Factorise the quadratic expression: $$${step4_factor}$$`,
          `Solve for $x$: $$x = ${ans1} \\quad \\text{or} \\quad x = ${ans2}$$`
        ]
      };
    }

    // subType === 2: A/(x + 1) ± B/(x - 1) = 1
    const k1 = randInt(1, 3);
    const k2 = randInt(1, 3);
    const r1 = 2 * k1 + 1;
    const r2 = -(2 * k2 + 1);

    const A = ((1 + r1) * (1 + r2)) / 2;
    const B = r1 + r2 - A;

    const ans1 = Math.min(r1, r2).toString();
    const ans2 = Math.max(r1, r2).toString();

    const frac1_str = `${A > 0 ? "" : "-"}\\frac{${Math.abs(A)}}{x + 1}`;
    const frac2_str = `${B > 0 ? "+ " : "- "}\\frac{${Math.abs(B)}}{x - 1}`;
    const eq = `${frac1_str} ${frac2_str} = 1`;

    const coeffX_lhs = A + B;
    const const_lhs = B - A;
    const coeffX_lhs_str =
      coeffX_lhs === 0 ? "" : coeffX_lhs === 1 ? "x" : coeffX_lhs === -1 ? "-x" : `${coeffX_lhs}x`;
    const const_lhs_str =
      const_lhs > 0
        ? coeffX_lhs === 0
          ? const_lhs.toString()
          : `+ ${const_lhs}`
        : const_lhs < 0
          ? `- ${Math.abs(const_lhs)}`
          : "";

    const num_combined = `${coeffX_lhs_str}${const_lhs_str ? ` ${const_lhs_str}` : ""}`.trim();
    const step1_comb = `\\frac{${num_combined}}{x^2 - 1} = 1`;
    const step2_cross = `${num_combined} = x^2 - 1`;

    const b_quad = -(r1 + r2);
    const c_quad = r1 * r2;
    const b_quad_str = formatSignedSpaced(b_quad, "x");
    const c_quad_str = formatSignedSpaced(c_quad);
    const step3_quad = `x^2 ${b_quad_str} ${c_quad_str} = 0`.replace(/\s+/g, " ").trim();

    const f1 = -r1;
    const f2 = -r2;
    const f1_str = formatSignedSpaced(f1);
    const f2_str = formatSignedSpaced(f2);
    const step4_factor = `(x ${f1_str})(x ${f2_str}) = 0`;

    return {
      strand: "Algebra",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Solving Fractional Equations",
      prompt: `Solve the fractional equation:\n\n$$${eq}$$`,
      diagramSvg: null,
      inputCount: 2,
      inputLabels: ["x =", "or x ="],
      expectedAnswer: [ans1, ans2],
      displayAnswer: `x = ${ans1} \\quad \\text{or} \\quad x = ${ans2}`,
      extraKeys,
      steps: [
        `Combine the algebraic fractions on the left-hand side into a single fraction: $$${step1_comb}$$`,
        `Cross-multiply to remove the denominator: $$${step2_cross}$$`,
        `Rearrange terms into standard quadratic form ($ax^2 + bx + c = 0$): $$${step3_quad}$$`,
        `Factorise the quadratic expression: $$${step4_factor}$$`,
        `Solve for $x$: $$x = ${ans1} \\quad \\text{or} \\quad x = ${ans2}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Sum of Two Linear Fractions Over Distinct Linear Denominators)
  // =========================================================
  const r1_choice = randInt(0, 1);
  const r2_choice = randInt(0, 2);

  const r1 = r1_choice === 0 ? 5 : 8;
  const r2 = r2_choice === 0 ? -5 : r2_choice === 1 ? -4 : -2;

  const a = 1 + ((1 + r1) * (1 + r2)) / 3;
  const c = -2 + r1 + r2 - a;

  const ans1 = Math.min(r1, r2).toString();
  const ans2 = Math.max(r1, r2).toString();

  const a_str = formatSignedSpaced(a);
  const c_str = formatSignedSpaced(c);

  const frac1 = `\\frac{x ${a_str}}{x + 1}`;
  const frac2 = `\\frac{x ${c_str}}{x - 2}`;
  const eq = `${frac1} + ${frac2} = 3`;

  const coeffX_num = a + c - 1;
  const const_num = c - 2 * a;
  const coeffX_num_str = formatSignedSpaced(coeffX_num, "x");
  const const_num_str = formatSignedSpaced(const_num);

  const num_expr = `2x^2 ${coeffX_num_str} ${const_num_str}`.replace(/\s+/g, " ").trim();
  const lhs_single = `\\frac{${num_expr}}{x^2 - x - 2} = 3`;
  const step2_cross = `${num_expr} = 3(x^2 - x - 2)`;
  const step2_expand = `${num_expr} = 3x^2 - 3x - 6`;

  const b_quad = -(r1 + r2);
  const c_quad = r1 * r2;
  const b_quad_str = formatSignedSpaced(b_quad, "x");
  const c_quad_str = formatSignedSpaced(c_quad);
  const step3_quad = `x^2 ${b_quad_str} ${c_quad_str} = 0`.replace(/\s+/g, " ").trim();

  const f1 = -r1;
  const f2 = -r2;
  const f1_str = formatSignedSpaced(f1);
  const f2_str = formatSignedSpaced(f2);
  const step4_factor = `(x ${f1_str})(x ${f2_str}) = 0`;

  return {
    strand: "Algebra",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Solving Fractional Equations",
    prompt: `Solve the fractional equation:\n\n$$${eq}$$`,
    diagramSvg: null,
    inputCount: 2,
    inputLabels: ["x =", "or x ="],
    expectedAnswer: [ans1, ans2],
    displayAnswer: `x = ${ans1} \\quad \\text{or} \\quad x = ${ans2}`,
    extraKeys,
    steps: [
      `Combine the two algebraic fractions on the left-hand side into a single fraction over a common denominator: $$${lhs_single}$$`,
      `Cross-multiply to remove the denominator: $$${step2_cross}$$`,
      `Expand the terms on the right-hand side: $$${step2_expand}$$`,
      `Rearrange terms into standard quadratic form ($ax^2 + bx + c = 0$): $$${step3_quad}$$`,
      `Factorise the quadratic expression: $$${step4_factor}$$`,
      `Solve for $x$: $$x = ${ans1} \\quad \\text{or} \\quad x = ${ans2}$$`
    ]
  };
}

export const fractionalEquations = { generate: generateQuestion };
export default generateQuestion;
```[cite: 14]
