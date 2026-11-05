/**
 * Question Generator: Solving Fractional Equations
 * Curriculum Skill: Sec 3 G3 - Algebra
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Simple Fractional Equation with Constant Denominator)
  // =========================================================
  if (tier === 1) {
    const r1 = randInt(2, 6);
    const r2 = randInt(-6, -2);

    const r1_val = r1;
    const r2_val = (r1 + r2 === 0) ? r2 - 1 : r2;

    const a = r1_val;
    const d = r2_val;
    const c = r1_val + r2_val;

    const ans1 = Math.min(r1_val, r2_val).toString();
    const ans2 = Math.max(r1_val, r2_val).toString();

    const a_str = a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
    const d_str = d > 0 ? `+ ${d}` : `- ${Math.abs(d)}`;
    const c_str = c === 1 ? "" : (c === -1 ? "-" : c.toString());

    const lhs_frac = `\\frac{x ${a_str}}{2}`;
    const rhs_frac = `\\frac{${c_str}x}{x ${d_str}}`;
    const eq = `${lhs_frac} = ${rhs_frac}`;

    const step1_cross = `(x ${a_str})(x ${d_str}) = 2(${c_str}x)`;
    const sum_ad = a + d;
    const prod_ad = a * d;
    const sum_ad_str = sum_ad > 0 ? `+ ${sum_ad}x` : (sum_ad < 0 ? `- ${Math.abs(sum_ad)}x` : "");
    const prod_ad_str = prod_ad > 0 ? `+ ${prod_ad}` : `- ${Math.abs(prod_ad)}`;
    const rhs_exp = `${2 * c}x`;
    const step2_expand = `x^2 ${sum_ad_str} ${prod_ad_str} = ${rhs_exp}`;

    const b_quad = -(r1_val + r2_val);
    const b_quad_str = b_quad === 1 ? "+ x" : (b_quad === -1 ? "- x" : (b_quad > 0 ? `+ ${b_quad}x` : (b_quad < 0 ? `- ${Math.abs(b_quad)}x` : "")));
    const step3_quad = `x^2 ${b_quad_str} ${prod_ad_str} = 0`;

    const f1 = -r1_val;
    const f2 = -r2_val;
    const f1_str = f1 > 0 ? `+ ${f1}` : `- ${Math.abs(f1)}`;
    const f2_str = f2 > 0 ? `+ ${f2}` : `- ${Math.abs(f2)}`;
    const step4_factor = `(x ${f1_str})(x ${f2_str}) = 0`;

    return {
      strand: "Algebra",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Solving Fractional Equations",
      prompt: `Solve the fractional equation:\n\n$$${eq}$$`,
      inputCount: 2,
      inputLabels: ["x =", "or x ="],
      expectedAnswer: [ans1, ans2],
      displayAnswer: `x = ${ans1} \\text{ or } x = ${ans2}`,
      steps: [
        `Cross-multiply to remove the denominators: $$${step1_cross}$$`,
        `Expand terms on both sides: $$${step2_expand}$$`,
        `Rearrange into a standard quadratic equation ($ax^2 + bx + c = 0$): $$${step3_quad}$$`,
        `Factorise the quadratic expression: $$${step4_factor}$$`,
        `Solve for $x$: $$x = ${ans1}\\text{ or } x = ${ans2}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Linear Term with Fraction / Two Algebraic Fractions)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Form: x + (a / (x + b)) = c
      const r1 = randInt(3, 7);
      const r2 = randInt(-6, -2);
      const b = randInt(1, 3);

      const r2_eff = (r2 === -b || r1 + r2 === 0) ? r2 - 1 : r2;
      const sumR = r1 + r2_eff;
      const prodR = r1 * r2_eff;
      const c = b + sumR;
      const a = prodR + b * c;

      const ans1 = Math.min(r1, r2_eff).toString();
      const ans2 = Math.max(r1, r2_eff).toString();

      const b_str = `+ ${b}`;
      const a_abs = Math.abs(a);
      const frac_part = (a > 0 ? "+ " : "- ") + `\\frac{${a_abs}}{x ${b_str}}`;
      const eq = `x ${frac_part} = ${c}`;

      const comb_num_exp = `x^2 + ${b}x ` + (a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`);
      const step1_single = `\\frac{${comb_num_exp}}{x ${b_str}} = ${c}`;
      const step2_cross = `${comb_num_exp} = ${c}(x ${b_str})`;
      const bc_val = b * c;
      const step2_expand = `${comb_num_exp} = ${c}x + ${bc_val}`;

      const b_quad = -sumR;
      const b_quad_str = b_quad === 1 ? "+ x" : (b_quad === -1 ? "- x" : (b_quad > 0 ? `+ ${b_quad}x` : (b_quad < 0 ? `- ${Math.abs(b_quad)}x` : "")));
      const c_quad_str = prodR > 0 ? `+ ${prodR}` : `- ${Math.abs(prodR)}`;
      const step3_quad = `x^2 ${b_quad_str} ${c_quad_str} = 0`;

      const f1 = -r1;
      const f2 = -r2_eff;
      const f1_str = f1 > 0 ? `+ ${f1}` : `- ${Math.abs(f1)}`;
      const f2_str = f2 > 0 ? `+ ${f2}` : `- ${Math.abs(f2)}`;
      const step4_factor = `(x ${f1_str})(x ${f2_str}) = 0`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solving Fractional Equations",
        prompt: `Solve the fractional equation:\n\n$$${eq}$$`,
        inputCount: 2,
        inputLabels: ["x =", "or x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1} \\text{ or } x = ${ans2}`,
        steps: [
          `Combine the terms on the left-hand side into a single fraction: $$${step1_single}$$`,
          `Cross-multiply to remove the denominator: $$${step2_cross}$$`,
          `Expand terms: $$${step2_expand}$$`,
          `Rearrange into a standard quadratic equation ($ax^2 + bx + c = 0$): $$${step3_quad}$$`,
          `Factorise the quadratic expression: $$${step4_factor}$$`,
          `Solve for $x$: $$x = ${ans1}\\text{ or } x = ${ans2}$$`
        ]
      };
    } else {
      // Form: A/(x + 1) + B/(x - 1) = 1
      const k1 = randInt(1, 3);
      const k2 = randInt(1, 3);

      const r1 = 2 * k1 + 1;
      const r2 = -(2 * k2 + 1);
      const A = ((1 + r1) * (1 + r2)) / 2;
      const B = r1 + r2 - A;

      const ans1 = Math.min(r1, r2).toString();
      const ans2 = Math.max(r1, r2).toString();

      const frac1_str = (A > 0 ? "" : "-") + `\\frac{${Math.abs(A)}}{x + 1}`;
      const frac2_str = (B > 0 ? "+ " : "- ") + `\\frac{${Math.abs(B)}}{x - 1}`;
      const eq = `${frac1_str} ${frac2_str} = 1`;

      const coeffX_lhs = A + B;
      const const_lhs = B - A;
      const coeffX_lhs_str = coeffX_lhs === 0 ? "" : (coeffX_lhs === 1 ? "x" : (coeffX_lhs === -1 ? "-x" : `${coeffX_lhs}x`));
      const const_lhs_str = const_lhs > 0 ? (coeffX_lhs === 0 ? const_lhs.toString() : `+ ${const_lhs}`) : (const_lhs < 0 ? `- ${Math.abs(const_lhs)}` : "");
      const num_combined = coeffX_lhs_str + (const_lhs_str ? ` ${const_lhs_str}` : "");

      const step1_comb = `\\frac{${num_combined}}{x^2 - 1} = 1`;
      const step2_cross = `${num_combined} = x^2 - 1`;

      const b_quad = -(r1 + r2);
      const c_quad = r1 * r2;
      const b_quad_str = b_quad === 1 ? "+ x" : (b_quad === -1 ? "- x" : (b_quad > 0 ? `+ ${b_quad}x` : (b_quad < 0 ? `- ${Math.abs(b_quad)}x` : "")));
      const c_quad_str = c_quad > 0 ? `+ ${c_quad}` : `- ${Math.abs(c_quad)}`;
      const step3_quad = `x^2 ${b_quad_str} ${c_quad_str} = 0`;

      const f1 = -r1;
      const f2 = -r2;
      const f1_str = f1 > 0 ? `+ ${f1}` : `- ${Math.abs(f1)}`;
      const f2_str = f2 > 0 ? `+ ${f2}` : `- ${Math.abs(f2)}`;
      const step4_factor = `(x ${f1_str})(x ${f2_str}) = 0`;

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solving Fractional Equations",
        prompt: `Solve the fractional equation:\n\n$$${eq}$$`,
        inputCount: 2,
        inputLabels: ["x =", "or x ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: `x = ${ans1} \\text{ or } x = ${ans2}`,
        steps: [
          `Combine the algebraic fractions on the left-hand side into a single fraction: $$${step1_comb}$$`,
          `Cross-multiply to remove the denominator: $$${step2_cross}$$`,
          `Rearrange terms into standard quadratic form ($ax^2 + bx + c = 0$): $$${step3_quad}$$`,
          `Factorise the quadratic expression: $$${step4_factor}$$`,
          `Solve for $x$: $$x = ${ans1}\\text{ or } x = ${ans2}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Complex Sum of Algebraic Fractions)
  // =========================================================
  const r1_choice = randInt(0, 1);
  const r2_choice = randInt(0, 2);

  const r1 = r1_choice === 0 ? 5 : 8;
  const r2 = r2_choice === 0 ? -5 : (r2_choice === 1 ? -4 : -2);
  const a = 1 + ((1 + r1) * (1 + r2)) / 3;
  const c = -2 + r1 + r2 - a;

  const ans1 = Math.min(r1, r2).toString();
  const ans2 = Math.max(r1, r2).toString();

  const a_str = a > 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
  const c_str = c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
  const frac1 = `\\frac{x ${a_str}}{x + 1}`;
  const frac2 = `\\frac{x ${c_str}}{x - 2}`;
  const eq = `${frac1} + ${frac2} = 3`;

  const coeffX_num = a + c - 1;
  const const_num = c - 2 * a;
  const coeffX_num_str = coeffX_num === 0 ? "" : (coeffX_num === 1 ? "+ x" : (coeffX_num === -1 ? "- x" : (coeffX_num > 0 ? `+ ${coeffX_num}x` : `- ${Math.abs(coeffX_num)}x`)));
  const const_num_str = const_num > 0 ? `+ ${const_num}` : `- ${Math.abs(const_num)}`;

  const lhs_single = `\\frac{2x^2 ${coeffX_num_str} ${const_num_str}}{x^2 - x - 2} = 3`;
  const step2_cross = `2x^2 ${coeffX_num_str} ${const_num_str} = 3(x^2 - x - 2)`;
  const step2_expand = `2x^2 ${coeffX_num_str} ${const_num_str} = 3x^2 - 3x - 6`;

  const b_quad = -(r1 + r2);
  const c_quad = r1 * r2;
  const b_quad_str = b_quad === 1 ? "+ x" : (b_quad === -1 ? "- x" : (b_quad > 0 ? `+ ${b_quad}x` : `- ${Math.abs(b_quad)}x`));
  const c_quad_str = c_quad > 0 ? `+ ${c_quad}` : `- ${Math.abs(c_quad)}`;
  const step3_quad = `x^2 ${b_quad_str} ${c_quad_str} = 0`;

  const f1 = -r1;
  const f2 = -r2;
  const f1_str = f1 > 0 ? `+ ${f1}` : `- ${Math.abs(f1)}`;
  const f2_str = f2 > 0 ? `+ ${f2}` : `- ${Math.abs(f2)}`;
  const step4_factor = `(x ${f1_str})(x ${f2_str}) = 0`;

  return {
    strand: "Algebra",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Solving Fractional Equations",
    prompt: `Solve the fractional equation:\n\n$$${eq}$$`,
    inputCount: 2,
    inputLabels: ["x =", "or x ="],
    expectedAnswer: [ans1, ans2],
    displayAnswer: `x = ${ans1} \\text{ or } x = ${ans2}`,
    steps: [
      `Combine the two algebraic fractions on the left-hand side into a single fraction over a common denominator: $$${lhs_single}$$`,
      `Cross-multiply to remove the denominator: $$${step2_cross}$$`,
      `Expand the terms on the right-hand side: $$${step2_expand}$$`,
      `Rearrange terms into standard quadratic form ($ax^2 + bx + c = 0$): $$${step3_quad}$$`,
      `Factorise the quadratic expression: $$${step4_factor}$$`,
      `Solve for $x$: $$x = ${ans1}\\text{ or } x = ${ans2}$$`
    ]
  };
}

export const solvingFractionalEquations = { generate: generateQuestion };
export default generateQuestion;
