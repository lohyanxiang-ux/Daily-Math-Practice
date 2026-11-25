/**
 * Question Generator: Area of Triangle
 * Curriculum Skill: Sec 3 G3 - Trigonometry
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

export function generateQuestion(tier = 1) {
  const extraKeys = [];

  // =========================================================
  // TIER 1: BASIC (Direct Sine Area Formula: 1/2 * ab * sin C)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Given b = AC, c = AB, and angle A
      const b = randInt(5, 12);
      const c = randInt(8, 15);
      const degA = randInt(35, 125);

      const areaVal = 0.5 * b * c * Math.sin(toRad(degA));
      const ans = toSigFigs(areaVal, 3);

      const step1 = `\\text{Area} = \\frac{1}{2} (${b})(${c})\\sin ${degA}^\\circ`;
      const step2 = `\\text{Area} \\approx ${ans}\\text{ cm}^2`;

      const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='60,170 240,170 130,60' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M 82 170 A 22 22 0 0 0 71 150' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='45' y='185' font-size='14' font-weight='bold'>A</text><text x='250' y='185' font-size='14' font-weight='bold'>B</text><text x='130' y='48' font-size='14' font-weight='bold' text-anchor='middle'>C</text><text x='150' y='192' font-size='13' text-anchor='middle' fill='#1d3557'>c = ${c} cm</text><text x='82' y='110' font-size='13' fill='#1d3557' text-anchor='end'>b = ${b} cm</text><text x='92' y='162' font-size='12' fill='#e63946'>${degA}°</text></svg>`;

      return {
        strand: "Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Area of Triangle",
        prompt: `${svg}\n\nIn $\\triangle ABC$, $AC = ${b}\\text{ cm}$, $AB = ${c}\\text{ cm}$, and $\\angle A = ${degA}^\\circ$.\n\nFind the area of $\\triangle ABC$. (Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["Area ="],
        expectedAnswer: ans,
        displayAnswer: `\\text{Area} \\approx ${ans}\\text{ cm}^2`,
        extraKeys,
        steps: [
          `Apply the sine area formula: $$\\text{Area} = \\frac{1}{2} b c \\sin A$$`,
          `Substitute the given side lengths and angle: $$${step1}$$`,
          `Calculate the area: $$${step2}$$`
        ]
      };
    }

    if (subType === 2) {
      // Given a = BC, c = AB, and angle B
      const a = randInt(6, 14);
      const c = randInt(7, 15);
      const degB = randInt(35, 125);

      const areaVal = 0.5 * a * c * Math.sin(toRad(degB));
      const ans = toSigFigs(areaVal, 3);

      const step1 = `\\text{Area} = \\frac{1}{2} (${a})(${c})\\sin ${degB}^\\circ`;
      const step2 = `\\text{Area} \\approx ${ans}\\text{ cm}^2`;

      const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='70,60 50,170 250,170' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M 75 170 A 25 25 0 0 0 54 145' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='65' y='48' font-size='14' font-weight='bold' text-anchor='middle'>A</text><text x='35' y='185' font-size='14' font-weight='bold'>B</text><text x='260' y='185' font-size='14' font-weight='bold'>C</text><text x='150' y='192' font-size='13' text-anchor='middle' fill='#1d3557'>a = ${a} cm</text><text x='50' y='110' font-size='13' fill='#1d3557' text-anchor='end'>c = ${c} cm</text><text x='70' y='160' font-size='12' fill='#e63946'>${degB}°</text></svg>`;

      return {
        strand: "Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Area of Triangle",
        prompt: `${svg}\n\nIn $\\triangle ABC$, $BC = ${a}\\text{ cm}$, $AB = ${c}\\text{ cm}$, and $\\angle B = ${degB}^\\circ$.\n\nFind the area of $\\triangle ABC$. (Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["Area ="],
        expectedAnswer: ans,
        displayAnswer: `\\text{Area} \\approx ${ans}\\text{ cm}^2`,
        extraKeys,
        steps: [
          `Apply the sine area formula: $$\\text{Area} = \\frac{1}{2} a c \\sin B$$`,
          `Substitute the given side lengths and angle: $$${step1}$$`,
          `Calculate the area: $$${step2}$$`
        ]
      };
    }

    // subType === 3: Given a = BC, b = AC, and angle C
    const a = randInt(6, 14);
    const b = randInt(5, 13);
    const degC = randInt(35, 125);

    const areaVal = 0.5 * a * b * Math.sin(toRad(degC));
    const ans = toSigFigs(areaVal, 3);

    const step1 = `\\text{Area} = \\frac{1}{2} (${a})(${b})\\sin ${degC}^\\circ`;
    const step2 = `\\text{Area} \\approx ${ans}\\text{ cm}^2`;

    const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='180,60 60,170 260,170' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M 235 170 A 25 25 0 0 1 245 150' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='180' y='48' font-size='14' font-weight='bold' text-anchor='middle'>A</text><text x='45' y='185' font-size='14' font-weight='bold'>B</text><text x='270' y='185' font-size='14' font-weight='bold'>C</text><text x='150' y='192' font-size='13' text-anchor='middle' fill='#1d3557'>a = ${a} cm</text><text x='230' y='110' font-size='13' fill='#1d3557'>b = ${b} cm</text><text x='225' y='160' font-size='12' fill='#e63946'>${degC}°</text></svg>`;

    return {
      strand: "Trigonometry",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Area of Triangle",
      prompt: `${svg}\n\nIn $\\triangle ABC$, $BC = ${a}\\text{ cm}$, $AC = ${b}\\text{ cm}$, and $\\angle C = ${degC}^\\circ$.\n\nFind the area of $\\triangle ABC$. (Give your answer correct to 3 significant figures.)`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["Area ="],
      expectedAnswer: ans,
      displayAnswer: `\\text{Area} \\approx ${ans}\\text{ cm}^2`,
      extraKeys,
      steps: [
        `Apply the sine area formula: $$\\text{Area} = \\frac{1}{2} a b \\sin C$$`,
        `Substitute the given side lengths and angle: $$${step1}$$`,
        `Calculate the area: $$${step2}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Angle Chase & Composite Quadrilateral)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Straight line BCD with AB || EC, find area of ΔABC
      const ab = randInt(6, 10);
      const ac = randInt(5, 8);
      const degACB = randInt(65, 75);
      const degECD = randInt(55, 65);

      const degACE = 180 - degACB - degECD;
      const areaVal = 0.5 * ab * ac * Math.sin(toRad(degACE));
      const ans = toSigFigs(areaVal, 3);

      const step1 = `\\angle ACE = 180^\\circ - ${degACB}^\\circ - ${degECD}^\\circ = ${degACE}^\\circ`;
      const step2 = `\\text{Since } AB \\parallel EC, \\angle BAC = \\angle ACE = ${degACE}^\\circ`;
      const step3 = `\\text{Area} = \\frac{1}{2}(${ab})(${ac})\\sin ${degACE}^\\circ \\approx ${ans}\\text{ cm}^2`;

      const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><line x1='30' y1='180' x2='290' y2='180' stroke='#2b2b2b' stroke-width='2'/><polygon points='70,180 120,50 170,180' fill='none' stroke='#2b2b2b' stroke-width='2'/><line x1='170' y1='180' x2='230' y2='50' stroke='#2b2b2b' stroke-width='2'/><path d='M -4,-4 L 3,0 L -4,4' fill='none' stroke='#e63946' stroke-width='2' transform='translate(95,115) rotate(-69)'/><path d='M -4,-4 L 3,0 L -4,4' fill='none' stroke='#e63946' stroke-width='2' transform='translate(200,115) rotate(-65.2)'/><path d='M 145 180 A 25 25 0 0 1 160 157' fill='none' stroke='#e63946' stroke-width='1.5'/><path d='M 195 180 A 25 25 0 0 0 180 157' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='60' y='198' font-size='14' font-weight='bold'>B</text><text x='115' y='40' font-size='14' font-weight='bold'>A</text><text x='168' y='198' font-size='14' font-weight='bold'>C</text><text x='290' y='198' font-size='14' font-weight='bold'>D</text><text x='235' y='45' font-size='14' font-weight='bold'>E</text><text x='82' y='110' font-size='13' fill='#1d3557' text-anchor='end'>${ab} cm</text><text x='152' y='110' font-size='13' fill='#1d3557'>${ac} cm</text><text x='135' y='170' font-size='11' fill='#e63946'>${degACB}°</text><text x='196' y='170' font-size='11' fill='#e63946'>${degECD}°</text></svg>`;

      return {
        strand: "Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Area of Triangle",
        prompt: `${svg}\n\nIn the diagram, $BCD$ is a straight line and $AB \\parallel EC$. $AB = ${ab}\\text{ cm}$, $AC = ${ac}\\text{ cm}$, $\\angle ACB = ${degACB}^\\circ$, and $\\angle ECD = ${degECD}^\\circ$.\n\nFind the area of $\\triangle ABC$. (Give your answer correct to 3 significant figures.)`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["Area ="],
        expectedAnswer: ans,
        displayAnswer: `\\text{Area} \\approx ${ans}\\text{ cm}^2`,
        extraKeys,
        steps: [
          `Find $\\angle ACE$ on straight line $BCD$: $$${step1}$$`,
          `Use alternate interior angles for $AB \\parallel EC$: $$${step2}$$`,
          `Calculate the area of $\\triangle ABC$: $$${step3}$$`
        ]
      };
    }

    // subType === 2: Quadrilateral ABCD with right ΔABD and ΔBDC
    const ab = randInt(5, 8);
    const bd = randInt(9, 12);
    const cd = randInt(6, 10);
    const degBDC = randInt(45, 65);

    const ad2 = bd * bd - ab * ab;
    const ad = Math.sqrt(ad2);
    const ad_str = toSigFigs(ad, 3);
    const area1 = 0.5 * ab * ad;
    const area1_str = toSigFigs(area1, 3);

    const area2 = 0.5 * cd * bd * Math.sin(toRad(degBDC));
    const area2_str = toSigFigs(area2, 3);

    const totalArea = area1 + area2;
    const ans = toSigFigs(totalArea, 3);

    const step1 = `AD = \\sqrt{${bd}^2 - ${ab}^2} = \\sqrt{${ad2}} \\approx ${ad_str}\\text{ cm}`;
    const step2 = `\\text{Area}(\\triangle ABD) = \\frac{1}{2} \\times ${ab} \\times ${ad_str} \\approx ${area1_str}\\text{ cm}^2`;
    const step3 = `\\begin{aligned}\\text{Area}(\\triangle BDC) &= \\frac{1}{2} \\times ${cd} \\times ${bd} \\times \\sin ${degBDC}^\\circ \\\\ &\\approx ${area2_str}\\text{ cm}^2\\end{aligned}`;
    const step4 = `\\text{Total Area} = ${area1_str} + ${area2_str} \\approx ${ans}\\text{ cm}^2`;

    const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='80,180 200,180 240,50 80,80' fill='none' stroke='#2b2b2b' stroke-width='2'/><line x1='80' y1='80' x2='200' y2='180' stroke='#2b2b2b' stroke-width='1.5'/><polyline points='80,165 95,165 95,180' fill='none' stroke='#2b2b2b' stroke-width='1.5'/><path d='M 105 75 A 25 25 0 0 1 99 96' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='65' y='195' font-size='14' font-weight='bold'>A</text><text x='210' y='195' font-size='14' font-weight='bold'>B</text><text x='248' y='45' font-size='14' font-weight='bold'>C</text><text x='65' y='75' font-size='14' font-weight='bold'>D</text><text x='140' y='198' font-size='13' text-anchor='middle' fill='#1d3557'>${ab} cm</text><text x='160' y='50' font-size='13' text-anchor='middle' fill='#1d3557'>${cd} cm</text><text x='145' y='122' font-size='13' fill='#1d3557'>${bd} cm</text><text x='110' y='90' font-size='11' fill='#e63946'>${degBDC}°</text></svg>`;

    return {
      strand: "Trigonometry",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Area of Triangle",
      prompt: `${svg}\n\nIn the quadrilateral $ABCD$, $AB = ${ab}\\text{ cm}$, $CD = ${cd}\\text{ cm}$, $BD = ${bd}\\text{ cm}$, $\\angle BAD = 90^\\circ$, and $\\angle BDC = ${degBDC}^\\circ$.\n\nFind the area of $ABCD$. (Give your answer correct to 3 significant figures.)`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["Area ="],
      expectedAnswer: ans,
      displayAnswer: `\\text{Area} \\approx ${ans}\\text{ cm}^2`,
      extraKeys,
      steps: [
        `Use Pythagoras' Theorem in right $\\triangle ABD$ to find side $AD$: $$${step1}$$`,
        `Find the area of right $\\triangle ABD$: $$${step2}$$`,
        `Find the area of $\\triangle BDC$ using $\\frac{1}{2} ab \\sin C$: $$${step3}$$`,
        `Sum both areas to get the total area of $ABCD$: $$${step4}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Quadratic Area Equation & Parallel-Line Sine Ratio)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Given area and sides (x + 1) and x with ∠BAC = 30°, solve for x
    const x = randInt(4, 10);
    const areaVal = 0.25 * x * (x + 1);
    const c_val = 4 * areaVal;
    const ans = x.toString();

    const step1 = `\\text{Area} = \\frac{1}{2} \\times x(x + 1) \\sin 30^\\circ = ${areaVal}`;
    const step2 = `\\frac{1}{4}(x^2 + x) = ${areaVal} \\implies x^2 + x - ${c_val} = 0`;
    const step3 = `\\begin{aligned}(x - ${x})(x + ${x + 1}) = 0 \\\\ \\implies x = ${ans} \\text{ (since } x > 0\\text{)}\\end{aligned}`;

    const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='50,170 250,170 200,60' fill='none' stroke='#2b2b2b' stroke-width='2'/><path d='M 75 170 A 25 25 0 0 0 68 152' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='35' y='180' font-size='14' font-weight='bold'>A</text><text x='260' y='180' font-size='14' font-weight='bold'>B</text><text x='200' y='48' font-size='14' font-weight='bold' text-anchor='middle'>C</text><text x='150' y='190' font-size='13' text-anchor='middle' fill='#1d3557'>x + 1</text><text x='112' y='110' font-size='13' fill='#1d3557' text-anchor='end'>x</text><text x='82' y='162' font-size='12' fill='#e63946'>30°</text></svg>`;

    return {
      strand: "Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Area of Triangle",
      prompt: `${svg}\n\nIn $\\triangle ABC$, $AB = (x + 1)\\text{ cm}$, $AC = x\\text{ cm}$, and $\\angle BAC = 30^\\circ$.\n\nIf the area of $\\triangle ABC = ${areaVal}\\text{ cm}^2$, find the value of $x$.`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["x ="],
      expectedAnswer: ans,
      displayAnswer: `x = ${ans}`,
      extraKeys,
      steps: [
        `Set up the area equation using $\\sin 30^\\circ = 0.5$: $$${step1}$$`,
        `Formulate a quadratic equation: $$${step2}$$`,
        `Solve for positive value $x$: $$${step3}$$`
      ]
    };
  }

  // subType === 2: AB || DC, find (a) sin ∠ABD and (b) area of ΔBCD
  const ab = randInt(6, 10);
  const bd = randInt(10, 14);
  const cd = randInt(4, 8);
  const areaABD = randInt(20, 35);

  const sinABD = (2 * areaABD) / (ab * bd);
  const sinABD_ans = toSigFigs(sinABD, 3);

  const areaBCD = 0.5 * bd * cd * sinABD;
  const areaBCD_ans = toSigFigs(areaBCD, 3);

  const step1 = `\\begin{aligned}\\text{Area}(\\triangle ABD) = \\frac{1}{2} (${ab})(${bd}) \\sin \\angle ABD = ${areaABD} \\\\ \\implies \\sin \\angle ABD \\approx ${sinABD_ans}\\end{aligned}`;
  const step2 = `\\begin{aligned}\\text{Since } AB \\parallel DC, \\angle BDC = \\angle ABD \\text{ (alt. } \\angle\\text{s)}, \\\\ \\text{so } \\sin \\angle BDC = \\sin \\angle ABD \\approx ${sinABD_ans}\\end{aligned}`;
  const step3 = `\\begin{aligned}\\text{Area}(\\triangle BCD) &= \\frac{1}{2} (${bd})(${cd}) \\sin \\angle BDC \\\\ &\\approx ${areaBCD_ans}\\text{ cm}^2\\end{aligned}`;

  const svg = `<svg width='320' height='220' viewBox='0 0 320 220' xmlns='http://www.w3.org/2000/svg'><polygon points='60,170 110,60 250,82 210,170' fill='none' stroke='#2b2b2b' stroke-width='2'/><line x1='110' y1='60' x2='210' y2='170' stroke='#2b2b2b' stroke-width='1.5'/><path d='M -4,-4 L 3,0 L -4,4' fill='none' stroke='#e63946' stroke-width='2' transform='translate(85,115) rotate(-65.55)'/><path d='M -4,-4 L 3,0 L -4,4' fill='none' stroke='#e63946' stroke-width='2' transform='translate(230,126) rotate(-65.55)'/><path d='M 127 78 A 25 25 0 0 1 100 83' fill='none' stroke='#e63946' stroke-width='1.5'/><text x='45' y='180' font-size='14' font-weight='bold'>A</text><text x='105' y='50' font-size='14' font-weight='bold'>B</text><text x='260' y='87' font-size='14' font-weight='bold'>C</text><text x='210' y='188' font-size='14' font-weight='bold'>D</text><text x='72' y='110' font-size='13' fill='#1d3557' text-anchor='end'>${ab} cm</text><text x='150' y='125' font-size='13' fill='#1d3557'>${bd} cm</text><text x='238' y='135' font-size='13' fill='#1d3557'>${cd} cm</text></svg>`;

  return {
    strand: "Trigonometry",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Area of Triangle",
    prompt: `${svg}\n\nIn the diagram, $AB \\parallel DC$, $AB = ${ab}\\text{ cm}$, $BD = ${bd}\\text{ cm}$, and $CD = ${cd}\\text{ cm}$. The area of $\\triangle ABD = ${areaABD}\\text{ cm}^2$.\n\nFind:\n(a) $\\sin \\angle ABD$,\n(b) the area of $\\triangle BCD$.\n\n(Give your answers correct to 3 significant figures.)`,
    diagramSvg: svg,
    inputCount: 2,
    inputLabels: ["(a) sin ∠ABD =", "(b) Area of triangle BCD ="],
    expectedAnswer: [sinABD_ans, areaBCD_ans],
    displayAnswer: `\\sin\\angle ABD \\approx ${sinABD_ans},\\; \\text{Area}(\\triangle BCD) \\approx ${areaBCD_ans}\\text{ cm}^2`,
    extraKeys,
    steps: [
      `Use area formula in $\\triangle ABD$ to solve for $\\sin \\angle ABD$: $$${step1}$$`,
      `Apply parallel line properties to conclude $\\sin \\angle BDC = \\sin \\angle ABD$: $$${step2}$$`,
      `Calculate the area of $\\triangle BCD$: $$${step3}$$`
    ]
  };
}

export const areaOfTriangle = { generate: generateQuestion };
export default generateQuestion;
```[cite: 15]
