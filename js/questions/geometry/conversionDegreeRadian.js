/**
 * Question Generator: Convert between Radian & Degrees
 * Curriculum Skill: Sec 3 G3 - Trigonometry
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
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

function toSigFigs(val, sigFigs = 3) {
  return Number(Number(val).toPrecision(sigFigs)).toString();
}

export function generateQuestion(tier = 1) {
  const extraKeys = [];

  // =========================================================
  // TIER 1: BASIC (Radians to Degrees — Exact π Multiples & Decimal Radians)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Exact π radian multiple to degrees
      const degList = [15, 30, 45, 60, 75, 120, 135, 150, 210, 225, 240, 300, 315, 330];
      const deg = degList[randInt(0, degList.length - 1)];
      const g = gcd(deg, 180);
      const k = deg / g;
      const m = 180 / g;

      const radTex =
        m === 1
          ? k === 1
            ? "\\pi"
            : `${k}\\pi`
          : k === 1
            ? `\\frac{\\pi}{${m}}`
            : `\\frac{${k}\\pi}{${m}}`;

      const ans = deg.toString();

      const step1 = `\\pi \\text{ rad} = 180^\\circ`;
      const step2 = `1 \\text{ rad} = \\frac{180^\\circ}{\\pi}`;
      const step3 = `\\begin{aligned} ${radTex} \\text{ rad} &= ${radTex} \\times \\frac{180^\\circ}{\\pi} \\\\ &= ${ans}^\\circ \\end{aligned}`;

      return {
        strand: "Trigonometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Convert between Radian & Degrees",
        prompt: `Express the angle $${radTex}\\text{ rad}$ in degrees.`,
        diagramSvg: null,
        inputCount: 1,
        inputLabels: ["Angle ="],
        expectedAnswer: ans,
        displayAnswer: `${ans}^\\circ`,
        extraKeys,
        steps: [`$$${step1}$$`, `$$${step2}$$`, `$$${step3}$$`]
      };
    }

    // subType === 2: Decimal radian value (0.50 to 6.28 rad) to degrees (1 d.p.)
    const rHundredths = randInt(50, 628);
    const r = Number((rHundredths / 100).toFixed(2));
    const degExact = (r * 180) / Math.PI;
    const ans = Number(degExact.toFixed(1)).toString();
    const numerator = Number((r * 180).toFixed(2)).toString();

    const step1 = `\\pi \\text{ rad} = 180^\\circ`;
    const step2 = `1 \\text{ rad} = \\frac{180^\\circ}{\\pi}`;
    const step3 = `\\begin{aligned} ${r} \\text{ rad} &= ${r} \\times \\frac{180^\\circ}{\\pi} \\\\ &= \\frac{${numerator}^\\circ}{\\pi} \\approx ${ans}^\\circ \\end{aligned}`;

    return {
      strand: "Trigonometry",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Convert between Radian & Degrees",
      prompt: `Express the angle $${r}\\text{ rad}$ in degrees.\n\n(Give your answer correct to 1 decimal place.)`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["Angle ="],
      expectedAnswer: ans,
      displayAnswer: `${ans}^\\circ`,
      extraKeys,
      steps: [`$$${step1}$$`, `$$${step2}$$`, `$$${step3}$$`]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Degrees to Radians — In Terms of π & Decimal Radians)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Degrees to radians in terms of π
    const degList = [30, 45, 60, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 320, 330, 340];
    const deg = degList[randInt(0, degList.length - 1)];
    const g = gcd(deg, 180);
    const k = deg / g;
    const m = 180 / g;

    const ans =
      m === 1
        ? k === 1
          ? "π"
          : `${k}π`
        : k === 1
          ? `π/${m}`
          : `${k}π/${m}`;

    const ansTex =
      m === 1
        ? k === 1
          ? "\\pi"
          : `${k}\\pi`
        : k === 1
          ? `\\frac{\\pi}{${m}}`
          : `\\frac{${k}\\pi}{${m}}`;

    const step1 = `180^\\circ = \\pi \\text{ rad}`;
    const step2 = `1^\\circ = \\frac{\\pi}{180} \\text{ rad}`;
    const step3 = `\\begin{aligned} ${deg}^\\circ &= ${deg} \\times \\frac{\\pi}{180} \\text{ rad} \\\\ &= ${ansTex} \\text{ rad} \\end{aligned}`;

    return {
      strand: "Trigonometry",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Convert between Radian & Degrees",
      prompt: `Express the angle $${deg}^\\circ$ in radians, giving your answer in terms of $\\pi$.`,
      diagramSvg: null,
      inputCount: 1,
      inputLabels: ["Angle ="],
      expectedAnswer: ans,
      displayAnswer: `${ansTex}\\text{ rad}`,
      extraKeys,
      steps: [`$$${step1}$$`, `$$${step2}$$`, `$$${step3}$$`]
    };
  }

  // subType === 2: General degree angle (20° to 350°) to decimal radians (3 s.f.)
  const deg = randInt(20, 350);
  const radExact = (deg * Math.PI) / 180;
  const ans = toSigFigs(radExact, 3);

  const step1 = `180^\\circ = \\pi \\text{ rad}`;
  const step2 = `1^\\circ = \\frac{\\pi}{180} \\text{ rad}`;
  const step3 = `\\begin{aligned} ${deg}^\\circ &= ${deg} \\times \\frac{\\pi}{180} \\text{ rad} \\\\ &\\approx ${ans} \\text{ rad} \\end{aligned}`;

  return {
    strand: "Trigonometry",
    tier: 2,
    tierName: "Intermediate",
    skillTitle: "Convert between Radian & Degrees",
    prompt: `Express the angle $${deg}^\\circ$ in radians.\n\n(Give your answer correct to 3 significant figures.)`,
    diagramSvg: null,
    inputCount: 1,
    inputLabels: ["Angle ="],
    expectedAnswer: ans,
    displayAnswer: `${ans}\\text{ rad}`,
    extraKeys,
    steps: [`$$${step1}$$`, `$$${step2}$$`, `$$${step3}$$`]
  };
}

export const conversionBetweenRadianAndDegrees = { generate: generateQuestion };
export default generateQuestion;
```[cite: 15]
