/**
 * Question Generator: Graphs of Functions
 * Curriculum Skill: Sec 3 G3 - Algebra / Functions
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function shuffleIndices(length) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildSvgAxes() {
  return `<svg viewBox='0 0 220 180' width='220' height='180' style='background:#ffffff; border:1px solid #d1d5db; border-radius:8px; display:block; margin:10px 0;'><defs><marker id='ar' viewBox='0 0 10 10' refX='5' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M 0 0 L 10 5 L 0 10 z' fill='#333333'/></marker></defs><line x1='20' y1='100' x2='200' y2='100' stroke='#333333' stroke-width='2' marker-end='url(#ar)'/><line x1='110' y1='170' x2='110' y2='15' stroke='#333333' stroke-width='2' marker-end='url(#ar)'/><text x='192' y='118' font-size='13' font-style='italic'>x</text><text x='116' y='22' font-size='13' font-style='italic'>y</text><text x='98' y='116' font-size='13' font-style='italic'>O</text>`;
}

export function generateQuestion(tier = 1) {
  const extraKeys = [];
  const letters = ["A", "B", "C", "D"];

  // =========================================================
  // TIER 1: BASIC (Positive Linear, Quadratic, Cubic & Constant Graphs)
  // =========================================================
  if (tier === 1) {
    const type = randInt(0, 3);
    const optsRaw = ["$y = 2x$", "$y = 3x^2$", "$y = x^3$", "$y = 3$"];
    const order = shuffleIndices(4);
    const ans = letters[order.indexOf(type)];

    const bodies = [
      "<line x1='40' y1='160' x2='180' y2='40' stroke='#d9534f' stroke-width='2.5'/>",
      "<path d='M 50 30 Q 110 170 170 30' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
      "<path d='M 30 170 C 70 100 90 100 110 100 C 130 100 150 100 190 30' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
      "<line x1='20' y1='50' x2='200' y2='50' stroke='#d9534f' stroke-width='2.5'/><line x1='107' y1='50' x2='113' y2='50' stroke='#333333' stroke-width='2'/><text x='95' y='46' font-size='12' fill='#d9534f'>3</text>"
    ];

    const explanations = [
      "$y = 2x$ is a straight line with a positive gradient passing through the origin $O$.",
      "$y = 3x^2$ is a U-shaped parabola (opening upwards) with its turning point at the origin $O$.",
      "$y = x^3$ is a cubic curve rising from bottom-left to top-right with a point of inflection at the origin $O$.",
      "$y = 3$ is a horizontal line passing through $(0, 3)$."
    ];

    const svg = `${buildSvgAxes()}${bodies[type]}</svg>`;
    const optionsText = order.map((idx, i) => `${letters[i]}: ${optsRaw[idx]}`).join("\n\n");

    return {
      strand: "Algebra",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Graphs of Functions",
      prompt: `Select the equation of the graph shown below:\n\n${svg}\n\n${optionsText}`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["Option:"],
      expectedAnswer: ans,
      displayAnswer: `${ans} (${optsRaw[type]})`,
      extraKeys,
      steps: [explanations[type]]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Reflected Linear, Quadratic, Cubic & Constant Graphs; Reciprocal & Inverse-Square Graphs)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Negative/reflected basic functions
      const type = randInt(0, 3);
      const optsRaw = ["$y = -2x$", "$y = -3x^2$", "$y = -x^3$", "$y = -3$"];
      const order = shuffleIndices(4);
      const ans = letters[order.indexOf(type)];

      const bodies = [
        "<line x1='40' y1='40' x2='180' y2='160' stroke='#d9534f' stroke-width='2.5'/>",
        "<path d='M 50 170 Q 110 30 170 170' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
        "<path d='M 30 30 C 70 100 90 100 110 100 C 130 100 150 100 190 170' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
        "<line x1='20' y1='150' x2='200' y2='150' stroke='#d9534f' stroke-width='2.5'/><line x1='107' y1='150' x2='113' y2='150' stroke='#333333' stroke-width='2'/><text x='89' y='154' font-size='12' fill='#d9534f'>-3</text>"
      ];

      const explanations = [
        "$y = -2x$ is a straight line with a negative gradient passing through the origin $O$.",
        "$y = -3x^2$ is an inverted parabola (opening downwards) with its maximum point at the origin $O$.",
        "$y = -x^3$ is a cubic curve falling from top-left to bottom-right through the origin $O$.",
        "$y = -3$ is a horizontal line passing through $(0, -3)$."
      ];

      const svg = `${buildSvgAxes()}${bodies[type]}</svg>`;
      const optionsText = order.map((idx, i) => `${letters[i]}: ${optsRaw[idx]}`).join("\n\n");

      return {
        strand: "Algebra",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Graphs of Functions",
        prompt: `Select the equation of the graph shown below:\n\n${svg}\n\n${optionsText}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: ["Option:"],
        expectedAnswer: ans,
        displayAnswer: `${ans} (${optsRaw[type]})`,
        extraKeys,
        steps: [explanations[type]]
      };
    }

    // subType === 2: Reciprocal (1/x) and inverse-square (1/x^2) graphs
    const type = randInt(0, 3);
    const optsRaw = [
      "$y = \\frac{4}{x}$",
      "$y = -\\frac{1}{x}$",
      "$y = \\frac{1}{x^2}$",
      "$y = -\\frac{3}{x^2}$"
    ];
    const order = shuffleIndices(4);
    const ans = letters[order.indexOf(type)];

    const bodies = [
      "<path d='M 120 25 Q 125 85 195 92' fill='none' stroke='#d9534f' stroke-width='2.5'/><path d='M 25 108 Q 95 115 100 175' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
      "<path d='M 25 92 Q 95 85 100 25' fill='none' stroke='#d9534f' stroke-width='2.5'/><path d='M 120 175 Q 125 115 195 108' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
      "<path d='M 120 25 Q 123 88 195 93' fill='none' stroke='#d9534f' stroke-width='2.5'/><path d='M 25 93 Q 97 88 100 25' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
      "<path d='M 120 175 Q 123 112 195 107' fill='none' stroke='#d9534f' stroke-width='2.5'/><path d='M 25 107 Q 97 112 100 175' fill='none' stroke='#d9534f' stroke-width='2.5'/>"
    ];

    const explanations = [
      "$y = \\frac{4}{x}$ has branches in the 1st and 3rd quadrants asymptotic to both axes.",
      "$y = -\\frac{1}{x}$ has branches in the 2nd and 4th quadrants asymptotic to both axes.",
      "$y = \\frac{1}{x^2}$ has both branches above the $x$-axis (1st and 2nd quadrants) asymptotic to both axes.",
      "$y = -\\frac{3}{x^2}$ has both branches below the $x$-axis (3rd and 4th quadrants) asymptotic to both axes."
    ];

    const svg = `${buildSvgAxes()}${bodies[type]}</svg>`;
    const optionsText = order.map((idx, i) => `${letters[i]}: ${optsRaw[idx]}`).join("\n\n");

    return {
      strand: "Algebra",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Graphs of Functions",
      prompt: `Select the equation of the graph shown below:\n\n${svg}\n\n${optionsText}`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["Option:"],
      expectedAnswer: ans,
      displayAnswer: `${ans} (${optsRaw[type]})`,
      extraKeys,
      steps: [explanations[type]]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Exponential Functions & Mixed Function Families)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Exponential graphs with y-intercept markers
    const type = randInt(0, 3);
    const optsRaw = ["$y = 4^x$", "$y = -3^x$", "$y = 2(2^x)$", "$y = -2(3^x)$"];
    const order = shuffleIndices(4);
    const ans = letters[order.indexOf(type)];

    const bodies = [
      "<path d='M 25 97 C 75 96 100 90 185 20' fill='none' stroke='#d9534f' stroke-width='2.5'/><line x1='107' y1='85' x2='113' y2='85' stroke='#333333' stroke-width='2'/><text x='95' y='88' font-size='12' fill='#333333'>1</text>",
      "<path d='M 25 103 C 75 104 100 110 185 180' fill='none' stroke='#d9534f' stroke-width='2.5'/><line x1='107' y1='115' x2='113' y2='115' stroke='#333333' stroke-width='2'/><text x='91' y='118' font-size='12' fill='#333333'>-1</text>",
      "<path d='M 25 97 C 75 94 100 80 185 15' fill='none' stroke='#d9534f' stroke-width='2.5'/><line x1='107' y1='65' x2='113' y2='65' stroke='#333333' stroke-width='2'/><text x='95' y='68' font-size='12' fill='#333333'>2</text>",
      "<path d='M 25 103 C 75 106 100 120 185 185' fill='none' stroke='#d9534f' stroke-width='2.5'/><line x1='107' y1='135' x2='113' y2='135' stroke='#333333' stroke-width='2'/><text x='91' y='138' font-size='12' fill='#333333'>-2</text>"
    ];

    const explanations = [
      "$y = 4^x$ increases rapidly as $x$ increases and crosses the $y$-axis at $(0, 1)$.",
      "$y = -3^x$ decreases rapidly as $x$ increases and crosses the $y$-axis at $(0, -1)$.",
      "$y = 2(2^x)$ increases rapidly as $x$ increases and crosses the $y$-axis at $(0, 2)$.",
      "$y = -2(3^x)$ decreases rapidly as $x$ increases and crosses the $y$-axis at $(0, -2)$."
    ];

    const svg = `${buildSvgAxes()}${bodies[type]}</svg>`;
    const optionsText = order.map((idx, i) => `${letters[i]}: ${optsRaw[idx]}`).join("\n\n");

    return {
      strand: "Algebra",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Graphs of Functions",
      prompt: `Select the equation of the graph shown below:\n\n${svg}\n\n${optionsText}`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["Option:"],
      expectedAnswer: ans,
      displayAnswer: `${ans} (${optsRaw[type]})`,
      extraKeys,
      steps: [explanations[type]]
    };
  }

  // subType === 2: Mixed function families
  const type = randInt(0, 3);
  const optsRaw = ["$y = -\\frac{3}{x^2}$", "$y = -2x^3$", "$y = 2x^2$", "$y = -3^x$"];
  const order = shuffleIndices(4);
  const ans = letters[order.indexOf(type)];

  const bodies = [
    "<path d='M 120 175 Q 123 112 195 107' fill='none' stroke='#d9534f' stroke-width='2.5'/><path d='M 25 107 Q 97 112 100 175' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
    "<path d='M 30 30 C 70 100 90 100 110 100 C 130 100 150 100 190 170' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
    "<path d='M 50 30 Q 110 170 170 30' fill='none' stroke='#d9534f' stroke-width='2.5'/>",
    "<path d='M 25 103 C 75 104 100 110 185 180' fill='none' stroke='#d9534f' stroke-width='2.5'/><line x1='107' y1='115' x2='113' y2='115' stroke='#333333' stroke-width='2'/><text x='91' y='118' font-size='12' fill='#333333'>-1</text>"
  ];

  const explanations = [
    "$y = -\\frac{3}{x^2}$ has both branches below the $x$-axis asymptotic to the $x$- and $y$-axes.",
    "$y = -2x^3$ is a negative cubic curve passing through the origin $O$ and falling from left to right.",
    "$y = 2x^2$ is a U-shaped parabola with its minimum at the origin $O$.",
    "$y = -3^x$ is an exponential decay curve below the $x$-axis crossing the $y$-axis at $(0, -1)$."
  ];

  const svg = `${buildSvgAxes()}${bodies[type]}</svg>`;
  const optionsText = order.map((idx, i) => `${letters[i]}: ${optsRaw[idx]}`).join("\n\n");

  return {
    strand: "Algebra",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Graphs of Functions",
    prompt: `Select the equation of the graph shown below:\n\n${svg}\n\n${optionsText}`,
    diagramSvg: svg,
    inputCount: 1,
    inputLabels: ["Option:"],
    expectedAnswer: ans,
    displayAnswer: `${ans} (${optsRaw[type]})`,
    extraKeys,
    steps: [explanations[type]]
  };
}

export const graphsOfFunctions = { generate: generateQuestion };
export default generateQuestion;
```[cite: 15]
