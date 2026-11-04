/**
 * Question Generator: Cosine Rule
 * Curriculum Skill: Sec 3 G3 - Geometry & Trigonometry
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Direct Side Length & Angle Calculation)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Find side x given 2 sides and included acute angle A
      const b = randInt(6, 12);
      const c = randInt(10, 16);
      const degA = randInt(35, 75);

      const radA = (degA * Math.PI) / 180;
      const x2 = b * b + c * c - 2 * b * c * Math.cos(radA);
      const xVal = Math.sqrt(x2);
      const ansVal = Math.round(xVal * 10) / 10;
      const ans = ansVal.toFixed(1);
      const x2_str = x2.toFixed(2);

      const step1 = `x^2 = ${b}^2 + ${c}^2 - 2(${b})(${c})\\cos ${degA}^\\circ`;
      const step2 = `x^2 \\approx ${x2_str}`;
      const step3 = `x = \\sqrt{${x2_str}} \\approx ${ans}\\text{ cm}`;

      const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='60,170 240,170 130,60' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M 82 170 A 22 22 0 0 0 71 150' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='45' y='185' font-size='14' font-weight='bold'>A</text><text x='250' y='185' font-size='14' font-weight='bold'>B</text><text x='130' y='48' font-size='14' font-weight='bold' text-anchor='middle'>C</text><text x='150' y='192' font-size='13' text-anchor='middle' fill='#1d3557'>c = ${c} cm</text><text x='82' y='110' font-size='13' fill='#1d3557' text-anchor='end'>b = ${b} cm</text><text x='195' y='110' font-size='13' fill='#e63946' font-weight='bold'>x = ?</text><text x='92' y='162' font-size='12' fill='#e63946'>${degA}°</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Cosine Rule",
        prompt: `In $\\triangle ABC$, $AC = ${b}\\text{ cm}$, $AB = ${c}\\text{ cm}$, and $\\angle A = ${degA}^\\circ$.\n\nFind the unknown side length $x = BC$. (Give your answer correct to 1 decimal place.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Apply the Cosine Rule for side $x$: $$${step1}$$`,
          `Simplify the right-hand side: $$${step2}$$`,
          `Take the square root to evaluate $x$: $$${step3}$$`
        ]
      };
    } else {
      // Find angle θ given 3 sides
      const b = randInt(7, 10);
      const c = randInt(9, 12);
      const a = randInt(8, 11);

      const num = b * b + c * c - a * a;
      const den = 2 * b * c;
      const cosA = num / den;
      const radA = Math.acos(cosA);
      const degA = Math.round((radA * 180) / Math.PI * 10) / 10;
      const ans = degA.toFixed(1);
      const cosA_str = cosA.toFixed(4);

      const step1 = `\\cos \\theta = \\frac{${b}^2 + ${c}^2 - ${a}^2}{2(${b})(${c})}`;
      const step2 = `\\cos \\theta = \\frac{${num}}{${den}} \\approx ${cosA_str}`;
      const step3 = `\\theta = \\cos^{-1}(${cosA_str}) \\approx ${ans}^\\circ`;

      const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='60,170 240,170 130,60' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M 82 170 A 22 22 0 0 0 71 150' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='45' y='185' font-size='14' font-weight='bold'>A</text><text x='250' y='185' font-size='14' font-weight='bold'>B</text><text x='130' y='48' font-size='14' font-weight='bold' text-anchor='middle'>C</text><text x='150' y='192' font-size='13' text-anchor='middle' fill='#1d3557'>c = ${c} cm</text><text x='82' y='110' font-size='13' fill='#1d3557' text-anchor='end'>b = ${b} cm</text><text x='195' y='110' font-size='13' fill='#1d3557'>a = ${a} cm</text><text x='92' y='162' font-size='12' fill='#e63946' font-weight='bold'>θ = ?</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Cosine Rule",
        prompt: `In $\\triangle ABC$, $AC = ${b}\\text{ cm}$, $AB = ${c}\\text{ cm}$, and $BC = ${a}\\text{ cm}$.\n\nFind the value of angle $\\theta = \\angle A$. (Give your answer in degrees correct to 1 decimal place.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Apply the Cosine Rule rearranged for angle $\\theta$: $$${step1}$$`,
          `Evaluate the ratio for $\\cos \\theta$: $$${step2}$$`,
          `Take the inverse cosine: $$${step3}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Obtuse Angle & 2-Step Quadrilateral)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Find side x with an obtuse angle
      const a = randInt(6, 12);
      const b = randInt(9, 15);
      const degQ = randInt(95, 125);

      const radQ = (degQ * Math.PI) / 180;
      const x2 = a * a + b * b - 2 * a * b * Math.cos(radQ);
      const xVal = Math.sqrt(x2);
      const ansVal = Math.round(xVal * 10) / 10;
      const ans = ansVal.toFixed(1);
      const x2_str = x2.toFixed(2);

      const step1 = `x^2 = ${a}^2 + ${b}^2 - 2(${a})(${b})\\cos ${degQ}^\\circ`;
      const step2 = `x^2 \\approx ${x2_str}`;
      const step3 = `x = \\sqrt{${x2_str}} \\approx ${ans}\\text{ cm}`;

      const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='40,140 140,180 270,70' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M 120 172 A 20 20 0 0 1 155 167' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='25' y='145' font-size='14' font-weight='bold'>P</text><text x='140' y='200' font-size='14' font-weight='bold' text-anchor='middle'>Q</text><text x='280' y='70' font-size='14' font-weight='bold'>R</text><text x='80' y='175' font-size='13' fill='#1d3557'>${a} cm</text><text x='215' y='140' font-size='13' fill='#1d3557'>${b} cm</text><text x='150' y='95' font-size='13' fill='#e63946' font-weight='bold'>x = ?</text><text x='140' y='160' font-size='12' fill='#e63946' text-anchor='middle'>${degQ}°</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Cosine Rule",
        prompt: `In $\\triangle PQR$, $PQ = ${a}\\text{ cm}$, $QR = ${b}\\text{ cm}$, and obtuse angle $\\angle Q = ${degQ}^\\circ$.\n\nFind the length of side $x = PR$. (Give your answer correct to 1 decimal place.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `Apply the Cosine Rule in $\\triangle PQR$: $$${step1}$$`,
          `Evaluate $x^2$: $$${step2}$$`,
          `Calculate side $x$: $$${step3}$$`
        ]
      };
    } else {
      // Quadrilateral angle calculation via shared diagonal BD
      const ab = randInt(5, 8);
      const da = randInt(4, 6);
      const degA = randInt(100, 115);
      const bc = randInt(6, 9);
      const cd = randInt(7, 10);

      const radA = (degA * Math.PI) / 180;
      const bd2 = ab * ab + da * da - 2 * ab * da * Math.cos(radA);
      const bd = Math.sqrt(bd2);
      const bd_str = bd.toFixed(2);

      const cosC = (bc * bc + cd * cd - bd2) / (2 * bc * cd);
      const radC = Math.acos(cosC);
      const degC = Math.round((radC * 180) / Math.PI * 10) / 10;
      const ans = degC.toFixed(1);
      const cosC_str = cosC.toFixed(4);

      const step1 = `\\begin{aligned} BD^2 &= ${ab}^2 + ${da}^2 - 2(${ab})(${da})\\cos ${degA}^\\circ \\\\ BD &\\approx ${bd_str}\\text{ cm}\\end{aligned}`;
      const step2 = `\\begin{aligned} \\cos \\angle BCD &= \\frac{${bc}^2 + ${cd}^2 - ${bd_str}^2}{2(${bc})(${cd})} \\\\ &\\approx ${cosC_str}\\end{aligned}`;
      const step3 = `\\angle BCD = \\cos^{-1}(${cosC_str}) \\approx ${ans}^\\circ`;

      const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='80,170 200,170 240,60 60,80' fill='none' stroke='#2b2b2b' stroke-width='2'/><line x1='60' y1='80' x2='200' y2='170' stroke='#2b2b2b' stroke-width='1.5' stroke-dasharray='4,4'/><path d='M 95 170 A 20 20 0 0 0 70 150' fill='none' stroke='#e63946' stroke-width='1.5'/><path d='M 220 62 A 20 20 0 0 0 233 79' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='70' y='190' font-size='14' font-weight='bold'>A</text><text x='210' y='185' font-size='14' font-weight='bold'>B</text><text x='245' y='55' font-size='14' font-weight='bold'>C</text><text x='45' y='80' font-size='14' font-weight='bold'>D</text><text x='140' y='190' font-size='13' text-anchor='middle' fill='#1d3557'>${ab} cm</text><text x='58' y='130' font-size='13' fill='#1d3557' text-anchor='end'>${da} cm</text><text x='230' y='125' font-size='13' fill='#1d3557'>${bc} cm</text><text x='150' y='62' font-size='13' fill='#1d3557'>${cd} cm</text><text x='92' y='155' font-size='12' fill='#e63946'>${degA}°</text><text x='208' y='82' font-size='13' font-weight='bold' fill='#e63946'>?</text></svg>`;

      return {
        strand: "Geometry & Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Cosine Rule",
        prompt: `In quadrilateral $ABCD$, $AB = ${ab}\\text{ cm}$, $BC = ${bc}\\text{ cm}$, $CD = ${cd}\\text{ cm}$, $DA = ${da}\\text{ cm}$, and $\\angle BAD = ${degA}^\\circ$.\n\nFind $\\angle BCD$. (Give your answer in degrees correct to 1 decimal place.)`,
        diagramSvg: svg,
        expectedAnswer: ans,
        steps: [
          `In $\\triangle ABD$, apply the Cosine Rule to find length $BD$: $$${step1}$$`,
          `In $\\triangle BCD$, apply the Cosine Rule to set up $\\cos \\angle BCD$: $$${step2}$$`,
          `Solve for angle $\\angle BCD$: $$${step3}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Multi-Step Quadrilateral Perimeter)
  // =========================================================
  const ab = randInt(4, 8);
  const da = randInt(3, 6);
  const degA = randInt(70, 95);
  const bc = randInt(5, 9);
  const degCBD = randInt(25, 45);

  const radA = (degA * Math.PI) / 180;
  const bd2 = ab * ab + da * da - 2 * ab * da * Math.cos(radA);
  const bd = Math.sqrt(bd2);
  const bd_str = bd.toFixed(2);

  const radCBD = (degCBD * Math.PI) / 180;
  const cd2 = bd2 + bc * bc - 2 * bd * bc * Math.cos(radCBD);
  const cd = Math.sqrt(cd2);
  const cd_str = cd.toFixed(2);

  const perimVal = Math.round((ab + bc + cd + da) * 10) / 10;
  const ans = perimVal.toFixed(1);

  const step1 = `\\begin{aligned} BD^2 &= ${ab}^2 + ${da}^2 - 2(${ab})(${da})\\cos ${degA}^\\circ \\\\ BD &\\approx ${bd_str}\\text{ cm}\\end{aligned}`;
  const step2 = `\\begin{aligned} CD^2 &= ${bd_str}^2 + ${bc}^2 - 2(${bd_str})(${bc})\\cos ${degCBD}^\\circ \\\\ CD &\\approx ${cd_str}\\text{ cm}\\end{aligned}`;
  const step3 = `\\begin{aligned} \\text{Perimeter} &= ${ab} + ${bc} + ${cd_str} + ${da} \\\\ &\\approx ${ans}\\text{ cm}\\end{aligned}`;

  const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='60,170 180,170 250,60 100,70' fill='none' stroke='#2b2b2b' stroke-width='2'/><line x1='100' y1='70' x2='180' y2='170' stroke='#2b2b2b' stroke-width='1.5' stroke-dasharray='4,4'/><path d='M 78 170 A 18 18 0 0 0 68 152' fill='none' stroke='#e63946' stroke-width='1.5'/><path d='M 167 154 A 20 20 0 0 1 191 153' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='50' y='190' font-size='14' font-weight='bold'>A</text><text x='190' y='185' font-size='14' font-weight='bold'>B</text><text x='255' y='55' font-size='14' font-weight='bold'>C</text><text x='85' y='68' font-size='14' font-weight='bold'>D</text><text x='120' y='190' font-size='13' text-anchor='middle' fill='#1d3557'>${ab} cm</text><text x='68' y='120' font-size='13' fill='#1d3557' text-anchor='end'>${da} cm</text><text x='225' y='120' font-size='13' fill='#1d3557'>${bc} cm</text><text x='80' y='160' font-size='12' fill='#e63946'>${degA}°</text><text x='176' y='132' font-size='12' fill='#e63946' text-anchor='middle'>${degCBD}°</text></svg>`;

  return {
    strand: "Geometry & Trigonometry",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Cosine Rule",
    prompt: `In quadrilateral $ABCD$, $AB = ${ab}\\text{ cm}$, $DA = ${da}\\text{ cm}$, $BC = ${bc}\\text{ cm}$, $\\angle BAD = ${degA}^\\circ$, and $\\angle CBD = ${degCBD}^\\circ$.\n\nFind the perimeter of quadrilateral $ABCD$. (Give your answer correct to 1 decimal place.)`,
    diagramSvg: svg,
    expectedAnswer: ans,
    steps: [
      `In $\\triangle ABD$, calculate diagonal distance $BD$: $$${step1}$$`,
      `In $\\triangle BCD$, calculate side $CD$: $$${step2}$$`,
      `Add all four sides to find the perimeter: $$${step3}$$`
    ]
  };
}

export const cosineRule = { generate: generateQuestion };
export default generateQuestion;
