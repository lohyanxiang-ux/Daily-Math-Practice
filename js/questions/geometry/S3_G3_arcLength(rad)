/**
 * Question Generator: Arc Length (Radians)
 * Curriculum Skill: Sec 3 G3 - Geometry & Trigonometry
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Direct Arc Length & Reflex Angle)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Find arc length given r and central angle theta
      const r = randInt(5, 15);
      const thetaTenths = randInt(6, 28);
      const rot = randInt(0, 280);

      const theta = Number((thetaTenths / 10).toFixed(1));
      const rad1 = (rot * Math.PI) / 180;
      const rad2 = rad1 + theta;
      const radMid = rad1 + theta / 2;

      const ax = Math.round(130 + 70 * Math.cos(rad1));
      const ay = Math.round(120 - 70 * Math.sin(rad1));
      const bx = Math.round(130 + 70 * Math.cos(rad2));
      const by = Math.round(120 - 70 * Math.sin(rad2));
      const px = Math.round(130 + 88 * Math.cos(radMid));
      const py = Math.round(120 - 88 * Math.sin(radMid) + 4);
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

      const largeFlag = theta > Math.PI ? 1 : 0;
      const arcLenVal = r * theta;
      const ans = Number(arcLenVal.toPrecision(3)).toString();

      const step1 = `\\text{Arc length } APB = r\\theta`;
      const step2 = `= ${r} \\times ${theta}`;
      const step3 = `= ${ans} \\text{ cm}`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M ${ax} ${ay} A 70 70 0 ${largeFlag} 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#dc2626" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#dc2626" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 ${largeFlag} 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${px}" y="${py}" font-family="sans-serif" font-size="14" fill="#16a34a" font-weight="bold" text-anchor="middle">P</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta} rad</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Arc Length (Radians)",
        prompt: `Find the arc length of $APB$ in the circle sector shown below.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Apply the formula for arc length in radians: $$${step1}$$`,
          `Substitute $r = ${r}\\text{ cm}$ and $\\theta = ${theta}\\text{ rad}$: $$${step2}$$`,
          `Evaluate and round to 3 significant figures: $$${step3}$$`
        ]
      };
    } else {
      // Find major arc length given unshaded angle phi
      const r = randInt(6, 16);
      const phiTenths = randInt(35, 52);
      const rot = randInt(0, 280);

      const phi = Number((phiTenths / 10).toFixed(1));
      const theta = Number((2 * Math.PI - phi).toPrecision(4));
      const thetaDisplay = Number(theta.toPrecision(3));

      const rad1 = (rot * Math.PI) / 180;
      const rad2 = rad1 + theta;
      const radMid = rad1 + theta / 2;
      const radOppMid = rad1 + theta + phi / 2;

      const ax = Math.round(130 + 70 * Math.cos(rad1));
      const ay = Math.round(120 - 70 * Math.sin(rad1));
      const bx = Math.round(130 + 70 * Math.cos(rad2));
      const by = Math.round(120 - 70 * Math.sin(rad2));
      const px = Math.round(130 + 88 * Math.cos(radMid));
      const py = Math.round(120 - 88 * Math.sin(radMid) + 4);
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

      const arcLenVal = r * theta;
      const ans = Number(arcLenVal.toPrecision(3)).toString();

      const step1 = `\\text{Angle for arc } APB = 2\\pi - ${phi} \\approx ${thetaDisplay} \\text{ rad}`;
      const step2 = `\\text{Arc length } APB = r\\theta = ${r} \\times ${thetaDisplay}`;
      const step3 = `\\approx ${ans} \\text{ cm}`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M ${ax} ${ay} A 70 70 0 0 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#dc2626" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#dc2626" stroke-width="2"/><path d="M ${arc2x} ${arc2y} A 22 22 0 1 0 ${arc1x} ${arc1y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${px}" y="${py}" font-family="sans-serif" font-size="14" fill="#16a34a" font-weight="bold" text-anchor="middle">P</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${phi} rad</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Arc Length (Radians)",
        prompt: `Find the arc length of $APB$ in the figure below.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Calculate the central angle subtending arc $APB$: $$${step1}$$`,
          `Substitute $r = ${r}\\text{ cm}$ and $\\theta \\approx ${thetaDisplay}\\text{ rad}$ into the arc length formula: $$${step2}$$`,
          `Evaluate and round to 3 significant figures: $$${step3}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Perimeter, Radius, & Angle)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Find sector perimeter
      const r = randInt(6, 16);
      const thetaTenths = randInt(35, 48);
      const rot = randInt(0, 280);

      const theta = Number((thetaTenths / 10).toFixed(1));
      const rad1 = (rot * Math.PI) / 180;
      const rad2 = rad1 + theta;
      const radMid = rad1 + theta / 2;

      const ax = Math.round(130 + 70 * Math.cos(rad1));
      const ay = Math.round(120 - 70 * Math.sin(rad1));
      const bx = Math.round(130 + 70 * Math.cos(rad2));
      const by = Math.round(120 - 70 * Math.sin(rad2));
      const xx = Math.round(130 + 88 * Math.cos(radMid));
      const xy = Math.round(120 - 88 * Math.sin(radMid) + 4);
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

      const arcLenVal = r * theta;
      const perimVal = arcLenVal + 2 * r;
      const ans = Number(perimVal.toPrecision(3)).toString();
      const arcLenRounded = Number(arcLenVal.toPrecision(3));

      const step1 = `\\text{Arc length } AXB = r\\theta = ${r} \\times ${theta} = ${arcLenRounded} \\text{ cm}`;
      const step2 = `\\text{Perimeter } OAXB = \\text{Arc length } AXB + 2r`;
      const step3 = `= ${arcLenRounded} + 2(${r}) \\approx ${ans} \\text{ cm}`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M ${ax} ${ay} A 70 70 0 1 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#16a34a" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#16a34a" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 1 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${xx}" y="${xy}" font-family="sans-serif" font-size="14" fill="#16a34a" font-weight="bold" text-anchor="middle">X</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#16a34a">${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta} rad</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Arc Length (Radians)",
        prompt: `Find the perimeter of sector $OAXB$ shown below.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Calculate the arc length of $AXB$: $$${step1}$$`,
          `Set up the sector perimeter expression: $$${step2}$$`,
          `Add the components together: $$${step3}$$`
        ]
      };
    } else if (subType === 2) {
      // Find radius given s and theta
      const s = randInt(10, 40);
      const thetaTenths = randInt(8, 25);
      const rot = randInt(0, 280);

      const theta = Number((thetaTenths / 10).toFixed(1));
      const rVal = s / theta;
      const ans = Number(rVal.toPrecision(3)).toString();

      const rad1 = (rot * Math.PI) / 180;
      const rad2 = rad1 + theta;
      const radMid = rad1 + theta / 2;

      const ax = Math.round(130 + 70 * Math.cos(rad1));
      const ay = Math.round(120 - 70 * Math.sin(rad1));
      const bx = Math.round(130 + 70 * Math.cos(rad2));
      const by = Math.round(120 - 70 * Math.sin(rad2));
      const sx = Math.round(130 + 88 * Math.cos(radMid));
      const sy = Math.round(120 - 88 * Math.sin(radMid) + 4);
      const arc1x = Math.round(130 + 22 * Math.cos(rad1));
      const arc1y = Math.round(120 - 22 * Math.sin(rad1));
      const arc2x = Math.round(130 + 22 * Math.cos(rad2));
      const arc2y = Math.round(120 - 22 * Math.sin(rad2));
      const lblx = Math.round(130 + 38 * Math.cos(radMid));
      const lbly = Math.round(120 - 38 * Math.sin(radMid) + 4);
      const v1x = Math.round(130 + 84 * Math.cos(rad1));
      const v1y = Math.round(120 - 84 * Math.sin(rad1) + 4);
      const v2x = Math.round(130 + 84 * Math.cos(rad2));
      const v2y = Math.round(120 - 84 * Math.sin(rad2) + 4);

      const step1 = `\\begin{aligned} s &= r\\theta \\\\ ${s} &= r \\times ${theta} \\end{aligned}`;
      const step2 = `r = \\frac{${s}}{${theta}} \\approx ${ans} \\text{ cm}`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M ${ax} ${ay} A 70 70 0 0 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#475569" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#475569" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 0 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${sx}" y="${sy}" font-family="sans-serif" font-size="13" fill="#16a34a" font-weight="bold" text-anchor="middle">s = ${s} cm</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta} rad</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Arc Length (Radians)",
        prompt: `A circle sector has an arc length of $${s}\\text{ cm}$ and a central angle of $${theta}\\text{ rad}$. Find the radius $r$ of the sector.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Set up the arc length formula: $$${step1}$$`,
          `Solve for $r$: $$${step2}$$`
        ]
      };
    } else {
      // Find central angle theta given r and s
      const r = randInt(7, 18);
      const s = randInt(12, 35);
      const rot = randInt(0, 280);

      const thetaVal = s / r;
      const ans = Number(thetaVal.toPrecision(3)).toString();

      const rad1 = (rot * Math.PI) / 180;
      const rad2 = rad1 + thetaVal;
      const radMid = rad1 + thetaVal / 2;

      const ax = Math.round(130 + 70 * Math.cos(rad1));
      const ay = Math.round(120 - 70 * Math.sin(rad1));
      const bx = Math.round(130 + 70 * Math.cos(rad2));
      const by = Math.round(120 - 70 * Math.sin(rad2));
      const sx = Math.round(130 + 88 * Math.cos(radMid));
      const sy = Math.round(120 - 88 * Math.sin(radMid) + 4);
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

      const largeFlag = thetaVal > Math.PI ? 1 : 0;

      const step1 = `\\begin{aligned} s &= r\\theta \\\\ ${s} &= ${r} \\times \\theta \\end{aligned}`;
      const step2 = `\\theta = \\frac{${s}}{${r}} \\approx ${ans} \\text{ rad}`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M ${ax} ${ay} A 70 70 0 ${largeFlag} 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#475569" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#475569" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 ${largeFlag} 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${sx}" y="${sy}" font-family="sans-serif" font-size="13" fill="#16a34a" font-weight="bold" text-anchor="middle">s = ${s} cm</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">r = ${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">θ</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Arc Length (Radians)",
        prompt: `A circle sector has a radius of $${r}\\text{ cm}$ and an arc length of $${s}\\text{ cm}$. Find the central angle $\\theta$ in radians.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Set up the arc length formula: $$${step1}$$`,
          `Solve for $\\theta$: $$${step2}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Bent Wire & Shaded Region)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Wire bent to sector OPQ
    const L = randInt(50, 100);
    const thetaTenths = randInt(12, 28);
    const rot = randInt(0, 280);

    const theta = Number((thetaTenths / 10).toFixed(1));
    const denom = 2 + theta;
    const rVal = L / denom;
    const ans = Number(rVal.toPrecision(3)).toString();

    const rad1 = (rot * Math.PI) / 180;
    const rad2 = rad1 + theta;
    const radMid = rad1 + theta / 2;

    const px = Math.round(130 + 70 * Math.cos(rad1));
    const py = Math.round(120 - 70 * Math.sin(rad1));
    const qx = Math.round(130 + 70 * Math.cos(rad2));
    const qy = Math.round(120 - 70 * Math.sin(rad2));
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

    const step1 = `\\begin{aligned} \\text{Perimeter} &= 2r + r\\theta \\\\ &= r(2 + \\theta) = ${L} \\end{aligned}`;
    const step2 = `r(2 + ${theta}) = ${L}`;
    const step3 = `r = \\frac{${L}}{${Number(denom.toFixed(1))}} \\approx ${ans} \\text{ cm}`;

    const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M ${px} ${py} A 70 70 0 0 0 ${qx} ${qy}" fill="none" stroke="#475569" stroke-width="3"/><line x1="130" y1="120" x2="${px}" y2="${py}" stroke="#475569" stroke-width="2"/><line x1="130" y1="120" x2="${qx}" y2="${qy}" stroke="#475569" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 0 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><circle cx="${px}" cy="${py}" r="3" fill="#2563eb"/><circle cx="${qx}" cy="${qy}" r="3" fill="#2563eb"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">P</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">Q</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" font-style="italic" fill="#1e293b">r</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta} rad</text></svg>`;

    return {
      strand: "Geometry & Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Arc Length (Radians)",
      prompt: `A piece of wire $${L}\\text{ cm}$ long is bent to form sector $OPQ$ of a circle with centre $O$. The radius is $r\\text{ cm}$ and $\\angle POQ = ${theta}\\text{ rad}$. Find the value of $r$.\n\n(Give your answer correct to 3 significant figures.)`,
      diagramSvg: svg,
      expectedAnswer: ans,
      steps: [
        `Write the perimeter equation in terms of $r$ and $\\theta$: $$${step1}$$`,
        `Substitute $\\theta = ${theta}\\text{ rad}$: $$${step2}$$`,
        `Solve for $r$: $$${step3}$$`
      ]
    };
  } else {
    // Shaded region perimeter with right-angled triangle OPB
    const a = randInt(5, 9);
    const b = randInt(6, 12);

    const rVal = Math.sqrt(a * a + b * b);
    const rRounded = Number(rVal.toPrecision(4));
    const thetaRad = Math.atan2(b, a);
    const thetaRounded = Number(thetaRad.toPrecision(3));

    const paVal = rVal - a;
    const paRounded = Number(paVal.toPrecision(3));
    const arcABVal = thetaRad * rVal;
    const arcABRounded = Number(arcABVal.toPrecision(3));

    const perimVal = paVal + b + arcABVal;
    const ans = Number(perimVal.toPrecision(3)).toString();

    const scale = 80 / rVal;
    const opPx = Math.round(80 + a * scale);
    const bX = Math.round(80 + a * scale);
    const bY = Math.round(170 - b * scale);
    const aX = Math.round(80 + rVal * scale);
    const arc1x = Math.round(80 + 22);
    const arc1y = 170;
    const arc2x = Math.round(80 + 22 * Math.cos(thetaRad));
    const arc2y = Math.round(170 - 22 * Math.sin(thetaRad));

    const step1 = `OB = \\sqrt{\\text{OP}^2 + \\text{PB}^2} = \\sqrt{${a}^2 + ${b}^2} = ${rRounded} \\text{ cm}`;
    const step2 = `\\angle AOB = \\tan^{-1}\\left(\\frac{${b}}{${a}}\\right) \\approx ${thetaRounded} \\text{ rad}`;
    const step3 = `\\text{PA} = OB - OP = ${rRounded} - ${a} = ${paRounded} \\text{ cm}`;
    const step4 = `\\text{Arc } AB = r\\theta \\approx ${rRounded} \\times ${thetaRounded} = ${arcABRounded} \\text{ cm}`;
    const step5 = `\\begin{aligned} \\text{Shaded Perimeter} &= \\text{PA} + \\text{PB} + \\text{Arc } AB \\\\ &= ${paRounded} + ${b} + ${arcABRounded} \\approx ${ans} \\text{ cm} \\end{aligned}`;

    const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M ${opPx} 170 L ${aX} 170 A 80 80 0 0 0 ${bX} ${bY} Z" fill="#cbd5e1" stroke="none"/><polygon points="80,170 ${opPx},170 ${bX},${bY}" fill="none" stroke="#334155" stroke-width="2"/><path d="M ${bX} ${bY} A 80 80 0 0 1 ${aX} 170" fill="none" stroke="#16a34a" stroke-width="3"/><line x1="80" y1="170" x2="${aX}" y2="170" stroke="#334155" stroke-width="2"/><polyline points="${opPx - 8},170 ${opPx - 8},${170 - 8} ${opPx},${170 - 8}" fill="none" stroke="#334155" stroke-width="1.5"/><path d="M ${arc1x} 170 A 22 22 0 0 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="80" cy="170" r="3" fill="#1e293b"/><text x="65" y="175" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${opPx}" y="202" font-family="sans-serif" font-size="14" text-anchor="middle">P</text><text x="${aX + 8}" y="175" font-family="sans-serif" font-size="14">A</text><text x="${bX}" y="${bY - 8}" font-family="sans-serif" font-size="14">B</text><text x="${(80 + opPx) / 2}" y="188" font-family="sans-serif" font-size="13" fill="#1e293b" text-anchor="middle">${a}</text><text x="${bX + 8}" y="${(170 + bY) / 2}" font-family="sans-serif" font-size="13" fill="#1e293b">${b}</text></svg>`;

    return {
      strand: "Geometry & Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Arc Length (Radians)",
      prompt: `The diagram shows a sector $OAB$ of a circle with centre $O$. $P$ is the point on $OA$ such that $OP = ${a}\\text{ cm}$, $PB = ${b}\\text{ cm}$, and $\\angle OPB = 90^\\circ$.\n\nFind the perimeter of the shaded region.\n\n(Give your answer correct to 3 significant figures.)`,
      diagramSvg: svg,
      expectedAnswer: ans,
      steps: [
        `Find the radius $OB$ of the circle using Pythagoras' theorem on $\\triangle OPB$: $$${step1}$$`,
        `Find central angle $\\angle AOB$ in radians: $$${step2}$$`,
        `Find the length of segment $PA$: $$${step3}$$`,
        `Calculate the arc length $AB$: $$${step4}$$`,
        `Sum the boundaries ($PA + PB + \\text{Arc } AB$) to find the total perimeter: $$${step5}$$`
      ]
    };
  }
}

export const arcLengthRadians = { generate: generateQuestion };
export default generateQuestion;
