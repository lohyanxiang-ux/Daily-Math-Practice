/**
 * Question Generator: Area of Sector (Radians)
 * Curriculum Skill: Sec 3 G3 - Geometry & Trigonometry
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Direct Sector Area & Reflex Angle)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Direct sector area calculation given r and theta
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
      const areaVal = 0.5 * r * r * theta;
      const ans = Number(areaVal.toPrecision(3)).toString();

      const step1 = `\\text{Area} = \\frac{1}{2} r^2 \\theta`;
      const step2 = `= \\frac{1}{2} \\times ${r}^2 \\times ${theta}`;
      const step3 = `= ${ans} \\text{ cm}^2`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M 130 120 L ${ax} ${ay} A 70 70 0 ${largeFlag} 0 ${bx} ${by} Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 ${largeFlag} 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta} rad</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Area of Sector (Radians)",
        prompt: `Find the area of sector $OAB$ shown below.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Apply the formula for sector area in radians: $$${step1}$$`,
          `Substitute $r = ${r}\\text{ cm}$ and $\\theta = ${theta}\\text{ rad}$: $$${step2}$$`,
          `Evaluate and round to 3 significant figures: $$${step3}$$`
        ]
      };
    } else {
      // Sector area given unshaded angle phi
      const r = randInt(6, 16);
      const phiTenths = randInt(35, 52);
      const rot = randInt(0, 280);

      const phi = Number((phiTenths / 10).toFixed(1));
      const theta = Number((2 * Math.PI - phi).toPrecision(4));
      const thetaDisplay = Number(theta.toPrecision(3));

      const rad1 = (rot * Math.PI) / 180;
      const rad2 = rad1 + theta;
      const radOppMid = rad1 + theta + phi / 2;

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

      const areaVal = 0.5 * r * r * theta;
      const ans = Number(areaVal.toPrecision(3)).toString();

      const step1 = `\\text{Angle } \\theta = 2\\pi - ${phi} \\approx ${thetaDisplay} \\text{ rad}`;
      const step2 = `\\text{Area} = \\frac{1}{2} \\times ${r}^2 \\times ${thetaDisplay}`;
      const step3 = `\\approx ${ans} \\text{ cm}^2`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M 130 120 L ${ax} ${ay} A 70 70 0 0 0 ${bx} ${by} Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/><path d="M ${arc2x} ${arc2y} A 22 22 0 1 0 ${arc1x} ${arc1y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${phi} rad</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Area of Sector (Radians)",
        prompt: `Find the area of the shaded sector shown in the figure below.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Calculate the central angle of the shaded sector: $$${step1}$$`,
          `Substitute $r = ${r}\\text{ cm}$ and $\\theta \\approx ${thetaDisplay}\\text{ rad}$ into the area formula: $$${step2}$$`,
          `Evaluate and round to 3 significant figures: $$${step3}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Major Sector, Radius, & Angle)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Major sector area calculation
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

      const areaVal = 0.5 * r * r * theta;
      const ans = Number(areaVal.toPrecision(3)).toString();

      const step1 = `\\text{Area} = \\frac{1}{2} r^2 \\theta`;
      const step2 = `= \\frac{1}{2} \\times ${r}^2 \\times ${theta}`;
      const step3 = `= ${ans} \\text{ cm}^2`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M 130 120 L ${ax} ${ay} A 70 70 0 1 0 ${bx} ${by} Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 1 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta} rad</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Area of Sector (Radians)",
        prompt: `Find the area of the major sector $OAB$ shown below.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Apply the formula for major sector area in radians: $$${step1}$$`,
          `Substitute $r = ${r}\\text{ cm}$ and $\\theta = ${theta}\\text{ rad}$: $$${step2}$$`,
          `Evaluate and round to 3 significant figures: $$${step3}$$`
        ]
      };
    } else if (subType === 2) {
      // Find radius r given sector area A and angle theta
      const a = randInt(25, 150);
      const thetaTenths = randInt(8, 25);
      const rot = randInt(0, 280);

      const theta = Number((thetaTenths / 10).toFixed(1));
      const rVal = Math.sqrt((2 * a) / theta);
      const ans = Number(rVal.toPrecision(3)).toString();

      const rad1 = (rot * Math.PI) / 180;
      const rad2 = rad1 + theta;
      const radMid = rad1 + theta / 2;

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
      const v1x = Math.round(130 + 84 * Math.cos(rad1));
      const v1y = Math.round(120 - 84 * Math.sin(rad1) + 4);
      const v2x = Math.round(130 + 84 * Math.cos(rad2));
      const v2y = Math.round(120 - 84 * Math.sin(rad2) + 4);

      const largeFlag = theta > Math.PI ? 1 : 0;

      const step1 = `\\begin{aligned} A &= \\frac{1}{2} r^2 \\theta \\\\ ${a} &= \\frac{1}{2} \\times r^2 \\times ${theta} \\end{aligned}`;
      const step2 = `r^2 = \\frac{2 \\times ${a}}{${theta}}`;
      const step3 = `r = \\sqrt{\\frac{${2 * a}}{${theta}}} \\approx ${ans} \\text{ cm}`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M 130 120 L ${ax} ${ay} A 70 70 0 ${largeFlag} 0 ${bx} ${by} Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 ${largeFlag} 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta} rad</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Area of Sector (Radians)",
        prompt: `A circle sector has an area of $${a}\\text{ cm}^2$ and a central angle of $${theta}\\text{ rad}$. Find the radius $r$ of the sector.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Set up the sector area equation: $$${step1}$$`,
          `Rearrange for $r^2$: $$${step2}$$`,
          `Solve for $r$: $$${step3}$$`
        ]
      };
    } else {
      // Find central angle theta given radius r and area A
      const r = randInt(6, 15);
      const a = randInt(30, 180);
      const rot = randInt(0, 280);

      const thetaVal = (2 * a) / (r * r);
      const ans = Number(thetaVal.toPrecision(3)).toString();

      const rad1 = (rot * Math.PI) / 180;
      const rad2 = rad1 + thetaVal;
      const radMid = rad1 + thetaVal / 2;

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

      const largeFlag = thetaVal > Math.PI ? 1 : 0;

      const step1 = `\\begin{aligned} A &= \\frac{1}{2} r^2 \\theta \\\\ ${a} &= \\frac{1}{2} \\times (${r})^2 \\times \\theta \\end{aligned}`;
      const step2 = `\\theta = \\frac{2 \\times ${a}}{${r * r}} \\approx ${ans} \\text{ rad}`;

      const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M 130 120 L ${ax} ${ay} A 70 70 0 ${largeFlag} 0 ${bx} ${by} Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 ${largeFlag} 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">r = ${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">θ</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Area of Sector (Radians)",
        prompt: `A circle sector has a radius of $${r}\\text{ cm}$ and an area of $${a}\\text{ cm}^2$. Find the central angle $\\theta$ in radians.\n\n(Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Substitute values into the sector area formula in radians: $$${step1}$$`,
          `Solve for $\\theta$: $$${step2}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Wire Bent, Composite Shaded Regions, Concentric Sectors)
  // =========================================================
  const subType = randInt(1, 4);

  if (subType === 1) {
    // Piece of wire L bent into sector OPQ
    const L = randInt(50, 100);
    const thetaTenths = randInt(12, 28);
    const rot = randInt(0, 280);

    const theta = Number((thetaTenths / 10).toFixed(1));
    const denom = 2 + theta;
    const rVal = L / denom;
    const rRounded = Number(rVal.toPrecision(4));
    const areaVal = 0.5 * rVal * rVal * theta;
    const ans = Number(areaVal.toPrecision(3)).toString();

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
    const step2 = `r = \\frac{${L}}{2 + ${theta}} = \\frac{${L}}{${Number(denom.toFixed(1))}} \\approx ${rRounded} \\text{ cm}`;
    const step3 = `\\text{Area} = \\frac{1}{2} \\times (${rRounded})^2 \\times ${theta} \\approx ${ans} \\text{ cm}^2`;

    const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M 130 120 L ${px} ${py} A 70 70 0 0 0 ${qx} ${qy} Z" fill="#bbf7d0" stroke="#475569" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 0 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><circle cx="${px}" cy="${py}" r="3" fill="#2563eb"/><circle cx="${qx}" cy="${qy}" r="3" fill="#2563eb"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">P</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">Q</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" font-style="italic" fill="#1e293b">r</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta} rad</text></svg>`;

    return {
      strand: "Geometry & Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Area of Sector (Radians)",
      prompt: `A piece of wire $${L}\\text{ cm}$ long is bent to form sector $OPQ$ of a circle with centre $O$. $\\angle POQ = ${theta}\\text{ rad}$. Find the area of sector $OPQ$.\n\n(Give your answer correct to 3 significant figures.)`,
      diagramSvg: svg,
      expectedAnswer: ans,
      steps: [
        `Write the perimeter equation to solve for $r$: $$${step1}$$`,
        `Calculate the radius $r$: $$${step2}$$`,
        `Calculate the sector area: $$${step3}$$`
      ]
    };
  } else if (subType === 2) {
    // Shaded region between sector OAB and right triangle OPB
    const a = randInt(5, 9);
    const b = randInt(6, 12);

    const rVal = Math.sqrt(a * a + b * b);
    const rRounded = Number(rVal.toPrecision(4));
    const thetaRad = Math.atan2(b, a);
    const thetaRounded = Number(thetaRad.toPrecision(3));

    const triArea = 0.5 * a * b;
    const secAreaVal = 0.5 * rVal * rVal * thetaRad;
    const secAreaRounded = Number(secAreaVal.toPrecision(4));

    const shadedAreaVal = secAreaVal - triArea;
    const ans = Number(shadedAreaVal.toPrecision(3)).toString();

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
    const step3 = `\\text{Sector } OAB = \\frac{1}{2} \\times (${rRounded})^2 \\times ${thetaRounded} \\approx ${secAreaRounded} \\text{ cm}^2`;
    const step4 = `\\text{Area } \\triangle OPB = \\frac{1}{2} \\times ${a} \\times ${b} = ${triArea} \\text{ cm}^2`;
    const step5 = `\\begin{aligned} \\text{Shaded Area} &= \\text{Sector Area} - \\text{Triangle Area} \\\\ &= ${secAreaRounded} - ${triArea} \\approx ${ans} \\text{ cm}^2 \\end{aligned}`;

    const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M ${opPx} 170 L ${aX} 170 A 80 80 0 0 0 ${bX} ${bY} Z" fill="#cbd5e1" stroke="none"/><polygon points="80,170 ${opPx},170 ${bX},${bY}" fill="none" stroke="#334155" stroke-width="2"/><path d="M ${bX} ${bY} A 80 80 0 0 1 ${aX} 170" fill="none" stroke="#16a34a" stroke-width="3"/><line x1="80" y1="170" x2="${aX}" y2="170" stroke="#334155" stroke-width="2"/><polyline points="${opPx - 8},170 ${opPx - 8},${170 - 8} ${opPx},${170 - 8}" fill="none" stroke="#334155" stroke-width="1.5"/><path d="M ${arc1x} 170 A 22 22 0 0 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="80" cy="170" r="3" fill="#1e293b"/><text x="65" y="175" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${opPx}" y="202" font-family="sans-serif" font-size="14" text-anchor="middle">P</text><text x="${aX + 8}" y="175" font-family="sans-serif" font-size="14">A</text><text x="${bX}" y="${bY - 8}" font-family="sans-serif" font-size="14">B</text><text x="${(80 + opPx) / 2}" y="188" font-family="sans-serif" font-size="13" fill="#1e293b" text-anchor="middle">${a}</text><text x="${bX + 8}" y="${(170 + bY) / 2}" font-family="sans-serif" font-size="13" fill="#1e293b">${b}</text></svg>`;

    return {
      strand: "Geometry & Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Area of Sector (Radians)",
      prompt: `The diagram shows a sector $OAB$ of a circle with centre $O$. $P$ is the point on $OA$ such that $OP = ${a}\\text{ cm}$, $PB = ${b}\\text{ cm}$, and $\\angle OPB = 90^\\circ$.\n\nFind the area of the shaded region.\n\n(Give your answer correct to 3 significant figures.)`,
      diagramSvg: svg,
      expectedAnswer: ans,
      steps: [
        `Find radius $OB$ using Pythagoras' theorem: $$${step1}$$`,
        `Find central angle $\\angle AOB$ in radians: $$${step2}$$`,
        `Calculate area of sector $OAB$: $$${step3}$$`,
        `Calculate area of right triangle $OPB$: $$${step4}$$`,
        `Subtract triangle area from sector area: $$${step5}$$`
      ]
    };
  } else if (subType === 3) {
    // Triangle OAB and Sector OBC (find sector OBC area)
    const a = randInt(6, 14);

    const obVal = Math.sqrt(2 * a * a);
    const obAns = Number(obVal.toPrecision(3)).toString();
    const obRounded = Number(obVal.toPrecision(4));

    const areaVal = 0.5 * obVal * obVal * ((3 * Math.PI) / 4);
    const areaAns = Number(areaVal.toPrecision(3)).toString();

    const step1 = `\\text{OB} = \\sqrt{\\text{AO}^2 + \\text{AB}^2} = \\sqrt{${a}^2 + ${a}^2} \\approx ${obAns} \\text{ cm}`;
    const step2 = `\\begin{aligned} \\angle AOB &= \\frac{\\pi}{4} \\text{ rad} \\\\ \\angle BOC &= \\pi - \\frac{\\pi}{4} = \\frac{3\\pi}{4} \\approx 2.36 \\text{ rad} \\end{aligned}`;
    const step3 = `\\begin{aligned} \\text{Area of sector } OBC &= \\frac{1}{2} r^2 \\theta \\\\ &= \\frac{1}{2} \\times (${obRounded})^2 \\times \\frac{3\\pi}{4} \\\\ &\\approx ${areaAns} \\text{ cm}^2 \\end{aligned}`;

    const svg = `<svg width="260" height="200" viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M 115 150 L 45 80 A 99 99 0 0 1 214 150 Z" fill="#cbd5e1" stroke="none"/><path d="M 45 80 A 99 99 0 0 1 214 150" fill="none" stroke="#16a34a" stroke-width="3"/><line x1="45" y1="150" x2="214" y2="150" stroke="#334155" stroke-width="2"/><line x1="45" y1="150" x2="45" y2="80" stroke="#334155" stroke-width="2"/><line x1="115" y1="150" x2="45" y2="80" stroke="#334155" stroke-width="2"/><polyline points="45,140 55,140 55,150" fill="none" stroke="#334155" stroke-width="1.5"/><line x1="41" y1="115" x2="49" y2="115" stroke="#334155" stroke-width="1.5"/><line x1="43" y1="112" x2="51" y2="112" stroke="#334155" stroke-width="1.5"/><line x1="80" y1="146" x2="80" y2="154" stroke="#334155" stroke-width="1.5"/><line x1="83" y1="146" x2="83" y2="154" stroke="#334155" stroke-width="1.5"/><circle cx="115" cy="150" r="3" fill="#1e293b"/><circle cx="45" cy="150" r="3" fill="#1e293b"/><circle cx="45" cy="80" r="3" fill="#1e293b"/><circle cx="214" cy="150" r="3" fill="#1e293b"/><text x="32" y="165" font-family="sans-serif" font-size="14" font-style="italic">A</text><text x="112" y="168" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="32" y="75" font-family="sans-serif" font-size="14" font-style="italic">B</text><text x="220" y="165" font-family="sans-serif" font-size="14" font-style="italic">C</text><text x="80" y="170" font-family="sans-serif" font-size="13" fill="#1e293b" text-anchor="middle">${a}</text></svg>`;

    return {
      strand: "Geometry & Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Area of Sector (Radians)",
      prompt: `In the diagram, $AOC$ is a straight line and $OBC$ is a sector of the circle with centre $O$. $AO = AB = ${a}\\text{ cm}$ and $\\angle OAB = 90^\\circ$.\n\nFind the area of sector $OBC$.\n\n(Give your answer correct to 3 significant figures.)`,
      diagramSvg: svg,
      expectedAnswer: areaAns,
      steps: [
        `Calculate hypotenuse/radius $OB$ using Pythagoras' theorem: $$${step1}$$`,
        `Determine central angle $\\angle BOC$ in radians: $$${step2}$$`,
        `Calculate sector area $OBC$: $$${step3}$$`
      ]
    };
  } else {
    // Concentric sectors OQR and OPS: solve for x given shaded area
    const r1 = randInt(4, 8);
    const xExact = randInt(3, 7);
    const thetaTenths = randInt(15, 28);

    const theta = Number((thetaTenths / 10).toFixed(1));
    const r2Exact = r1 + xExact;
    const areaShadedVal = 0.5 * theta * (r2Exact * r2Exact - r1 * r1);
    const areaShadedRounded = Number(areaShadedVal.toPrecision(3));

    const oqVal = Math.sqrt(r1 * r1 + (2 * areaShadedRounded) / theta);
    const oqRounded = Number(oqVal.toPrecision(4));
    const ans = xExact.toString();

    const rad = theta;
    const rx = Math.round(130 + 90 * Math.cos(rad));
    const ry = Math.round(170 - 90 * Math.sin(rad));
    const sx = Math.round(130 + 45 * Math.cos(rad));
    const sy = Math.round(170 - 45 * Math.sin(rad));
    const lblx = Math.round(130 + 25 * Math.cos(rad / 2));
    const lbly = Math.round(170 - 25 * Math.sin(rad / 2));

    const step1 = `\\begin{aligned} \\text{Shaded Area} &= \\text{Area}(OQR) - \\text{Area}(OPS) \\\\ &= \\frac{1}{2} \\theta (OQ^2 - OP^2) \\end{aligned}`;
    const step2 = `${areaShadedRounded} = \\frac{1}{2} \\times ${theta} \\times (OQ^2 - ${r1}^2)`;
    const step3 = `\\begin{aligned} OQ^2 - ${r1 * r1} &= \\frac{2 \\times ${areaShadedRounded}}{${theta}} \\\\ OQ &= \\sqrt{${r1 * r1} + \\frac{2 \\times ${areaShadedRounded}}{${theta}}} \\approx ${oqRounded} \\text{ cm} \\end{aligned}`;
    const step4 = `x = PQ = OQ - OP \\approx ${oqRounded} - ${r1} = ${ans} \\text{ cm}`;

    const svg = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;"><path d="M 175 170 L 220 170 A 90 90 0 0 0 ${rx} ${ry} L ${sx} ${sy} A 45 45 0 0 1 175 170 Z" fill="#cbd5e1" stroke="none"/><path d="M 220 170 A 90 90 0 0 0 ${rx} ${ry}" fill="none" stroke="#16a34a" stroke-width="2.5"/><line x1="130" y1="170" x2="220" y2="170" stroke="#334155" stroke-width="2"/><line x1="130" y1="170" x2="${rx}" y2="${ry}" stroke="#334155" stroke-width="2"/><path d="M 175 170 A 45 45 0 0 0 ${sx} ${sy}" fill="none" stroke="#334155" stroke-width="2"/><path d="M 152 170 A 22 22 0 0 0 ${Math.round(130 + 22 * Math.cos(rad))} ${Math.round(170 - 22 * Math.sin(rad))}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="170" r="3" fill="#1e293b"/><circle cx="175" cy="170" r="3" fill="#1e293b"/><circle cx="220" cy="170" r="3" fill="#1e293b"/><circle cx="${sx}" cy="${sy}" r="3" fill="#1e293b"/><circle cx="${rx}" cy="${ry}" r="3" fill="#1e293b"/><text x="115" y="175" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="172" y="188" font-family="sans-serif" font-size="14" font-style="italic">P</text><text x="220" y="188" font-family="sans-serif" font-size="14" font-style="italic">Q</text><text x="${sx - 12}" y="${sy + 12}" font-family="sans-serif" font-size="14" font-style="italic">S</text><text x="${rx - 15}" y="${ry - 5}" font-family="sans-serif" font-size="14" font-style="italic">R</text><text x="152" y="185" font-family="sans-serif" font-size="13" fill="#1e293b" text-anchor="middle">${r1}</text><text x="197" y="185" font-family="sans-serif" font-size="13" fill="#1e293b" text-anchor="middle">x</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta} rad</text></svg>`;

    return {
      strand: "Geometry & Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Area of Sector (Radians)",
      prompt: `In the diagram, $OQR$ and $OPS$ are sectors of two circles with a common centre $O$. $OP = ${r1}\\text{ cm}$, $PQ = x\\text{ cm}$, and $\\angle QOR = ${theta}\\text{ rad}$. If the area of the shaded region is $${areaShadedRounded}\\text{ cm}^2$, find the value of $x$.\n\n(Give your answer correct to 3 significant figures.)`,
      diagramSvg: svg,
      expectedAnswer: ans,
      steps: [
        `State the relationship for the shaded area in radians: $$${step1}$$`,
        `Substitute the given values: $$${step2}$$`,
        `Solve for $OQ$: $$${step3}$$`,
        `Find $x = PQ = OQ - OP$: $$${step4}$$`
      ]
    };
  }
}

export const S3_G3_areaOfSectorRadians = { generate: generateQuestion };
export default generateQuestion;
