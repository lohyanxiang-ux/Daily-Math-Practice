/**
 * Question Generator: Ratio & Volume of Similar Figures
 * Curriculum Skill: Sec 3 G3 - Mensuration / Geometry
 */

function randInt(min, max, excludeZero = false, notEqualTo = null) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while ((excludeZero && val === 0) || (notEqualTo !== null && val === notEqualTo));
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

export function generateQuestion(tier = 1) {
  const extraKeys = [];

  // =========================================================
  // TIER 1: BASIC (Area Ratio, Volume Ratio & Perimeter-to-Area Ratio)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Unknown area A2 from corresponding side lengths and area A1
      const b = randInt(1, 4);
      const a = randInt(2, 6, false, b);
      const m = randInt(2, 5);
      const k = randInt(2, 8);

      const l1 = b * m;
      const l2 = a * m;
      const A1 = b * b * k;
      const a_sq = a * a;
      const b_sq = b * b;

      const g = gcd(l2, l1);
      const red_l2 = l2 / g;
      const red_l1 = l1 / g;

      const ans_num = a_sq * k;
      const ans = ans_num.toString();

      const svg = `<div style="text-align:center; margin-bottom:12px;"><svg width="260" height="110" viewBox="0 0 260 110" xmlns="http://www.w3.org/2000/svg"><polygon points="10,90 80,90 10,30" fill="#f0fdf4" stroke="#166534" stroke-width="2"/><text x="45" y="105" font-size="12" text-anchor="middle">${l1} cm</text><text x="40" y="65" font-size="12" text-anchor="middle">A₁ = ${A1} cm²</text><polygon points="110,90 230,90 110,10" fill="#f0fdf4" stroke="#166534" stroke-width="2"/><text x="170" y="105" font-size="12" text-anchor="middle">${l2} cm</text><text x="150" y="55" font-size="12" text-anchor="middle">A₂</text></svg></div>`;

      return {
        strand: "Geometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Ratio & Volume of Similar Figures",
        prompt: `${svg}\n\nTwo similar figures have corresponding side lengths of $${l1}\\text{ cm}$ and $${l2}\\text{ cm}$. If the area of the first figure is $${A1}\\text{ cm}^2$, find the unknown area $A_2$.`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["A₂ ="],
        expectedAnswer: ans,
        displayAnswer: `A_2 = ${ans}\\text{ cm}^2`,
        extraKeys,
        steps: [
          `State the area ratio formula for similar figures: $$\\frac{A_2}{A_1} = \\left(\\frac{l_2}{l_1}\\right)^2$$`,
          `Substitute the given values into the formula: $$\\frac{A_2}{${A1}} = \\left(\\frac{${l2}}{${l1}}\\right)^2 = \\left(\\frac{${red_l2}}{${red_l1}}\\right)^2 = \\frac{${a_sq}}{${b_sq}}$$`,
          `Solve for $A_2$: $$A_2 = ${A1} \\times \\frac{${a_sq}}{${b_sq}} = ${ans}\\text{ cm}^2$$`
        ]
      };
    }

    if (subType === 2) {
      // Unknown volume V2 from corresponding heights and volume V1
      const b = randInt(1, 3);
      const a = randInt(2, 4, false, b);
      const m = randInt(2, 4);
      const k = randInt(2, 5);

      const h1 = b * m;
      const h2 = a * m;
      const V1 = b * b * b * k;
      const a3 = a * a * a;
      const b3 = b * b * b;

      const g = gcd(h2, h1);
      const red_h2 = h2 / g;
      const red_h1 = h1 / g;

      const ans_num = a3 * k;
      const ans = ans_num.toString();

      const svg = `<div style="text-align:center; margin-bottom:12px;"><svg width="260" height="120" viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="25" rx="25" ry="10" fill="#f0fdf4" stroke="#166534" stroke-width="2"/><path d="M15,25 L15,85 A25,10 0 0,0 65,85 L65,25" fill="#f0fdf4" stroke="#166534" stroke-width="2"/><ellipse cx="40" cy="85" rx="25" ry="10" fill="none" stroke="#166534" stroke-width="1" stroke-dasharray="3,3"/><text x="40" y="60" font-size="11" text-anchor="middle">V₁ = ${V1} cm³</text><text x="75" y="55" font-size="11">${h1} cm</text><ellipse cx="170" cy="18" rx="35" ry="12" fill="#f0fdf4" stroke="#166534" stroke-width="2"/><path d="M135,18 L135,102 A35,12 0 0,0 205,102 L205,18" fill="#f0fdf4" stroke="#166534" stroke-width="2"/><ellipse cx="170" cy="102" rx="35" ry="12" fill="none" stroke="#166534" stroke-width="1" stroke-dasharray="3,3"/><text x="170" y="65" font-size="11" text-anchor="middle">V₂</text><text x="215" y="60" font-size="11">${h2} cm</text></svg></div>`;

      return {
        strand: "Geometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Ratio & Volume of Similar Figures",
        prompt: `${svg}\n\nTwo similar solids have heights of $${h1}\\text{ cm}$ and $${h2}\\text{ cm}$ respectively. If the volume of the first solid is $${V1}\\text{ cm}^3$, find the volume of the second solid $V_2$.`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["V₂ ="],
        expectedAnswer: ans,
        displayAnswer: `V_2 = ${ans}\\text{ cm}^3`,
        extraKeys,
        steps: [
          `State the volume ratio formula for similar solids: $$\\frac{V_2}{V_1} = \\left(\\frac{h_2}{h_1}\\right)^3$$`,
          `Substitute the given values into the formula: $$\\frac{V_2}{${V1}} = \\left(\\frac{${h2}}{${h1}}\\right)^3 = \\left(\\frac{${red_h2}}{${red_h1}}\\right)^3 = \\frac{${a3}}{${b3}}$$`,
          `Solve for $V_2$: $$V_2 = ${V1} \\times \\frac{${a3}}{${b3}} = ${ans}\\text{ cm}^3$$`
        ]
      };
    }

    // subType === 3: Ratio of areas in simplest form a : b from perimeters
    const p1_raw = randInt(2, 5);
    const p2_raw = randInt(2, 6, false, p1_raw);
    const m = randInt(2, 4);

    const p1 = p1_raw * m;
    const p2 = p2_raw * m;
    const g = gcd(p1, p2);
    const n1 = p1 / g;
    const n2 = p2 / g;
    const n1_sq = n1 * n1;
    const n2_sq = n2 * n2;
    const ans = `${n1_sq}:${n2_sq}`;

    return {
      strand: "Geometry",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Ratio & Volume of Similar Figures",
      prompt: `The perimeters of two similar pentagons are $${p1}\\text{ cm}$ and $${p2}\\text{ cm}$ respectively. Find the ratio of their areas in simplest form $a : b$.`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["Ratio ="],
      expectedAnswer: ans,
      displayAnswer: `${n1_sq} : ${n2_sq}`,
      extraKeys,
      steps: [
        `State the area ratio formula based on perimeter ratio: $$\\frac{A_1}{A_2} = \\left(\\frac{P_1}{P_2}\\right)^2$$`,
        `Substitute values and simplify the fraction: $$\\frac{A_1}{A_2} = \\left(\\frac{${p1}}{${p2}}\\right)^2 = \\left(\\frac{${n1}}{${n2}}\\right)^2 = \\frac{${n1_sq}}{${n2_sq}}$$`,
        `Convert the simplified fraction into a ratio: $$\\text{Ratio of areas } A_1 : A_2 = ${n1_sq} : ${n2_sq}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Linear Length from Area Ratio)
  // =========================================================
  if (tier === 2) {
    const b = randInt(1, 4);
    const a = randInt(2, 5, false, b);
    const m = randInt(2, 5);
    const k = randInt(2, 6);

    const A1 = b * b * k;
    const A2 = a * a * k;
    const l1 = b * m;
    const ans_num = a * m;
    const ans = ans_num.toString();

    const svg = `<div style="text-align:center; margin-bottom:12px;"><svg width="260" height="110" viewBox="0 0 260 110" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="30" width="60" height="60" fill="#eff6ff" stroke="#1e40af" stroke-width="2"/><text x="40" y="65" font-size="11" text-anchor="middle">${A1} cm²</text><text x="40" y="105" font-size="11" text-anchor="middle">${l1} cm</text><rect x="110" y="10" width="90" height="80" fill="#eff6ff" stroke="#1e40af" stroke-width="2"/><text x="155" y="55" font-size="11" text-anchor="middle">${A2} cm²</text><text x="155" y="105" font-size="11" text-anchor="middle">x</text></svg></div>`;

    return {
      strand: "Geometry",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Ratio & Volume of Similar Figures",
      prompt: `${svg}\n\nTwo similar figures have areas of $${A1}\\text{ cm}^2$ and $${A2}\\text{ cm}^2$. If a side length of the first figure is $${l1}\\text{ cm}$, find the corresponding side length $x$ of the second figure.`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["x ="],
      expectedAnswer: ans,
      displayAnswer: `x = ${ans}\\text{ cm}`,
      extraKeys,
      steps: [
        `State the linear length ratio formula derived from area ratio: $$\\frac{x}{l_1} = \\sqrt{\\frac{A_2}{A_1}}$$`,
        `Substitute the given values into the formula: $$\\frac{x}{${l1}} = \\sqrt{\\frac{${A2}}{${A1}}} = \\frac{${a}}{${b}}$$`,
        `Solve for $x$: $$x = ${l1} \\times \\frac{${a}}{${b}} = ${ans}\\text{ cm}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Nested Similar Triangles, Area-to-Volume & Cone Frustum)
  // =========================================================
  const subType = randInt(1, 3);

  if (subType === 1) {
    // Similar triangles ΔABC ~ ΔADE with DE || BC
    const ad = randInt(2, 8);
    const bd = randInt(2, 6);
    const k = randInt(1, 4);

    const ab = ad + bd;
    const g = gcd(ab, ad);
    const num = ab / g;
    const den = ad / g;

    const areaADE = den * den * k;
    const num_sq = num * num;
    const den_sq = den * den;
    const ans_num = num_sq * k;
    const ans = ans_num.toString();

    const svg = `<div style="text-align:center; margin-bottom:12px;"><svg width="200" height="130" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg"><polygon points="100,10 20,110 180,110" fill="none" stroke="#991b1b" stroke-width="2"/><line x1="52" y1="70" x2="148" y2="70" stroke="#991b1b" stroke-width="2"/><text x="100" y="8" font-size="12" text-anchor="middle">A</text><text x="12" y="122" font-size="12">B</text><text x="182" y="122" font-size="12">C</text><text x="40" y="70" font-size="12">D</text><text x="154" y="70" font-size="12">E</text><text x="68" y="42" font-size="11" text-anchor="middle">${ad}</text><text x="28" y="95" font-size="11" text-anchor="middle">${bd}</text></svg></div>`;

    return {
      strand: "Geometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Ratio & Volume of Similar Figures",
      prompt: `${svg}\n\nIn $\\Delta ABC$, $DE \\parallel BC$ such that $D$ lies on $AB$ and $E$ lies on $AC$. Given $AD = ${ad}\\text{ cm}$, $BD = ${bd}\\text{ cm}$, and the area of $\\Delta ADE$ is $${areaADE}\\text{ cm}^2$, find the area of $\\Delta ABC$.`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["Area(ΔABC) ="],
      expectedAnswer: ans,
      displayAnswer: `\\text{Area}(\\Delta ABC) = ${ans}\\text{ cm}^2`,
      extraKeys,
      steps: [
        `Calculate total length $AB$: $$AB = AD + BD = ${ad} + ${bd} = ${ab}\\text{ cm}$$`,
        `State the area ratio formula for similar triangles $\\Delta ABC \\sim \\Delta ADE$: $$\\frac{\\text{Area}(\\Delta ABC)}{\\text{Area}(\\Delta ADE)} = \\left(\\frac{AB}{AD}\\right)^2$$`,
        `Substitute the given side lengths into the formula: $$\\frac{\\text{Area}(\\Delta ABC)}{${areaADE}} = \\left(\\frac{${ab}}{${ad}}\\right)^2 = \\left(\\frac{${num}}{${den}}\\right)^2 = \\frac{${num_sq}}{${den_sq}}$$`,
        `Solve for $\\text{Area}(\\Delta ABC)$: $$\\text{Area}(\\Delta ABC) = ${areaADE} \\times \\frac{${num_sq}}{${den_sq}} = ${ans}\\text{ cm}^2$$`
      ]
    };
  }

  if (subType === 2) {
    // Volume of larger cube from ratio of face areas and volume of smaller cube
    const b = randInt(1, 3);
    const a = randInt(3, 5, false, b);
    const k = randInt(1, 4);

    const areaB = b * b;
    const areaA = a * a;
    const volB = b * b * b * k;
    const a3 = a * a * a;
    const b3 = b * b * b;

    const ans_num = a3 * k;
    const ans = ans_num.toString();

    return {
      strand: "Geometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Ratio & Volume of Similar Figures",
      prompt: `The ratio of the areas of corresponding faces of two similar cubes is $${areaB} : ${areaA}$. If the volume of the smaller cube is $${volB}\\text{ cm}^3$, find the volume of the larger cube.`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["V ="],
      expectedAnswer: ans,
      displayAnswer: `V = ${ans}\\text{ cm}^3`,
      extraKeys,
      steps: [
        `Find the linear side ratio from the area ratio: $$\\frac{l_2}{l_1} = \\sqrt{\\frac{A_2}{A_1}} = \\sqrt{\\frac{${areaA}}{${areaB}}} = \\frac{${a}}{${b}}$$`,
        `State the volume ratio formula: $$\\frac{V_2}{V_1} = \\left(\\frac{l_2}{l_1}\\right)^3$$`,
        `Substitute the linear scale factor into the volume ratio formula: $$\\frac{V_2}{${volB}} = \\left(\\frac{${a}}{${b}}\\right)^3 = \\frac{${a3}}{${b3}}$$`,
        `Solve for the volume of the larger cube $V_2$: $$V_2 = ${volB} \\times \\frac{${a3}}{${b3}} = ${ans}\\text{ cm}^3$$`
      ]
    };
  }

  // subType === 3: Volume of frustum of a cone
  const h1 = randInt(2, 4);
  const h2 = randInt(2, 4);
  const k = randInt(1, 3);

  const H = h1 + h2;
  const g = gcd(H, h1);
  const big_num = H / g;
  const small_den = h1 / g;

  const big_cubed = big_num * big_num * big_num;
  const small_cubed = small_den * small_den * small_den;

  const vTotal = big_cubed * k;
  const vTop = small_cubed * k;
  const ans_num = vTotal - vTop;
  const ans = ans_num.toString();

  const svg = `<div style="text-align:center; margin-bottom:12px;"><svg width="180" height="130" viewBox="0 0 180 130" xmlns="http://www.w3.org/2000/svg"><polygon points="90,10 20,110 160,110" fill="#fef2f2" stroke="#991b1b" stroke-width="2"/><line x1="55" y1="60" x2="125" y2="60" stroke="#991b1b" stroke-width="2" stroke-dasharray="3,3"/><text x="90" y="40" font-size="11" text-anchor="middle">Top Cone</text><text x="90" y="90" font-size="11" text-anchor="middle">Frustum</text><text x="135" y="38" font-size="10">${h1} cm</text><text x="148" y="88" font-size="10">${h2} cm</text></svg></div>`;

  return {
    strand: "Geometry",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Ratio & Volume of Similar Figures",
    prompt: `${svg}\n\nA solid cone of total height $${H}\\text{ cm}$ has a total volume of $${vTotal}\\text{ cm}^3$. A smaller cone of height $${h1}\\text{ cm}$ is sliced off parallel to the base. Find the volume of the remaining frustum.`,
    diagramSvg: svg,
    inputCount: 1,
    inputLabels: ["V_frustum ="],
    expectedAnswer: ans,
    displayAnswer: `V_{\\text{frustum}} = ${ans}\\text{ cm}^3`,
    extraKeys,
    steps: [
      `State the height ratio of the top small cone to the full cone: $$\\frac{h_{\\text{top}}}{H} = \\frac{${h1}}{${H}} = \\frac{${small_den}}{${big_num}}$$`,
      `Calculate the volume of the sliced top cone $V_{\\text{top}}$: $$\\frac{V_{\\text{top}}}{V_{\\text{total}}} = \\left(\\frac{h_{\\text{top}}}{H}\\right)^3 = \\left(\\frac{${small_den}}{${big_num}}\\right)^3 = \\frac{${small_cubed}}{${big_cubed}}$$`,
      `Find $V_{\\text{top}}$: $$V_{\\text{top}} = ${vTotal} \\times \\frac{${small_cubed}}{${big_cubed}} = ${vTop}\\text{ cm}^3$$`,
      `Subtract $V_{\\text{top}}$ from total volume to get the volume of the frustum: $$V_{\\text{frustum}} = V_{\\text{total}} - V_{\\text{top}} = ${vTotal} - ${vTop} = ${ans}\\text{ cm}^3$$`
    ]
  };
}

export const ratioAndVolumeOfSimilarFigures = { generate: generateQuestion };
export default generateQuestion;
