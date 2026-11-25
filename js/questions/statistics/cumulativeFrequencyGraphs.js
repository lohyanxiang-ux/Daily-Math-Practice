/**
 * Question Generator: Cumulative Frequency Graphs
 * Curriculum Skill: Sec 3 G3 - Statistics / Data Analysis
 */

function randInt(min, max, excludeZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (excludeZero && val === 0);
  return val;
}

function pickRandom(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/**
 * Deterministic smooth cumulative frequency function CF(x) on [xMin, xMax]
 * mapped to [0, total] via a smooth S-curve (smoothstep / cubic blend).
 */
function smoothstep01(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

function evalCf(x, xMin, xMax, total) {
  const t = (x - xMin) / (xMax - xMin);
  return Math.round(total * smoothstep01(t));
}

function invertCfForValue(targetCf, xMin, xMax, total) {
  // Monotone non-decreasing lookup with linear interpolation on grid steps
  const steps = 200;
  for (let i = 0; i < steps; i++) {
    const xA = xMin + ((xMax - xMin) * i) / steps;
    const xB = xMin + ((xMax - xMin) * (i + 1)) / steps;
    const cfA = evalCf(xA, xMin, xMax, total);
    const cfB = evalCf(xB, xMin, xMax, total);
    if (targetCf >= cfA && targetCf <= cfB) {
      if (cfB === cfA) return Number(xA.toFixed(1));
      const frac = (targetCf - cfA) / (cfB - cfA);
      return Number((xA + frac * (xB - xA)).toFixed(1));
    }
  }
  return targetCf <= 0 ? xMin : xMax;
}

/**
 * Builds an SVG cumulative frequency graph with major/minor gridlines,
 * optional x-axis break, smooth curve, and optional dashed reference lines.
 */
function buildCfGraphSvg({
  title,
  xLabel,
  yLabel = "Cumulative frequency",
  xMin,
  xMax,
  xStep,
  total,
  yStep,
  hasBreak = false,
  highlights = []
}) {
  const width = 420;
  const height = 290;
  const padLeft = 62;
  const padRight = 24;
  const padTop = 38;
  const padBottom = 46;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const yMax = Math.ceil((total * 1.08) / yStep) * yStep;

  const toSvgX = (val) => padLeft + ((val - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (cf) => padTop + plotH - (cf / yMax) * plotH;

  let gridLines = "";
  const xMinorCount = 5;
  const xMinorStep = xStep / xMinorCount;
  for (let xv = xMin; xv <= xMax + 1e-9; xv += xMinorStep) {
    const isMajor =
      Math.abs(Math.round((xv - xMin) / xStep) - (xv - xMin) / xStep) < 1e-6;
    const sx = toSvgX(xv).toFixed(1);
    gridLines += `<line x1='${sx}' y1='${padTop}' x2='${sx}' y2='${(padTop + plotH).toFixed(1)}' stroke='${isMajor ? "#cbd5e1" : "#e2e8f0"}' stroke-width='${isMajor ? "1.1" : "0.6"}'/>`;
  }

  const yMinorCount = 5;
  const yMinorStep = yStep / yMinorCount;
  for (let yv = 0; yv <= yMax + 1e-9; yv += yMinorStep) {
    const isMajor =
      Math.abs(Math.round(yv / yStep) - yv / yStep) < 1e-6;
    const sy = toSvgY(yv).toFixed(1);
    gridLines += `<line x1='${padLeft}' y1='${sy}' x2='${(padLeft + plotW).toFixed(1)}' y2='${sy}' stroke='${isMajor ? "#cbd5e1" : "#e2e8f0"}' stroke-width='${isMajor ? "1.1" : "0.6"}'/>`;
  }

  // Axis ticks & labels
  let ticksAndLabels = "";
  for (let xv = xMin; xv <= xMax + 1e-9; xv += xStep) {
    const sx = toSvgX(xv).toFixed(1);
    const baseY = (padTop + plotH).toFixed(1);
    ticksAndLabels += `<line x1='${sx}' y1='${(padTop + plotH - 4).toFixed(1)}' x2='${sx}' y2='${(padTop + plotH + 4).toFixed(1)}' stroke='#1e293b' stroke-width='1.5'/><text x='${sx}' y='${(padTop + plotH + 17).toFixed(1)}' font-size='11' fill='#1e293b' text-anchor='middle' font-family='sans-serif'>${Math.round(xv)}</text>`;
  }

  for (let yv = 0; yv <= yMax + 1e-9; yv += yStep) {
    const sy = toSvgY(yv).toFixed(1);
    ticksAndLabels += `<line x1='${(padLeft - 4).toFixed(1)}' y1='${sy}' x2='${(padLeft + 4).toFixed(1)}' y2='${sy}' stroke='#1e293b' stroke-width='1.5'/><text x='${(padLeft - 8).toFixed(1)}' y='${(Number(sy) + 4).toFixed(1)}' font-size='11' fill='#1e293b' text-anchor='end' font-family='sans-serif'>${Math.round(yv)}</text>`;
  }

  // Origin label
  ticksAndLabels += `<text x='${(padLeft - 8).toFixed(1)}' y='${(padTop + plotH + 17).toFixed(1)}' font-size='11' fill='#475569' text-anchor='end' font-family='sans-serif'>0</text>`;

  // Optional axis break zig-zag on x-axis
  const axisBreakSvg = hasBreak
    ? `<polyline points='${(padLeft + 10).toFixed(1)},${(padTop + plotH).toFixed(1)} ${(padLeft + 15).toFixed(1)},${(padTop + plotH - 7).toFixed(1)} ${(padLeft + 21).toFixed(1)},${(padTop + plotH + 7).toFixed(1)} ${(padLeft + 26).toFixed(1)},${(padTop + plotH).toFixed(1)}' fill='none' stroke='#1e293b' stroke-width='1.6'/>`
    : "";

  // Smooth curve path
  const samples = 60;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const xv = xMin + ((xMax - xMin) * i) / samples;
    const cf = evalCf(xv, xMin, xMax, total);
    pts.push(`${i === 0 ? "M" : "L"} ${toSvgX(xv).toFixed(1)} ${toSvgY(cf).toFixed(1)}`);
  }
  const curvePath = `<path d='${pts.join(" ")}' fill='none' stroke='#16a34a' stroke-width='2.4' stroke-linecap='round'/>`;

  // Dashed guide lines for worked solution steps
  let guideSvg = "";
  for (const h of highlights) {
    const sx = toSvgX(h.x).toFixed(1);
    const sy = toSvgY(h.cf).toFixed(1);
    const baseY = (padTop + plotH).toFixed(1);
    guideSvg += `<line x1='${sx}' y1='${sy}' x2='${sx}' y2='${baseY}' stroke='#dc2626' stroke-width='1.2' stroke-dasharray='4,3'/><line x1='${padLeft}' y1='${sy}' x2='${sx}' y2='${sy}' stroke='#dc2626' stroke-width='1.2' stroke-dasharray='4,3'/><circle cx='${sx}' cy='${sy}' r='3.5' fill='#dc2626'/>`;
  }

  return `<svg width='${width}' height='${height}' viewBox='0 0 ${width} ${height}' xmlns='http://www.w3.org/2000/svg' style='background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; display:block; margin:10px auto; max-width:100%;'><defs><marker id='cfArr' viewBox='0 0 10 10' refX='6' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M 0 0 L 10 5 L 0 10 z' fill='#1e293b'/></marker></defs><text x='${(width / 2).toFixed(1)}' y='20' font-size='13' font-weight='bold' fill='#0f172a' text-anchor='middle' font-family='sans-serif'>${title}</text>${gridLines}${axisBreakSvg}<line x1='${padLeft}' y1='${(padTop + plotH).toFixed(1)}' x2='${(width - 10).toFixed(1)}' y2='${(padTop + plotH).toFixed(1)}' stroke='#1e293b' stroke-width='1.8' marker-end='url(#cfArr)'/><line x1='${padLeft}' y1='${(padTop + plotH).toFixed(1)}' x2='${padLeft}' y2='28' stroke='#1e293b' stroke-width='1.8' marker-end='url(#cfArr)'/>${ticksAndLabels}${curvePath}${guideSvg}<text x='${(padLeft + plotW / 2).toFixed(1)}' y='${(height - 7).toFixed(1)}' font-size='12' font-weight='bold' fill='#1e293b' text-anchor='middle' font-family='sans-serif'>${xLabel}</text><text x='16' y='${(padTop + plotH / 2).toFixed(1)}' font-size='12' font-weight='bold' fill='#1e293b' text-anchor='middle' transform='rotate(-90, 16, ${(padTop + plotH / 2).toFixed(1)})' font-family='sans-serif'>${yLabel}</text></svg>`;
}

const SCENARIOS = [
  {
    entity: "cars",
    singular: "car",
    title: "Speeds of cars",
    xLabel: "Speed (km/h)",
    unit: "km/h",
    context:
      "The speeds of $500$ cars passing by a speed camera on an expressway were recorded. The cumulative frequency graph shows the distribution of the speeds in kilometres per hour.",
    total: 500,
    xMin: 40,
    xMax: 90,
    xStep: 10,
    yStep: 100,
    hasBreak: true,
    upperPhrases: [
      (x) => `had speeds greater than $${x}\\text{ km/h}$`,
      (x) => `were speeding if the speed limit was $${x}\\text{ km/h}$`
    ],
    lowerPhrases: (x) => `had speeds less than or equal to $${x}\\text{ km/h}$`,
    sampleX: [50, 60, 70, 80]
  },
  {
    entity: "students",
    singular: "student",
    title: "Times taken to solve a mathematical puzzle",
    xLabel: "Time (min)",
    unit: "min",
    context:
      "$150$ students were asked to solve a mathematical puzzle. The cumulative frequency graph shows the distribution of the times in minutes taken to solve the puzzle.",
    total: 150,
    xMin: 10,
    xMax: 60,
    xStep: 10,
    yStep: 50,
    hasBreak: false,
    upperPhrases: [
      (x) => `took more than $${x}$ minutes to solve the puzzle`
    ],
    lowerPhrases: (x) => `took at most $${x}$ minutes to solve the puzzle`,
    sampleX: [20, 30, 40, 50]
  },
  {
    entity: "parcels",
    singular: "parcel",
    title: "Masses of parcels",
    xLabel: "Mass (kg)",
    unit: "kg",
    context:
      "The masses of $100$ small parcels that arrived at a post office on a particular day were measured. The cumulative frequency graph shows the distribution of the masses in kilograms.",
    total: 100,
    xMin: 0,
    xMax: 10,
    xStep: 2,
    yStep: 20,
    hasBreak: false,
    upperPhrases: [
      (x) => `had masses greater than $${x}\\text{ kg}$`
    ],
    lowerPhrases: (x) => `had masses equal to $${x}\\text{ kg}$ or less`,
    sampleX: [2, 4, 6, 8]
  },
  {
    entity: "students",
    singular: "student",
    title: "Number of trips made by students",
    xLabel: "Number of trips",
    unit: " trips",
    context:
      "The cumulative frequency graph shows the distribution of the number of trips made via public transport by $300$ students in the first school term of the year.",
    total: 300,
    xMin: 90,
    xMax: 115,
    xStep: 5,
    yStep: 100,
    hasBreak: true,
    upperPhrases: [
      (x) => `made more than $${x}$ trips`
    ],
    lowerPhrases: (x) => `made at most $${x}$ trips`,
    sampleX: [95, 100, 105, 110]
  },
  {
    entity: "plants",
    singular: "plant",
    title: "Heights of plants",
    xLabel: "Height (cm)",
    unit: " cm",
    context:
      "The cumulative frequency graph shows the distribution of the heights, in centimetres, of $400$ plants after two months.",
    total: 400,
    xMin: 0,
    xMax: 60,
    xStep: 10,
    yStep: 100,
    hasBreak: false,
    upperPhrases: [
      (x) => `had heights greater than $${x}\\text{ cm}$`
    ],
    lowerPhrases: (x) => `had heights less than or equal to $${x}\\text{ cm}$`,
    sampleX: [15, 20, 30, 40, 45, 50]
  }
];

export function generateQuestion(tier = 1) {
  const extraKeys = [];
  const sc = pickRandom(SCENARIOS);

  // =========================================================
  // TIER 1: BASIC (Direct CF Reading, Tail Count/% & CF Table Lookup)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Type 1A: Number or percentage of items <= x
      const xVal = pickRandom(sc.sampleX);
      const cfVal = evalCf(xVal, sc.xMin, sc.xMax, sc.total);
      const askPct = randInt(0, 1) === 1;
      const pctVal = Number(((cfVal / sc.total) * 100).toPrecision(3)).toString();
      const ans = askPct ? pctVal : cfVal.toString();

      const svg = buildCfGraphSvg({
        title: sc.title,
        xLabel: sc.xLabel,
        xMin: sc.xMin,
        xMax: sc.xMax,
        xStep: sc.xStep,
        total: sc.total,
        yStep: sc.yStep,
        hasBreak: sc.hasBreak,
        highlights: [{ x: xVal, cf: cfVal }]
      });

      const targetDesc = askPct
        ? `the percentage of ${sc.entity} that ${sc.lowerPhrases(xVal)}`
        : `the number of ${sc.entity} that ${sc.lowerPhrases(xVal)}`;

      const steps = askPct
        ? [
            `From the graph at $${sc.xLabel.split(" ")[0].toLowerCase()} = ${xVal}$, the cumulative frequency is $${cfVal}$.`,
            `Calculate the percentage of ${sc.entity}: $$\\frac{${cfVal}}{${sc.total}} \\times 100\\% = ${ans}\\%$$`
          ]
        : [
            `Locate $${xVal}$ on the horizontal axis and read up to the curve to find the cumulative frequency: $$\\text{CF}(${xVal}) = ${cfVal}$$`
          ];

      return {
        strand: "Statistics",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Cumulative Frequency Graphs",
        prompt: `${sc.context}\n\n${svg}\n\nUse the graph to estimate ${targetDesc}.${askPct ? " (Give your answer correct to 3 significant figures.)" : ""}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: [askPct ? "Percentage (%) =" : `Number of ${sc.entity} =`],
        expectedAnswer: ans,
        displayAnswer: askPct ? `${ans}\\%` : ans,
        extraKeys,
        steps
      };
    }

    if (subType === 2) {
      // Type 1B: Tail count or percentage (> x)
      const xVal = pickRandom(sc.sampleX);
      const cfVal = evalCf(xVal, sc.xMin, sc.xMax, sc.total);
      const tailCount = sc.total - cfVal;
      const askPct = randInt(0, 1) === 1;
      const pctVal = Number(((tailCount / sc.total) * 100).toPrecision(3)).toString();
      const ans = askPct ? pctVal : tailCount.toString();

      const svg = buildCfGraphSvg({
        title: sc.title,
        xLabel: sc.xLabel,
        xMin: sc.xMin,
        xMax: sc.xMax,
        xStep: sc.xStep,
        total: sc.total,
        yStep: sc.yStep,
        hasBreak: sc.hasBreak,
        highlights: [{ x: xVal, cf: cfVal }]
      });

      const phrase = pickRandom(sc.upperPhrases)(xVal);
      const targetDesc = askPct
        ? `the percentage of ${sc.entity} that ${phrase}`
        : `the number of ${sc.entity} that ${phrase}`;

      const steps = askPct
        ? [
            `Read the cumulative frequency at $${xVal}$: $$\\text{CF}(${xVal}) = ${cfVal}$$`,
            `Find the number of ${sc.entity} above $${xVal}$: $$${sc.total} - ${cfVal} = ${tailCount}$$`,
            `Express as a percentage of $${sc.total}$: $$\\frac{${tailCount}}{${sc.total}} \\times 100\\% = ${ans}\\%$$`
          ]
        : [
            `Read the cumulative frequency at $${xVal}$: $$\\text{CF}(${xVal}) = ${cfVal}$$`,
            `Subtract from the total frequency: $$${sc.total} - ${cfVal} = ${tailCount}$$`
          ];

      return {
        strand: "Statistics",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Cumulative Frequency Graphs",
        prompt: `${sc.context}\n\n${svg}\n\nUse the graph to estimate ${targetDesc}.${askPct ? " (Give your answer correct to 3 significant figures.)" : ""}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: [askPct ? "Percentage (%) =" : `Number of ${sc.entity} =`],
        expectedAnswer: ans,
        displayAnswer: askPct ? `${ans}\\%` : ans,
        extraKeys,
        steps
      };
    }

    // subType === 3: Type 1C - Cumulative frequency at a specific upper boundary in a CF table
    const xVal = pickRandom(sc.sampleX);
    const cfVal = evalCf(xVal, sc.xMin, sc.xMax, sc.total);
    const ans = cfVal.toString();

    const svg = buildCfGraphSvg({
      title: sc.title,
      xLabel: sc.xLabel,
      xMin: sc.xMin,
      xMax: sc.xMax,
      xStep: sc.xStep,
      total: sc.total,
      yStep: sc.yStep,
      hasBreak: sc.hasBreak,
      highlights: [{ x: xVal, cf: cfVal }]
    });

    return {
      strand: "Statistics",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Cumulative Frequency Graphs",
      prompt: `${sc.context}\n\n${svg}\n\nFind the cumulative frequency for the class boundary $x \\le ${xVal}$.`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: [`CF(x ≤ ${xVal}) =`],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys,
      steps: [
        `Locate $x = ${xVal}$ along the horizontal axis and move vertically to the cumulative frequency curve.`,
        `Read across to the vertical axis to get the cumulative frequency: $$${ans}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Interval Count, Reverse Lookup x & Class Frequency)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Type 2A: Interval count or percentage (a < x <= b)
      const idxA = randInt(0, sc.sampleX.length - 2);
      const xA = sc.sampleX[idxA];
      const xB = sc.sampleX[idxA + 1];

      const cfA = evalCf(xA, sc.xMin, sc.xMax, sc.total);
      const cfB = evalCf(xB, sc.xMin, sc.xMax, sc.total);
      const intervalCount = cfB - cfA;
      const askPct = randInt(0, 1) === 1;
      const pctVal = Number(((intervalCount / sc.total) * 100).toPrecision(3)).toString();
      const ans = askPct ? pctVal : intervalCount.toString();

      const svg = buildCfGraphSvg({
        title: sc.title,
        xLabel: sc.xLabel,
        xMin: sc.xMin,
        xMax: sc.xMax,
        xStep: sc.xStep,
        total: sc.total,
        yStep: sc.yStep,
        hasBreak: sc.hasBreak,
        highlights: [
          { x: xA, cf: cfA },
          { x: xB, cf: cfB }
        ]
      });

      const targetDesc = askPct
        ? `the percentage of ${sc.entity} with values greater than $${xA}$ and less than or equal to $${xB}$`
        : `the number of ${sc.entity} with values between $${xA}$ and $${xB}$ ($${xA} < x \\le ${xB}$)`;

      const steps = askPct
        ? [
            `Read the cumulative frequencies: $$\\text{CF}(${xB}) = ${cfB} \\quad \\text{and} \\quad \\text{CF}(${xA}) = ${cfA}$$`,
            `Subtract to find the number of ${sc.entity} in the interval: $$${cfB} - ${cfA} = ${intervalCount}$$`,
            `Convert to a percentage: $$\\frac{${intervalCount}}{${sc.total}} \\times 100\\% = ${ans}\\%$$`
          ]
        : [
            `Read the cumulative frequencies at both boundaries: $$\\text{CF}(${xB}) = ${cfB} \\quad \\text{and} \\quad \\text{CF}(${xA}) = ${cfA}$$`,
            `Subtract the lower cumulative frequency from the upper one: $$${cfB} - ${cfA} = ${intervalCount}$$`
          ];

      return {
        strand: "Statistics",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Cumulative Frequency Graphs",
        prompt: `${sc.context}\n\n${svg}\n\nUse the graph to estimate ${targetDesc}.${askPct ? " (Give your answer correct to 3 significant figures.)" : ""}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: [askPct ? "Percentage (%) =" : `Number of ${sc.entity} =`],
        expectedAnswer: ans,
        displayAnswer: askPct ? `${ans}\\%` : ans,
        extraKeys,
        steps
      };
    }

    if (subType === 2) {
      // Type 2B: Reverse lookup - estimate k or x from a given count or percentage
      const pctGiven = pickRandom([20, 25, 40, 60, 75]);
      const isUpperTail = randInt(0, 1) === 1;
      const tailCount = Math.round((pctGiven / 100) * sc.total);
      const targetCf = isUpperTail ? sc.total - tailCount : tailCount;
      const estX = invertCfForValue(targetCf, sc.xMin, sc.xMax, sc.total);
      const ans = estX.toString();

      const svg = buildCfGraphSvg({
        title: sc.title,
        xLabel: sc.xLabel,
        xMin: sc.xMin,
        xMax: sc.xMax,
        xStep: sc.xStep,
        total: sc.total,
        yStep: sc.yStep,
        hasBreak: sc.hasBreak,
        highlights: [{ x: estX, cf: targetCf }]
      });

      const promptText = isUpperTail
        ? `${pctGiven}\\% of the ${sc.entity} have values greater than $k$. Estimate the value of $k$. (Give your answer correct to 1 decimal place.)`
        : `${pctGiven}\\% of the ${sc.entity} have values less than or equal to $x$. Estimate the value of $x$. (Give your answer correct to 1 decimal place.)`;

      const varName = isUpperTail ? "k" : "x";
      const steps = isUpperTail
        ? [
            `Calculate $${pctGiven}\\%$ of $${sc.total}$ ${sc.entity}: $$\\frac{${pctGiven}}{100} \\times ${sc.total} = ${tailCount}$$`,
            `Since $${tailCount}$ ${sc.entity} are above $k$, the cumulative frequency at $k$ is: $$\\text{CF}(k) = ${sc.total} - ${tailCount} = ${targetCf}$$`,
            `Locate $${targetCf}$ on the vertical axis, move across to the curve, and read down to estimate $k$: $$k \\approx ${ans}$$`
          ]
        : [
            `Calculate $${pctGiven}\\%$ of $${sc.total}$ ${sc.entity}: $$\\text{CF}(x) = \\frac{${pctGiven}}{100} \\times ${sc.total} = ${targetCf}$$`,
            `Locate $${targetCf}$ on the vertical axis, move across to the curve, and read down to estimate $x$: $$x \\approx ${ans}$$`
          ];

      return {
        strand: "Statistics",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Cumulative Frequency Graphs",
        prompt: `${sc.context}\n\n${svg}\n\n${promptText}`,
        diagramSvg: svg,
        inputCount: 1,
        inputLabels: [`${varName} =`],
        expectedAnswer: ans,
        displayAnswer: `${varName} \\approx ${ans}`,
        extraKeys,
        steps
      };
    }

    // subType === 3: Type 2C - Frequency of a specific class interval (a < x <= b)
    const idxA = randInt(0, sc.sampleX.length - 2);
    const xA = sc.sampleX[idxA];
    const xB = sc.sampleX[idxA + 1];
    const cfA = evalCf(xA, sc.xMin, sc.xMax, sc.total);
    const cfB = evalCf(xB, sc.xMin, sc.xMax, sc.total);
    const freq = cfB - cfA;
    const ans = freq.toString();

    const svg = buildCfGraphSvg({
      title: sc.title,
      xLabel: sc.xLabel,
      xMin: sc.xMin,
      xMax: sc.xMax,
      xStep: sc.xStep,
      total: sc.total,
      yStep: sc.yStep,
      hasBreak: sc.hasBreak,
      highlights: [
        { x: xA, cf: cfA },
        { x: xB, cf: cfB }
      ]
    });

    return {
      strand: "Statistics",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Cumulative Frequency Graphs",
      prompt: `${sc.context}\n\n${svg}\n\nFind the frequency of ${sc.entity} in the class interval $${xA} < x \\le ${xB}$.`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["Frequency ="],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys,
      steps: [
        `Read the cumulative frequency at the upper class boundary $x = ${xB}$: $$\\text{CF}(${xB}) = ${cfB}$$`,
        `Read the cumulative frequency at the lower class boundary $x = ${xA}$: $$\\text{CF}(${xA}) = ${cfA}$$`,
        `Subtract to find the class frequency: $$${cfB} - ${cfA} = ${freq}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Complement / Filter Conditions & Cutoff + Interval Queries)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Type 3A: Threshold / filter condition (discarded/excluded below x -> percentage kept/remaining)
    const xCut = pickRandom(sc.sampleX);
    const cfCut = evalCf(xCut, sc.xMin, sc.xMax, sc.total);
    const keptCount = sc.total - cfCut;
    const keptPct = Number(((keptCount / sc.total) * 100).toPrecision(3)).toString();
    const ans = keptPct;

    const svg = buildCfGraphSvg({
      title: sc.title,
      xLabel: sc.xLabel,
      xMin: sc.xMin,
      xMax: sc.xMax,
      xStep: sc.xStep,
      total: sc.total,
      yStep: sc.yStep,
      hasBreak: sc.hasBreak,
      highlights: [{ x: xCut, cf: cfCut }]
    });

    return {
      strand: "Statistics",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Cumulative Frequency Graphs",
      prompt: `${sc.context}\n\n${svg}\n\nItems with a measurement less than or equal to $${xCut}$ are excluded from the main group. Find the percentage of ${sc.entity} that remain in the main group. (Give your answer correct to 3 significant figures.)`,
      diagramSvg: svg,
      inputCount: 1,
      inputLabels: ["Percentage (%) ="],
      expectedAnswer: ans,
      displayAnswer: `${ans}\\%`,
      extraKeys,
      steps: [
        `Read the number of ${sc.entity} with value $\\le ${xCut}$ from the graph: $$\\text{CF}(${xCut}) = ${cfCut}$$`,
        `Find the number of ${sc.entity} remaining above $${xCut}$: $$${sc.total} - ${cfCut} = ${keptCount}$$`,
        `Calculate the percentage remaining: $$\\frac{${keptCount}}{${sc.total}} \\times 100\\% = ${ans}\\%$$`
      ]
    };
  }

  // subType === 2: Top p% cutoff k, then find number of items between xLow and estimated k
  const topPct = pickRandom([10, 20, 25]);
  const topCount = Math.round((topPct / 100) * sc.total);
  const cfAtK = sc.total - topCount;
  const kEst = invertCfForValue(cfAtK, sc.xMin, sc.xMax, sc.total);

  const xLow = sc.sampleX[0];
  const cfLow = evalCf(xLow, sc.xMin, sc.xMax, sc.total);
  const bandCount = Math.max(0, cfAtK - cfLow);
  const ans = bandCount.toString();

  const svg = buildCfGraphSvg({
    title: sc.title,
    xLabel: sc.xLabel,
    xMin: sc.xMin,
    xMax: sc.xMax,
    xStep: sc.xStep,
    total: sc.total,
    yStep: sc.yStep,
    hasBreak: sc.hasBreak,
    highlights: [
      { x: xLow, cf: cfLow },
      { x: kEst, cf: cfAtK }
    ]
  });

  return {
    strand: "Statistics",
    tier: 3,
    tierName: "Advanced",
    skillTitle: "Cumulative Frequency Graphs",
    prompt: `${sc.context}\n\n${svg}\n\nThe top $${topPct}\\%$ of ${sc.entity} have values greater than $k$. Estimate the number of ${sc.entity} with values greater than $${xLow}$ but less than or equal to $k$.`,
    diagramSvg: svg,
    inputCount: 1,
    inputLabels: [`Number of ${sc.entity} =`],
    expectedAnswer: ans,
    displayAnswer: ans,
    extraKeys,
    steps: [
      `Find the cumulative frequency corresponding to the top $${topPct}\\%$ cutoff $k$: $$\\text{CF}(k) = ${sc.total} - \\frac{${topPct}}{100} \\times ${sc.total} = ${cfAtK}$$`,
      `Read the cumulative frequency at $${xLow}$: $$\\text{CF}(${xLow}) = ${cfLow}$$`,
      `Subtract to find the number of ${sc.entity} in the band $${xLow} < x \\le k$: $$${cfAtK} - ${cfLow} = ${ans}$$`
    ]
  };
}

export const cumulativeFrequencyGraphs = { generate: generateQuestion };
export default generateQuestion;
