/**
 * Question Generator: Pythagoras' Theorem
 * Curriculum Skill: Sec 3 G3 - Geometry & Measurement
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Direct Right-Angled Triangles)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Structure 1: Calculate Hypotenuse BC
      const a = randInt(3, 15);
      const b = randInt(3, 15);

      const a2 = a * a;
      const b2 = b * b;
      const c2 = a2 + b2;
      const sqrt_c2 = Math.sqrt(c2);

      const ans = sqrt_c2 % 1 === 0 ? sqrt_c2.toString() : parseFloat(sqrt_c2.toPrecision(3)).toString();
      const step3_text = sqrt_c2 % 1 === 0 
        ? `BC = \\sqrt{${c2}} = ${sqrt_c2}\\text{ cm}` 
        : `BC = \\sqrt{${c2}} \\approx ${parseFloat(sqrt_c2.toPrecision(3))}\\text{ cm (to 3 s.f.)}`;

      const svg = `<svg viewBox='0 0 240 160' width='100%' height='auto' style='max-width:250px; display:block; margin:10px auto;'><polygon points='60,130 190,130 60,30' fill='none' stroke='#2b5b84' stroke-width='2'/><polyline points='60,120 70,120 70,130' fill='none' stroke='#333' stroke-width='1.5'/><text x='45' y='145' font-size='14' font-family='sans-serif' fill='#333'>A</text><text x='195' y='145' font-size='14' font-family='sans-serif' fill='#333'>B</text><text x='55' y='20' font-size='14' font-family='sans-serif' fill='#333'>C</text><text x='50' y='85' font-size='13' font-family='sans-serif' fill='#000' text-anchor='end'>${a} cm</text><text x='125' y='148' font-size='13' font-family='sans-serif' fill='#000' text-anchor='middle'>${b} cm</text></svg>`;

      return {
        strand: "Geometry & Measurement",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Pythagoras' Theorem",
        prompt: `${svg}\n\nIn right-angled triangle $ABC$, $AC = ${a}\\text{ cm}$ and $AB = ${b}\\text{ cm}$. Calculate the length of side $BC$.`,
        inputCount: 1,
        inputLabels: ["BC ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Apply Pythagoras' Theorem:\n\n$$BC^2 = AC^2 + AB^2$$`,
          `Substitute the given values:\n\n$$BC^2 = ${a}^2 + ${b}^2 = ${a2} + ${b2} = ${c2}$$`,
          `Take the square root to find $BC$:\n\n$$${step3_text}$$`
        ]
      };
    } else {
      // Structure 2: Calculate Leg XY
      const b = randInt(4, 15);
      const diff = randInt(2, 10);
      const c = b + diff;

      const b2 = b * b;
      const c2 = c * c;
      const a2 = c2 - b2;
      const sqrt_a2 = Math.sqrt(a2);

      const ans = sqrt_a2 % 1 === 0 ? sqrt_a2.toString() : parseFloat(sqrt_a2.toPrecision(3)).toString();
      const step3_text = sqrt_a2 % 1 === 0 
        ? `XY = \\sqrt{${a2}} = ${sqrt_a2}\\text{ cm}` 
        : `XY = \\sqrt{${a2}} \\approx ${parseFloat(sqrt_a2.toPrecision(3))}\\text{ cm (to 3 s.f.)}`;

      const svg = `<svg viewBox='0 0 240 160' width='100%' height='auto' style='max-width:250px; display:block; margin:10px auto;'><polygon points='40,130 180,130 180,30' fill='none' stroke='#2b5b84' stroke-width='2'/><polyline points='170,130 170,120 180,120' fill='none' stroke='#333' stroke-width='1.5'/><text x='25' y='135' font-size='14' font-family='sans-serif' fill='#333'>X</text><text x='188' y='135' font-size='14' font-family='sans-serif' fill='#333'>Y</text><text x='185' y='25' font-size='14' font-family='sans-serif' fill='#333'>Z</text><text x='188' y='85' font-size='13' font-family='sans-serif' fill='#000' text-anchor='start'>${b} cm</text><text x='105' y='75' font-size='13' font-family='sans-serif' fill='#000' text-anchor='end'>${c} cm</text></svg>`;

      return {
        strand: "Geometry & Measurement",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Pythagoras' Theorem",
        prompt: `${svg}\n\nIn right-angled triangle $XYZ$, $XZ = ${c}\\text{ cm}$ and $YZ = ${b}\\text{ cm}$. Calculate the length of side $XY$.`,
        inputCount: 1,
        inputLabels: ["XY ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Rearrange Pythagoras' Theorem to solve for side $XY$:\n\n$$XY^2 = XZ^2 - YZ^2$$`,
          `Substitute the given values:\n\n$$XY^2 = ${c}^2 - ${b}^2 = ${c2} - ${b2} = ${a2}$$`,
          `Take the square root to find $XY$:\n\n$$${step3_text}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Multi-Step Right Triangles)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Structure 1: Compound Triangles BAD and BDC
      const k = randInt(1, 4);
      const a = 3 * k;
      const b = 4 * k;
      const c = 12 * k;

      const bd_sq = a * a + b * b;
      const bd = 5 * k;
      const bc_sq = bd_sq + c * c;
      const bc = 13 * k;
      const ans = bc.toString();

      const svg = `<svg viewBox='0 0 240 180' width='100%' height='auto' style='max-width:250px; display:block; margin:10px auto;'><polygon points='50,150 190,150 50,90' fill='none' stroke='#2b5b84' stroke-width='2'/><line x1='50' y1='90' x2='80' y2='20' stroke='#2b5b84' stroke-width='2'/><line x1='190' y1='150' x2='80' y2='20' stroke='#2b5b84' stroke-width='2'/><polyline points='50,140 60,140 60,150' fill='none' stroke='#333' stroke-width='1.5'/><path d='M 59.2,93.9 L 63.1,84.7 L 53.9,80.8' fill='none' stroke='#333' stroke-width='1.5'/><text x='35' y='155' font-size='14' font-family='sans-serif' fill='#333'>A</text><text x='198' y='155' font-size='14' font-family='sans-serif' fill='#333'>B</text><text x='80' y='18' font-size='14' font-family='sans-serif' fill='#333'>C</text><text x='32' y='95' font-size='14' font-family='sans-serif' fill='#333'>D</text><text x='120' y='165' font-size='13' font-family='sans-serif' fill='#000' text-anchor='middle'>${a} cm</text><text x='42' y='125' font-size='13' font-family='sans-serif' fill='#000' text-anchor='end'>${b} cm</text><text x='58' y='52' font-size='13' font-family='sans-serif' fill='#000' text-anchor='end'>${c} cm</text></svg>`;

      return {
        strand: "Geometry & Measurement",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Pythagoras' Theorem",
        prompt: `${svg}\n\nIn the diagram, $\\angle BAD = \\angle BDC = 90^\\circ$. Given $AB = ${a}\\text{ cm}$, $AD = ${b}\\text{ cm}$, and $CD = ${c}\\text{ cm}$, find the length of $BC$.`,
        inputCount: 1,
        inputLabels: ["BC ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Find $BD$ using right-angled triangle $BAD$:\n\n$$BD^2 = AB^2 + AD^2 = ${a}^2 + ${b}^2 = ${bd_sq}$$\n\n$$BD = \\sqrt{${bd_sq}} = ${bd}\\text{ cm}$$`,
          `Apply Pythagoras' Theorem in right-angled triangle $BDC$:\n\n$$BC^2 = BD^2 + CD^2 = ${bd}^2 + ${c}^2 = ${bc_sq}$$`,
          `Take the square root to find $BC$:\n\n$$BC = \\sqrt{${bc_sq}} = ${bc}\\text{ cm}$$`
        ]
      };
    } else {
      // Structure 2: Altitude split triangle PQR
      const k = randInt(1, 4);
      const p = 5 * k;
      const r = 16 * k;
      const h = 12 * k;

      const r_sq = r * r;
      const h_sq = h * h;
      const rq_sq = r_sq + h_sq;
      const rq = 20 * k;
      const ans = rq.toString();

      const svg = `<svg viewBox='0 0 250 160' width='100%' height='auto' style='max-width:260px; display:block; margin:10px auto;'><polygon points='30,40 220,40 90,130' fill='none' stroke='#2b5b84' stroke-width='2'/><line x1='90' y1='40' x2='90' y2='130' stroke='#2b5b84' stroke-width='2'/><polyline points='90,50 100,50 100,40' fill='none' stroke='#333' stroke-width='1.5'/><text x='15' y='42' font-size='14' font-family='sans-serif' fill='#333'>P</text><text x='88' y='25' font-size='14' font-family='sans-serif' fill='#333'>S</text><text x='228' y='42' font-size='14' font-family='sans-serif' fill='#333'>R</text><text x='88' y='148' font-size='14' font-family='sans-serif' fill='#333'>Q</text><text x='60' y='28' font-size='13' font-family='sans-serif' fill='#000' text-anchor='middle'>${p} cm</text><text x='155' y='28' font-size='13' font-family='sans-serif' fill='#000' text-anchor='middle'>${r} cm</text><text x='98' y='90' font-size='13' font-family='sans-serif' fill='#000' text-anchor='start'>${h} cm</text></svg>`;

      return {
        strand: "Geometry & Measurement",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Pythagoras' Theorem",
        prompt: `${svg}\n\nIn the diagram, $QS$ is perpendicular to $PR$. Given $PS = ${p}\\text{ cm}$, $RS = ${r}\\text{ cm}$, and $QS = ${h}\\text{ cm}$, find the length of $RQ$.`,
        inputCount: 1,
        inputLabels: ["RQ ="],
        expectedAnswer: ans,
        displayAnswer: ans,
        steps: [
          `Identify the right-angled triangle $RSQ$ containing side $RQ$:\n\n$$RQ^2 = RS^2 + QS^2$$`,
          `Substitute the known values:\n\n$$RQ^2 = ${r}^2 + ${h}^2 = ${r_sq} + ${h_sq} = ${rq_sq}$$`,
          `Take the square root to find $RQ$:\n\n$$RQ = \\sqrt{${rq_sq}} = ${rq}\\text{ cm}$$`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Perpendicular Altitude via Area Method)
  // =========================================================
  const k = randInt(1, 4);
  const a = 15 * k;
  const b = 20 * k;
  const c = 25 * k;
  const cd = 12 * k;

  const area = 0.5 * a * b;
  const c_sq = a * a + b * b;
  const ans = cd.toString();

  const svg = `<svg viewBox='0 0 250 170' width='100%' height='auto' style='max-width:260px; display:block; margin:10px auto;'><polygon points='40,130 220,90 70,40' fill='none' stroke='#2b5b84' stroke-width='2'/><line x1='70' y1='40' x2='87.6' y2='119.4' stroke='#2b5b84' stroke-width='2'/><path d='M 66.8,49.5 L 76.3,52.7 L 79.5,43.2' fill='none' stroke='#333' stroke-width='1.5'/><path d='M 77.9,121.6 L 75.7,111.9 L 85.4,109.7' fill='none' stroke='#333' stroke-width='1.5'/><text x='22' y='138' font-size='14' font-family='sans-serif' fill='#333'>A</text><text x='228' y='95' font-size='14' font-family='sans-serif' fill='#333'>B</text><text x='70' y='25' font-size='14' font-family='sans-serif' fill='#333'>C</text><text x='92' y='135' font-size='14' font-family='sans-serif' fill='#333'>D</text><text x='48' y='80' font-size='13' font-family='sans-serif' fill='#000' text-anchor='end'>${a} cm</text><text x='150' y='58' font-size='13' font-family='sans-serif' fill='#000' text-anchor='start'>${b} cm</text></svg>`;

  return {
    strand: "Geometry & Measurement",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Pythagoras' Theorem",
    prompt: `${svg}\n\nIn right-angled triangle $ABC$, $\\angle ACB = 90^\\circ$, $AC = ${a}\\text{ cm}$, and $BC = ${b}\\text{ cm}$. $D$ lies on $AB$ such that $CD$ is perpendicular to $AB$. Find the length of $CD$.`,
    inputCount: 1,
    inputLabels: ["CD ="],
    expectedAnswer: ans,
    displayAnswer: ans,
    steps: [
      `First, calculate hypotenuse $AB$ using Pythagoras' Theorem:\n\n$$AB^2 = AC^2 + BC^2 = ${a}^2 + ${b}^2 = ${c_sq}$$\n\n$$AB = \\sqrt{${c_sq}} = ${c}\\text{ cm}$$`,
      `Calculate the area of $\\Delta ABC$:\n\n$$\\text{Area} = \\frac{1}{2} \\times AC \\times BC$$\n\n$$\\text{Area} = \\frac{1}{2} \\times ${a} \\times ${b} = ${area}\\text{ cm}^2$$`,
      `Equate the area formula using base $AB$ and height $CD$ to solve for $CD$:\n\n$$\\frac{1}{2} \\times AB \\times CD = \\text{Area}$$\n\n$$\\frac{1}{2} \\times ${c} \\times CD = ${area}$$\n\n$$CD = \\frac{${2 * area}}{${c}} = ${cd}\\text{ cm}$$`
    ]
  };
}

export const pythagorasTheorem = { generate: generateQuestion };
export default generateQuestion;
