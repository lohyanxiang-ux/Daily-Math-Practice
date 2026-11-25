/**
 * Question Generator: Length of Line Segment
 * Curriculum Skill: Sec 3 G3 - Coordinate Geometry
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function formatCoordVal(val) {
  return val < 0 ? `(${val})` : val.toString();
}

function formatSignedConst(val) {
  if (val === 0) return "";
  return val > 0 ? ` + ${val}` : ` - ${Math.abs(val)}`;
}

function formatCoeffX(coeff) {
  if (coeff === 0) return "";
  if (coeff === 1) return "x";
  if (coeff === -1) return "-x";
  return `${coeff}x`;
}

function formatCoeffY(coeff) {
  if (coeff === 0) return "";
  if (coeff === 1) return "y";
  if (coeff === -1) return "-y";
  return `${coeff}y`;
}

export function generateQuestion(tier = 1) {
  const extraKeys = ["(", ")", ",", "^"];

  // =========================================================
  // TIER 1: BASIC (Distance Between Two Points)
  // =========================================================
  if (tier === 1) {
    const x1 = randInt(-8, 8);
    const y1 = randInt(-8, 8);
    const dx_raw = randInt(-8, 8);
    const dy_raw = randInt(-8, 8);

    const dx = dx_raw === 0 && dy_raw === 0 ? 3 : dx_raw;
    const dy = dy_raw;
    const x2 = x1 + dx;
    const y2 = y1 + dy;

    const sum_sq = dx * dx + dy * dy;
    const dist = Math.sqrt(sum_sq);
    const isExact = Number.isInteger(dist);
    const ans = isExact ? dist.toString() : dist.toPrecision(3);

    const x1_str = formatCoordVal(x1);
    const y1_str = formatCoordVal(y1);
    const step1 = `AB = \\sqrt{(${x2} - ${x1_str})^2 + (${y2} - ${y1_str})^2}`;
    const step2 = `AB = ${ans}${isExact ? "" : " \\text{ (to 3 s.f.)}"}`;

    return {
      strand: "Coordinate Geometry",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Length of Line Segment",
      prompt: `Find the length of the line segment joining the points $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["AB ="],
      expectedAnswer: ans,
      displayAnswer: step2,
      extraKeys,
      steps: [
        `Use the distance formula: $$AB = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$`,
        `Substitute the coordinates into the formula: $$${step1}$$`,
        `Evaluate using a calculator: $$${step2}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Missing Coordinate & Equidistant Point on Axes)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Given P(x1, y1), Q(x2, k), and distance d, find possible values of k
      const x1 = randInt(-5, 5);
      const y1 = randInt(-5, 5);
      const s_dx = randInt(0, 1);
      const m = randInt(1, 4);

      const dx = m === 1 ? 3 : m === 2 ? 4 : m === 3 ? 6 : 5;
      const r = m === 1 ? 4 : m === 2 ? 3 : m === 3 ? 8 : 12;
      const d = m === 1 ? 5 : m === 2 ? 5 : m === 3 ? 10 : 13;

      const sign_dx = s_dx === 0 ? -1 : 1;
      const x2 = x1 + sign_dx * dx;
      const dx_sq = dx * dx;
      const d_sq = d * d;
      const r_sq = r * r;

      const k1 = y1 + r;
      const k2 = y1 - r;
      const ans1 = k1.toString();
      const ans2 = k2.toString();

      const k_term =
        y1 === 0 ? "k" : y1 > 0 ? `(k - ${y1})` : `(k + ${Math.abs(y1)})`;
      const x1_str = formatCoordVal(x1);
      const y1_str = formatCoordVal(y1);

      const step1 = `PQ = \\sqrt{(${x2} - ${x1_str})^2 + (k - ${y1_str})^2} = ${d}`;
      const step2 = `(${sign_dx * dx})^2 + ${k_term}^2 = ${d_sq}`;
      const step3 = `${dx_sq} + ${k_term}^2 = ${d_sq} \\implies ${k_term}^2 = ${r_sq}`;
      const step4 = `${k_term} = \\pm ${r}`;
      const step5 = `k = ${k1} \\text{ or } k = ${k2}`;

      return {
        strand: "Coordinate Geometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Length of Line Segment",
        prompt: `The distance between the points $P(${x1}, ${y1})$ and $Q(${x2}, k)$ is $${d}$ units. Find the possible values of $k$.`,
        diagramSvg: null,
        inputCount: 2,
        inputLabels: ["k =", "or k ="],
        expectedAnswer: [ans1, ans2],
        displayAnswer: step5,
        extraKeys,
        steps: [
          `Apply the distance formula for $PQ$: $$${step1}$$`,
          `Square both sides to eliminate the radical: $$${step2}$$`,
          `Isolate the squared term: $$${step3}$$`,
          `Take the square root of both sides: $$${step4}$$`,
          `Solve for $k$: $$${step5}$$`
        ]
      };
    }

    if (subType === 2) {
      // Point C on x-axis equidistant from A(x1, y1) and B(x2, y2)
      const x_ans = randInt(-3, 3);
      const type_sel = randInt(1, 4);

      const dx1 =
        type_sel === 1 ? 3 : type_sel === 2 ? 2 : type_sel === 3 ? 1 : 4;
      const y1 =
        type_sel === 1 ? 4 : type_sel === 2 ? 4 : type_sel === 3 ? 7 : 2;
      const k_val =
        type_sel === 1 ? 4 : type_sel === 2 ? 4 : type_sel === 3 ? 5 : 2;
      const y2 =
        type_sel === 1 ? 3 : type_sel === 2 ? 2 : type_sel === 3 ? 5 : 4;

      const x1 = x_ans - dx1;
      const x2 = x_ans + k_val;

      const c1 = x1 * x1 + y1 * y1;
      const c2 = x2 * x2 + y2 * y2;
      const coeffL = -2 * x1;
      const coeffR = -2 * x2;
      const ans = `(${x_ans}, 0)`;

      const x1_str = formatCoordVal(x1);
      const x2_str = formatCoordVal(x2);
      const coeffL_str = formatCoeffX(coeffL);
      const coeffR_str = formatCoeffX(coeffR);

      const step1 = `(x - ${x1_str})^2 + (${y1})^2 = (x - ${x2_str})^2 + (${y2})^2`;
      const step2 = `x^2${formatSignedConst(coeffL * 0) && ""}${coeffL >= 0 ? ` + ${coeffL}x` : ` - ${Math.abs(coeffL)}x`} + ${c1} = x^2${coeffR >= 0 ? ` + ${coeffR}x` : ` - ${Math.abs(coeffR)}x`} + ${c2}`;
      const step3 = `${coeffL_str} + ${c1} = ${coeffR_str} + ${c2} \\implies x = ${x_ans}`;

      return {
        strand: "Coordinate Geometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Length of Line Segment",
        prompt: `Find the coordinates of a point $C$ on the $x$-axis which is equidistant from $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["C ="],
        expectedAnswer: ans,
        displayAnswer: `C = ${ans}`,
        extraKeys,
        steps: [
          `Since point $C$ lies on the $x$-axis, its coordinates are $(x, 0)$.`,
          `Set $AC^2 = BC^2$ using the distance formula: $$${step1}$$`,
          `Expand both sides of the equation: $$${step2}$$`,
          `Simplify and solve for $x$: $$${step3}$$`,
          `Therefore, the coordinates of $C$ are $${ans}$.`
        ]
      };
    }

    // subType === 3: Point C on y-axis equidistant from A(x1, y1) and B(x2, y2)
    const y_ans = randInt(-3, 3);
    const type_sel = randInt(1, 4);

    const dy1 =
      type_sel === 1 ? 3 : type_sel === 2 ? 2 : type_sel === 3 ? 1 : 4;
    const x1 =
      type_sel === 1 ? 4 : type_sel === 2 ? 4 : type_sel === 3 ? 7 : 2;
    const k_val =
      type_sel === 1 ? 4 : type_sel === 2 ? 4 : type_sel === 3 ? 5 : 2;
    const x2 =
      type_sel === 1 ? 3 : type_sel === 2 ? 2 : type_sel === 3 ? 5 : 4;

    const y1 = y_ans - dy1;
    const y2 = y_ans + k_val;

    const c1 = x1 * x1 + y1 * y1;
    const c2 = x2 * x2 + y2 * y2;
    const coeffL = -2 * y1;
    const coeffR = -2 * y2;
    const ans = `(0, ${y_ans})`;

    const y1_str = formatCoordVal(y1);
    const y2_str = formatCoordVal(y2);
    const coeffL_str = formatCoeffY(coeffL);
    const coeffR_str = formatCoeffY(coeffR);

    const step1 = `(${x1})^2 + (y - ${y1_str})^2 = (${x2})^2 + (y - ${y2_str})^2`;
    const step2 = `y^2${coeffL >= 0 ? ` + ${coeffL}y` : ` - ${Math.abs(coeffL)}y`} + ${c1} = y^2${coeffR >= 0 ? ` + ${coeffR}y` : ` - ${Math.abs(coeffR)}y`} + ${c2}`;
    const step3 = `${coeffL_str} + ${c1} = ${coeffR_str} + ${c2} \\implies y = ${y_ans}`;

    return {
      strand: "Coordinate Geometry",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Length of Line Segment",
      prompt: `Two points $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$ are given. Find the coordinates of point $C$ on the $y$-axis which is equidistant from $A$ and $B$.`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["C ="],
      expectedAnswer: ans,
      displayAnswer: `C = ${ans}`,
      extraKeys,
      steps: [
        `Since point $C$ lies on the $y$-axis, its coordinates are $(0, y)$.`,
        `Set $AC^2 = BC^2$ using the distance formula: $$${step1}$$`,
        `Expand both sides of the equation: $$${step2}$$`,
        `Simplify and solve for $y$: $$${step3}$$`,
        `Therefore, the coordinates of $C$ are $${ans}$.`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Distance Ratio PQ = n * QR with Unknown Coordinate)
  // =========================================================
  const p_sel = randInt(1, 4);

  const n = p_sel === 3 ? 3 : 2;
  const x1 = p_sel === 1 ? -2 : p_sel === 2 ? -6 : p_sel === 3 ? -8 : -9;
  const x2 = p_sel === 1 ? 4 : p_sel === 2 ? 2 : p_sel === 3 ? 1 : 3;
  const y2 = p_sel === 1 ? 5 : p_sel === 2 ? 3 : p_sel === 3 ? 2 : 1;
  const x3 = p_sel === 1 ? 0 : p_sel === 2 ? -1 : p_sel === 3 ? -2 : -3;
  const y3 = p_sel === 1 ? 2 : p_sel === 2 ? -1 : p_sel === 3 ? -2 : -7;

  const dxR = x2 - x3;
  const dyR = y2 - y3;
  const QR_sq = dxR * dxR + dyR * dyR;
  const QR_val = Math.round(Math.sqrt(QR_sq));

  const target_dist = n * QR_val;
  const target_sq = target_dist * target_dist;

  const dxP = Math.abs(x2 - x1);
  const dxP_sq = dxP * dxP;
  const rem_sq = target_sq - dxP_sq;
  const M = Math.round(Math.sqrt(rem_sq));

  const k1 = y2 + M;
  const k2 = y2 - M;
  const ans1 = k1.toString();
  const ans2 = k2.toString();

  const x3_str = formatCoordVal(x3);
  const y3_str = formatCoordVal(y3);
  const x1_str = formatCoordVal(x1);
  const y2_str = formatCoordVal(y2);

  const step1 = `QR = \\sqrt{(${x2} - ${x3_str})^2 + (${y2} - ${y3_str})^2} = \\sqrt{${QR_sq}} = ${QR_val}`;
  const step2 = `PQ = ${n} \\times ${QR_val} = ${target_dist}`;
  const step3 = `\\sqrt{(${x2} - ${x1_str})^2 + (k - ${y2_str})^2} = ${target_dist}`;
  const step4 = `(${dxP})^2 + (k - ${y2})^2 = ${target_sq}`;
  const step5 = `(${dxP_sq}) + (k - ${y2})^2 = ${target_sq} \\implies (k - ${y2})^2 = ${rem_sq}`;
  const step6 = `k - ${y2} = \\pm ${M} \\implies k = ${k1} \\text{ or } k = ${k2}`;

  return {
    strand: "Coordinate Geometry",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Length of Line Segment",
    prompt: `The points $P(${x1}, k)$, $Q(${x2}, ${y2})$, and $R(${x3}, ${y3})$ are such that $PQ = ${n}QR$. Find the possible values of $k$.`,
    diagramSvg: null,
    inputCount: 2,
    inputLabels: ["k =", "or k ="],
    expectedAnswer: [ans1, ans2],
    displayAnswer: `k = ${k1} \\text{ or } k = ${k2}`,
    extraKeys,
    steps: [
      `Calculate the length of line segment $QR$: $$${step1}$$`,
      `Use the condition $PQ = ${n}QR$: $$${step2}$$`,
      `Apply the distance formula for $PQ$: $$${step3}$$`,
      `Square both sides and simplify: $$${step4}$$`,
      `Isolate the squared term: $$${step5}$$`,
      `Solve for $k$: $$${step6}$$`
    ]
  };
}

export const lengthOfLineSegment = { generate: generateQuestion };
export default generateQuestion;
