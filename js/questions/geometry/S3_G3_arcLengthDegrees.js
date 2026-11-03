/**
 * Question Generator: Arc Length (Degrees)
 * Curriculum Skill: Sec 3 G3 - Geometry & Measurement
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const arcLengthDegrees = {
  generate: (tier = 1) => {
    // TIER 1: BASIC (Level 1 Questions)
    if (tier === 1) {
      const subType = randInt(1, 2);

      if (subType === 1) {
        // Direct Arc Length from r & theta
        const r = randInt(5, 15);
        const theta = randInt(35, 160);
        const rot = randInt(0, 280);

        const rad1 = (rot * Math.PI) / 180;
        const rad2 = ((rot + theta) * Math.PI) / 180;
        const radMid = ((rot + theta / 2) * Math.PI) / 180;

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

        const largeFlag = theta > 180 ? 1 : 0;
        const arcLenVal = (theta / 360) * 2 * Math.PI * r;
        const ans = Number(arcLenVal.toPrecision(3)).toString();

        const diagram = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;"><path d="M ${ax} ${ay} A 70 70 0 ${largeFlag} 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#dc2626" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#dc2626" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 ${largeFlag} 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${px}" y="${py}" font-family="sans-serif" font-size="14" fill="#16a34a" font-weight="bold" text-anchor="middle">P</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta}°</text></svg>`;

        return {
          strand: "Geometry & Measurement",
          tier: 1,
          tierName: "Basic",
          skillTitle: "Arc Length (Degrees)",
          prompt: `Find the arc length of $APB$ in the circle sector shown below.\n\n*(Give your answer correct to 3 significant figures.)*\n\n${diagram}`,
          expectedAnswer: ans,
          keypad: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "⌫", "Clear"],
          steps: [
            `Apply the formula for arc length: $$\\text{Arc length } APB = \\frac{\\theta}{360^\\circ} \\times 2\\pi r$$`,
            `Substitute $\\theta = ${theta}^\\circ$ and $r = ${r}\\text{ cm}$: $$= \\frac{${theta}}{360} \\times 2 \\times \\pi \\times ${r}$$`,
            `Evaluate and round to 3 significant figures: $$\\approx ${ans}\\text{ cm}$$`
          ]
        };
      } else {
        // Arc length given reflex angle phi
        const r = randInt(6, 16);
        const phi = randInt(200, 265);
        const rot = randInt(0, 280);

        const theta = 360 - phi;
        const rad1 = (rot * Math.PI) / 180;
        const rad2 = ((rot + theta) * Math.PI) / 180;
        const radMid = ((rot + theta / 2) * Math.PI) / 180;
        const radOppMid = ((rot + theta + phi / 2) * Math.PI) / 180;

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

        const arcLenVal = (theta / 360) * 2 * Math.PI * r;
        const ans = Number(arcLenVal.toPrecision(3)).toString();

        const diagram = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;"><path d="M ${ax} ${ay} A 70 70 0 0 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#dc2626" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#dc2626" stroke-width="2"/><path d="M ${arc2x} ${arc2y} A 22 22 0 1 0 ${arc1x} ${arc1y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${px}" y="${py}" font-family="sans-serif" font-size="14" fill="#16a34a" font-weight="bold" text-anchor="middle">P</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${phi}°</text></svg>`;

        return {
          strand: "Geometry & Measurement",
          tier: 1,
          tierName: "Basic",
          skillTitle: "Arc Length (Degrees)",
          prompt: `Find the arc length of $APB$ in the figure below.\n\n*(Give your answer correct to 3 significant figures.)*\n\n${diagram}`,
          expectedAnswer: ans,
          keypad: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "⌫", "Clear"],
          steps: [
            `Calculate the central angle subtending arc $APB$: $$\\text{Angle for arc } APB = 360^\\circ - ${phi}^\\circ = ${theta}^\\circ$$`,
            `Substitute $\\theta = ${theta}^\\circ$ and $r = ${r}\\text{ cm}$ into the arc length formula: $$\\text{Arc length } APB = \\frac{${theta}}{360} \\times 2 \\times \\pi \\times ${r}$$`,
            `Evaluate and round to 3 significant figures: $$\\approx ${ans}\\text{ cm}$$`
          ]
        };
      }
    }

    // TIER 2: INTERMEDIATE (Level 2 Questions)
    if (tier === 2) {
      const subType = randInt(1, 3);

      if (subType === 1) {
        // Sector Perimeter given r & theta
        const r = randInt(6, 16);
        const theta = randInt(195, 280);
        const rot = randInt(0, 280);

        const rad1 = (rot * Math.PI) / 180;
        const rad2 = ((rot + theta) * Math.PI) / 180;
        const radMid = ((rot + theta / 2) * Math.PI) / 180;

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

        const arcLenVal = (theta / 360) * 2 * Math.PI * r;
        const perimVal = arcLenVal + 2 * r;
        const ans = Number(perimVal.toPrecision(3)).toString();
        const arcLenRounded = Number(arcLenVal.toPrecision(3));

        const diagram = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;"><path d="M ${ax} ${ay} A 70 70 0 1 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#16a34a" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#16a34a" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 1 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${xx}" y="${xy}" font-family="sans-serif" font-size="14" fill="#16a34a" font-weight="bold" text-anchor="middle">X</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#16a34a">${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta}°</text></svg>`;

        return {
          strand: "Geometry & Measurement",
          tier: 2,
          tierName: "Intermediate",
          skillTitle: "Arc Length (Degrees)",
          prompt: `Find the perimeter of sector $OAXB$ shown below.\n\n*(Give your answer correct to 3 significant figures.)*\n\n${diagram}`,
          expectedAnswer: ans,
          keypad: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "⌫", "Clear"],
          steps: [
            `Calculate the arc length of $AXB$: $$\\text{Arc length } AXB = \\frac{${theta}}{360} \\times 2 \\times \\pi \\times ${r} \\approx ${arcLenRounded}\\text{ cm}$$`,
            `Set up the sector perimeter expression: $$\\text{Perimeter } OAXB = \\text{Arc length } AXB + 2r$$`,
            `Add the components together: $$= ${arcLenRounded} + 2(${r}) \\approx ${ans}\\text{ cm}$$`
          ]
        };
      } else if (subType === 2) {
        // Find radius r given arc length s & theta
        const s = randInt(10, 40);
        const theta = randInt(45, 150);
        const rot = randInt(0, 280);

        const rVal = (s * 360) / (2 * Math.PI * theta);
        const ans = Number(rVal.toPrecision(3)).toString();

        const rad1 = (rot * Math.PI) / 180;
        const rad2 = ((rot + theta) * Math.PI) / 180;
        const radMid = ((rot + theta / 2) * Math.PI) / 180;

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

        const diagram = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;"><path d="M ${ax} ${ay} A 70 70 0 0 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#475569" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#475569" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 0 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${sx}" y="${sy}" font-family="sans-serif" font-size="13" fill="#16a34a" font-weight="bold" text-anchor="middle">s = ${s} cm</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta}°</text></svg>`;

        return {
          strand: "Geometry & Measurement",
          tier: 2,
          tierName: "Intermediate",
          skillTitle: "Arc Length (Degrees)",
          prompt: `A circle sector has an arc length of $${s}\\text{ cm}$ and a central angle of $${theta}^\\circ$. Find the radius $r$ of the sector.\n\n*(Give your answer correct to 3 significant figures.)*\n\n${diagram}`,
          expectedAnswer: ans,
          keypad: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "⌫", "Clear"],
          steps: [
            `State the arc length formula: $$\\text{Arc length } s = \\frac{\\theta}{360^\\circ} \\times 2\\pi r$$`,
            `Substitute $s = ${s}\\text{ cm}$ and $\\theta = ${theta}^\\circ$: $$${s} = \\frac{${theta}}{360} \\times 2\\pi r$$`,
            `Rearrange and solve for $r$: $$r = \\frac{${s} \\times 360}{2\\pi \\times ${theta}} \\approx ${ans}\\text{ cm}$$`
          ]
        };
      } else {
        // Find angle theta given r & s
        const r = randInt(7, 18);
        const s = randInt(12, 35);
        const rot = randInt(0, 280);

        const thetaVal = (s / (2 * Math.PI * r)) * 360;
        const ans = thetaVal.toFixed(1);

        const rad1 = (rot * Math.PI) / 180;
        const rad2 = ((rot + thetaVal) * Math.PI) / 180;
        const radMid = ((rot + thetaVal / 2) * Math.PI) / 180;

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

        const largeFlag = thetaVal > 180 ? 1 : 0;

        const diagram = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;"><path d="M ${ax} ${ay} A 70 70 0 ${largeFlag} 0 ${bx} ${by}" fill="none" stroke="#16a34a" stroke-width="4"/><line x1="130" y1="120" x2="${ax}" y2="${ay}" stroke="#475569" stroke-width="2"/><line x1="130" y1="120" x2="${bx}" y2="${by}" stroke="#475569" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 ${largeFlag} 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">A</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">B</text><text x="${sx}" y="${sy}" font-family="sans-serif" font-size="13" fill="#16a34a" font-weight="bold" text-anchor="middle">s = ${s} cm</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" fill="#1e293b">r = ${r}</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">θ</text></svg>`;

        return {
          strand: "Geometry & Measurement",
          tier: 2,
          tierName: "Intermediate",
          skillTitle: "Arc Length (Degrees)",
          prompt: `A circle sector has a radius of $${r}\\text{ cm}$ and an arc length of $${s}\\text{ cm}$. Find the central angle $\\theta$ in degrees.\n\n*(Give your answer correct to 1 decimal place.)*\n\n${diagram}`,
          expectedAnswer: ans,
          keypad: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "⌫", "Clear"],
          steps: [
            `State the arc length formula: $$\\text{Arc length } s = \\frac{\\theta}{360^\\circ} \\times 2\\pi r$$`,
            `Substitute $s = ${s}\\text{ cm}$ and $r = ${r}\\text{ cm}$: $$${s} = \\frac{\\theta}{360} \\times 2\\pi (${r})$$`,
            `Solve for $\\theta$: $$\\theta = \\frac{${s} \\times 360}{2\\pi \\times ${r}} \\approx ${ans}^\\circ$$`
          ]
        };
      }
    }

    // TIER 3: ADVANCED (Level 3 Questions)
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Wire bent into sector of perimeter L
      const L = randInt(50, 100);
      const theta = randInt(95, 160);
      const rot = randInt(0, 280);

      const denom = 2 + (theta / 360) * 2 * Math.PI;
      const rVal = L / denom;
      const ans = Number(rVal.toPrecision(3)).toString();

      const rad1 = (rot * Math.PI) / 180;
      const rad2 = ((rot + theta) * Math.PI) / 180;
      const radMid = ((rot + theta / 2) * Math.PI) / 180;

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

      const diagram = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;"><path d="M ${px} ${py} A 70 70 0 0 0 ${qx} ${qy}" fill="none" stroke="#475569" stroke-width="3"/><line x1="130" y1="120" x2="${px}" y2="${py}" stroke="#475569" stroke-width="2"/><line x1="130" y1="120" x2="${qx}" y2="${qy}" stroke="#475569" stroke-width="2"/><path d="M ${arc1x} ${arc1y} A 22 22 0 0 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="130" cy="120" r="3" fill="#1e293b"/><circle cx="${px}" cy="${py}" r="3" fill="#2563eb"/><circle cx="${qx}" cy="${qy}" r="3" fill="#2563eb"/><text x="112" y="128" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${v1x}" y="${v1y}" font-family="sans-serif" font-size="14">P</text><text x="${v2x}" y="${v2y}" font-family="sans-serif" font-size="14">Q</text><text x="${rlbx}" y="${rlby}" font-family="sans-serif" font-size="13" font-style="italic" fill="#1e293b">r</text><text x="${lblx}" y="${lbly}" font-family="sans-serif" font-size="13" fill="#dc2626" text-anchor="middle">${theta}°</text></svg>`;

      return {
        strand: "Geometry & Measurement",
        tier: 3,
        tierName: "Advanced",
        skillTitle: "Arc Length (Degrees)",
        prompt: `A piece of wire $${L}\\text{ cm}$ long is bent to form sector $OPQ$ of a circle with centre $O$. The radius is $r\\text{ cm}$ and $\\angle POQ = ${theta}^\\circ$. Find the value of $r$.\n\n*(Give your answer correct to 3 significant figures.)*\n\n${diagram}`,
        expectedAnswer: ans,
        keypad: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "⌫", "Clear"],
        steps: [
          `Write the perimeter equation for the sector: $$\\text{Perimeter} = 2r + \\left(\\frac{\\theta}{360^\\circ} \\times 2\\pi r\\right) = ${L}$$`,
          `Substitute $\\theta = ${theta}^\\circ$ and total perimeter $= ${L}$: $$2r + \\left(\\frac{${theta}}{360} \\times 2\\pi r\\right) = ${L}$$`,
          `Factor out $r$: $$r \\left(2 + \\frac{${theta}}{360} \\times 2\\pi\\right) = ${L}$$`,
          `Solve for $r$: $$r = \\frac{${L}}{2 + \\frac{${theta}}{360} \\times 2\\pi} \\approx ${ans}\\text{ cm}$$`
        ]
      };
    } else {
      // Shaded perimeter with right triangle OPB inside sector OAB
      const a = randInt(5, 9);
      const b = randInt(6, 12);

      const rVal = Math.sqrt(a * a + b * b);
      const rRounded = Number(rVal.toPrecision(4));
      const thetaRad = Math.atan2(b, a);
      const thetaDeg = (thetaRad * 180) / Math.PI;
      const thetaRounded = Number(thetaDeg.toPrecision(3));

      const paVal = rVal - a;
      const paRounded = Number(paVal.toPrecision(3));

      const arcABVal = (thetaDeg / 360) * 2 * Math.PI * rVal;
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

      const diagram = `<svg width="260" height="220" viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;"><path d="M ${opPx} 170 L ${aX} 170 A 80 80 0 0 0 ${bX} ${bY} Z" fill="#cbd5e1" stroke="none"/><polygon points="80,170 ${opPx},170 ${bX},${bY}" fill="none" stroke="#334155" stroke-width="2"/><path d="M ${bX} ${bY} A 80 80 0 0 1 ${aX} 170" fill="none" stroke="#16a34a" stroke-width="3"/><line x1="80" y1="170" x2="${aX}" y2="170" stroke="#334155" stroke-width="2"/><polyline points="${opPx-8},170 ${opPx-8},${170-8} ${opPx},${170-8}" fill="none" stroke="#334155" stroke-width="1.5"/><path d="M ${arc1x} 170 A 22 22 0 0 0 ${arc2x} ${arc2y}" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="80" cy="170" r="3" fill="#1e293b"/><text x="65" y="175" font-family="sans-serif" font-size="14" font-style="italic">O</text><text x="${opPx}" y="202" font-family="sans-serif" font-size="14" text-anchor="middle">P</text><text x="${aX + 8}" y="175" font-family="sans-serif" font-size="14">A</text><text x="${bX}" y="${bY - 8}" font-family="sans-serif" font-size="14">B</text><text x="${(80 + opPx)/2}" y="188" font-family="sans-serif" font-size="13" fill="#1e293b" text-anchor="middle">${a}</text><text x="${bX + 8}" y="${(170 + bY)/2}" font-family="sans-serif" font-size="13" fill="#1e293b">${b}</text></svg>`;

      return {
        strand: "Geometry & Measurement",
        tier: 3,
        tierName: "Advanced",
        skillTitle: "Arc Length (Degrees)",
        prompt: `The diagram shows a sector $OAB$ of a circle with centre $O$. $P$ is the point on $OA$ such that $OP = ${a}\\text{ cm}$, $PB = ${b}\\text{ cm}$, and $\\angle OPB = 90^\\circ$.\n\nFind the perimeter of the shaded region.\n\n*(Give your answer correct to 3 significant figures.)*\n\n${diagram}`,
        expectedAnswer: ans,
        keypad: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "⌫", "Clear"],
        steps: [
          `Find the radius $OB$ of the circle using Pythagoras' theorem on $\\triangle OPB$: $$OB = \\sqrt{\\text{OP}^2 + \\text{PB}^2} = \\sqrt{${a}^2 + ${b}^2} = ${rRounded}\\text{ cm}$$`,
          `Find the central angle $\\angle AOB$: $$\\angle AOB = \\tan^{-1}\\left(\\frac{${b}}{${a}}\\right) \\approx ${thetaRounded}^\\circ$$`,
          `Find the length of segment $PA$: $$PA = OB - OP = ${rRounded} - ${a} = ${paRounded}\\text{ cm}$$`,
          `Calculate the arc length $AB$: $$\\text{Arc } AB = \\frac{${thetaRounded}}{360} \\times 2\\pi \\times ${rRounded} \\approx ${arcABRounded}\\text{ cm}$$`,
          `Sum the boundaries ($PA + PB + \\text{Arc } AB$) to find the total perimeter: $$\\begin{aligned} \\text{Shaded Perimeter} &= PA + PB + \\text{Arc } AB \\\\ &= ${paRounded} + ${b} + ${arcABRounded} \\approx ${ans}\\text{ cm}\\end{aligned}$$`
        ]
      };
    }
  }
};
