/**
 * Question Generator: Angles of Elevation & Depression
 * Curriculum Skill: Sec 3 G3 - Geometry & Measurement
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(tier = 1) {
  // =========================================================
  // TIER 1: BASIC (Level 1 - Single Right-Angled Triangle)
  // =========================================================
  if (tier === 1) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Structure 1: Angle of Elevation from Ground Point to Building
      const d = randInt(60, 180);
      const angle = randInt(25, 55);
      const rad = (angle * Math.PI) / 180;
      const height = (d * Math.tan(rad)).toFixed(1);

      const svg = `<svg width="100%" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="160" x2="380" y2="160" stroke="#333" stroke-width="2" stroke-dasharray="4,4"/>
        <rect x="280" y="40" width="60" height="120" fill="#f4e4bc" stroke="#333" stroke-width="2"/>
        <line x1="60" y1="160" x2="280" y2="40" stroke="#d9534f" stroke-width="3"/>
        <path d="M 100 160 A 40 40 0 0 0 92 143" fill="none" stroke="#d9534f" stroke-width="2"/>
        <rect x="265" y="145" width="15" height="15" fill="none" stroke="#333" stroke-width="1.5"/>
        <text x="50" y="180" font-weight="bold" font-size="15">A</text>
        <text x="280" y="180" font-weight="bold" font-size="15">B</text>
        <text x="280" y="30" font-weight="bold" font-size="15">T</text>
        <text x="150" y="180" font-size="14" fill="#003366">${d} m</text>
        <text x="105" y="152" font-size="13" fill="#d9534f">${angle}°</text>
      </svg>`;

      return {
        strand: "Geometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Angles of Elevation & Depression",
        prompt: `${svg}<br>A point <i>A</i> on the ground is${d} m in front of a building <i>TB</i>. The angle of elevation of the top <i>T</i> of the building from <i>A</i> is ${angle}°. Find the height of the building (rounded to 1 decimal place).`,
        inputCount: 1,
        inputLabels: ["Height (m) ="],
        expectedAnswer: height,
        steps: [
          `Identify the known values in right-angled triangle $\\triangle TAB$: adjacent side $AB =${d}\\text{ m}$and angle of elevation$\\angle TAB = ${angle}^\\circ$.`,
          `Set up the trigonometric ratio using tangent: $\\tan(\\angle TAB) = \\dfrac{\\text{opposite}}{\\text{adjacent}} = \\dfrac{TB}{AB}$.`,
          `Substitute the values into the equation: $\\tan(${angle}^\\circ) = \\dfrac{TB}{${d}}$.`,
          `Rearrange the equation by multiplying both sides by ${d}$ to solve for $TB$: $TB =${d} \\times \\tan(${angle}^\\circ)$.`,
          `Calculate the result and round to 1 decimal place: $TB \\approx ${height}\\text{ m}$.`
        ]
      };
    } else {
      // Structure 2: Angle of Depression from Cliff to Boat
      const h = randInt(40, 120);
      const angle = randInt(30, 60);
      const rad = (angle * Math.PI) / 180;
      const dist = (h / Math.tan(rad)).toFixed(1);

      const svg = `<svg width="100%" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M 280 40 L 380 40 L 380 170 L 280 170 Z" fill="#d2b48c" stroke="#5c4033" stroke-width="2"/>
        <path d="M 20 170 Q 150 175 280 170" stroke="#0077be" stroke-width="3" fill="none"/>
        <line x1="280" y1="40" x2="160" y2="40" stroke="#0077be" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="280" y1="40" x2="100" y2="165" stroke="#0077be" stroke-width="3"/>
        <path d="M 240 40 A 40 40 0 0 0 252 58" fill="none" stroke="#d9534f" stroke-width="2"/>
        <rect x="265" y="155" width="15" height="15" fill="none" stroke="#333" stroke-width="1.5"/>
        <text x="285" y="32" font-weight="bold" font-size="15">A</text>
        <text x="95" y="185" font-weight="bold" font-size="15">B</text>
        <text x="285" y="185" font-weight="bold" font-size="15">C</text>
        <text x="290" y="110" font-size="14" fill="#333">${h} m</text>
        <text x="210" y="58" font-size="13" fill="#d9534f">${angle}°</text>
      </svg>`;

      return {
        strand: "Geometry",
        tier: 1,
        tierName: "Basic",
        skillTitle: "Angles of Elevation & Depression",
        prompt: `${svg}<br>A vertical cliff <i>AC</i> is${h} m above sea level. The angle of depression of a boat <i>B</i> from the top <i>A</i> of the cliff is ${angle}°. How far is the boat from the cliff (rounded to 1 decimal place)?`,
        inputCount: 1,
        inputLabels: ["Distance (m) ="],
        expectedAnswer: dist,
        steps: [
          `Use alternate interior angles to find the angle inside right-angled triangle $\\triangle ABC$:$\\angle ABC = \\text{angle of depression} = ${angle}^\\circ$.`,
          `Set up the tangent ratio in $\\triangle ABC$: $\\tan(\\angle ABC) = \\dfrac{\\text{opposite}}{\\text{adjacent}} = \\dfrac{AC}{BC}$.`,
          `Substitute the known vertical height $AC = ${h}\\text{ m}$: $\\tan(${angle}^\\circ) = \\dfrac{${h}}{BC}$.`,
          `Rearrange to solve for horizontal distance $BC$: $BC = \\dfrac{${h}}{\\tan(${angle}^\\circ)}$.`,
          `Evaluate the expression and round to 1 decimal place: $BC \\approx ${dist}\\text{ m}$.`
        ]
      };
    }
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2 - Sine Ratio / Two Observations)
  // =========================================================
  if (tier === 2) {
    const subType = randInt(1, 2);

    if (subType === 1) {
      // Structure 3: Hot-Air Balloon Height (Sine Ratio)
      const L = randInt(350, 650);
      const angle = randInt(25, 50);
      const rad = (angle * Math.PI) / 180;
      const height = (L * Math.sin(rad)).toFixed(1);

      const svg = `<svg width="100%" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <line x1="30" y1="170" x2="370" y2="170" stroke="#333" stroke-width="2"/>
        <line x1="100" y1="40" x2="100" y2="170" stroke="#5b8c5a" stroke-width="2.5"/>
        <line x1="100" y1="40" x2="320" y2="170" stroke="#5b8c5a" stroke-width="2.5"/>
        <line x1="100" y1="40" x2="210" y2="40" stroke="#333" stroke-width="2" stroke-dasharray="4,4"/>
        <circle cx="100" cy="30" r="12" fill="#d9534f"/>
        <path d="M 140 40 A 40 40 0 0 1 133 58" fill="none" stroke="#d9534f" stroke-width="2"/>
        <rect x="100" y="155" width="15" height="15" fill="none" stroke="#333" stroke-width="1.5"/>
        <text x="80" y="40
