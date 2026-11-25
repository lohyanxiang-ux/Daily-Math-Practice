/**
 * Question Generator: Area of Segment (Degrees)
 * Curriculum Skill: Sec 3 G3 - Mensuration / Trigonometry
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toSigFigs(val, sigFigs = 3) {
  return Number(Number(val).toPrecision(sigFigs)).toString();
}

function toSigFigsNum(val, sigFigs = 4) {
  return Number(Number(val).toPrecision(sigFigs));
}

export function generateQuestion(tier = 1) {
  const extraKeys = [];

  // =========================================================
  // TIER 1: BASIC (Minor Segment with Direct or Reflex Angle)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Minor segment given central angle θ (45° to 135°) and radius r
      const r = randInt(6, 15);
      const theta = randInt(45, 135);
      const rot = randInt(0, 280);

      const rad1 = toRad(rot);
      const rad2 = toRad(rot + theta);
      const radMid = toRad(rot + theta / 2);

      const ax = Math.round(130 + 70 * Math.cos(rad1));
      const ay = Math.round(120 - 70 * Math.sin(rad1));
      const bx = Math.round(130 + 70 * Math.cos(rad2));
      const by = Math.round(120 - 70 * Math.sin(rad2));

      const arc1x = Math.round(130 + 22 * Math.cos(rad1));
      const arc1y = Math.round(120 - 22 * Math.sin(rad1));
      const arc2x = Math.round(130 + 22 * Math.cos(rad2));
      const arc2y = Math.round(120 - 22 * Math.sin(rad2));

      const lblx = Math.round(130 + 38 * Math.cos(radMid));
      const lbly = Math.round(120 - 38 * Math.sin(radMid) + 4);

      const rlbx = Math.round(130 + 35 * Math.cos(rad1) + 12 * Math.sin(rad1));
      const rlby = Math.round(120 - 35 * Math.sin(rad1) + 12 * Math.cos(rad1));

      const v1x = Math.round(130 + 84 * Math.cos(rad1));
      const v1y = Math.round(120 - 84 * Math.sin(rad1) + 4);
      const v2x = Math.round(130 + 84 * Math.cos(rad2));
      const v2y = Math.round(120 - 84 * Math.sin(rad2) + 4);

      const largeFlag = theta > 180 ? 1 : 0;
      const thetaRad = toRad(theta);

      const secAreaVal = (theta / 360) * Math.PI * r * r;
      const triAreaVal = 0.5 * r * r * Math.sin(thetaRad);
      const segAreaVal = secAreaVal - triAreaVal;

      const ans = toSigFigs(segAreaVal, 3);
      const secAreaRounded = toSigFigsNum(secAreaVal, 4);
      const triAreaRounded = toSigFigsNum(triAreaVal, 4);

      const step1 = `\\begin{aligned} \\text{Sector Area} &= \\frac{${theta}}{360} \\times \\pi \\times ${r}^2 \\\\ &\\approx ${secAreaRounded} \\text{ cm}^2 \\end{aligned}`;
      const step2 = `\\begin{aligned} \\text{Triangle Area} &= \\frac{1}{2} \\times ${r}^2 \\times \\sin(${theta}^\\circ) \\\\ &\\approx ${triAreaRounded} \\text{ cm}^2 \\end{aligned}`;
      const step3 = `\\begin{aligned} \\text{Segment Area} &= \\text{Sector Area} - \\text{Triangle Area} \\\\ &= ${secAreaRounded} - ${triAreaRounded} \\\\ &\\approx ${ans} \\text{ cm}^2 \\end{aligned}`;

      const diagram = `<svg width='260' height='220' viewBox='0 0 260 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;'><path d='M ${ax} ${ay} A 70 70 0 ${largeFlag} 0 ${bx} ${by} Z' fill='#cbd5e1' stroke='#16a34a' stroke-width='2.5'/><line x1='130' y1='120' x2='${ax}' y2='${ay}' stroke='#334155' stroke-width='2'/><line x1='130' y1='120' x2='${bx}' y2='${by}' stroke='#334155' stroke-width='2'/><path d='M ${arc1x} ${arc1y} A 22 22 0 ${largeFlag} 0 ${arc2x} ${arc2y}' fill='none' stroke='#dc2626' stroke-width='1.5'/><circle cx='130' cy='120' r='3' fill='#1e293b'/><text x='112' y='128' font-family='sans-serif' font-size='14' font-style='italic'>O</text><text x='${v1x}' y='${v1y}' font-family='sans-serif' font-size='14'>A</text><text x='${v2x}' y='${v2y}' font-family='sans-serif' font-size='14'>B</text><text x='${rlbx}' y='${rlby}' font-family='sans-serif' font-size='13' fill='#1e293b'>${r}</text><text x='${lblx}' y='${lbly}' font-family='sans-serif' font-size='13' fill='#dc2626' text-anchor='middle'>${theta}°</text></svg>`;

      return {
        strand: "Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Area of Segment (Degrees)",
        prompt: `Find the area of the shaded minor segment bounded by chord $AB$ shown below.\n\n(Give your answer correct to 3 significant figures.)\n\n${diagram}`,
        diagramSvg: diagram,
        inputCount: 1,
        inputLabels: ["Area ="],
        expectedAnswer: ans,
        displayAnswer: `\\text{Area} \\approx ${ans}\\text{ cm}^2`,
        extraKeys,
        steps: [
          `Calculate the area of sector $OAB$: $$${step1}$$`,
          `Calculate the area of $\\triangle OAB$: $$${step2}$$`,
          `Subtract triangle area from sector area: $$${step3}$$`
        ]
      };
    }

    // subType === 2: Minor segment given reflex angle φ (210° to 270°) and radius r
    const r = randInt(6, 16);
    const phi = randInt(210, 270);
    const rot = randInt(0, 280);
    const theta = 360 - phi;

    const rad1 = toRad(rot);
    const rad2 = toRad(rot + theta);
    const radOppMid = toRad(rot + theta + phi / 2);

    const ax = Math.round(130 + 70 * Math.cos(rad1));
    const ay = Math.round(120 - 70 * Math.sin(rad1));
    const bx = Math.round(130 + 70 * Math.cos(rad2));
    const by = Math.round(120 - 70 * Math.sin(rad2));

    const arc1x = Math.round(130 + 22 * Math.cos(rad1));
    const arc1y = Math.round(120 - 22 * Math.sin(rad1));
    const arc2x = Math.round(130 + 22 * Math.cos(rad2));
    const arc2y = Math.round(120 - 22 * Math.sin(rad2));

    const lblx = Math.round(130 + 38 * Math.cos(radOppMid));
    const lbly = Math.round(120 - 38 * Math.sin(radOppMid) + 4);

    const rlbx = Math.round(130 + 35 * Math.cos(rad1) + 12 * Math.sin(rad1));
    const rlby = Math.round(120 - 35 * Math.sin(rad1) + 12 * Math.cos(rad1));

    const v1x = Math.round(130 + 84 * Math.cos(rad1));
    const v1y = Math.round(120 - 84 * Math.sin(rad1) + 4);
    const v2x = Math.round(130 + 84 * Math.cos(rad2));
    const v2y = Math.round(120 - 84 * Math.sin(rad2) + 4);

    const thetaRad = toRad(theta);
    const secAreaVal = (theta / 360) * Math.PI * r * r;
    const triAreaVal = 0.5 * r * r * Math.sin(thetaRad);
    const segAreaVal = secAreaVal - triAreaVal;

    const ans = toSigFigs(segAreaVal, 3);
    const secAreaRounded = toSigFigsNum(secAreaVal, 4);
    const triAreaRounded = toSigFigsNum(triAreaVal, 4);

    const step1 = `\\text{Central angle } \\theta = 360^\\circ - ${phi}^\\circ = ${theta}^\\circ`;
    const step2 = `\\begin{aligned} \\text{Sector Area} &= \\frac{${theta}}{360} \\times \\pi \\times ${r}^2 \\\\ &\\approx ${secAreaRounded} \\text{ cm}^2 \\end{aligned}`;
    const step3 = `\\begin{aligned} \\text{Triangle Area} &= \\frac{1}{2} \\times ${r}^2 \\times \\sin(${theta}^\\circ) \\\\ &\\approx ${triAreaRounded} \\text{ cm}^2 \\end{aligned}`;
    const step4 = `\\begin{aligned} \\text{Segment Area} &= \\text{Sector Area} - \\text{Triangle Area} \\\\ &= ${secAreaRounded} - ${triAreaRounded} \\\\ &\\approx ${ans} \\text{ cm}^2 \\end{aligned}`;

    const diagram = `<svg width='260' height='220' viewBox='0 0 260 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;'><path d='M ${ax} ${ay} A 70 70 0 0 0 ${bx} ${by} Z' fill='#cbd5e1' stroke='#16a34a' stroke-width='2.5'/><line x1='130' y1='120' x2='${ax}' y2='${ay}' stroke='#334155' stroke-width='2'/><line x1='130' y1='120' x2='${bx}' y2='${by}' stroke='#334155' stroke-width='2'/><path d='M ${arc2x} ${arc2y} A 22 22 0 1 0 ${arc1x} ${arc1y}' fill='none' stroke='#dc2626' stroke-width='1.5'/><circle cx='130' cy='120' r='3' fill='#1e293b'/><text x='112' y='128' font-family='sans-serif' font-size='14' font-style='italic'>O</text><text x='${v1x}' y='${v1y}' font-family='sans-serif' font-size='14'>A</text><text x='${v2x}' y='${v2y}' font-family='sans-serif' font-size='14'>B</text><text x='${rlbx}' y='${rlby}' font-family='sans-serif' font-size='13' fill='#1e293b'>${r}</text><text x='${lblx}' y='${lbly}' font-family='sans-serif' font-size='13' fill='#dc2626' text-anchor='middle'>${phi}°</text></svg>`;

    return {
      strand: "Trigonometry",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Area of Segment (Degrees)",
      prompt: `Find the area of the minor segment bounded by chord $AB$ in the figure below.\n\n(Give your answer correct to 3 significant figures.)\n\n${diagram}`,
      diagramSvg: diagram,
      inputCount: 1,
      inputLabels: ["Area ="],
      expectedAnswer: ans,
      displayAnswer: `\\text{Area} \\approx ${ans}\\text{ cm}^2`,
      extraKeys,
      steps: [
        `Find the central angle $\\theta$ subtending the minor arc $AB$: $$${step1}$$`,
        `Calculate the area of sector $OAB$: $$${step2}$$`,
        `Calculate the area of $\\triangle OAB$: $$${step3}$$`,
        `Subtract triangle area from sector area: $$${step4}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Major Segment & 90° Quadrant Segment)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Major segment bounded by chord AB given central angle θ (60° to 120°) and radius r
    const r = randInt(6, 15);
    const theta = randInt(60, 120);

    const ang1Deg = 270 - theta / 2;
    const ang2Deg = 270 + theta / 2;
    const rad1 = toRad(ang1Deg);
    const rad2 = toRad(ang2Deg);
    const radMid = toRad(270);

    const ax = Math.round(130 + 65 * Math.cos(rad1));
    const ay = Math.round(100 - 65 * Math.sin(rad1));
    const bx = Math.round(130 + 65 * Math.cos(rad2));
    const by = Math.round(100 - 65 * Math.sin(rad2));

    const arc1x = Math.round(130 + 22 * Math.cos(rad1));
    const arc1y = Math.round(100 - 22 * Math.sin(rad1));
    const arc2x = Math.round(130 + 22 * Math.cos(rad2));
    const arc2y = Math.round(100 - 22 * Math.sin(rad2));

    const lblx = 130;
    const lbly = Math.round(100 - 36 * Math.sin(radMid) + 4);

    const rlbx = Math.round(130 + 35 * Math.cos(rad1) + 12 * Math.sin(rad1));
    const rlby = Math.round(100 - 35 * Math.sin(rad1) + 12 * Math.cos(rad1));

    const v1x = Math.round(130 + 82 * Math.cos(rad1));
    const v1y = Math.round(100 - 82 * Math.sin(rad1) + 4);
    const v2x = Math.round(130 + 82 * Math.cos(rad2));
    const v2y = Math.round(100 - 82 * Math.sin(rad2) + 4);

    const thetaRad = toRad(theta);
    const circleAreaVal = Math.PI * r * r;
    const secAreaVal = (theta / 360) * Math.PI * r * r;
    const triAreaVal = 0.5 * r * r * Math.sin(thetaRad);
    const minorSegVal = secAreaVal - triAreaVal;
    const majorSegVal = circleAreaVal - minorSegVal;

    const ans = toSigFigs(majorSegVal, 3);
    const circleAreaRounded = toSigFigsNum(circleAreaVal, 4);
    const minorSegRounded = toSigFigsNum(minorSegVal, 4);

    const step1 = `\\begin{aligned} \\text{Circle Area} &= \\pi \\times ${r}^2 \\\\ &\\approx ${circleAreaRounded} \\text{ cm}^2 \\end{aligned}`;
    const step2 = `\\begin{aligned} \\text{Minor Segment Area} &= \\text{Sector Area} - \\text{Triangle Area} \\\\ &= \\frac{${theta}}{360} \\pi (${r})^2 - \\frac{1}{2} (${r})^2 \\sin(${theta}^\\circ) \\\\ &\\approx ${minorSegRounded} \\text{ cm}^2 \\end{aligned}`;
    const step3 = `\\begin{aligned} \\text{Major Segment Area} &= \\text{Circle Area} - \\text{Minor Segment Area} \\\\ &= ${circleAreaRounded} - ${minorSegRounded} \\\\ &\\approx ${ans} \\text{ cm}^2 \\end{aligned}`;

    const diagram = `<svg width='260' height='210' viewBox='0 0 260 210' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;'><path d='M ${ax} ${ay} A 65 65 0 1 1 ${bx} ${by} Z' fill='#cbd5e1' stroke='#16a34a' stroke-width='2.5'/><path d='M ${ax} ${ay} A 65 65 0 0 0 ${bx} ${by}' fill='none' stroke='#94a3b8' stroke-width='1.5' stroke-dasharray='4 4'/><line x1='${ax}' y1='${ay}' x2='${bx}' y2='${by}' stroke='#1e293b' stroke-width='2'/><line x1='130' y1='100' x2='${ax}' y2='${ay}' stroke='#334155' stroke-width='2'/><line x1='130' y1='100' x2='${bx}' y2='${by}' stroke='#334155' stroke-width='2'/><path d='M ${arc1x} ${arc1y} A 22 22 0 0 0 ${arc2x} ${arc2y}' fill='none' stroke='#dc2626' stroke-width='1.5'/><circle cx='130' cy='100' r='3' fill='#1e293b'/><text x='115' y='95' font-family='sans-serif' font-size='14' font-style='italic'>O</text><text x='${v1x}' y='${v1y}' font-family='sans-serif' font-size='14'>A</text><text x='${v2x}' y='${v2y}' font-family='sans-serif' font-size='14'>B</text><text x='${rlbx}' y='${rlby}' font-family='sans-serif' font-size='13' fill='#1e293b'>${r}</text><text x='${lblx}' y='${lbly}' font-family='sans-serif' font-size='13' fill='#dc2626' text-anchor='middle'>${theta}°</text></svg>`;

    return {
      strand: "Trigonometry",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Area of Segment (Degrees)",
      prompt: `Find the area of the major segment (shaded region) bounded by chord $AB$ shown below.\n\n(Give your answer correct to 3 significant figures.)\n\n${diagram}`,
      diagramSvg: diagram,
      inputCount: 1,
      inputLabels: ["Area ="],
      expectedAnswer: ans,
      displayAnswer: `\\text{Area} \\approx ${ans}\\text{ cm}^2`,
      extraKeys,
      steps: [
        `Calculate the total area of the circle: $$${step1}$$`,
        `Calculate the area of the minor segment: $$${step2}$$`,
        `Subtract minor segment area from circle area: $$${step3}$$`
      ]
    };
  }

  // subType === 2: Minor segment with right-angled sector (∠AOB = 90°)
  const r = randInt(5, 18);
  const rot = randInt(0, 280);

  const rad1 = toRad(rot);
  const rad2 = toRad(rot + 90);

  const ax = Math.round(130 + 70 * Math.cos(rad1));
  const ay = Math.round(120 - 70 * Math.sin(rad1));
  const bx = Math.round(130 + 70 * Math.cos(rad2));
  const by = Math.round(120 - 70 * Math.sin(rad2));

  const sq1x = Math.round(130 + 12 * Math.cos(rad1));
  const sq1y = Math.round(120 - 12 * Math.sin(rad1));
  const sq2x = Math.round(130 + 12 * Math.cos(rad1) + 12 * Math.cos(rad2));
  const sq2y = Math.round(120 - 12 * Math.sin(rad1) - 12 * Math.sin(rad2));
  const sq3x = Math.round(130 + 12 * Math.cos(rad2));
  const sq3y = Math.round(120 - 12 * Math.sin(rad2));

  const rlbx = Math.round(130 + 35 * Math.cos(rad1) + 12 * Math.sin(rad1));
  const rlby = Math.round(120 - 35 * Math.sin(rad1) + 12 * Math.cos(rad1));

  const v1x = Math.round(130 + 84 * Math.cos(rad1));
  const v1y = Math.round(120 - 84 * Math.sin(rad1) + 4);
  const v2x = Math.round(130 + 84 * Math.cos(rad2));
  const v2y = Math.round(120 - 84 * Math.sin(rad2) + 4);

  const secAreaVal = 0.25 * Math.PI * r * r;
  const triAreaVal = 0.5 * r * r;
  const segAreaVal = secAreaVal - triAreaVal;

  const ans = toSigFigs(segAreaVal, 3);
  const secAreaRounded = toSigFigsNum(secAreaVal, 4);

  const step1 = `\\begin{aligned} \\text{Sector Area} &= \\frac{1}{4} \\pi (${r})^2 \\\\ &\\approx ${secAreaRounded} \\text{ cm}^2 \\end{aligned}`;
  const step2 = `\\begin{aligned} \\text{Triangle Area} &= \\frac{1}{2} \\times ${r} \\times ${r} \\\\ &= ${triAreaVal} \\text{ cm}^2 \\end{aligned}`;
  const step3 = `\\begin{aligned} \\text{Segment Area} &= \\text{Sector Area} - \\text{Triangle Area} \\\\ &= ${secAreaRounded} - ${triAreaVal} \\\\ &\\approx ${ans} \\text{ cm}^2 \\end{aligned}`;

  const diagram = `<svg width='260' height='220' viewBox='0 0 260 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;'><path d='M ${ax} ${ay} A 70 70 0 0 0 ${bx} ${by} Z' fill='#cbd5e1' stroke='#16a34a' stroke-width='2.5'/><line x1='130' y1='120' x2='${ax}' y2='${ay}' stroke='#334155' stroke-width='2'/><line x1='130' y1='120' x2='${bx}' y2='${by}' stroke='#334155' stroke-width='2'/><polyline points='${sq1x},${sq1y} ${sq2x},${sq2y} ${sq3x},${sq3y}' fill='none' stroke='#334155' stroke-width='1.5'/><circle cx='130' cy='120' r='3' fill='#1e293b'/><text x='112' y='128' font-family='sans-serif' font-size='14' font-style='italic'>O</text><text x='${v1x}' y='${v1y}' font-family='sans-serif' font-size='14'>A</text><text x='${v2x}' y='${v2y}' font-family='sans-serif' font-size='14'>B</text><text x='${rlbx}' y='${rlby}' font-family='sans-serif' font-size='13' fill='#1e293b'>${r}</text></svg>`;

  return {
    strand: "Trigonometry",
    tier: 2,
    tierName: "Intermediate",
    skillTitle: "Area of Segment (Degrees)",
    prompt: `A circle sector $OAB$ has radius $r = ${r}\\text{ cm}$ and $\\angle AOB = 90^\\circ$.\n\nFind the area of the minor segment bounded by chord $AB$.\n\n(Give your answer correct to 3 significant figures.)\n\n${diagram}`,
    diagramSvg: diagram,
    inputCount: 1,
    inputLabels: ["Area ="],
    expectedAnswer: ans,
    displayAnswer: `\\text{Area} \\approx ${ans}\\text{ cm}^2`,
    extraKeys,
    steps: [
      `Calculate the area of the quadrant sector: $$${step1}$$`,
      `Calculate the area of the right triangle $\\triangle OAB$: $$${step2}$$`,
      `Subtract triangle area from sector area: $$${step3}$$`
    ]
  };
}

export const areaOfSegmentDegrees = { generate: generateQuestion };
export default generateQuestion;
```[cite: 14]
