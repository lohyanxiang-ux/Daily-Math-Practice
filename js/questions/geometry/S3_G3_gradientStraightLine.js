/**
 * Question Generator: Gradient of Straight Line
 * Curriculum Skill: Sec 3 G3 - Coordinate Geometry
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function formatCoordVal(val) {
  return val < 0 ? `(${val})` : val.toString();
}

export function generateQuestion(tier = 1) {
  const extraKeys = ["k", "undefined"];

  // =========================================================
  // TIER 1: BASIC (Gradient Between Two Points & Horizontal/Vertical Lines)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Gradient passing through A(x1, y1) and B(x2, y2)
      const x1 = randInt(-6, 6);
      const y1 = randInt(-6, 6);
      const dx_raw = randInt(-5, 5, true);
      const dy_raw = randInt(-8, 8, true);

      const x2 = x1 + dx_raw;
      const y2 = y1 + dy_raw;
      const dx = x2 - x1;
      const dy = y2 - y1;

      const g = gcd(dy, dx);
      const num = (dx < 0 ? -dy : dy) / g;
      const den = Math.abs(dx) / g;

      const ans = den === 1 ? num.toString() : `${num}/${den}`;
      const ans_latex = den === 1 ? num.toString() : `\\frac{${num}}{${den}}`;

      const y1_str = formatCoordVal(y1);
      const x1_str = formatCoordVal(x1);
      const step1 = `m = \\frac{${y2} - ${y1_str}}{${x2} - ${x1_str}}`;
      const step2 = `m = \\frac{${dy}}{${dx}}`;

      return {
        strand: "Coordinate Geometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Gradient of Straight Line",
        prompt: `Find the gradient of the line passing through the points $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["m ="],
        expectedAnswer: ans,
        displayAnswer: `m = ${ans_latex}`,
        extraKeys,
        steps: [
          `Apply the gradient formula $$m = \\frac{y_2 - y_1}{x_2 - x_1}$$`,
          `Substitute the coordinates: $$${step1}$$`,
          `Simplify: $$${step2} = ${ans_latex}$$`
        ]
      };
    }

    // subType === 2: Horizontal (m = 0) or vertical (m = undefined) line through P and Q
    const type = randInt(0, 1);
    const c1 = randInt(-7, 7);
    const c2 = randInt(-7, 7);
    const diff = randInt(2, 6);

    const x1 = type === 0 ? c1 : c2;
    const y1 = type === 0 ? c2 : c1;
    const x2 = type === 0 ? c1 + diff : c2;
    const y2 = type === 0 ? c2 : c1 + diff;

    const ans = type === 0 ? "0" : "undefined";
    const dy = y2 - y1;
    const dx = x2 - x1;

    const y1_str = formatCoordVal(y1);
    const x1_str = formatCoordVal(x1);
    const step1 =
      type === 0
        ? `m = \\frac{${y2} - ${y1_str}}{${x2} - ${x1_str}} = \\frac{0}{${dx}} = 0`
        : `m = \\frac{${y2} - ${y1_str}}{${x2} - ${x1_str}} = \\frac{${dy}}{0}`;

    const step3 =
      type === 0
        ? `Since the line is horizontal ($\\Delta y = 0$), its gradient is $$0$$.`
        : `Since division by zero is undefined for vertical lines, its gradient is $$\\text{undefined}$$.`;

    return {
      strand: "Coordinate Geometry",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Gradient of Straight Line",
      prompt: `Find the gradient of the line passing through the points $P(${x1}, ${y1})$ and $Q(${x2}, ${y2})$.`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["m ="],
      expectedAnswer: ans,
      displayAnswer: type === 0 ? "m = 0" : "m \\text{ is undefined}",
      extraKeys,
      steps: [
        `Apply the gradient formula $$m = \\frac{y_2 - y_1}{x_2 - x_1}$$`,
        `Substitute the coordinates: $$${step1}$$`,
        step3
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Missing Coordinate & Collinear Points)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Given A(x1, y1), B(k, y2), and gradient m, solve for k
      const x1 = randInt(-6, 6);
      const y1 = randInt(-6, 6);
      const m = randInt(-4, 4, true);
      const mult = randInt(-5, 5, true);

      const dy = m * mult;
      const y2 = y1 + dy;
      const ans_val = x1 + mult;
      const ans = ans_val.toString();

      const y1_str = formatCoordVal(y1);
      const x1_str = formatCoordVal(x1);
      const x1_sub =
        x1 < 0 ? `k + ${Math.abs(x1)}` : x1 === 0 ? "k" : `k - ${x1}`;

      const step1 = `\\frac{${y2} - ${y1_str}}{k - ${x1_str}} = ${m}`;
      const step2 = `\\frac{${dy}}{${x1_sub}} = ${m}`;
      const step3 = `${dy} = ${m}(${x1_sub})`;

      return {
        strand: "Coordinate Geometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Gradient of Straight Line",
        prompt: `The gradient of the line passing through $A(${x1}, ${y1})$ and $B(k, ${y2})$ is ${m}.\n\nFind the value of $k$.`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["k ="],
        expectedAnswer: ans,
        displayAnswer: `k = ${ans}`,
        extraKeys,
        steps: [
          `Set up the equation using the gradient formula $$m = \\frac{y_2 - y_1}{x_2 - x_1}$$`,
          `Substitute the known values: $$${step1}$$`,
          `Simplify the numerator: $$${step2}$$`,
          `Multiply both sides by the denominator: $$${step3}$$`,
          `Solve for $k$: $$k = ${ans}$$`
        ]
      };
    }

    // subType === 2: Collinear points A(x1, y1), B(x2, k), and C(x3, y3)
    const m = randInt(-3, 3, true);
    const x1 = randInt(-5, 2);
    const dx1 = randInt(1, 4);
    const dx2 = randInt(1, 4);
    const y1 = randInt(-5, 5);

    const x2 = x1 + dx1;
    const x3 = x2 + dx2;
    const k_val = y1 + m * dx1;
    const y3 = y1 + m * (dx1 + dx2);
    const ans = k_val.toString();

    const dy_AC = y3 - y1;
    const dx_AC = x3 - x1;
    const y1_str = formatCoordVal(y1);
    const x1_str = formatCoordVal(x1);

    const step1 = `m_{AC} = \\frac{${y3} - ${y1_str}}{${x3} - ${x1_str}} = \\frac{${dy_AC}}{${dx_AC}} = ${m}`;
    const step2 = `m_{AB} = \\frac{k - ${y1_str}}{${x2} - ${x1_str}} = ${m}`;

    return {
      strand: "Coordinate Geometry",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Gradient of Straight Line",
      prompt: `The points $A(${x1}, ${y1})$, $B(${x2}, k)$, and $C(${x3}, ${y3})$ lie on a straight line.\n\nFind the value of $k$.`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["k ="],
      expectedAnswer: ans,
      displayAnswer: `k = ${ans}`,
      extraKeys,
      steps: [
        `Since $A$, $B$, and $C$ lie on the same straight line, $m_{AB} = m_{AC}$ using $m = \\frac{y_2 - y_1}{x_2 - x_1}$.`,
        `Find the gradient of $AC$: $$${step1}$$`,
        `Equate $m_{AB}$ to $m_{AC}$: $$${step2}$$`,
        `Solve for $k$: $$k = ${ans}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Quadratic Gradient Equation)
  // =========================================================
  const a = randInt(1, 4);
  const C = a * (a + 1);
  const r1 = a;
  const r2 = -(a + 1);

  const ans1 = r1.toString();
  const ans2 = r2.toString();

  const step1 = `\\frac{${C} - k}{k - 0} = k`;
  const step2 = `${C} - k = k^2 \\implies k^2 + k - ${C} = 0`;
  const step3 = `(k - ${r1})(k + ${a + 1}) = 0`;

  return {
    strand: "Coordinate Geometry",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Gradient of Straight Line",
    prompt: `The gradient of a line joining the points $(0, k)$ and $(k, ${C})$ is $k$.\n\nFind the possible values of $k$.`,
    diagramSvg: null,
    inputCount: 2,
    inputLabels: ["k =", "or k ="],
    expectedAnswer: [ans1, ans2],
    displayAnswer: `k = ${r1} \\quad \\text{or} \\quad k = ${r2}`,
    extraKeys,
    steps: [
      `Apply the gradient formula $$m = \\frac{y_2 - y_1}{x_2 - x_1}$$: $$${step1}$$`,
      `Rearrange into a quadratic equation: $$${step2}$$`,
      `Factorise the quadratic expression: $$${step3}$$`,
      `Solve for $k$: $$k = ${r1} \\quad \\text{or} \\quad k = ${r2}$$`
    ]
  };
}

export const gradientOfStraightLine = { generate: generateQuestion };
export default generateQuestion;
```[cite: 15]
