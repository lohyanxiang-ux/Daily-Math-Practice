/**
 * Question Generator: Sine Rule
 * Curriculum Skill: Sec 3 G3 - Geometry & Trigonometry
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(tier = 1) {
  const defaultKeypad = [
    "7", "8", "9", "4",
    "5", "6", "1", "2",
    "3", "0", ".", "⌫", "Clear"
  ];

  // =========================================================
  // TIER 1: BASIC (Level 1: Direct Side & Angle Calculations)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Sub-type A: Find side 'a' given side 'b', angle A, angle B
      const b = randInt(8, 25);
      const degA = randInt(30, 75);
      let degB = randInt(40, 80);
      while (degB === degA) {
        degB = randInt(40, 80);
      }

      const degC = 180 - degA - degB;
      const radA = (degA * Math.PI) / 180;
      const radB = (degB * Math.PI) / 180;
      const radC = (degC * Math.PI) / 180;

      const ansVal = Math.round(((b * Math.sin(radA)) / Math.sin(radB)) * 10) / 10;
      const ans = ansVal.toFixed(1);

      const step1 = `\\frac{a}{\\sin ${degA}^\\circ} = \\frac{${b}}{\\sin ${degB}^\\circ}`;
      const step2 = `a = \\frac{${b} \\times \\sin ${degA}^\\circ}{\\sin ${degB}^\\circ} \\approx ${ans}\\text{ cm}`;

      const c_draw = (160 * Math.sin(radC)) / Math.sin(radB);
      const bx_raw = c_draw * Math.cos(radA);
      const xmin = Math.min(0, bx_raw);
      const xmax = Math.max(160, bx_raw);
      const width = xmax - xmin;
      const height = c_draw * Math.sin(radA);
      const scale = Math.min(200 / width, 110 / height);

      const ax = Math.round(60 + (0 - xmin) * scale);
      const cx = Math.round(60 + (160 - xmin) * scale);
      const bx = Math.round(60 + (bx_raw - xmin) * scale);
      const ay = 170;
      const cy = 170;
      const by = Math.round(170 - height * scale);

      const label_b_x = Math.round((ax + cx) / 2);
      const label_a_x = Math.round((bx + cx) / 2 + 15);
      const label_a_y = Math.round((by + 170) / 2);

      const arcA_x = Math.round(ax + 22 * Math.cos(radA));
      const arcA_y = Math.round(170 - 22 * Math.sin(radA));
      const arcB1_x = Math.round(bx - 22 * Math.cos(radA));
      const arcB1_y = Math.round(by + 22 * Math.sin(radA));
      const arcB2_x = Math.round(bx + 22 * Math.cos(radC));
      const arcB2_y = Math.round(by + 22 * Math.sin(radC));

      const svgDiagram = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;'><polygon points='${ax},${ay} ${bx},${by} ${cx},${cy}' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M ${ax + 22} 170 A 22 22 0 0 0 ${arcA_x} ${arcA_y}' fill='none' stroke='#e63946' stroke-width='1.5'/><path d='M ${arcB1_x} ${arcB1_y} A 22 22 0 0 0 ${arcB2_x} ${arcB2_y}' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='${ax - 15}' y='${ay + 15}' font-size='14' font-weight='bold'>A</text><text x='${bx}' y='${by - 10}' font-size='14' font-weight='bold' text-anchor='middle'>B</text><text x='${cx + 10}' y='${cy + 15}' font-size='14' font-weight='bold'>C</text><text x='${label_b_x}' y='195' font-size='13' text-anchor='middle' fill='#1d3557'>b = ${b} cm</text><text x='${label_a_x}' y='${label_a_y}' font-size='13' fill='#e63946' font-weight='bold'>a = ?</text><text x='${ax + 28}' y='${ay - 5}' font-size='12' fill='#e63946'>${degA}°</text><text x='${bx}' y='${by + 25}' font-size='12' fill='#e63946' text-anchor='middle'>${degB}°</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Sine Rule",
        prompt: `${svgDiagram}\n\nIn $\\triangle ABC$, $b = ${b}\\text{ cm}$, $\\angle A = ${degA}^\\circ$, and $\\angle B = ${degB}^\\circ$.\n\nFind the length of side $a$.\n\n*(Give your answer correct to 1 decimal place.)*`,
        expectedAnswer: ans,
        keypad: defaultKeypad,
        steps: [
          `Apply the Sine Rule for sides: $$${step1}$$`,
          `Rearrange and evaluate: $$${step2}$$`
        ]
      };
    } else if (subType === 2) {
      // Sub-type B: Find acute angle A given sides a, b and angle B
      const b = randInt(12, 22);
      const degB = randInt(35, 60);
      const a = randInt(6, 11);

      const radB = (degB * Math.PI) / 180;
      const sinA = (a * Math.sin(radB)) / b;
      const radA = Math.asin(sinA);
      const degA = Math.round(((radA * 180) / Math.PI) * 10) / 10;
      const degC = 180 - degA - degB;
      const radC = (degC * Math.PI) / 180;

      const ans = degA.toFixed(1);
      const sinA_str = sinA.toFixed(4);

      const step1 = `\\frac{\\sin \\theta}{${a}} = \\frac{\\sin ${degB}^\\circ}{${b}}`;
      const step2 = `\\sin \\theta = \\frac{${a} \\times \\sin ${degB}^\\circ}{${b}} \\approx ${sinA_str}`;
      const step3 = `\\theta = \\sin^{-1}(${sinA_str}) \\approx ${ans}^\\circ`;

      const c_draw = (100 * Math.sin(radC)) / Math.sin(radA);
      const ax_raw = c_draw * Math.cos(radB);
      const xmin = Math.min(0, ax_raw);
      const xmax = Math.max(100, ax_raw);
      const width = xmax - xmin;
      const height = c_draw * Math.sin(radB);
      const scale = Math.min(200 / width, 110 / height);

      const bx = Math.round(60 + (0 - xmin) * scale);
      const cx = Math.round(60 + (100 - xmin) * scale);
      const ax = Math.round(60 + (ax_raw - xmin) * scale);
      const by = 170;
      const cy = 170;
      const ay = Math.round(170 - height * scale);

      const label_a_x = Math.round((bx + cx) / 2);
      const label_b_x = Math.round((ax + cx) / 2 + 15);
      const label_b_y = Math.round((ay + 170) / 2);

      const arcB_x = Math.round(bx + 22 * Math.cos(radB));
      const arcB_y = Math.round(170 - 22 * Math.sin(radB));
      const len_AB = Math.hypot(bx - ax, by - ay);
      const len_AC = Math.hypot(cx - ax, cy - ay);
      const arcA_bx = Math.round(ax + (22 * (bx - ax)) / len_AB);
      const arcA_by = Math.round(ay + (22 * (by - ay)) / len_AB);
      const arcA_cx = Math.round(ax + (22 * (cx - ax)) / len_AC);
      const arcA_cy = Math.round(ay + (22 * (cy - ay)) / len_AC);

      const svgDiagram = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;'><polygon points='${ax},${ay} ${bx},${by} ${cx},${cy}' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M ${bx + 22} 170 A 22 22 0 0 0 ${arcB_x} ${arcB_y}' fill='none' stroke='#e63946' stroke-width='1.5'/><path d='M ${arcA_bx} ${arcA_by} A 22 22 0 0 0 ${arcA_cx} ${arcA_cy}' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='${ax}' y='${ay - 10}' font-size='14' font-weight='bold' text-anchor='middle'>A</text><text x='${bx - 15}' y='${by + 15}' font-size='14' font-weight='bold'>B</text><text x='${cx + 10}' y='${cy + 15}' font-size='14' font-weight='bold'>C</text><text x='${label_a_x}' y='195' font-size='13' text-anchor='middle' fill='#1d3557'>a = ${a} cm</text><text x='${label_b_x}' y='${label_b_y}' font-size='13' fill='#1d3557'>b = ${b} cm</text><text x='${bx + 28}' y='${by - 5}' font-size='12' fill='#e63946'>${degB}°</text><text x='${ax}' y='${ay + 38}' font-size='13' fill='#e63946' font-weight='bold' text-anchor='middle'>θ = ?</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Sine Rule",
        prompt: `${svgDiagram}\n\nIn $\\triangle ABC$, $a = ${a}\\text{ cm}$, $b = ${b}\\text{ cm}$, and $\\angle B = ${degB}^\\circ$.\n\nFind the acute angle $\\theta = \\angle A$.\n\n*(Give your answer in degrees correct to 1 decimal place.)*`,
        expectedAnswer: ans,
        keypad: defaultKeypad,
        steps: [
          `Apply the Sine Rule for angles: $$${step1}$$`,
          `Solve for $\\sin \\theta$: $$${step2}$$`,
          `Take the inverse sine: $$${step3}$$`
        ]
      };
    } else {
      // Sub-type C: Find acute angle B given sides b, c and angle C
      const c = randInt(12, 22);
      const degC = randInt(35, 60);
      const b = randInt(6, 11);

      const radC = (degC * Math.PI) / 180;
      const sinB = (b * Math.sin(radC)) / c;
      const radB = Math.asin(sinB);
      const degB = Math.round(((radB * 180) / Math.PI) * 10) / 10;
      const degA = 180 - degB - degC;
      const radA = (degA * Math.PI) / 180;

      const ans = degB.toFixed(1);
      const sinB_str = sinB.toFixed(4);

      const step1 = `\\frac{\\sin \\theta}{${b}} = \\frac{\\sin ${degC}^\\circ}{${c}}`;
      const step2 = `\\sin \\theta = \\frac{${b} \\times \\sin ${degC}^\\circ}{${c}} \\approx ${sinB_str}`;
      const step3 = `\\theta = \\sin^{-1}(${sinB_str}) \\approx ${ans}^\\circ`;

      const a_draw = (100 * Math.sin(radA)) / Math.sin(radB);
      const bx_raw = a_draw * Math.cos(radC);
      const xmin = Math.min(0, bx_raw);
      const xmax = Math.max(100, bx_raw);
      const width = xmax - xmin;
      const height = a_draw * Math.sin(radC);
      const scale = Math.min(200 / width, 110 / height);

      const cx = Math.round(60 + (0 - xmin) * scale);
      const ax = Math.round(60 + (100 - xmin) * scale);
      const bx = Math.round(60 + (bx_raw - xmin) * scale);
      const cy = 170;
      const ay = 170;
      const by = Math.round(170 - height * scale);

      const label_b_x = Math.round((ax + cx) / 2);
      const label_c_x = Math.round((bx + ax) / 2 + 15);
      const label_c_y = Math.round((by + 170) / 2);

      const arcC_x = Math.round(cx + 22 * Math.cos(radC));
      const arcC_y = Math.round(170 - 22 * Math.sin(radC));
      const len_BA = Math.hypot(ax - bx, ay - by);
      const len_BC = Math.hypot(cx - bx, cy - by);
      const arcB_ax = Math.round(bx + (22 * (ax - bx)) / len_BA);
      const arcB_ay = Math.round(by + (22 * (ay - by)) / len_BA);
      const arcB_cx = Math.round(bx + (22 * (cx - bx)) / len_BC);
      const arcB_cy = Math.round(by + (22 * (cy - by)) / len_BC);

      const svgDiagram = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;'><polygon points='${ax},${ay} ${bx},${by} ${cx},${cy}' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M ${cx + 22} 170 A 22 22 0 0 0 ${arcC_x} ${arcC_y}' fill='none' stroke='#e63946' stroke-width='1.5'/><path d='M ${arcB_ax} ${arcB_ay} A 22 22 0 0 1 ${arcB_cx} ${arcB_cy}' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='${ax + 10}' y='${ay + 15}' font-size='14' font-weight='bold'>A</text><text x='${bx}' y='${by - 10}' font-size='14' font-weight='bold' text-anchor='middle'>B</text><text x='${cx - 15}' y='${cy + 15}' font-size='14' font-weight='bold'>C</text><text x='${label_b_x}' y='195' font-size='13' text-anchor='middle' fill='#1d3557'>b = ${b} cm</text><text x='${label_c_x}' y='${label_c_y}' font-size='13' fill='#1d3557'>c = ${c} cm</text><text x='${cx + 28}' y='${cy - 5}' font-size='12' fill='#e63946'>${degC}°</text><text x='${bx}' y='${by + 38}' font-size='13' fill='#e63946' font-weight='bold' text-anchor='middle'>θ = ?</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Sine Rule",
        prompt: `${svgDiagram}\n\nIn $\\triangle ABC$, $b = ${b}\\text{ cm}$, $c = ${c}\\text{ cm}$, and $\\angle C = ${degC}^\\circ$.\n\nFind the acute angle $\\theta = \\angle B$.\n\n*(Give your answer in degrees correct to 1 decimal place.)*`,
        expectedAnswer: ans,
        keypad: defaultKeypad,
        steps: [
          `Apply the Sine Rule for angles: $$${step1}$$`,
          `Solve for $\\sin \\theta$: $$${step2}$$`,
          `Take the inverse sine: $$${step3}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2: Obtuse Triangles & Perpendicular Height)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Sub-type A: Obtuse Triangle PQR (Find side PR)
      const c = randInt(10, 25);
      const degP = randInt(20, 50);
      const degQ = randInt(95, 120);

      const degR = 180 - degP - degQ;
      const radP = (degP * Math.PI) / 180;
      const radQ = (degQ * Math.PI) / 180;
      const radR = (degR * Math.PI) / 180;

      const ansVal = Math.round(((c * Math.sin(radQ)) / Math.sin(radR)) * 10) / 10;
      const ans = ansVal.toFixed(1);

      const step1 = `\\angle PRQ = 180^\\circ - ${degP}^\\circ - ${degQ}^\\circ = ${degR}^\\circ`;
      const step2 = `\\frac{PR}{\\sin ${degQ}^\\circ} = \\frac{${c}}{\\sin ${degR}^\\circ}`;
      const step3 = `PR = \\frac{${c} \\times \\sin ${degQ}^\\circ}{\\sin ${degR}^\\circ} \\approx ${ans}\\text{ cm}`;

      const pr_draw = (100 * Math.sin(radQ)) / Math.sin(radR);
      const rx_raw = pr_draw * Math.cos(radP);
      const xmin = Math.min(0, rx_raw);
      const xmax = Math.max(100, rx_raw);
      const width = xmax - xmin;
      const height = pr_draw * Math.sin(radP);
      const scale = Math.min(200 / width, 110 / height);

      const px = Math.round(60 + (0 - xmin) * scale);
      const qx = Math.round(60 + (100 - xmin) * scale);
      const rx = Math.round(60 + (rx_raw - xmin) * scale);
      const py = 170;
      const qy = 170;
      const ry = Math.round(170 - height * scale);

      const label_pr_x = Math.round((px + rx) / 2 - 15);
      const label_pr_y = Math.round((py + ry) / 2 - 5);

      const arcP_x = Math.round(px + 22 * Math.cos(radP));
      const arcP_y = Math.round(170 - 22 * Math.sin(radP));
      const len_QR = Math.hypot(rx - qx, ry - qy);
      const arcQ_px = qx - 22;
      const arcQ_rx = Math.round(qx + (22 * (rx - qx)) / len_QR);
      const arcQ_ry = Math.round(qy + (22 * (ry - qy)) / len_QR);

      const svgDiagram = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;'><polygon points='${px},${py} ${qx},${qy} ${rx},${ry}' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M ${px + 22} 170 A 22 22 0 0 0 ${arcP_x} ${arcP_y}' fill='none' stroke='#e63946' stroke-width='1.5'/><path d='M ${arcQ_px} 170 A 22 22 0 0 1 ${arcQ_rx} ${arcQ_ry}' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='${px - 15}' y='${py + 15}' font-size='14' font-weight='bold'>P</text><text x='${qx + 10}' y='${qy + 15}' font-size='14' font-weight='bold'>Q</text><text x='${rx}' y='${ry - 10}' font-size='14' font-weight='bold' text-anchor='middle'>R</text><text x='${Math.round((px + qx) / 2)}' y='195' font-size='13' text-anchor='middle' fill='#1d3557'>${c} cm</text><text x='${label_pr_x}' y='${label_pr_y}' font-size='13' fill='#e63946' font-weight='bold'>PR = ?</text><text x='${px + 28}' y='${py - 5}' font-size='12' fill='#e63946'>${degP}°</text><text x='${qx - 25}' y='${qy - 15}' font-size='12' fill='#e63946'>${degQ}°</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Sine Rule",
        prompt: `${svgDiagram}\n\nIn $\\triangle PQR$, $PQ = ${c}\\text{ cm}$, $\\angle QPR = ${degP}^\\circ$, and $\\angle PQR = ${degQ}^\\circ$.\n\nFind the length of $PR$.\n\n*(Give your answer correct to 1 decimal place.)*`,
        expectedAnswer: ans,
        keypad: defaultKeypad,
        steps: [
          `Find the third angle opposite $PQ$: $$${step1}$$`,
          `Set up the Sine Rule: $$${step2}$$`,
          `Calculate $PR$: $$${step3}$$`
        ]
      };
    } else {
      // Sub-type B: Perpendicular height AD in ABC
      const bc = randInt(18, 30);
      const degB = randInt(55, 75);
      const degC = randInt(35, 50);

      const degA = 180 - degB - degC;
      const radA = (degA * Math.PI) / 180;
      const radB = (degB * Math.PI) / 180;
      const radC = (degC * Math.PI) / 180;

      const acVal = (bc * Math.sin(radB)) / Math.sin(radA);
      const acStr = (Math.round(acVal * 100) / 100).toFixed(2);
      const adVal = Math.round(acVal * Math.sin(radC) * 10) / 10;
      const ans = adVal.toFixed(1);

      const step1 = `\\angle BAC = 180^\\circ - ${degB}^\\circ - ${degC}^\\circ = ${degA}^\\circ`;
      const step2 = `\\frac{AC}{\\sin ${degB}^\\circ} = \\frac{${bc}}{\\sin ${degA}^\\circ} \\implies AC \\approx ${acStr}\\text{ cm}`;
      const step3 = `AD = ${acStr} \\times \\sin ${degC}^\\circ \\approx ${ans}\\text{ cm}`;

      const ac_draw = (180 * Math.sin(radB)) / Math.sin(radA);
      const ax_raw = 180 - ac_draw * Math.cos(radC);
      const xmin = Math.min(0, ax_raw);
      const xmax = Math.max(180, ax_raw);
      const width = xmax - xmin;
      const height = ac_draw * Math.sin(radC);
      const scale = Math.min(200 / width, 110 / height);

      const bx = Math.round(60 + (0 - xmin) * scale);
      const cx = Math.round(60 + (180 - xmin) * scale);
      const ax = Math.round(60 + (ax_raw - xmin) * scale);
      const ay = Math.round(170 - height * scale);
      const label_ad_y = Math.round((ay + 170) / 2);

      const arcB_x = Math.round(bx + 22 * Math.cos(radB));
      const arcB_y = Math.round(170 - 22 * Math.sin(radB));
      const arcC_x = Math.round(cx - 22 * Math.cos(radC));
      const arcC_y = Math.round(170 - 22 * Math.sin(radC));

      const svgDiagram = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;'><polygon points='${ax},${ay} ${bx},170 ${cx},170' fill='none' stroke='#2b2b2b' stroke-width='2'/><line x1='${ax}' y1='${ay}' x2='${ax}' y2='170' stroke='#2b2b2b' stroke-width='1.5' stroke-dasharray='4,4'/><path d='M ${ax - 10} 170 L ${ax - 10} 160 L ${ax} 160' fill='none' stroke='#2b2b2b' stroke-width='1.2'/><path d='M ${bx + 22} 170 A 22 22 0 0 0 ${arcB_x} ${arcB_y}' fill='none' stroke='#e63946' stroke-width='1.5'/><path d='M ${cx - 22} 170 A 22 22 0 0 1 ${arcC_x} ${arcC_y}' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='${ax}' y='${ay - 10}' font-size='14' font-weight='bold' text-anchor='middle'>A</text><text x='${bx - 15}' y='185' font-size='14' font-weight='bold'>B</text><text x='${cx + 10}' y='185' font-size='14' font-weight='bold'>C</text><text x='${ax}' y='185' font-size='13' text-anchor='middle'>D</text><text x='160' y='205' font-size='13' text-anchor='middle' fill='#1d3557'>BC = ${bc} cm</text><text x='${ax + 8}' y='${label_ad_y}' font-size='13' fill='#e63946' font-weight='bold'>AD = ?</text><text x='${bx + 28}' y='165' font-size='12' fill='#e63946'>${degB}°</text><text x='${cx - 35}' y='165' font-size='12' fill='#e63946'>${degC}°</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Sine Rule",
        prompt: `${svgDiagram}\n\nIn $\\triangle ABC$, $BC = ${bc}\\text{ cm}$, $\\angle ABC = ${degB}^\\circ$, $\\angle ACB = ${degC}^\\circ$, and $AD \\perp BC$ with $D$ lying on $BC$.\n\nFind the perpendicular height $AD$.\n\n*(Give your answer correct to 1 decimal place.)*`,
        expectedAnswer: ans,
        keypad: defaultKeypad,
        steps: [
          `Find $\\angle BAC$ using the angle sum of a triangle: $$${step1}$$`,
          `Use Sine Rule to find side $AC$: $$${step2}$$`,
          `Calculate $AD$ using right-angled trigonometry $AD = AC \\sin C$: $$${step3}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3: Multi-Triangle & Composite Figures)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Sub-type A: Quadrilateral ABCD (Right triangle ABD + Triangle BCD)
    const ab = randInt(12, 20);
    const degABD = randInt(20, 35);
    const degCBD = randInt(40, 55);
    const degBCD = randInt(70, 85);

    const radABD = (degABD * Math.PI) / 180;
    const radCBD = (degCBD * Math.PI) / 180;
    const radBCD = (degBCD * Math.PI) / 180;
    const radBDC = ((180 - degCBD - degBCD) * Math.PI) / 180;

    const bdVal = ab / Math.cos(radABD);
    const bdStr = (Math.round(bdVal * 100) / 100).toFixed(2);
    const cdVal = Math.round(((bdVal * Math.sin(radCBD)) / Math.sin(radBCD)) * 10) / 10;
    const ans = cdVal.toFixed(1);

    const step1 = `BD = \\frac{AB}{\\cos ${degABD}^\\circ} = \\frac{${ab}}{\\cos ${degABD}^\\circ} \\approx ${bdStr}\\text{ cm}`;
    const step2 = `\\begin{aligned} \\frac{CD}{\\sin ${degCBD}^\\circ} &= \\frac{BD}{\\sin ${degBCD}^\\circ} \\\\ \\implies CD &= \\frac{${bdStr} \\times \\sin ${degCBD}^\\circ}{\\sin ${degBCD}^\\circ} \\end{aligned}`;
    const step3 = `CD \\approx ${ans}\\text{ cm}`;

    const ad_draw = 100 * Math.tan(radABD);
    const dx = Math.round(50 + ad_draw);
    const dy = 175;
    const bd_draw = 100 / Math.cos(radABD);
    const bc_draw = (bd_draw * Math.sin(radBDC)) / Math.sin(radBCD);
    const phi = ((90 - degABD - degCBD) * Math.PI) / 180;

    const cx = Math.round(50 + bc_draw * Math.cos(phi));
    const cy = Math.round(75 - bc_draw * Math.sin(phi));

    const label_cd_x = Math.round((cx + dx) / 2 + 15);
    const label_cd_y = Math.round((cy + dy) / 2);

    const arc1_x = Math.round(50 + 25 * Math.sin(radABD));
    const arc1_y = Math.round(75 + 25 * Math.cos(radABD));
    const arc2_dx = Math.round(50 + 35 * Math.sin(radABD));
    const arc2_dy = Math.round(75 + 35 * Math.cos(radABD));
    const arc2_cx = Math.round(50 + 35 * Math.cos(phi));
    const arc2_cy = Math.round(75 - 35 * Math.sin(phi));

    const cd_len = Math.hypot(dx - cx, 175 - cy);
    const arc3_bx = Math.round(cx - 20 * Math.cos(phi));
    const arc3_by = Math.round(cy + 20 * Math.sin(phi));
    const arc3_dx = Math.round(cx + (20 * (dx - cx)) / cd_len);
    const arc3_dy = Math.round(cy + (20 * (175 - cy)) / cd_len);

    const lbl1_x = Math.round(50 + 38 * Math.sin(radABD / 2));
    const lbl1_y = Math.round(75 + 38 * Math.cos(radABD / 2));
    const lbl2_x = Math.round(50 + 52 * Math.sin(radABD + radCBD / 2));
    const lbl2_y = Math.round(75 + 52 * Math.cos(radABD + radCBD / 2));

    const ang_CB = Math.atan2(75 - cy, 50 - cx);
    const ang_CD = Math.atan2(175 - cy, dx - cx);
    const bis3 = (ang_CB + ang_CD) / 2;
    const lbl3_x = Math.round(cx + 36 * Math.cos(bis3));
    const lbl3_y = Math.round(cy + 36 * Math.sin(bis3));

    const svgDiagram = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;'><polygon points='50,175 50,75 ${cx},${cy} ${dx},175' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M 50,75 L ${dx},175' stroke='#2b2b2b' stroke-width='1.5' stroke-dasharray='4,4'/><rect x='50' y='160' width='15' height='15' fill='none' stroke='#2b2b2b' stroke-width='1.2'/><path d='M 50,100 A 25 25 0 0 0 ${arc1_x},${arc1_y}' fill='none' stroke='#e63946' stroke-width='1.2'/><path d='M ${arc2_dx},${arc2_dy} A 35 35 0 0 0 ${arc2_cx},${arc2_cy}' fill='none' stroke='#e63946' stroke-width='1.2'/><path d='M ${arc3_bx},${arc3_by} A 20 20 0 0 0 ${arc3_dx},${arc3_dy}' fill='none' stroke='#e63946' stroke-width='1.2'/><text x='35' y='185' font-size='14' font-weight='bold'>A</text><text x='35' y='70' font-size='14' font-weight='bold'>B</text><text x='${cx + 10}' y='${cy}' font-size='14' font-weight='bold'>C</text><text x='${dx + 10}' y='185' font-size='14' font-weight='bold'>D</text><text x='20' y='130' font-size='13' fill='#1d3557'>${ab} cm</text><text x='${label_cd_x}' y='${label_cd_y}' font-size='13' fill='#e63946' font-weight='bold'>CD = ?</text><text x='${lbl1_x}' y='${lbl1_y}' font-size='11' fill='#e63946' text-anchor='middle'>${degABD}°</text><text x='${lbl2_x}' y='${lbl2_y}' font-size='11' fill='#e63946' text-anchor='middle'>${degCBD}°</text><text x='${lbl3_x}' y='${lbl3_y}' font-size='11' fill='#e63946' text-anchor='middle'>${degBCD}°</text></svg>`;

    return {
      strand: "Geometry & Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Sine Rule",
      prompt: `${svgDiagram}\n\nIn quadrilateral $ABCD$, $AB = ${ab}\\text{ cm}$, $\\angle DAB = 90^\\circ$, $\\angle ABD = ${degABD}^\\circ$, $\\angle CBD = ${degCBD}^\\circ$, and $\\angle BCD = ${degBCD}^\\circ$.\n\nFind the length of $CD$.\n\n*(Give your answer correct to 1 decimal place.)*`,
      expectedAnswer: ans,
      keypad: defaultKeypad,
      steps: [
        `In right-angled $\\triangle ABD$, calculate length $BD$: $$${step1}$$`,
        `In $\\triangle BCD$, apply the Sine Rule: $$${step2}$$`,
        `Evaluate $CD$: $$${step3}$$`
      ]
    };
  } else {
    // Sub-type B: Point C lies on BD (Right triangle ABD with internal secant AC)
    const cd = randInt(8, 14);
    const ac = randInt(18, 25);
    const degADB = randInt(40, 52);

    const radADB = (degADB * Math.PI) / 180;
    const sinCAD = (cd * Math.sin(radADB)) / ac;
    const radCAD = Math.asin(sinCAD);
    const degCAD = (radCAD * 180) / Math.PI;
    const degACD = 180 - degADB - degCAD;
    const degACB = Math.round((180 - degACD) * 10) / 10;
    const ans = degACB.toFixed(1);

    const degCAD_str = degCAD.toFixed(1);
    const degACD_str = degACD.toFixed(1);

    const step1 = `\\begin{aligned} \\frac{\\sin \\angle CAD}{${cd}} &= \\frac{\\sin ${degADB}^\\circ}{${ac}} \\\\ \\implies \\angle CAD &\\approx ${degCAD_str}^\\circ \\end{aligned}`;
    const step2 = `\\angle ACD = 180^\\circ - ${degADB}^\\circ - ${degCAD_str}^\\circ = ${degACD_str}^\\circ`;
    const step3 = `\\begin{aligned} \\angle ACB &= 180^\\circ - \\angle ACD \\\\ &= 180^\\circ - ${degACD_str}^\\circ = ${ans}^\\circ \\end{aligned}`;

    const cd_ratio = cd / (cd + (ac * Math.sin(radCAD)) / Math.sin(radADB));
    const cx = Math.round(260 - 210 * cd_ratio);

    const arcD_x = Math.round(260 - 22 * Math.cos(Math.atan2(110, 210)));
    const arcD_y = Math.round(175 - 22 * Math.sin(Math.atan2(110, 210)));
    const arcC_x = Math.round(cx + 20 * Math.cos(Math.atan2(-110, 50 - cx)));
    const arcC_y = Math.round(175 + 20 * Math.sin(Math.atan2(-110, 50 - cx)));

    const svgDiagram = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg' style='background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:12px 0;'><polygon points='50,65 50,175 260,175' fill='none' stroke='#2b2b2b' stroke-width='2'/><line x1='50' y1='65' x2='${cx}' y2='175' stroke='#2b2b2b' stroke-width='2'/><rect x='50' y='160' width='15' height='15' fill='none' stroke='#2b2b2b' stroke-width='1.2'/><path d='M 238 175 A 22 22 0 0 1 ${arcD_x} ${arcD_y}' fill='none' stroke='#e63946' stroke-width='1.5'/><path d='M ${cx - 20} 175 A 20 20 0 0 1 ${arcC_x} ${arcC_y}' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='35' y='60' font-size='14' font-weight='bold'>A</text><text x='35' y='190' font-size='14' font-weight='bold'>B</text><text x='${cx}' y='190' font-size='14' font-weight='bold' text-anchor='middle'>C</text><text x='270' y='190' font-size='14' font-weight='bold'>D</text><text x='${Math.round((cx + 260) / 2)}' y='195' font-size='13' text-anchor='middle' fill='#1d3557'>${cd} cm</text><text x='${Math.round((50 + cx) / 2 - 15)}' y='${Math.round((65 + 175) / 2)}' font-size='13' fill='#1d3557'>AC = ${ac} cm</text><text x='220' y='170' font-size='12' fill='#e63946'>${degADB}°</text><text x='${cx - 24}' y='155' font-size='12' fill='#e63946' font-weight='bold' text-anchor='end'>∠ACB = ?</text></svg>`;

    return {
      strand: "Geometry & Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Sine Rule",
      prompt: `${svgDiagram}\n\nIn $\\triangle ABD$, point $C$ lies on $BD$ such that $CD = ${cd}\\text{ cm}$ and $AC = ${ac}\\text{ cm}$. Given that $\\angle ADB = ${degADB}^\\circ$ and $\\angle ABD = 90^\\circ$, find $\\angle ACB$.\n\n*(Give your answer in degrees correct to 1 decimal place.)*`,
      expectedAnswer: ans,
      keypad: defaultKeypad,
      steps: [
        `In $\\triangle ACD$, apply the Sine Rule to find $\\angle CAD$: $$${step1}$$`,
        `Calculate $\\angle ACD$ using sum of angles in $\\triangle ACD$: $$${step2}$$`,
        `Find supplementary angle $\\angle ACB$: $$${step3}$$`
      ]
    };
  }
}

export const sineRule = { generate: generateQuestion };
export default generateQuestion;
