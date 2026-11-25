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
 * Grid snapping helper:
 * Each major interval has 5 small boxes, so:
 * - 1 small box = step / 5
 * - Half a small box (edge or middle of a small box) = step / 10
 */
function getSnapUnits(xStep, yStep) {
  return {
    xSmall: xStep / 5,
    xHalf: xStep / 10,
    ySmall: yStep / 5,
    yHalf: yStep / 10
  };
}

function snapToGrid(val, unit, minVal, maxVal) {
  const snapped = Math.round(val / unit) * unit;
  return Math.max(minVal, Math.min(maxVal, Number(snapped.toFixed(4))));
}

/**
 * Generates smooth control points (x, cf) along a monotone S-curve where
 * knot values snap cleanly to small-box edges/middles, while curve rendering
 * uses a smooth Catmull-Rom-to-cubic-Bezier spline (no jagged stair-stepping).
 */
function createSmoothOgive(scenario) {
  const { xMin, xMax, xStep, yStep, total } = scenario;
  const { xHalf, yHalf } = getSnapUnits(xStep, yStep);

  const fractions = [0, 0.05, 0.18, 0.45, 0.75, 0.92, 1];
  const knots = [];

  for (let i = 0; i < fractions.length; i++) {
    let kx;
    if (i === 0) {
      kx = xMin;
    } else if (i === fractions.length - 1) {
      kx = xMax;
    } else {
      const approxX = xMin + (i / (fractions.length - 1)) * (xMax - xMin);
      kx = snapToGrid(approxX, xHalf, xMin + xHalf, xMax - xHalf);
    }

    let kcf;
    if (i === 0) {
      kcf = 0;
    } else if (i === fractions.length - 1) {
      kcf = total;
    } else {
      const approxCf = fractions[i] * total;
      kcf = snapToGrid(approxCf, yHalf, yHalf, total - yHalf);
    }

    if (knots.length > 0) {
      const prev = knots[knots.length - 1];
      if (kx <= prev.x) {
        kx = Math.min(xMax, Number((prev.x + xHalf).toFixed(4)));
      }
      if (kcf < prev.cf) {
        kcf = prev.cf;
      }
    }
    knots.push({ x: kx, cf: kcf });
  }

  // Smooth monotone-friendly cubic interpolation across knots for numerical queries
  function evalCf(x) {
    if (x <= knots[0].x) return 0;
    if (x >= knots[knots.length - 1].x) return total;

    for (let i = 0; i < knots.length - 1; i++) {
      const p0 = knots[i];
      const p1 = knots[i + 1];
      if (x >= p0.x && x <= p1.x) {
        if (p1.x === p0.x) return p1.cf;
        const t = (x - p0.x) / (p1.x - p0.x);
        const smoothT = t * t * (3 - 2 * t);
        const raw = p0.cf + smoothT * (p1.cf - p0.cf);
        return snapToGrid(raw, yHalf, p0.cf, p1.cf);
      }
    }
    return total;
  }

  function invertCf(targetCf) {
    const snappedTarget = snapToGrid(targetCf, yHalf, 0, total);
    const numSteps = Math.max(20, Math.round((xMax - xMin) / xHalf));
    for (let i = 0; i <= numSteps; i++) {
      const candX = Number((xMin + i * xHalf).toFixed(4));
      if (evalCf(candX) >= snappedTarget) {
        return candX;
      }
    }
    return xMax;
  }

  return { knots, evalCf, invertCf };
}

/**
 * Converts a list of (sx, sy) points into a smooth SVG cubic Bezier path.
 */
function buildSmoothSvgPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Builds a clear, unclipped SVG cumulative frequency graph with major/minor gridlines,
 * optional x-axis break, smooth ogive curve, clear axis labels, and optional highlights.
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
  knots,
  highlights = []
}) {
  const width = 440;
  const height = 320;
  const padLeft = 72;
  const padRight = 24;
  const padTop = 38;
  const padBottom = 56;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const yMax = Math.ceil(total / yStep) * yStep;

  const toSvgX = (val) => padLeft + ((val - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (cf) => padTop + plotH - (cf / yMax) * plotH;

  let gridLines = "";
  const xMinorStep = xStep / 5;
  const totalXSteps = Math.round((xMax - xMin) / xMinorStep);
  for (let i = 0; i <= totalXSteps; i++) {
    const xv = xMin + i * xMinorStep;
    const isMajor = i % 5 === 0;
    const sx = toSvgX(xv).toFixed(1);
    gridLines += `<line x1='${sx}' y1='${padTop}' x2='${sx}' y2='${(padTop + plotH).toFixed(1)}' stroke='${isMajor ? "#cbd5e1" : "#e2e8f0"}' stroke-width='${isMajor ? "1.1" : "0.65"}'/>`;
  }

  const yMinorStep = yStep / 5;
  const totalYSteps = Math.round(yMax / yMinorStep);
  for (let i = 0; i <= totalYSteps; i++) {
    const yv = i * yMinorStep;
    const isMajor = i % 5 === 0;
    const sy = toSvgY(yv).toFixed(1);
    gridLines += `<line x1='${padLeft}' y1='${sy}' x2='${(padLeft + plotW).toFixed(1)}' y2='${sy}' stroke='${isMajor ? "#cbd5e1" : "#e2e8f0"}' stroke-width='${isMajor ? "1.1" : "0.65"}'/>`;
  }

  let ticksAndLabels = "";
  const totalMajorX = Math.round((xMax - xMin) / xStep);
  for (let i = 0; i <= totalMajorX; i++) {
    const xv = Math.round(xMin + i * xStep);
    const sx = toSvgX(xv).toFixed(1);
    ticksAndLabels += `<line x1='${sx}' y1='${(padTop + plotH - 4).toFixed(1)}' x2='${sx}' y2='${(padTop + plotH + 4).toFixed(1)}' stroke='#1e293b' stroke-width='1.5'/><text x='${sx}' y='${(padTop + plotH + 19).toFixed(1)}' font-size='11' fill='#1e293b' text-anchor='middle' font-family='sans-serif'>${xv}</text>`;
  }

  const totalMajorY = Math.round(yMax / yStep);
  for (let i = 0; i <= totalMajorY; i++) {
    const yv = Math.round(i * yStep);
    const sy = toSvgY(yv).toFixed(1);
    ticksAndLabels += `<line x1='${(padLeft - 4).toFixed(1)}' y1='${sy}' x2='${(padLeft + 4).toFixed(1)}' y2='${sy}' stroke='#1e293b' stroke-width='1.5'/><text x='${(padLeft - 9).toFixed(1)}' y='${(Number(sy) + 4).toFixed(1)}' font-size='11' fill='#1e293b' text-anchor='end' font-family='sans-serif'>${yv}</text>`;
  }

  const axisBreakSvg = hasBreak
    ? `<polyline points='${(padLeft + 10).toFixed(1)},${(padTop + plotH).toFixed(1)} ${(padLeft + 15).toFixed(1)},${(padTop + plotH - 7).toFixed(1)} ${(padLeft + 21).toFixed(1)},${(padTop + plotH + 7).toFixed(1)} ${(padLeft + 26).toFixed(1)},${(padTop + plotH).toFixed(1)}' fill='none' stroke='#1e293b' stroke-width='1.6'/>`
    : "";

  const svgPoints = knots.map((k) => ({
    x: toSvgX(k.x),
    y: toSvgY(k.cf)
  }));
  const curvePath = `<path d='${buildSmoothSvgPath(svgPoints)}' fill='none' stroke='#16a34a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/>`;

  let guideSvg = "";
  for (const h of highlights) {
    const sx = toSvgX(h.x).toFixed(1);
    const sy = toSvgY(h.cf).toFixed(1);
    const baseY = (padTop + plotH).toFixed(1);
    guideSvg += `<line x1='${sx}' y1='${sy}' x2='${sx}' y2='${baseY}' stroke='#dc2626' stroke-width='1.3' stroke-dasharray='4,3'/><line x1='${padLeft}' y1='${sy}' x2='${sx}' y2='${sy}' stroke='#dc2626' stroke-width='1.3' stroke-dasharray='4,3'/><circle cx='${sx}' cy='${sy}' r='3.6' fill='#dc2626'/>`;
  }

  const xAxisTitleY = (padTop + plotH + 40).toFixed(1);
  const yAxisTitleX = 18;
  const yAxisTitleY = (padTop + plotH / 2).toFixed(1);

  return `<svg width='${width}' height='${height}' viewBox='0 0 ${width} ${height}' xmlns='http://www.w3.org/2000/svg' style='background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; display:block; margin:10px auto; max-width:100%; overflow:visible;'><defs><marker id='cfArr' viewBox='0 0 10 10' refX='6' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M 0 0 L 10 5 L 0 10 z' fill='#1e293b'/></marker></defs><text x='${(width / 2).toFixed(1)}' y='20' font-size='13' font-weight='bold' fill='#0f172a' text-anchor='middle' font-family='sans-serif'>${title}</text>${gridLines}${axisBreakSvg}<line x1='${padLeft}' y1='${(padTop + plotH).toFixed(1)}' x2='${(width - 12).toFixed(1)}' y2='${(padTop + plotH).toFixed(1)}' stroke='#1e293b' stroke-width='1.8' marker-end='url(#cfArr)'/><line x1='${padLeft}' y1='${(padTop + plotH).toFixed(1)}' x2='${padLeft}' y2='28' stroke='#1e293b' stroke-width='1.8' marker-end='url(#cfArr)'/>${ticksAndLabels}${curvePath}${guideSvg}<text x='${(padLeft + plotW / 2).toFixed(1)}' y='${xAxisTitleY}' font-size='12' font-weight='bold' fill='#0f172a' text-anchor='middle' font-family='sans-serif'>${xLabel}</text><text x='${yAxisTitleX}' y='${yAxisTitleY}' font-size='12' font-weight='bold' fill='#0f172a' text-anchor='middle' transform='rotate(-90, ${yAxisTitleX}, ${yAxisTitleY})' font-family='sans-serif'>${yLabel}</text></svg>`;
}

const SCENARIOS = [
  {
    entity: "cars",
    title: "Speeds of cars",
    xLabel: "Speed (km/h)",
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
    lowerPhrases: (x) => `had speeds less than or equal to $${x}\\text{ km/h}$`
  },
  {
    entity: "students",
    title: "Times taken to solve a mathematical puzzle",
    xLabel: "Time (min)",
    context:
      "$150$ students were asked to solve a mathematical puzzle. The cumulative frequency graph shows the distribution of the times in minutes taken to solve the puzzle.",
    total: 150,
    xMin: 10,
    xMax: 60,
    xStep: 10,
    yStep: 50,
    hasBreak: false,
    upperPhrases: [(x) => `took more than $${x}$ minutes to solve the puzzle`],
    lowerPhrases: (x) => `took at most $${x}$ minutes to solve the puzzle`
  },
  {
    entity: "parcels",
    title: "Masses of parcels",
    xLabel: "Mass (kg)",
    context:
      "The masses of $100$ small parcels that arrived at a post office on a particular day were measured. The cumulative frequency graph shows the distribution of the masses in kilograms.",
    total: 100,
    xMin: 0,
    xMax: 10,
    xStep: 2,
    yStep: 20,
    hasBreak: false,
    upperPhrases: [(x) => `had masses greater than $${x}\\text{ kg}$`],
    lowerPhrases: (x) => `had masses equal to $${x}\\text{ kg}$ or less`
  },
  {
    entity: "students",
    title: "Number of trips made by students",
    xLabel: "Number of trips",
    context:
      "The cumulative frequency graph shows the distribution of the number of trips made via public transport by $300$ students in the first school term of the year.",
    total: 300,
    xMin: 90,
    xMax: 115,
    xStep: 5,
    yStep: 100,
    hasBreak: true,
    upperPhrases: [(x) => `made more than $${x}$ trips`],
    lowerPhrases: (x) => `made at most $${x}$ trips`
  },
  {
    entity: "plants",
    title: "Heights of plants",
    xLabel: "Height (cm)",
    context:
      "The cumulative frequency graph shows the distribution of the heights, in centimetres, of $400$ plants after two months.",
    total: 400,
    xMin: 0,
    xMax: 60,
    xStep: 10,
    yStep: 100,
    hasBreak: false,
    upperPhrases: [(x) => `had heights greater than $${x}\\text{ cm}$`],
    lowerPhrases: (x) => `had heights less than or equal to $${x}\\text{ cm}$`
  },
  {
    entity: "students",
    title: "Mathematics test scores",
    xLabel: "Score (marks)",
    context:
      "The scores of $200$ Secondary 3 students in a Mathematics test out of $80$ marks were recorded. The cumulative frequency graph shows the distribution of their scores.",
    total: 200,
    xMin: 20,
    xMax: 80,
    xStep: 10,
    yStep: 50,
    hasBreak: true,
    upperPhrases: [
      (x) => `scored more than $${x}$ marks`,
      (x) => `achieved a distinction if the cutoff was above $${x}$ marks`
    ],
    lowerPhrases: (x) => `scored $${x}$ marks or fewer`
  },
  {
    entity: "patients",
    title: "Waiting times at a clinic",
    xLabel: "Waiting time (min)",
    context:
      "The waiting times of $250$ patients visiting a neighbourhood clinic on a Monday morning were recorded. The cumulative frequency graph shows the distribution of waiting times in minutes.",
    total: 250,
    xMin: 0,
    xMax: 50,
    xStep: 10,
    yStep: 50,
    hasBreak: false,
    upperPhrases: [(x) => `waited for more than $${x}$ minutes`],
    lowerPhrases: (x) => `waited for $${x}$ minutes or less`
  },
  {
    entity: "batteries",
    title: "Battery life of wireless earbuds",
    xLabel: "Battery life (h)",
    context:
      "A manufacturer tested $120$ wireless earbuds to measure how long their batteries lasted on a single charge. The cumulative frequency graph shows the results in hours.",
    total: 120,
    xMin: 10,
    xMax: 35,
    xStep: 5,
    yStep: 20,
    hasBreak: true,
    upperPhrases: [(x) => `lasted for more than $${x}$ hours`],
    lowerPhrases: (x) => `lasted for at most $${x}$ hours`
  },
  {
    entity: "households",
    title: "Monthly water consumption",
    xLabel: "Water usage (m³)",
    context:
      "The monthly water consumption of $600$ households in a residential estate was recorded. The cumulative frequency graph shows the distribution in cubic metres ($\\text{m}^3$).",
    total: 600,
    xMin: 10,
    xMax: 60,
    xStep: 10,
    yStep: 100,
    hasBreak: true,
    upperPhrases: [(x) => `used more than $${x}\\text{ m}^3$ of water`],
    lowerPhrases: (x) => `used $${x}\\text{ m}^3$ of water or less`
  },
  {
    entity: "runners",
    title: "Distances run in a charity event",
    xLabel: "Distance (km)",
    context:
      "$400$ participants took part in a charity run. The cumulative frequency graph shows the distribution of the total distances completed in kilometres.",
    total: 400,
    xMin: 0,
    xMax: 20,
    xStep: 5,
    yStep: 100,
    hasBreak: false,
    upperPhrases: [(x) => `ran more than $${x}\\text{ km}$`],
    lowerPhrases: (x) => `ran at most $${x}\\text{ km}$`
  }
];

function getSnappedCandidateXs(sc, count = 4) {
  const { xHalf } = getSnapUnits(sc.xStep, sc.yStep);
  const minBound = sc.xMin + xHalf;
  const maxBound = sc.xMax - xHalf;
  const totalSteps = Math.max(2, Math.round((maxBound - minBound) / xHalf));
  const candidates = [];
  for (let i = 1; i < totalSteps; i++) {
    const val = Number((minBound + i * xHalf).toFixed(4));
    candidates.push(val);
  }
  if (candidates.length <= count) return candidates;
  const picked = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(((i + 0.5) / count) * candidates.length);
    picked.push(candidates[Math.min(candidates.length - 1, idx)]);
  }
  return picked;
}

export function generateQuestion(tier = 1) {
  const extraKeys = [];
  const sc = pickRandom(SCENARIOS);
  const { knots, evalCf, invertCf } = createSmoothOgive(sc);
  const { yHalf } = getSnapUnits(sc.xStep, sc.yStep);
  const candidateXs = getSnappedCandidateXs(sc, 4);

  const cleanQuestionGraphSvg = buildCfGraphSvg({
    title: sc.title,
    xLabel: sc.xLabel,
    xMin: sc.xMin,
    xMax: sc.xMax,
    xStep: sc.xStep,
    total: sc.total,
    yStep: sc.yStep,
    hasBreak: sc.hasBreak,
    knots,
    highlights: []
  });

  // =========================================================
  // TIER 1: BASIC (Direct CF Reading, Tail Count/% & CF Table Lookup)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 3);

    if (subType === 1) {
      // Type 1A: Number or percentage of items <= x
      const xVal = pickRandom(candidateXs);
      const cfVal = evalCf(xVal);
      const askPct = randInt(0, 1) === 1;
      const pctVal = Number(((cfVal / sc.total) * 100).toPrecision(3)).toString();
      const ans = askPct ? pctVal : cfVal.toString();

      const solSvg = buildCfGraphSvg({
        title: sc.title,
        xLabel: sc.xLabel,
        xMin: sc.xMin,
        xMax: sc.xMax,
        xStep: sc.xStep,
        total: sc.total,
        yStep: sc.yStep,
        hasBreak: sc.hasBreak,
        knots,
        highlights: [{ x: xVal, cf: cfVal }]
      });

      const targetDesc = askPct
        ? `the percentage of ${sc.entity} that ${sc.lowerPhrases(xVal)}`
        : `the number of ${sc.entity} that ${sc.lowerPhrases(xVal)}`;

      const steps = askPct
        ? [
            `From the graph at $x = ${xVal}$, the cumulative frequency is $${cfVal}$.\n\n${solSvg}`,
            `Calculate the percentage of ${sc.entity}: $$\\frac{${cfVal}}{${sc.total}} \\times 100\\% = ${ans}\\%$$`
          ]
        : [
            `Locate $${xVal}$ on the horizontal axis and read up to the curve to find the cumulative frequency: $$\\text{CF}(${xVal}) = ${cfVal}$$\n\n${solSvg}`
          ];

      return {
        strand: "Statistics",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Cumulative Frequency Graphs",
        prompt: `${sc.context}\n\nUse the graph to estimate ${targetDesc}.${askPct ? " (Give your answer correct to 3 significant figures.)" : ""}`,
        diagramSvg: cleanQuestionGraphSvg,
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
      const xVal = pickRandom(candidateXs);
      const cfVal = evalCf(xVal);
      const tailCount = sc.total - cfVal;
      const askPct = randInt(0, 1) === 1;
      const pctVal = Number(((tailCount / sc.total) * 100).toPrecision(3)).toString();
      const ans = askPct ? pctVal : tailCount.toString();

      const solSvg = buildCfGraphSvg({
        title: sc.title,
        xLabel: sc.xLabel,
        xMin: sc.xMin,
        xMax: sc.xMax,
        xStep: sc.xStep,
        total: sc.total,
        yStep: sc.yStep,
        hasBreak: sc.hasBreak,
        knots,
        highlights: [{ x: xVal, cf: cfVal }]
      });

      const phrase = pickRandom(sc.upperPhrases)(xVal);
      const targetDesc = askPct
        ? `the percentage of ${sc.entity} that ${phrase}`
        : `the number of ${sc.entity} that ${phrase}`;

      const steps = askPct
        ? [
            `Read the cumulative frequency at $${xVal}$: $$\\text{CF}(${xVal}) = ${cfVal}$$\n\n${solSvg}`,
            `Find the number of ${sc.entity} above $${xVal}$: $$${sc.total} - ${cfVal} = ${tailCount}$$`,
            `Express as a percentage of $${sc.total}$: $$\\frac{${tailCount}}{${sc.total}} \\times 100\\% = ${ans}\\%$$`
          ]
        : [
            `Read the cumulative frequency at $${xVal}$: $$\\text{CF}(${xVal}) = ${cfVal}$$\n\n${solSvg}`,
            `Subtract from the total frequency: $$${sc.total} - ${cfVal} = ${tailCount}$$`
          ];

      return {
        strand: "Statistics",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Cumulative Frequency Graphs",
        prompt: `${sc.context}\n\nUse the graph to estimate ${targetDesc}.${askPct ? " (Give your answer correct to 3 significant figures.)" : ""}`,
        diagramSvg: cleanQuestionGraphSvg,
        inputCount: 1,
        inputLabels: [askPct ? "Percentage (%) =" : `Number of ${sc.entity} =`],
        expectedAnswer: ans,
        displayAnswer: askPct ? `${ans}\\%` : ans,
        extraKeys,
        steps
      };
    }

    // subType === 3: Type 1C - Cumulative frequency at a specific upper boundary
    const xVal = pickRandom(candidateXs);
    const cfVal = evalCf(xVal);
    const ans = cfVal.toString();

    const solSvg = buildCfGraphSvg({
      title: sc.title,
      xLabel: sc.xLabel,
      xMin: sc.xMin,
      xMax: sc.xMax,
      xStep: sc.xStep,
      total: sc.total,
      yStep: sc.yStep,
      hasBreak: sc.hasBreak,
      knots,
      highlights: [{ x: xVal, cf: cfVal }]
    });

    return {
      strand: "Statistics",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Cumulative Frequency Graphs",
      prompt: `${sc.context}\n\nFind the cumulative frequency for the class boundary $x \\le ${xVal}$.`,
      diagramSvg: cleanQuestionGraphSvg,
      inputCount: 1,
      inputLabels: [`CF(x ≤ ${xVal}) =`],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys,
      steps: [
        `Locate $x = ${xVal}$ along the horizontal axis and move vertically to the cumulative frequency curve.`,
        `Read across to the vertical axis to get the cumulative frequency: $$${ans}$$\n\n${solSvg}`
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
      const idxA = randInt(0, candidateXs.length - 2);
      const xA = candidateXs[idxA];
      const xB = candidateXs[idxA + 1];

      const cfA = evalCf(xA);
      const cfB = evalCf(xB);
      const intervalCount = cfB - cfA;
      const askPct = randInt(0, 1) === 1;
      const pctVal = Number(((intervalCount / sc.total) * 100).toPrecision(3)).toString();
      const ans = askPct ? pctVal : intervalCount.toString();

      const solSvg = buildCfGraphSvg({
        title: sc.title,
        xLabel: sc.xLabel,
        xMin: sc.xMin,
        xMax: sc.xMax,
        xStep: sc.xStep,
        total: sc.total,
        yStep: sc.yStep,
        hasBreak: sc.hasBreak,
        knots,
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
            `Read the cumulative frequencies: $$\\text{CF}(${xB}) = ${cfB} \\quad \\text{and} \\quad \\text{CF}(${xA}) = ${cfA}$$\n\n${solSvg}`,
            `Subtract to find the number of ${sc.entity} in the interval: $$${cfB} - ${cfA} = ${intervalCount}$$`,
            `Convert to a percentage: $$\\frac{${intervalCount}}{${sc.total}} \\times 100\\% = ${ans}\\%$$`
          ]
        : [
            `Read the cumulative frequencies at both boundaries: $$\\text{CF}(${xB}) = ${cfB} \\quad \\text{and} \\quad \\text{CF}(${xA}) = ${cfA}$$\n\n${solSvg}`,
            `Subtract the lower cumulative frequency from the upper one: $$${cfB} - ${cfA} = ${intervalCount}$$`
          ];

      return {
        strand: "Statistics",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Cumulative Frequency Graphs",
        prompt: `${sc.context}\n\nUse the graph to estimate ${targetDesc}.${askPct ? " (Give your answer correct to 3 significant figures.)" : ""}`,
        diagramSvg: cleanQuestionGraphSvg,
        inputCount: 1,
        inputLabels: [askPct ? "Percentage (%) =" : `Number of ${sc.entity} =`],
        expectedAnswer: ans,
        displayAnswer: askPct ? `${ans}\\%` : ans,
        extraKeys,
        steps
      };
    }

    if (subType === 2) {
      // Type 2B: Reverse lookup - estimate k or x from a snapped count or percentage
      const pctGiven = pickRandom([20, 25, 40, 60, 75]);
      const isUpperTail = randInt(0, 1) === 1;
      const rawTail = (pctGiven / 100) * sc.total;
      const tailCount = snapToGrid(rawTail, yHalf, yHalf, sc.total - yHalf);
      const targetCf = isUpperTail
        ? snapToGrid(sc.total - tailCount, yHalf, yHalf, sc.total - yHalf)
        : tailCount;

      const estX = invertCf(targetCf);
      const ans = estX.toString();

      const solSvg = buildCfGraphSvg({
        title: sc.title,
        xLabel: sc.xLabel,
        xMin: sc.xMin,
        xMax: sc.xMax,
        xStep: sc.xStep,
        total: sc.total,
        yStep: sc.yStep,
        hasBreak: sc.hasBreak,
        knots,
        highlights: [{ x: estX, cf: targetCf }]
      });

      const promptText = isUpperTail
        ? `About $${pctGiven}\\%$ of the ${sc.entity} have values greater than $k$. Estimate the value of $k$ from the graph.`
        : `About $${pctGiven}\\%$ of the ${sc.entity} have values less than or equal to $x$. Estimate the value of $x$ from the graph.`;

      const varName = isUpperTail ? "k" : "x";
      const steps = isUpperTail
        ? [
            `Calculate $${pctGiven}\\%$ of $${sc.total}$ ${sc.entity} (to nearest grid reading): $$\\approx ${tailCount}$$`,
            `Since about $${tailCount}$ ${sc.entity} are above $k$, the cumulative frequency at $k$ is: $$\\text{CF}(k) = ${sc.total} - ${tailCount} = ${targetCf}$$`,
            `Locate $${targetCf}$ on the vertical axis, move across to the curve, and read down to estimate $k$: $$k = ${ans}$$\n\n${solSvg}`
          ]
        : [
            `Calculate $${pctGiven}\\%$ of $${sc.total}$ ${sc.entity} (to nearest grid reading): $$\\text{CF}(x) \\approx ${targetCf}$$`,
            `Locate $${targetCf}$ on the vertical axis, move across to the curve, and read down to estimate $x$: $$x = ${ans}$$\n\n${solSvg}`
          ];

      return {
        strand: "Statistics",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Cumulative Frequency Graphs",
        prompt: `${sc.context}\n\n${promptText}`,
        diagramSvg: cleanQuestionGraphSvg,
        inputCount: 1,
        inputLabels: [`${varName} =`],
        expectedAnswer: ans,
        displayAnswer: `${varName} = ${ans}`,
        extraKeys,
        steps
      };
    }

    // subType === 3: Type 2C - Frequency of a specific class interval (a < x <= b)
    const idxA = randInt(0, candidateXs.length - 2);
    const xA = candidateXs[idxA];
    const xB = candidateXs[idxA + 1];
    const cfA = evalCf(xA);
    const cfB = evalCf(xB);
    const freq = cfB - cfA;
    const ans = freq.toString();

    const solSvg = buildCfGraphSvg({
      title: sc.title,
      xLabel: sc.xLabel,
      xMin: sc.xMin,
      xMax: sc.xMax,
      xStep: sc.xStep,
      total: sc.total,
      yStep: sc.yStep,
      hasBreak: sc.hasBreak,
      knots,
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
      prompt: `${sc.context}\n\nFind the frequency of ${sc.entity} in the class interval $${xA} < x \\le ${xB}$.`,
      diagramSvg: cleanQuestionGraphSvg,
      inputCount: 1,
      inputLabels: ["Frequency ="],
      expectedAnswer: ans,
      displayAnswer: ans,
      extraKeys,
      steps: [
        `Read the cumulative frequency at the upper class boundary $x = ${xB}$: $$\\text{CF}(${xB}) = ${cfB}$$`,
        `Read the cumulative frequency at the lower class boundary $x = ${xA}$: $$\\text{CF}(${xA}) = ${cfA}$$\n\n${solSvg}`,
        `Subtract to find the class frequency: $$${cfB} - ${cfA} = ${freq}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Complement / Filter Conditions & Cutoff + Interval Queries)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Type 3A: Threshold / filter condition (excluded below xCut -> percentage remaining)
    const xCut = pickRandom(candidateXs);
    const cfCut = evalCf(xCut);
    const keptCount = sc.total - cfCut;
    const keptPct = Number(((keptCount / sc.total) * 100).toPrecision(3)).toString();
    const ans = keptPct;

    const solSvg = buildCfGraphSvg({
      title: sc.title,
      xLabel: sc.xLabel,
      xMin: sc.xMin,
      xMax: sc.xMax,
      xStep: sc.xStep,
      total: sc.total,
      yStep: sc.yStep,
      hasBreak: sc.hasBreak,
      knots,
      highlights: [{ x: xCut, cf: cfCut }]
    });

    return {
      strand: "Statistics",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Cumulative Frequency Graphs",
      prompt: `${sc.context}\n\nItems with a measurement less than or equal to $${xCut}$ are excluded from the main group. Find the percentage of ${sc.entity} that remain in the main group. (Give your answer correct to 3 significant figures.)`,
      diagramSvg: cleanQuestionGraphSvg,
      inputCount: 1,
      inputLabels: ["Percentage (%) ="],
      expectedAnswer: ans,
      displayAnswer: `${ans}\\%`,
      extraKeys,
      steps: [
        `Read the number of ${sc.entity} with value $\\le ${xCut}$ from the graph: $$\\text{CF}(${xCut}) = ${cfCut}$$\n\n${solSvg}`,
        `Find the number of ${sc.entity} remaining above $${xCut}$: $$${sc.total} - ${cfCut} = ${keptCount}$$`,
        `Calculate the percentage remaining: $$\\frac{${keptCount}}{${sc.total}} \\times 100\\% = ${ans}\\%$$`
      ]
    };
  }

  // subType === 2: Top p% cutoff k, then find number of items between xLow and estimated k
  const topPct = pickRandom([10, 20, 25]);
  const rawTopCount = (topPct / 100) * sc.total;
  const topCount = snapToGrid(rawTopCount, yHalf, yHalf, sc.total - yHalf);
  const cfAtK = snapToGrid(sc.total - topCount, yHalf, yHalf, sc.total - yHalf);
  const kEst = invertCf(cfAtK);

  const xLow = candidateXs[0];
  const cfLow = evalCf(xLow);
  const bandCount = Math.max(0, cfAtK - cfLow);
  const ans = bandCount.toString();

  const solSvg = buildCfGraphSvg({
    title: sc.title,
    xLabel: sc.xLabel,
    xMin: sc.xMin,
    xMax: sc.xMax,
    xStep: sc.xStep,
    total: sc.total,
    yStep: sc.yStep,
    hasBreak: sc.hasBreak,
    knots,
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
    prompt: `${sc.context}\n\nAbout the top $${topPct}\\%$ of ${sc.entity} have values greater than $k$. Estimate the number of ${sc.entity} with values greater than $${xLow}$ but less than or equal to $k$.`,
    diagramSvg: cleanQuestionGraphSvg,
    inputCount: 1,
    inputLabels: [`Number of ${sc.entity} =`],
    expectedAnswer: ans,
    displayAnswer: ans,
    extraKeys,
    steps: [
      `Find the cumulative frequency at the top $${topPct}\\%$ cutoff $k$ (snapped to grid): $$\\text{CF}(k) = ${sc.total} - ${topCount} = ${cfAtK}$$`,
      `Read the cumulative frequency at $${xLow}$: $$\\text{CF}(${xLow}) = ${cfLow}$$\n\n${solSvg}`,
      `Subtract to find the number of ${sc.entity} in the band $${xLow} < x \\le k$: $$${cfAtK} - ${cfLow} = ${ans}$$`
    ]
  };
}

export const cumulativeFrequencyGraphs = { generate: generateQuestion };
export default generateQuestion;
