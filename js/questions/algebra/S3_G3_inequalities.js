/**
 * Question Generator: Solving Inequalities
 * Curriculum Skill: Sec 3 G3 - Algebra & Inequalities
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randIntExclude(min, max, excludeZero = true) {
  let val = 0;
  do {
    val = randInt(min, max);
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

function formatFrac(num, den) {
  if (den === 1) return num.toString();
  if (num < 0) return `-\\frac{${Math.abs(num)}}{${den}}`;
  return `\\frac{${num}}{${den}}`;
}

export function generateQuestion(tier = 1) {
  // Pass extra keys to populate keypad spare slots
  const extraKeys = ["no solution"];

  // =========================================================
  // TIER 1: BASIC (Level 1 Linear Inequalities)
  // =========================================================
  if (tier === 1) {
    const a = randInt(2, 8);
    const c_raw = randIntExclude(-6, 6, true);
    const b = randIntExclude(-12, 12, true);
    const d = randIntExclude(-15, 15, true);
    const op_idx = randInt(1, 4);

    const c = c_raw === a ? c_raw + 1 : c_raw;
    const coeff = a - c;
    const const_val = d - b;
    const g = gcd(const_val, coeff);

    const num = (const_val / g) * (coeff < 0 ? -1 : 1);
    const den = Math.abs(coeff / g);

    const symList = ["\\gt", "\\lt", "\\ge", "\\le"];
    const sym = symList[op_idx - 1];

    const flipMap = { "\\gt": "\\lt", "\\lt": "\\gt", "\\ge": "\\le", "\\le": "\\ge" };
    const ans_sym = coeff < 0 ? flipMap[sym] : sym;

    let lhs = `${a === 1 ? 'x' : (a === -1 ? '-x' : a + 'x')}`;
    lhs += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;

    let rhs = "";
    if (c === 1) rhs = "x";
    else if (c === -1) rhs = "-x";
    else if (c !== 0) rhs = `${c}x`;

    if (d !== 0) {
      if (c === 0) rhs = `${d}`;
      else rhs += d > 0 ? ` + ${d}` : ` - ${Math.abs(d)}`;
    }

    const frac_latex = formatFrac(num, den);
    const ans = `x ${ans_sym} ${frac_latex}`;

    const step1Coeff = coeff === 1 ? 'x' : (coeff === -1 ? '-x' : `${coeff}x`);
    const step1 = `${step1Coeff} ${sym} ${const_val}`;

    return {
      strand: "Algebra & Inequalities",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Solving Inequalities",
      inputCount: 1,
      inputLabels: ["Ans ="],
      prompt: `Solve the inequality: $\\displaystyle ${lhs} ${sym} ${rhs}$`,
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys: extraKeys,
      steps: [
        `Rearrange terms to collect $x$ on one side and constant terms on the other: $$${step1}$$`,
        `Divide by the coefficient of $x$ (reversing the inequality sign if dividing by a negative number): $$${ans}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 Fractional & Compound Inequalities)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      const denom1 = randInt(2, 5);
      const denom2 = randInt(2, 5);
      const num_a = randIntExclude(-4, 5, true);
      const num_d = randIntExclude(-4, 5, true);
      const b_val = randIntExclude(-7, 7, true);
      const e_val = randIntExclude(-7, 7, true);
      const op_idx = randInt(1, 4);

      const c = denom1;
      const f = denom2 === denom1 ? (denom1 === 5 ? 2 : denom1 + 1) : denom2;
      const a = num_a;
      const d_raw = num_d;

      const coeff_check = f * a - c * d_raw;
      const d = coeff_check === 0 ? (d_raw > 0 ? d_raw + 1 : d_raw - 1) : d_raw;

      const coeff = f * a - c * d;
      const const_val = c * e_val - f * b_val;
      const g = gcd(const_val, coeff);

      const num = (const_val / g) * (coeff < 0 ? -1 : 1);
      const den = Math.abs(coeff / g);

      const symList = ["\\ge", "\\le", "\\gt", "\\lt"];
      const sym = symList[op_idx - 1];

      const flipMap = { "\\ge": "\\le", "\\le": "\\ge", "\\gt": "\\lt", "\\lt": "\\gt" };
      const ans_sym = coeff < 0 ? flipMap[sym] : sym;

      const lhs_num = `${a === 1 ? 'x' : (a === -1 ? '-x' : a + 'x')}${b_val > 0 ? ' + ' + b_val : ' - ' + Math.abs(b_val)}`;
      const rhs_num = `${d === 1 ? 'x' : (d === -1 ? '-x' : d + 'x')}${e_val > 0 ? ' + ' + e_val : ' - ' + Math.abs(e_val)}`;
      const expr = `\\frac{${lhs_num}}{${c}} ${sym} \\frac{${rhs_num}}{${f}}`;

      const frac_latex = formatFrac(num, den);
      const ans = `x ${ans_sym} ${frac_latex}`;

      const step1 = `${f}(${lhs_num}) ${sym} ${c}(${rhs_num})`;
      const step2Coeff = coeff === 1 ? 'x' : (coeff === -1 ? '-x' : `${coeff}x`);
      const step2 = `${step2Coeff} ${sym} ${const_val}`;

      return {
        strand: "Algebra & Inequalities",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solving Inequalities",
        inputCount: 1,
        inputLabels: ["Ans ="],
        prompt: `Solve the inequality: $\\displaystyle ${expr}$`,
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: extraKeys,
        steps: [
          `Multiply both sides by the common denominator to eliminate fractions: $$${step1}$$`,
          `Expand brackets and collect like terms: $$${step2}$$`,
          `Solve for $x$: $$${ans}$$`
        ]
      };
    } else {
      const x1_raw_num = randIntExclude(-12, 2, true);
      const x1_raw_den = randInt(1, 3);
      const gap = randInt(3, 6);
      const m = randInt(2, 4);
      const c = randIntExclude(-6, 6, true);
      const op1_type = randInt(1, 2);
      const op2_type = randInt(1, 2);

      const g1 = gcd(x1_raw_num, x1_raw_den);
      const x1_num = (x1_raw_num / g1) * (x1_raw_den < 0 ? -1 : 1);
      const x1_den = Math.abs(x1_raw_den / g1);

      const x2_raw_num = x1_num + gap * x1_den;
      const g2 = gcd(x2_raw_num, x1_den);
      const x2_num = (x2_raw_num / g2) * (x1_den < 0 ? -1 : 1);
      const x2_den = Math.abs(x1_den / g2);

      const a_raw_num = m * x1_num + c * x1_den;
      const ga = gcd(a_raw_num, x1_den);
      const a_num = (a_raw_num / ga) * (x1_den < 0 ? -1 : 1);
      const a_den = Math.abs(x1_den / ga);

      const b_raw_num = m * x2_raw_num + c * x1_den;
      const gb = gcd(b_raw_num, x1_den);
      const b_num = (b_raw_num / gb) * (x1_den < 0 ? -1 : 1);
      const b_den = Math.abs(x1_den / gb);

      const a_str = formatFrac(a_num, a_den);
      const b_str = formatFrac(b_num, b_den);
      const x1_str = formatFrac(x1_num, x1_den);
      const x2_str = formatFrac(x2_num, x2_den);

      const op1 = op1_type === 1 ? "\\le" : "\\lt";
      const op2 = op2_type === 1 ? "\\lt" : "\\le";

      const mid_expr = `${m === 1 ? 'x' : m + 'x'}${c > 0 ? ' + ' + c : ' - ' + Math.abs(c)}`;
      const expr = `${a_str} ${op1} ${mid_expr} ${op2} ${b_str}`;

      const ineq1 = `${mid_expr} ${op1 === '\\le' ? '\\ge' : '\\gt'} ${a_str}`;
      const ineq2 = `${mid_expr} ${op2} ${b_str}`;
      const sol1 = `x ${op1 === '\\le' ? '\\ge' : '\\gt'} ${x1_str}`;
      const sol2 = `x ${op2} ${x2_str}`;
      const ans = `${x1_str} ${op1} x ${op2} ${x2_str}`;

      const is_solid1 = op1 === "\\le";
      const is_solid2 = op2 === "\\le";
      const lbl1 = x1_den === 1 ? x1_num.toString() : `${x1_num}/${x1_den}`;
      const lbl2 = x2_den === 1 ? x2_num.toString() : `${x2_num}/${x2_den}`;

      const numline_svg = `<svg width="360" height="100" viewBox="0 0 360 100" xmlns="http://www.w3.org/2000/svg" style="background:#fff; font-family:sans-serif;"><defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#000"/></marker></defs><rect x="110" y="20" width="140" height="55" fill="#e0e0e0" opacity="0.6"/><line x1="20" y1="75" x2="340" y2="75" stroke="#000" stroke-width="2" marker-start="url(#arrow)" marker-end="url(#arrow)"/><line x1="110" y1="70" x2="110" y2="80" stroke="#000" stroke-width="2"/><text x="110" y="95" font-size="13" text-anchor="middle">${lbl1}</text><line x1="250" y1="70" x2="250" y2="80" stroke="#000" stroke-width="2"/><text x="250" y="95" font-size="13" text-anchor="middle">${lbl2}</text><line x1="110" y1="30" x2="110" y2="75" stroke="#888" stroke-dasharray="4,4"/><line x1="250" y1="48" x2="250" y2="75" stroke="#888" stroke-dasharray="4,4"/><line x1="110" y1="30" x2="330" y2="30" stroke="#000" stroke-width="2" marker-end="url(#arrow)"/><circle cx="110" cy="30" r="5" fill="${is_solid1 ? '#000' : '#fff'}" stroke="#000" stroke-width="2"/><line x1="250" y1="48" x2="30" y2="48" stroke="#000" stroke-width="2" marker-end="url(#arrow)"/><circle cx="250" cy="48" r="5" fill="${is_solid2 ? '#000' : '#fff'}" stroke="#000" stroke-width="2"/></svg>`;

      return {
        strand: "Algebra & Inequalities",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Solving Inequalities",
        inputCount: 1,
        inputLabels: ["Ans ="],
        prompt: `Solve the inequality: $\\displaystyle ${expr}$`,
        expectedAnswer: ans,
        displayAnswer: ans,
        extraKeys: extraKeys,
        steps: [
          `Split into two separate inequalities connected by "and": $$${ineq1} \\quad \\text{and} \\quad ${ineq2}$$`,
          `Solve each inequality independently: $$${sol1} \\quad \\text{and} \\quad ${sol2}$$`,
          `Represent both solutions on a number line to find their intersection:\n\n${numline_svg}`,
          `Combine the overlapping region to state the final answer: $$${ans}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 Simultaneous Inequalities)
  // =========================================================
  const p1 = randInt(2, 4);
  const a1 = randInt(2, 5);
  const b1 = randIntExclude(-6, 6, true);
  const q1 = randInt(2, 4);
  const c1 = randInt(1, 4);
  const d1 = randIntExclude(-6, 6, true);

  const p2 = randInt(2, 4);
  const a2 = randInt(2, 5);
  const b2 = randIntExclude(-6, 6, true);
  const q2 = randInt(2, 4);
  const c2 = randInt(1, 4);
  const d2 = randIntExclude(-6, 6, true);

  const op1_idx = randInt(1, 2);
  const op2_idx = randInt(1, 2);

  const coeff1 = p1 * a1 - q1 * c1;
  const adj_c1 = coeff1 === 0 ? c1 + 1 : c1;
  const eff_coeff1 = p1 * a1 - q1 * adj_c1;
  const const1 = q1 * d1 - p1 * b1;
  const gcd1 = gcd(const1, eff_coeff1);

  const num1 = (const1 / gcd1) * (eff_coeff1 < 0 ? -1 : 1);
  const den1 = Math.abs(eff_coeff1 / gcd1);

  const sym1 = op1_idx === 1 ? "\\ge" : "\\gt";
  const flipMap = { "\\ge": "\\le", "\\gt": "\\lt", "\\le": "\\ge", "\\lt": "\\gt" };
  const ans_sym1 = eff_coeff1 < 0 ? flipMap[sym1] : sym1;
  const val1_str = formatFrac(num1, den1);
  const v1 = num1 / den1;

  const coeff2 = p2 * a2 - q2 * c2;
  const adj_c2 = coeff2 === 0 ? c2 + 1 : c2;
  const eff_coeff2 = p2 * a2 - q2 * adj_c2;
  const const2 = q2 * d2 - p2 * b2;
  const gcd2 = gcd(const2, eff_coeff2);

  const num2_raw = (const2 / gcd2) * (eff_coeff2 < 0 ? -1 : 1);
  const den2_raw = Math.abs(eff_coeff2 / gcd2);
  const v2_raw = num2_raw / den2_raw;

  const num2 = v2_raw <= v1 ? num1 + 3 * den1 : num2_raw;
  const den2 = v2_raw <= v1 ? den1 : den2_raw;

  const sym2 = op2_idx === 1 ? "\\le" : "\\lt";
  const ans_sym2 = eff_coeff2 < 0 ? flipMap[sym2] : sym2;
  const val2_str = formatFrac(num2, den2);

  const expr1_lhs = `${p1}(${a1 === 1 ? 'x' : a1 + 'x'}${b1 > 0 ? ' + ' + b1 : ' - ' + Math.abs(b1)})`;
  const expr1_rhs = `${q1}(${adj_c1 === 1 ? 'x' : adj_c1 + 'x'}${d1 > 0 ? ' + ' + d1 : ' - ' + Math.abs(d1)})`;
  const expr1 = `${expr1_lhs} ${sym1} ${expr1_rhs}`;

  const expr2_lhs = `${p2}(${a2 === 1 ? 'x' : a2 + 'x'}${b2 > 0 ? ' + ' + b2 : ' - ' + Math.abs(b2)})`;
  const expr2_rhs = `${q2}(${adj_c2 === 1 ? 'x' : adj_c2 + 'x'}${d2 > 0 ? ' + ' + d2 : ' - ' + Math.abs(d2)})`;
  const expr2 = `${expr2_lhs} ${sym2} ${expr2_rhs}`;

  const sol1 = `x ${ans_sym1} ${val1_str}`;
  const sol2 = `x ${ans_sym2} ${val2_str}`;
  const left_op = ans_sym1 === "\\ge" ? "\\le" : "\\lt";

  let ans = "";
  if (eff_coeff1 > 0 && eff_coeff2 > 0) {
    ans = `${val1_str} ${left_op} x ${ans_sym2} ${val2_str}`;
  } else if (eff_coeff1 < 0 && eff_coeff2 < 0) {
    ans = "no solution";
  } else {
    ans = eff_coeff1 > 0 ? sol2 : sol1;
  }

  const ans_latex = ans === "no solution" ? "\\text{no solution}" : ans;
  const is_solid1 = sym1 === "\\ge";
  const is_solid2 = sym2 === "\\le";
  const lbl1 = den1 === 1 ? num1.toString() : `${num1}/${den1}`;
  const lbl2 = den2 === 1 ? num2.toString() : `${num2}/${den2}`;

  const x_target1 = eff_coeff1 > 0 ? 330 : 30;
  const x_target2 = eff_coeff2 > 0 ? 30 : 330;

  let rect_svg = "";
  if (eff_coeff1 > 0 && eff_coeff2 > 0) {
    rect_svg = `<rect x="110" y="20" width="140" height="55" fill="#e0e0e0" opacity="0.6"/>`;
  } else if (eff_coeff1 > 0) {
    rect_svg = `<rect x="250" y="20" width="90" height="55" fill="#e0e0e0" opacity="0.6"/>`;
  } else if (eff_coeff2 > 0) {
    rect_svg = `<rect x="20" y="20" width="90" height="55" fill="#e0e0e0" opacity="0.6"/>`;
  }

  const numline_svg = `<svg width="360" height="100" viewBox="0 0 360 100" xmlns="http://www.w3.org/2000/svg" style="background:#fff; font-family:sans-serif;"><defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#000"/></marker></defs>${rect_svg}<line x1="20" y1="75" x2="340" y2="75" stroke="#000" stroke-width="2" marker-start="url(#arrow)" marker-end="url(#arrow)"/><line x1="110" y1="70" x2="110" y2="80" stroke="#000" stroke-width="2"/><text x="110" y="95" font-size="13" text-anchor="middle">${lbl1}</text><line x1="250" y1="70" x2="250" y2="80" stroke="#000" stroke-width="2"/><text x="250" y="95" font-size="13" text-anchor="middle">${lbl2}</text><line x1="110" y1="30" x2="110" y2="75" stroke="#888" stroke-dasharray="4,4"/><line x1="250" y1="48" x2="250" y2="75" stroke="#888" stroke-dasharray="4,4"/><line x1="110" y1="30" x2="${x_target1}" y2="30" stroke="#000" stroke-width="2" marker-end="url(#arrow)"/><circle cx="110" cy="30" r="5" fill="${is_solid1 ? '#000' : '#fff'}" stroke="#000" stroke-width="2"/><line x1="250" y1="48" x2="${x_target2}" y2="48" stroke="#000" stroke-width="2" marker-end="url(#arrow)"/><circle cx="250" cy="48" r="5" fill="${is_solid2 ? '#000' : '#fff'}" stroke="#000" stroke-width="2"/></svg>`;

  const step4_text = ans === "no solution"
    ? "Since the two regions do not overlap, there is no solution:"
    : "Combine the intersecting region into the final inequality:";

  return {
    strand: "Algebra & Inequalities",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Solving Inequalities",
    inputCount: 1,
    inputLabels: ["Ans ="],
    prompt: `Solve the inequalities:\n\n$\\displaystyle ${expr1}$\n\nand\n\n$\\displaystyle ${expr2}$`,
    expectedAnswer: ans_latex,
    displayAnswer: ans_latex,
    extraKeys: extraKeys,
    steps: [
      `Solve the first inequality independently: $$${sol1}$$`,
      `Solve the second inequality independently: $$${sol2}$$`,
      `Represent both solutions on a number line to find their intersection:\n\n${numline_svg}`,
      `${step4_text} $$${ans_latex}$$`
    ]
  };
}

export const solvingInequalities = { generate: generateQuestion };
export default generateQuestion;
