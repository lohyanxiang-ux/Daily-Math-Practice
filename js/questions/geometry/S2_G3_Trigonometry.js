/**
 * Question Generator: Trigonometry
 * Curriculum Skill: Sec 3 G3 - Trigonometry
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function toSigFigs(val, sigFigs = 3) {
  return parseFloat(Number(val).toPrecision(sigFigs)).toString();
}

function toDeg1dp(rad) {
  return ((rad * 180) / Math.PI).toFixed(1);
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function generateQuestion(tier = 1) {
  const extraKeys = ["θ", "x", "°"];

  // =========================================================
  // TIER 1: BASIC (Unknown Sides & Trig Ratios from Triples)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 6);

    if (subType === 1) {
      // Tangent: find opposite x given adjacent a and angle theta
      const a = randInt(5, 20);
      const theta = randInt(22, 68);
      const ans = toSigFigs(a * Math.tan(toRad(theta)), 3);

      const step1 = `\\tan(${theta}^\\circ) = \\frac{x}{${a}}`;
      const step2 = `x = ${a} \\times \\tan(${theta}^\\circ)`;
      const step3 = `x \\approx ${ans}`;

      const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='220' height='160' viewBox='0 0 220 160'><polygon points='30,120 180,120 30,30' fill='none' stroke='#2b6cb0' stroke-width='2'/><rect x='30' y='105' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='18' y='135' font-size='14' fill='#2d3748'>B</text><text x='188' y='135' font-size='14' fill='#2d3748'>A</text><text x='18' y='25' font-size='14' fill='#2d3748'>C</text><text x='105' y='140' font-size='13' fill='#2d3748' text-anchor='middle'>${a} cm</text><text x='25' y='75' font-size='13' fill='#2d3748' text-anchor='end'>x</text><path d='M 155,120 A 25,25 0 0,1 158.6,107.1' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='140' y='114' font-size='12' fill='#e53e3e'>${theta}°</text></svg></div>`;

      return {
        strand: "Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Trigonometry",
        prompt: `In the right-angled triangle $ABC$ below, $\\angle B = 90^\\circ$, $AB = ${a}\\text{ cm}$, and $\\angle A = ${theta}^\\circ$.\n\nFind the length of $BC$ (labeled as $x$), giving your answer correct to 3 significant figures.\n\n${svg}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["x ="],
        expectedAnswer: ans,
        displayAnswer: `x \\approx ${ans}\\text{ cm}`,
        extraKeys,
        steps: [
          `Apply the tangent ratio: $$\\tan(\\theta) = \\frac{\\text{opposite}}{\\text{adjacent}}$$`,
          `Substitute the given values into the formula: $$${step1}$$`,
          `Solve for $x$: $$${step2}$$`,
          `Evaluate correct to 3 significant figures: $$${step3}\\text{ cm}$$`
        ]
      };
    }

    if (subType === 2) {
      // Sine: find opposite x given hypotenuse h and angle theta
      const h = randInt(12, 35);
      const theta = randInt(25, 65);
      const ans = toSigFigs(h * Math.sin(toRad(theta)), 3);

      const step1 = `\\sin(${theta}^\\circ) = \\frac{x}{${h}}`;
      const step2 = `x = ${h} \\times \\sin(${theta}^\\circ)`;
      const step3 = `x \\approx ${ans}`;

      const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='220' height='160' viewBox='0 0 220 160'><polygon points='30,120 180,120 30,30' fill='none' stroke='#2b6cb0' stroke-width='2'/><rect x='30' y='105' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='18' y='135' font-size='14' fill='#2d3748'>E</text><text x='188' y='135' font-size='14' fill='#2d3748'>F</text><text x='18' y='25' font-size='14' fill='#2d3748'>D</text><text x='110' y='65' font-size='13' fill='#2d3748' transform='rotate(31 110 65)'>${h} cm</text><text x='25' y='75' font-size='13' fill='#2d3748' text-anchor='end'>x</text><path d='M 155,120 A 25,25 0 0,1 158.6,107.1' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='140' y='114' font-size='12' fill='#e53e3e'>${theta}°</text></svg></div>`;

      return {
        strand: "Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Trigonometry",
        prompt: `In the right-angled triangle $DEF$ below, $\\angle E = 90^\\circ$, hypotenuse $DF = ${h}\\text{ cm}$, and $\\angle F = ${theta}^\\circ$.\n\nFind the length of $DE$ (labeled as $x$), giving your answer correct to 3 significant figures.\n\n${svg}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["x ="],
        expectedAnswer: ans,
        displayAnswer: `x \\approx ${ans}\\text{ cm}`,
        extraKeys,
        steps: [
          `Apply the sine ratio: $$\\sin(\\theta) = \\frac{\\text{opposite}}{\\text{hypotenuse}}$$`,
          `Substitute the given values into the formula: $$${step1}$$`,
          `Solve for $x$: $$${step2}$$`,
          `Evaluate correct to 3 significant figures: $$${step3}\\text{ cm}$$`
        ]
      };
    }

    if (subType === 3) {
      // Cosine: find adjacent x given hypotenuse h and angle theta
      const h = randInt(12, 35);
      const theta = randInt(25, 65);
      const ans = toSigFigs(h * Math.cos(toRad(theta)), 3);

      const step1 = `\\cos(${theta}^\\circ) = \\frac{x}{${h}}`;
      const step2 = `x = ${h} \\times \\cos(${theta}^\\circ)`;
      const step3 = `x \\approx ${ans}`;

      const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='220' height='160' viewBox='0 0 220 160'><polygon points='30,120 180,120 30,30' fill='none' stroke='#2b6cb0' stroke-width='2'/><rect x='30' y='105' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='18' y='135' font-size='14' fill='#2d3748'>E</text><text x='188' y='135' font-size='14' fill='#2d3748'>F</text><text x='18' y='25' font-size='14' fill='#2d3748'>D</text><text x='110' y='65' font-size='13' fill='#2d3748' transform='rotate(31 110 65)'>${h} cm</text><text x='25' y='75' font-size='13' fill='#2d3748' text-anchor='end'>x</text><path d='M 30,55 A 25,25 0 0,0 51.4,42.9' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='42' y='65' font-size='12' fill='#e53e3e'>${theta}°</text></svg></div>`;

      return {
        strand: "Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Trigonometry",
        prompt: `In the right-angled triangle $DEF$ below, $\\angle E = 90^\\circ$, hypotenuse $DF = ${h}\\text{ cm}$, and $\\angle EDF = ${theta}^\\circ$.\n\nFind the length of $DE$ (labeled as $x$), giving your answer correct to 3 significant figures.\n\n${svg}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["x ="],
        expectedAnswer: ans,
        displayAnswer: `x \\approx ${ans}\\text{ cm}`,
        extraKeys,
        steps: [
          `Apply the cosine ratio: $$\\cos(\\theta) = \\frac{\\text{adjacent}}{\\text{hypotenuse}}$$`,
          `Substitute the given values into the formula: $$${step1}$$`,
          `Solve for $x$: $$${step2}$$`,
          `Evaluate correct to 3 significant figures: $$${step3}\\text{ cm}$$`
        ]
      };
    }

    if (subType === 4) {
      // Sine with unknown in denominator: find hypotenuse x given opposite opp and angle theta
      const opp = randInt(8, 25);
      const theta = randInt(25, 65);
      const ans = toSigFigs(opp / Math.sin(toRad(theta)), 3);

      const step1 = `\\sin(${theta}^\\circ) = \\frac{${opp}}{x}`;
      const step2 = `x = \\frac{${opp}}{\\sin(${theta}^\\circ)}`;
      const step3 = `x \\approx ${ans}`;

      const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='220' height='160' viewBox='0 0 220 160'><polygon points='45,120 195,120 45,30' fill='none' stroke='#2b6cb0' stroke-width='2'/><rect x='45' y='105' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='33' y='135' font-size='14' fill='#2d3748'>B</text><text x='203' y='135' font-size='14' fill='#2d3748'>C</text><text x='33' y='25' font-size='14' fill='#2d3748'>A</text><text x='125' y='65' font-size='13' fill='#2d3748' transform='rotate(31 125 65)'>x</text><text x='40' y='75' font-size='13' fill='#2d3748' text-anchor='end'>${opp} cm</text><path d='M 170,120 A 25,25 0 0,1 173.6,107.1' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='155' y='114' font-size='12' fill='#e53e3e'>${theta}°</text></svg></div>`;

      return {
        strand: "Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Trigonometry",
        prompt: `In the right-angled triangle $ABC$ below, $\\angle B = 90^\\circ$, $AB = ${opp}\\text{ cm}$, and $\\angle C = ${theta}^\\circ$.\n\nFind the length of hypotenuse $AC$ (labeled as $x$), giving your answer correct to 3 significant figures.\n\n${svg}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["x ="],
        expectedAnswer: ans,
        displayAnswer: `x \\approx ${ans}\\text{ cm}`,
        extraKeys,
        steps: [
          `Apply the sine ratio: $$\\sin(\\theta) = \\frac{\\text{opposite}}{\\text{hypotenuse}}$$`,
          `Substitute the given values into the formula: $$${step1}$$`,
          `Solve for $x$: $$${step2}$$`,
          `Evaluate correct to 3 significant figures: $$${step3}\\text{ cm}$$`
        ]
      };
    }

    if (subType === 5) {
      // State sin θ, cos θ, tan θ from Pythagorean triple (standard orientation)
      const triples = [
        [5, 12, 13],
        [3, 4, 5],
        [8, 15, 17],
        [7, 24, 25],
        [20, 21, 29]
      ];
      const [opp, adj, hyp] = triples[randInt(0, triples.length - 1)];

      const sin_ans = `${opp}/${hyp}`;
      const cos_ans = `${adj}/${hyp}`;
      const tan_ans = `${opp}/${adj}`;

      const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='220' height='150' viewBox='0 0 220 150'><polygon points='30,120 180,120 30,30' fill='none' stroke='#2b6cb0' stroke-width='2'/><rect x='30' y='105' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='18' y='135' font-size='14' fill='#2d3748'>B</text><text x='188' y='135' font-size='14' fill='#2d3748'>C</text><text x='18' y='25' font-size='14' fill='#2d3748'>A</text><text x='105' y='140' font-size='13' fill='#2d3748' text-anchor='middle'>${adj}</text><text x='25' y='75' font-size='13' fill='#2d3748' text-anchor='end'>${opp}</text><text x='110' y='65' font-size='13' fill='#2d3748' transform='rotate(-31 110 65)'>${hyp}</text><path d='M 155,120 A 25,25 0 0,1 158.6,107.1' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='140' y='114' font-size='12' fill='#e53e3e'>θ</text></svg></div>`;

      return {
        strand: "Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Trigonometry",
        prompt: `State the values of $\\sin \\theta$, $\\cos \\theta$, and $\\tan \\theta$ in the right-angled triangle below. Leave each answer as a fraction in its simplest form.\n\n${svg}`,
        diagramSvg: svg,
        inputCount: 3,
        inputLabels: ["sin θ =", "cos θ =", "tan θ ="],
        expectedAnswer: [sin_ans, cos_ans, tan_ans],
        displayAnswer: `\\sin\\theta = \\frac{${opp}}{${hyp}},\\; \\cos\\theta = \\frac{${adj}}{${hyp}},\\; \\tan\\theta = \\frac{${opp}}{${adj}}`,
        extraKeys,
        steps: [
          `Identify the sides relative to angle $\\theta$: Opposite $= ${opp}$, Adjacent $= ${adj}$, Hypotenuse $= ${hyp}$.`,
          `$$\\sin \\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}} = \\frac{${opp}}{${hyp}}$$`,
          `$$\\cos \\theta = \\frac{\\text{adjacent}}{\\text{hypotenuse}} = \\frac{${adj}}{${hyp}}$$`,
          `$$\\tan \\theta = \\frac{\\text{opposite}}{\\text{adjacent}} = \\frac{${opp}}{${adj}}$$`
        ]
      };
    }

    // subType === 6: State sin θ, cos θ, tan θ from Pythagorean triple (rotated orientation DEF)
    const triplesDEF = [
      [20, 21, 29],
      [8, 15, 17],
      [5, 12, 13],
      [7, 24, 25]
    ];
    const [opp, adj, hyp] = triplesDEF[randInt(0, triplesDEF.length - 1)];

    const sin_ans = `${opp}/${hyp}`;
    const cos_ans = `${adj}/${hyp}`;
    const tan_ans = `${opp}/${adj}`;

    const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='220' height='160' viewBox='0 0 220 160'><polygon points='30,130 106,50 190,130' fill='none' stroke='#2b6cb0' stroke-width='2'/><polyline points='97.7,58.7 106.4,67.0 114.7,58.3' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='102' y='38' font-size='14' fill='#2d3748'>D</text><text x='15' y='135' font-size='14' fill='#2d3748'>E</text><text x='198' y='135' font-size='14' fill='#2d3748'>F</text><text x='60' y='85' font-size='13' fill='#2d3748'>${opp}</text><text x='155' y='85' font-size='13' fill='#2d3748'>${adj}</text><text x='110' y='148' font-size='13' fill='#2d3748' text-anchor='middle'>${hyp}</text><path d='M 165,130 A 25,25 0 0,1 171.9,112.8' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='152' y='118' font-size='12' fill='#e53e3e'>θ</text></svg></div>`;

    return {
      strand: "Trigonometry",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Trigonometry",
      prompt: `State the values of $\\sin \\theta$, $\\cos \\theta$, and $\\tan \\theta$ in the right-angled triangle below. Leave each answer as a fraction in its simplest form.\n\n${svg}`,
      diagramSvg: svg,
      inputCount: 3,
      inputLabels: ["sin θ =", "cos θ =", "tan θ ="],
      expectedAnswer: [sin_ans, cos_ans, tan_ans],
      displayAnswer: `\\sin\\theta = \\frac{${opp}}{${hyp}},\\; \\cos\\theta = \\frac{${adj}}{${hyp}},\\; \\tan\\theta = \\frac{${opp}}{${adj}}`,
      extraKeys,
      steps: [
        `Identify the sides relative to angle $\\theta$ at vertex $F$: Opposite $= DE = ${opp}$, Adjacent $= DF = ${adj}$, Hypotenuse $= EF = ${hyp}$.`,
        `$$\\sin \\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}} = \\frac{${opp}}{${hyp}}$$`,
        `$$\\cos \\theta = \\frac{\\text{adjacent}}{\\text{hypotenuse}} = \\frac{${adj}}{${hyp}}$$`,
        `$$\\tan \\theta = \\frac{\\text{opposite}}{\\text{adjacent}} = \\frac{${opp}}{${adj}}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Inverse Trig from Sides & Equations)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 5);

    if (subType === 1) {
      // Find acute angle θ in right triangle PQR given adjacent QR and hypotenuse PR
      const adj = randInt(7, 20);
      const hyp = randInt(21, 35);
      const ans = toDeg1dp(Math.acos(adj / hyp));

      const step1 = `\\cos \\theta = \\frac{${adj}}{${hyp}}`;
      const step2 = `\\theta = \\cos^{-1}\\left(\\frac{${adj}}{${hyp}}\\right)`;
      const step3 = `\\theta \\approx ${ans}^\\circ`;

      const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='220' height='160' viewBox='0 0 220 160'><polygon points='30,120 180,120 30,30' fill='none' stroke='#2b6cb0' stroke-width='2'/><rect x='30' y='105' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='18' y='135' font-size='14' fill='#2d3748'>Q</text><text x='188' y='135' font-size='14' fill='#2d3748'>R</text><text x='18' y='25' font-size='14' fill='#2d3748'>P</text><text x='105' y='140' font-size='13' fill='#2d3748' text-anchor='middle'>${adj} cm</text><text x='110' y='65' font-size='13' fill='#2d3748' transform='rotate(31 110 65)'>${hyp} cm</text><path d='M 155,120 A 25,25 0 0,1 158.6,107.1' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='138' y='114' font-size='12' fill='#e53e3e'>θ</text></svg></div>`;

      return {
        strand: "Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Trigonometry",
        prompt: `In the right-angled triangle $PQR$ below, $\\angle Q = 90^\\circ$, adjacent side $QR = ${adj}\\text{ cm}$, and hypotenuse $PR = ${hyp}\\text{ cm}$.\n\nFind the size of the acute angle $\\theta$, giving your answer correct to 1 decimal place.\n\n${svg}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["θ ="],
        expectedAnswer: ans,
        displayAnswer: `\\theta \\approx ${ans}^\\circ`,
        extraKeys,
        steps: [
          `Apply the cosine ratio: $$\\cos(\\theta) = \\frac{\\text{adjacent}}{\\text{hypotenuse}}$$`,
          `Substitute known side lengths: $$${step1}$$`,
          `Take the inverse cosine: $$${step2}$$`,
          `Evaluate correct to 1 decimal place: $$${step3}$$`
        ]
      };
    }

    if (subType === 2) {
      // Find acute angle θ = ∠EDF in right triangle DEF given DE and DF
      const adj = randInt(8, 18);
      const hyp = randInt(20, 35);
      const ans = toDeg1dp(Math.acos(adj / hyp));

      const step1 = `\\cos \\theta = \\frac{${adj}}{${hyp}}`;
      const step2 = `\\theta = \\cos^{-1}\\left(\\frac{${adj}}{${hyp}}\\right)`;
      const step3 = `\\theta \\approx ${ans}^\\circ`;

      const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='220' height='160' viewBox='0 0 220 160'><polygon points='45,120 195,120 45,30' fill='none' stroke='#2b6cb0' stroke-width='2'/><rect x='45' y='105' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='33' y='135' font-size='14' fill='#2d3748'>E</text><text x='200' y='135' font-size='14' fill='#2d3748'>F</text><text x='33' y='25' font-size='14' fill='#2d3748'>D</text><text x='40' y='75' font-size='13' fill='#2d3748' text-anchor='end'>${adj} cm</text><text x='125' y='65' font-size='13' fill='#2d3748' transform='rotate(31 125 65)'>${hyp} cm</text><path d='M 45,55 A 25,25 0 0,0 66.4,42.9' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='57' y='65' font-size='12' fill='#e53e3e'>θ</text></svg></div>`;

      return {
        strand: "Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Trigonometry",
        prompt: `In the right-angled triangle $DEF$ below, $\\angle E = 90^\\circ$, side $DE = ${adj}\\text{ cm}$, and hypotenuse $DF = ${hyp}\\text{ cm}$.\n\nFind the size of the acute angle $\\theta = \\angle EDF$, giving your answer correct to 1 decimal place.\n\n${svg}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["θ ="],
        expectedAnswer: ans,
        displayAnswer: `\\theta \\approx ${ans}^\\circ`,
        extraKeys,
        steps: [
          `With respect to angle $\\angle EDF$, side $DE$ is adjacent and $DF$ is the hypotenuse.`,
          `Apply the cosine ratio: $$\\cos(\\theta) = \\frac{\\text{adjacent}}{\\text{hypotenuse}}$$`,
          `Substitute known side lengths: $$${step1}$$`,
          `Take the inverse cosine: $$${step2}$$`,
          `Evaluate correct to 1 decimal place: $$${step3}$$`
        ]
      };
    }

    if (subType === 3) {
      // Solve tan θ = k_dec
      const k_num = randInt(3, 28);
      const k_dec = (k_num / 10).toFixed(2);
      const ans = toDeg1dp(Math.atan(parseFloat(k_dec)));

      return {
        strand: "Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Trigonometry",
        prompt: `Find the acute angle $\\theta$ in degrees that satisfies the equation:\n\n$$\\tan \\theta = ${k_dec}$$\n\nGive your answer correct to 1 decimal place.`,
        inputCount: 1,
        inputLabels: ["θ ="],
        expectedAnswer: ans,
        displayAnswer: `\\theta \\approx ${ans}^\\circ`,
        extraKeys,
        steps: [
          `Apply the inverse tangent function: $$\\theta = \\tan^{-1}(${k_dec})$$`,
          `Evaluate correct to 1 decimal place: $$\\theta \\approx ${ans}^\\circ$$`
        ]
      };
    }

    if (subType === 4) {
      // Solve sin θ = k_dec
      const k_num = randInt(15, 95);
      const k_dec = (k_num / 100).toFixed(2);
      const ans = toDeg1dp(Math.asin(parseFloat(k_dec)));

      return {
        strand: "Trigonometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Trigonometry",
        prompt: `Find the acute angle $\\theta$ in degrees that satisfies the equation:\n\n$$\\sin \\theta = ${k_dec}$$\n\nGive your answer correct to 1 decimal place.`,
        inputCount: 1,
        inputLabels: ["θ ="],
        expectedAnswer: ans,
        displayAnswer: `\\theta \\approx ${ans}^\\circ`,
        extraKeys,
        steps: [
          `Apply the inverse sine function: $$\\theta = \\sin^{-1}(${k_dec})$$`,
          `Evaluate correct to 1 decimal place: $$\\theta \\approx ${ans}^\\circ$$`
        ]
      };
    }

    // subType === 5: Solve cos θ = k_dec
    const k_num = randInt(15, 95);
    const k_dec = (k_num / 100).toFixed(2);
    const ans = toDeg1dp(Math.acos(parseFloat(k_dec)));

    return {
      strand: "Trigonometry",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Trigonometry",
      prompt: `Find the acute angle $\\theta$ in degrees that satisfies the equation:\n\n$$\\cos \\theta = ${k_dec}$$\n\nGive your answer correct to 1 decimal place.`,
      inputCount: 1,
      inputLabels: ["θ ="],
      expectedAnswer: ans,
      displayAnswer: `\\theta \\approx ${ans}^\\circ`,
      extraKeys,
      steps: [
        `Apply the inverse cosine function: $$\\theta = \\cos^{-1}(${k_dec})$$`,
        `Evaluate correct to 1 decimal place: $$\\theta \\approx ${ans}^\\circ$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Composite & Multi-Triangle Problems)
  // =========================================================
  const subType = randInt(1, 4);

  if (subType === 1) {
    // Triangle ABC with altitude CD ⊥ AB, find θ = ∠CBD
    const alpha = randInt(30, 55);
    const h = randInt(6, 15);
    const extra_b = randInt(4, 12);

    const ad_val = h / Math.tan(toRad(alpha));
    const L = Math.round(ad_val) + extra_b;
    const ad_3sf = toSigFigs(ad_val, 3);
    const db_val = L - parseFloat(ad_3sf);
    const db_3sf = toSigFigs(db_val, 3);
    const ans = toDeg1dp(Math.atan(h / parseFloat(db_3sf)));

    const step1a = `\\tan(${alpha}^\\circ) = \\frac{${h}}{AD}`;
    const step1b = `AD = \\frac{${h}}{\\tan(${alpha}^\\circ)} \\approx ${ad_3sf}\\text{ cm}`;
    const step2 = `BD = AB - AD = ${L} - ${ad_3sf} = ${db_3sf}\\text{ cm}`;
    const step3a = `\\tan \\theta = \\frac{${h}}{${db_3sf}}`;
    const step3b = `\\theta = \\tan^{-1}\\left(\\frac{${h}}{${db_3sf}}\\right) \\approx ${ans}^\\circ`;

    const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='240' height='160' viewBox='0 0 240 160'><polygon points='30,120 200,120 110,30' fill='none' stroke='#2b6cb0' stroke-width='2'/><line x1='110' y1='30' x2='110' y2='120' stroke='#2b6cb0' stroke-width='1.5' stroke-dasharray='4,4'/><rect x='110' y='105' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='15' y='135' font-size='14' fill='#2d3748'>A</text><text x='105' y='135' font-size='14' fill='#2d3748'>D</text><text x='205' y='135' font-size='14' fill='#2d3748'>B</text><text x='105' y='22' font-size='14' fill='#2d3748'>C</text><text x='118' y='75' font-size='13' fill='#2d3748'>${h} cm</text><text x='115' y='145' font-size='13' fill='#2d3748' text-anchor='middle'>${L} cm</text><path d='M 50,120 A 20,20 0 0,0 43.3,105.1' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='54' y='114' font-size='12' fill='#e53e3e'>${alpha}°</text><path d='M 180,120 A 20,20 0 0,1 185.9,105.9' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='165' y='114' font-size='12' fill='#e53e3e'>θ</text></svg></div>`;

    return {
      strand: "Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Trigonometry",
      prompt: `In the diagram below, $ABC$ is a triangle where $CD \\perp AB$. Given that $\\angle CAD = ${alpha}^\\circ$, $CD = ${h}\\text{ cm}$, and $AB = ${L}\\text{ cm}$, find the size of the angle $\\theta = \\angle CBD$.\n\nGive your answer correct to 1 decimal place.\n\n${svg}`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["θ ="],
      expectedAnswer: ans,
      displayAnswer: `\\theta \\approx ${ans}^\\circ`,
      extraKeys,
      steps: [
        `In $\\Delta ACD$, calculate length $AD$ using tangent: $$${step1a}$$`,
        `$$${step1b}$$`,
        `Calculate length $BD$: $$${step2}$$`,
        `In $\\Delta BCD$, apply tangent ratio to find $\\theta$: $$${step3a}$$`,
        `$$${step3b}$$`
      ]
    };
  }

  if (subType === 2) {
    // Two adjacent right triangles sharing side AC (x and θ)
    const beta = randInt(48, 65);
    const a = randInt(3, 8);
    const b = randInt(6, 14);

    const x_ans = toSigFigs(a * Math.tan(toRad(beta)), 3);
    const theta_ans = toDeg1dp(Math.atan(b / parseFloat(x_ans)));

    const step1a = `\\tan(${beta}^\\circ) = \\frac{x}{${a}}`;
    const step1b = `x = ${a} \\times \\tan(${beta}^\\circ) \\approx ${x_ans}\\text{ cm}`;
    const step2a = `\\tan \\theta = \\frac{${b}}{${x_ans}}`;
    const step2b = `\\theta = \\tan^{-1}\\left(\\frac{${b}}{${x_ans}}\\right) \\approx ${theta_ans}^\\circ`;

    const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='220' height='160' viewBox='0 0 220 160'><polygon points='30,120 90,120 90,30' fill='none' stroke='#2b6cb0' stroke-width='2'/><polygon points='90,30 90,120 180,120' fill='none' stroke='#2b6cb0' stroke-width='2'/><rect x='75' y='105' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='18' y='135' font-size='14' fill='#2d3748'>B</text><text x='85' y='135' font-size='14' fill='#2d3748'>C</text><text x='188' y='135' font-size='14' fill='#2d3748'>D</text><text x='85' y='22' font-size='14' fill='#2d3748'>A</text><text x='60' y='140' font-size='13' fill='#2d3748' text-anchor='middle'>${a}</text><text x='135' y='140' font-size='13' fill='#2d3748' text-anchor='middle'>${b}</text><text x='98' y='75' font-size='13' fill='#2d3748'>x</text><path d='M 50,120 A 20,20 0 0,0 41.1,103.4' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='52' y='112' font-size='12' fill='#e53e3e'>${beta}°</text><path d='M 90,50 A 20,20 0 0,0 104.1,44.1' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='96' y='60' font-size='12' fill='#e53e3e'>θ</text></svg></div>`;

    return {
      strand: "Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Trigonometry",
      prompt: `In the figure below, the unit of length is cm. Find the value of $x$ and of $\\theta$.\n\nGive $x$ correct to 3 significant figures and $\\theta$ correct to 1 decimal place.\n\n${svg}`,
      diagramSvg: svg,
      inputCount: 2,
      inputLabels: ["x =", "θ ="],
      expectedAnswer: [x_ans, theta_ans],
      displayAnswer: `x \\approx ${x_ans}\\text{ cm},\\; \\theta \\approx ${theta_ans}^\\circ`,
      extraKeys,
      steps: [
        `In right triangle $ABC$, solve for $x$: $$${step1a}$$`,
        `$$${step1b}$$`,
        `In right triangle $ACD$, solve for $\\theta$: $$${step2a}$$`,
        `$$${step2b}$$`
      ]
    };
  }

  if (subType === 3) {
    // Two right triangles ABD and BCD sharing side BD (x and θ)
    const alpha = randInt(35, 55);
    const a = randInt(8, 14);
    const c = randInt(22, 35);

    const x_ans = toSigFigs(a * Math.sin(toRad(alpha)), 3);
    const theta_ans = toDeg1dp(Math.asin(parseFloat(x_ans) / c));

    const step1a = `\\sin(${alpha}^\\circ) = \\frac{x}{${a}}`;
    const step1b = `x = ${a} \\times \\sin(${alpha}^\\circ) \\approx ${x_ans}\\text{ cm}`;
    const step2a = `\\sin \\theta = \\frac{${x_ans}}{${c}}`;
    const step2b = `\\theta = \\sin^{-1}\\left(\\frac{${x_ans}}{${c}}\\right) \\approx ${theta_ans}^\\circ`;

    const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='240' height='160' viewBox='0 0 240 160'><polygon points='40,80 100,20 100,140' fill='none' stroke='#2b6cb0' stroke-width='2'/><polygon points='100,20 100,140 190,20' fill='none' stroke='#2b6cb0' stroke-width='2'/><polyline points='48.5,71.5 57,80 48.5,88.5' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><rect x='100' y='20' width='12' height='12' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='25' y='85' font-size='14' fill='#2d3748'>A</text><text x='100' y='12' font-size='14' fill='#2d3748'>D</text><text x='198' y='22' font-size='14' fill='#2d3748'>C</text><text x='95' y='155' font-size='14' fill='#2d3748'>B</text><text x='60' y='45' font-size='13' fill='#2d3748'>${a}</text><text x='150' y='85' font-size='13' fill='#2d3748'>${c}</text><text x='108' y='85' font-size='13' fill='#2d3748'>x</text><path d='M 100,45 A 25,25 0 0,1 82.3,37.7' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='78' y='52' font-size='12' fill='#e53e3e'>${alpha}°</text><path d='M 165,20 A 25,25 0 0,0 175,40' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='152' y='38' font-size='12' fill='#e53e3e'>θ</text></svg></div>`;

    return {
      strand: "Trigonometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Trigonometry",
      prompt: `In the figure below, the unit of length is cm. Find the value of $x$ and of $\\theta$.\n\nGive $x$ correct to 3 significant figures and $\\theta$ correct to 1 decimal place.\n\n${svg}`,
      diagramSvg: svg,
      inputCount: 2,
      inputLabels: ["x =", "θ ="],
      expectedAnswer: [x_ans, theta_ans],
      displayAnswer: `x \\approx ${x_ans}\\text{ cm},\\; \\theta \\approx ${theta_ans}^\\circ`,
      extraKeys,
      steps: [
        `In right triangle $ABD$, solve for $x$: $$${step1a}$$`,
        `$$${step1b}$$`,
        `In right triangle $BCD$, solve for $\\theta$: $$${step2a}$$`,
        `$$${step2b}$$`
      ]
    };
  }

  // subType === 4: Overlapping right triangles ADC and ADB sharing side AD (x and θ)
  const alpha = randInt(35, 55);
  const b = randInt(7, 10);
  const c = randInt(10, 15);

  const x_ans = toSigFigs(b * Math.sin(toRad(alpha)), 3);
  const theta_ans = toDeg1dp(Math.asin(parseFloat(x_ans) / c));

  const step1a = `\\sin(${alpha}^\\circ) = \\frac{x}{${b}}`;
  const step1b = `x = ${b} \\times \\sin(${alpha}^\\circ) \\approx ${x_ans}\\text{ cm}`;
  const step2a = `\\sin \\theta = \\frac{${x_ans}}{${c}}`;
  const step2b = `\\theta = \\sin^{-1}\\left(\\frac{${x_ans}}{${c}}\\right) \\approx ${theta_ans}^\\circ`;

  const svg = `<div style='text-align: center; margin-top: 12px;'><svg width='240' height='160' viewBox='0 0 240 160'><polygon points='30,30 90,30 30,130' fill='none' stroke='#2b6cb0' stroke-width='2'/><polygon points='30,30 200,30 30,130' fill='none' stroke='#2b6cb0' stroke-width='2'/><rect x='30' y='30' width='15' height='15' fill='none' stroke='#2b6cb0' stroke-width='1.5'/><text x='18' y='25' font-size='14' fill='#2d3748'>D</text><text x='90' y='22' font-size='14' fill='#2d3748'>C</text><text x='205' y='25' font-size='14' fill='#2d3748'>B</text><text x='18' y='142' font-size='14' fill='#2d3748'>A</text><text x='20' y='85' font-size='13' fill='#2d3748' text-anchor='end'>x</text><text x='65' y='90' font-size='13' fill='#2d3748'>${b}</text><text x='125' y='95' font-size='13' fill='#2d3748'>${c}</text><path d='M 68,30 A 22,22 0 0,0 78.7,48.9' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='52' y='48' font-size='12' fill='#e53e3e'>${alpha}°</text><path d='M 170,30 A 30,30 0 0,0 174.1,45.2' fill='none' stroke='#e53e3e' stroke-width='1.5'/><text x='155' y='42' font-size='12' fill='#e53e3e'>θ</text></svg></div>`;

  return {
    strand: "Trigonometry",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Trigonometry",
    prompt: `In the figure below, the unit of length is cm. Find the value of $x$ and of $\\theta$.\n\nGive $x$ correct to 3 significant figures and $\\theta$ correct to 1 decimal place.\n\n${svg}`,
    diagramSvg: svg,
    inputCount: 2,
    inputLabels: ["x =", "θ ="],
    expectedAnswer: [x_ans, theta_ans],
    displayAnswer: `x \\approx ${x_ans}\\text{ cm},\\; \\theta \\approx ${theta_ans}^\\circ`,
    extraKeys,
    steps: [
      `In right triangle $ADC$, solve for $x$: $$${step1a}$$`,
      `$$${step1b}$$`,
      `In right triangle $ADB$, solve for $\\theta$: $$${step2a}$$`,
      `$$${step2b}$$`
    ]
  };
}

export const trigonometry = { generate: generateQuestion };
export default generateQuestion;
```[cite: 20]
