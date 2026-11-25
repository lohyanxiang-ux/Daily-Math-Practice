/**
 * Question Generator: Equation of Straight Lines
 * Curriculum Skill: Sec 3 G3 - Coordinate Geometry / Linear Equations
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function formatLinearTerm(coeff, varName) {
  if (coeff === 1) return varName;
  if (coeff === -1) return `-${varName}`;
  return `${coeff}${varName}`;
}

function formatConstCompact(val) {
  if (val === 0) return "";
  return val > 0 ? `+${val}` : val.toString();
}

function formatConstSpaced(val) {
  if (val === 0) return "";
  return val > 0 ? `+ ${val}` : `- ${Math.abs(val)}`;
}

function formatCoordVal(val) {
  return val < 0 ? `(${val})` : val.toString();
}

export function generateQuestion(tier = 1) {
  const extraKeys = [];

  // =========================================================
  // TIER 1: BASIC (Gradient-Intercept Form & General Form Extraction)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Given gradient m and y-intercept c, find equation y = mx + c
      const m = randInt(-5, 5, true);
      const c = randInt(-8, 8, true);

      const mx_term = formatLinearTerm(m, "x");
      const c_term = formatConstCompact(c);
      const c_term_spaced = formatConstSpaced(c);

      const ans = `y=${mx_term}${c_term}`;
      const step1 = `y = mx + c`;
      const step2 = `y = (${m})x + (${c})`;
      const step3 = `y = ${mx_term} ${c_term_spaced}`.trim();

      return {
        strand: "Coordinate Geometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Equation of Straight Lines",
        prompt: `Find the equation of the line with gradient $m = ${m}$ and $y$-intercept $c = ${c}$.`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: [""],
        expectedAnswer: ans,
        displayAnswer: step3,
        extraKeys,
        steps: [
          `Recall the gradient-intercept form of a straight line equation: $$${step1}$$`,
          `Substitute $m = ${m}$ and $c = ${c}$ into the equation: $$${step2}$$`,
          `Simplify to obtain the final equation: $$${step3}$$`
        ]
      };
    }

    // subType === 2: Given ax + by + c0 = 0, find gradient m and y-intercept c
    const m = randInt(-4, 4, true);
    const c = randInt(-6, 6, true);
    const b = randInt(1, 3);

    const a = -m * b;
    const c0 = -c * b;

    const a_term = formatLinearTerm(a, "x");
    const b_term = b === 1 ? "+ y" : `+ ${b}y`;
    const c0_term = formatConstSpaced(c0);
    const eq_str = `${a_term} ${b_term} ${c0_term} = 0`;

    const by_lhs = b === 1 ? "y" : `${b}y`;
    const rhs_a = -a;
    const rhs_c0 = -c0;
    const rhs_mx = formatLinearTerm(rhs_a, "x");
    const rhs_c_spaced = formatConstSpaced(rhs_c0);
    const step_rearrange = `${by_lhs} = ${rhs_mx} ${rhs_c_spaced}`.trim();

    const mx_term = formatLinearTerm(m, "x");
    const c_term_spaced = formatConstSpaced(c);
    const step_final_eq = `y = ${mx_term} ${c_term_spaced}`.trim();

    const ans_m = m.toString();
    const ans_c = c.toString();

    return {
      strand: "Coordinate Geometry",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Equation of Straight Lines",
      prompt: `For the linear equation $$${eq_str}$$ find the gradient and the $y$-intercept of the line.`,
      diagramSvg: null,
      inputCount: 2,
      inputLabels: ["Gradient, m =", "y-intercept, c ="],
      expectedAnswer: [ans_m, ans_c],
      displayAnswer: `m = ${ans_m},\\; c = ${ans_c}`,
      extraKeys,
      steps: [
        `Rearrange the given equation into gradient-intercept form $y = mx + c$.`,
        `Isolate the $y$-term on one side: $$${step_rearrange}$$`,
        `Divide all terms by the coefficient of $y$: $$${step_final_eq}$$`,
        `Compare with $y = mx + c$ to read off the values:\nGradient $m = ${ans_m}$, $y$-intercept $c = ${ans_c}$.`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Horizontal/Vertical Lines & Point-Gradient / Two-Point Lines)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Horizontal (y = a) or vertical (x = b) line through two points A and B
      const line_type = randInt(1, 2);
      const val1 = randInt(-7, 7);
      const val2 = randInt(-7, 7);
      const rawVal3 = randInt(-7, 7);
      const val3_eff =
        rawVal3 === val2 ? (val2 === 7 ? val2 - 1 : val2 + 1) : rawVal3;

      const x1 = line_type === 1 ? val2 : val1;
      const y1 = line_type === 1 ? val1 : val2;
      const x2 = line_type === 1 ? val3_eff : val1;
      const y2 = line_type === 1 ? val1 : val3_eff;

      const dy = y2 - y1;
      const dx = x2 - x1;
      const y1_fmt = formatCoordVal(y1);
      const x1_fmt = formatCoordVal(x1);

      const pA = `(${x1}, ${y1})`;
      const pB = `(${x2}, ${y2})`;
      const ans = line_type === 1 ? `y=${val1}` : `x=${val1}`;

      const step_m =
        line_type === 1
          ? `m = \\frac{${y2} - ${y1_fmt}}{${x2} - ${x1_fmt}} = \\frac{0}{${dx}} = 0`
          : `m = \\frac{${y2} - ${y1_fmt}}{${x2} - ${x1_fmt}} = \\frac{${dy}}{0} \\text{ (undefined)}`;

      const step_reason =
        line_type === 1
          ? `Since the gradient is $0$, the line is horizontal and has the form $y = a$, where $a$ is the $y$-intercept.`
          : `Since the gradient is undefined, the line is vertical and has the form $x = b$, where $b$ is the $x$-intercept.`;

      const svg_diagram =
        line_type === 1
          ? `<svg viewBox='0 0 300 200' width='100%' style='max-width:300px; display:block; margin:10px auto;'><defs><marker id='ah' viewBox='0 0 10 10' refX='5' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M 0 0 L 10 5 L 0 10 z' fill='#6b7280'/></marker></defs><line x1='20' y1='95' x2='280' y2='95' stroke='#9ca3af' stroke-width='1.5' marker-end='url(#ah)'/><line x1='150' y1='185' x2='150' y2='15' stroke='#9ca3af' stroke-width='1.5' marker-end='url(#ah)'/><text x='285' y='99' font-size='12' font-weight='bold' fill='#4b5563' font-family='sans-serif'>x</text><text x='150' y='10' font-size='12' font-weight='bold' fill='#4b5563' text-anchor='middle' font-family='sans-serif'>y</text><line x1='20' y1='${95 - 9 * val1}' x2='280' y2='${95 - 9 * val1}' stroke='#2563eb' stroke-width='2.5'/><circle cx='${150 + 9 * x1}' cy='${95 - 9 * val1}' r='4.5' fill='#dc2626'/><text x='${150 + 9 * x1}' y='${95 - 9 * val1 - 10}' font-size='11' font-weight='bold' text-anchor='middle' fill='#dc2626' font-family='sans-serif' paint-order='stroke fill' stroke='#ffffff' stroke-width='3' stroke-linejoin='round'>A${pA}</text><circle cx='${150 + 9 * x2}' cy='${95 - 9 * val1}' r='4.5' fill='#dc2626'/><text x='${150 + 9 * x2}' y='${95 - 9 * val1 + 18}' font-size='11' font-weight='bold' text-anchor='middle' fill='#dc2626' font-family='sans-serif' paint-order='stroke fill' stroke='#ffffff' stroke-width='3' stroke-linejoin='round'>B${pB}</text><circle cx='150' cy='${95 - 9 * val1}' r='4.5' fill='#16a34a'/><text x='138' y='${95 - 9 * val1 + 4}' font-size='11' font-weight='bold' text-anchor='end' fill='#16a34a' font-family='sans-serif' paint-order='stroke fill' stroke='#ffffff' stroke-width='3' stroke-linejoin='round'>y-int: (0, ${val1})</text></svg>`
          : `<svg viewBox='0 0 300 200' width='100%' style='max-width:300px; display:block; margin:10px auto;'><defs><marker id='ah' viewBox='0 0 10 10' refX='5' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M 0 0 L 10 5 L 0 10 z' fill='#6b7280'/></marker></defs><line x1='20' y1='95' x2='280' y2='95' stroke='#9ca3af' stroke-width='1.5' marker-end='url(#ah)'/><line x1='150' y1='185' x2='150' y2='15' stroke='#9ca3af' stroke-width='1.5' marker-end='url(#ah)'/><text x='285' y='99' font-size='12' font-weight='bold' fill='#4b5563' font-family='sans-serif'>x</text><text x='150' y='10' font-size='12' font-weight='bold' fill='#4b5563' text-anchor='middle' font-family='sans-serif'>y</text><line x1='${150 + 9 * val1}' y1='15' x2='${150 + 9 * val1}' y2='185' stroke='#2563eb' stroke-width='2.5'/><circle cx='${150 + 9 * val1}' cy='${95 - 9 * y1}' r='4.5' fill='#dc2626'/><text x='${150 + 9 * val1 - 8}' y='${95 - 9 * y1 + 4}' font-size='11' font-weight='bold' text-anchor='end' fill='#dc2626' font-family='sans-serif' paint-order='stroke fill' stroke='#ffffff' stroke-width='3' stroke-linejoin='round'>A${pA}</text><circle cx='${150 + 9 * val1}' cy='${95 - 9 * y2}' r='4.5' fill='#dc2626'/><text x='${150 + 9 * val1 + 8}' y='${95 - 9 * y2 + 4}' font-size='11' font-weight='bold' text-anchor='start' fill='#dc2626' font-family='sans-serif' paint-order='stroke fill' stroke='#ffffff' stroke-width='3' stroke-linejoin='round'>B${pB}</text><circle cx='${150 + 9 * val1}' cy='95' r='4.5' fill='#16a34a'/><text x='${150 + 9 * val1}' y='${val1 >= 0 ? 112 : 80}' font-size='11' font-weight='bold' text-anchor='middle' fill='#16a34a' font-family='sans-serif' paint-order='stroke fill' stroke='#ffffff' stroke-width='3' stroke-linejoin='round'>x-int: (${val1}, 0)</text></svg>`;

      const step_eq = line_type === 1 ? `y = ${val1}` : `x = ${val1}`;

      return {
        strand: "Coordinate Geometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Equation of Straight Lines",
        prompt: `Find the equation of the line that passes through the two points $A${pA}$ and $B${pB}$.`,
        diagramSvg: svg_diagram,
        inputCount: 1,
        inputLabels: [""],
        expectedAnswer: ans,
        displayAnswer: step_eq,
        extraKeys,
        steps: [
          `Calculate the gradient $m$ using $m = \\frac{y_2 - y_1}{x_2 - x_1}$: $$${step_m}$$`,
          `${step_reason}\n\n${svg_diagram}`,
          `Write the equation of the line: $$${step_eq}$$`
        ]
      };
    }

    if (subType === 2) {
      // Given gradient m and point A(x1, y1), find equation y = mx + c
      const m = randInt(-4, 4, true);
      const x1 = randInt(-5, 5, true);
      const y1 = randInt(-6, 6, true);

      const c = y1 - m * x1;
      const mx_term = formatLinearTerm(m, "x");
      const c_term = formatConstCompact(c);
      const c_term_spaced = formatConstSpaced(c);

      const ans = `y=${mx_term}${c_term}`;
      const step1 = `\\begin{aligned} y &= mx + c \\\\ ${y1} &= (${m})(${x1}) + c \\end{aligned}`;
      const step2 = `c = ${c}`;
      const step3 = `y = ${mx_term}${c_term_spaced ? ` ${c_term_spaced}` : ""}`;

      return {
        strand: "Coordinate Geometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Equation of Straight Lines",
        prompt: `Find the equation of the line that passes through the point $A(${x1}, ${y1})$ and has gradient $m = ${m}$.`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: [""],
        expectedAnswer: ans,
        displayAnswer: step3,
        extraKeys,
        steps: [
          `Substitute $m = ${m}$ and point $A(${x1}, ${y1})$ into $y = mx + c$: $$${step1}$$`,
          `Solve for $c$: $$${step2}$$`,
          `Write the final equation: $$${step3}$$`
        ]
      };
    }

    // subType === 3: Two points A(x1, y1) and B(x2, y2) with integer gradient m
    const m = randInt(-4, 4, true);
    const x1 = randInt(-4, 4);
    const dx = randInt(1, 4);
    const c = randInt(-6, 6);

    const x2 = x1 + dx;
    const y1 = m * x1 + c;
    const y2 = m * x2 + c;
    const dy = y2 - y1;

    const mx_term = formatLinearTerm(m, "x");
    const c_term = formatConstCompact(c);
    const c_term_spaced = formatConstSpaced(c);
    const ans = `y=${mx_term}${c_term}`;

    const y1_fmt = formatCoordVal(y1);
    const x1_fmt = formatCoordVal(x1);

    const step_m = `\\begin{aligned} m &= \\frac{y_2 - y_1}{x_2 - x_1} \\\\ &= \\frac{${y2} - ${y1_fmt}}{${x2} - ${x1_fmt}} \\\\ &= \\frac{${dy}}{${dx}} = ${m}\\end{aligned}`;
    const step_c = `\\begin{aligned} y &= mx + c \\\\ ${y1} &= (${m})(${x1}) + c \\\\ c &= ${c}\\end{aligned}`;
    const step_eq = `y = ${mx_term}${c_term_spaced ? ` ${c_term_spaced}` : ""}`;

    return {
      strand: "Coordinate Geometry",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Equation of Straight Lines",
      prompt: `Find the equation of the line that passes through the two points $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: [""],
      expectedAnswer: ans,
      displayAnswer: step_eq,
      extraKeys,
      steps: [
        `Calculate the gradient $m$ using $m = \\frac{y_2 - y_1}{x_2 - x_1}$: $$${step_m}$$`,
        `Substitute $m = ${m}$ and $A(${x1}, ${y1})$ into $y = mx + c$ to find $c$: $$${step_c}$$`,
        `Write the line equation: $$${step_eq}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Parallel Line Through a Given Point)
  // =========================================================
  const m = randInt(-4, 4, true);
  const b = randInt(1, 3);
  const x1 = randInt(-5, 5, true);
  const y1 = randInt(-6, 6, true);
  const c_orig = randInt(-7, 7, true);

  const a = -m * b;
  const c0 = -c_orig * b;
  const c2 = y1 - m * x1;

  const a_term = formatLinearTerm(a, "x");
  const b_term = b === 1 ? "+ y" : `+ ${b}y`;
  const c0_term = formatConstSpaced(c0);
  const eq_L2 = `${a_term} ${b_term} ${c0_term} = 0`;

  const by_lhs = b === 1 ? "y" : `${b}y`;
  const rhs_a = -a;
  const rhs_c0 = -c0;
  const rhs_mx = formatLinearTerm(rhs_a, "x");
  const rhs_c_spaced = formatConstSpaced(rhs_c0);

  const mx_term = formatLinearTerm(m, "x");
  const orig_c_spaced = formatConstSpaced(c_orig);

  const step_rearrange_full =
    b === 1
      ? `${by_lhs} = ${rhs_mx} ${rhs_c_spaced}`.trim()
      : `\\begin{aligned} ${by_lhs} &= ${rhs_mx} ${rhs_c_spaced} \\\\ y &= ${mx_term} ${orig_c_spaced}\\end{aligned}`;

  const c2_term = formatConstCompact(c2);
  const c2_term_spaced = formatConstSpaced(c2);
  const ans = `y=${mx_term}${c2_term}`;

  const step_c2 = `\\begin{aligned} y &= mx + c \\\\ ${y1} &= (${m})(${x1}) + c \\\\ c &= ${c2}\\end{aligned}`;
  const step_eq = `y = ${mx_term}${c2_term_spaced ? ` ${c2_term_spaced}` : ""}`;

  return {
    strand: "Coordinate Geometry",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Equation of Straight Lines",
    prompt: `A line $L_1$ passes through the point $P(${x1}, ${y1})$. The gradient of $L_1$ is equal to that of the line $L_2$ with equation $$${eq_L2}$$ Find the equation of the line $L_1$.`,
    diagramSvg: null,
    inputCount: 1,
    inputLabels: [""],
    expectedAnswer: ans,
    displayAnswer: step_eq,
    extraKeys,
    steps: [
      `Rearrange $L_2$ into $y = mx + c$ form: $$${step_rearrange_full}$$`,
      `Thus, the gradient of $L_2$ is $m = ${m}$. Since $L_1$ is parallel to $L_2$, $L_1$ also has gradient $m = ${m}$.`,
      `Substitute $m = ${m}$ and point $P(${x1}, ${y1})$ into $y = mx + c$ to find $c$: $$${step_c2}$$`,
      `Write the equation for line $L_1$: $$${step_eq}$$`
    ]
  };
}

export const equationsOfStraightLines = { generate: generateQuestion };
export default generateQuestion;
