/**
 * Question Generator: Angles of Elevation & Depression
 * Curriculum Skill: Sec 3 G3 - Geometry & Measurement
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const KEYPAD_KEYS = [
  "7", "8", "9", "-",
  "4", "5", "6", ".",
  "1", "2", "3", "0",
  "(", ")", "⌫", "Clear"
];

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
        prompt: `${svg}<br>A point <i>A</i> on the ground is ${d} m in front of a building <i>TB</i>. The angle of elevation of the top <i>T</i> of the building from <i>A</i> is ${angle}°. Find the height of the building (rounded to 1 decimal place).`,
        inputCount: 1,
        inputLabels: ["Height (m) ="],
        expectedAnswer: height,
        keypad: KEYPAD_KEYS,
        steps: [
          `Identify the known values in right-angled triangle $\\triangle TAB$: adjacent side $AB = ${d}\\text{ m}$ and angle of elevation $\\angle TAB = ${angle}^\\circ$.`,
          `Set up the trigonometric ratio using tangent: $\\tan(\\angle TAB) = \\dfrac{\\text{opposite}}{\\text{adjacent}} = \\dfrac{TB}{AB}$.`,
          `Substitute the values into the equation: $\\tan(${angle}^\\circ) = \\dfrac{TB}{${d}}$.`,
          `Rearrange the equation by multiplying both sides by ${d}$ to solve for $TB$: $TB = ${d} \\times \\tan(${angle}^\\circ)$.`,
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
        prompt: `${svg}<br>A vertical cliff <i>AC</i> is ${h} m above sea level. The angle of depression of a boat <i>B</i> from the top <i>A</i> of the cliff is ${angle}°. How far is the boat from the cliff (rounded to 1 decimal place)?`,
        inputCount: 1,
        inputLabels: ["Distance (m) ="],
        expectedAnswer: dist,
        keypad: KEYPAD_KEYS,
        steps: [
          `Use alternate interior angles to find the angle inside right-angled triangle $\\triangle ABC$: $\\angle ABC = \\text{angle of depression} = ${angle}^\\circ$.`,
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
        <text x="80" y="40" font-weight="bold" font-size="15">B</text>
        <text x="80" y="185" font-weight="bold" font-size="15">C</text>
        <text x="325" y="185" font-weight="bold" font-size="15">A</text>
        <text x="215" y="38" font-weight="bold" font-size="14">H</text>
        <text x="210" y="95" font-size="14" font-weight="bold" fill="#333">${L} m</text>
        <text x="145" y="55" font-size="13" fill="#d9534f">${angle}°</text>
      </svg>`;

      return {
        strand: "Geometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Angles of Elevation & Depression",
        prompt: `${svg}<br>The diagram shows a hot-air balloon <i>B</i> hovering above ground level <i>AC</i> with <i>AB</i> = ${L} m. The angle of depression of <i>A</i> from <i>B</i> is ${angle}°. Find the height of the balloon above the ground (rounded to 1 decimal place).`,
        inputCount: 1,
        inputLabels: ["Height (m) ="],
        expectedAnswer: height,
        keypad: KEYPAD_KEYS,
        steps: [
          `By alternate interior angles, the angle of elevation $\\angle BAC$ equals the angle of depression: $\\angle BAC = ${angle}^\\circ$.`,
          `Identify the hypotenuse $AB = ${L}\\text{ m}$ and the vertical side opposite to $\\angle BAC$, which is $BC$.`,
          `Set up the sine ratio in right-angled triangle $\\triangle ABC$: $\\sin(\\angle BAC) = \\dfrac{\\text{opposite}}{\\text{hypotenuse}} = \\dfrac{BC}{AB}$.`,
          `Substitute the given values into the equation: $\\sin(${angle}^\\circ) = \\dfrac{BC}{${L}}$.`,
          `Rearrange to solve for height $BC$: $BC = ${L} \\times \\sin(${angle}^\\circ)$.`,
          `Evaluate the calculation and round to 1 decimal place: $BC \\approx ${height}\\text{ m}$.`
        ]
      };
    } else {
      // Structure 4: Building Height from Two Points on Same Side (Sine Rule + Right Triangle)
      const AB = randInt(50, 100);
      const angleA = randInt(25, 38);
      const angleB = randInt(42, 58);
      const radA = (angleA * Math.PI) / 180;
      const radB = (angleB * Math.PI) / 180;
      const radDiff = ((angleB - angleA) * Math.PI) / 180;
      const AT_val = (AB * Math.sin(radB)) / Math.sin(radDiff);
      const AT = AT_val.toFixed(1);
      const TF = (AT_val * Math.sin(radA)).toFixed(1);

      const svg = `<svg width="100%" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="170" x2="380" y2="170" stroke="#333" stroke-width="2"/>
        <rect x="300" y="30" width="55" height="140" fill="#e2d5e7" stroke="#6a1b9a" stroke-width="2"/>
        <line x1="50" y1="170" x2="300" y2="30" stroke="#a93226" stroke-width="2.5"/>
        <line x1="180" y1="170" x2="300" y2="30" stroke="#a93226" stroke-width="2.5"/>
        <text x="45" y="188" font-weight="bold" font-size="15">A</text>
        <text x="175" y="188" font-weight="bold" font-size="15">B</text>
        <text x="295" y="188" font-weight="bold" font-size="15">F</text>
        <text x="295" y="24" font-weight="bold" font-size="15">T</text>
        <text x="105" y="188" font-size="14" font-weight="bold" fill="#003366">${AB} m</text>
      </svg>`;

      return {
        strand: "Geometry",
        tier: 2,
        tierName: "Intermediate",
        skillTitle: "Angles of Elevation & Depression",
        prompt: `${svg}<br>In the diagram, <i>TF</i> is a vertical building on level ground <i>ABF</i>, where <i>AB</i> = ${AB} m. The angles of depression of <i>A</i> and <i>B</i> from <i>T</i> are ${angleA}° and ${angleB}° respectively. Find the height <i>TF</i> of the building (rounded to 1 decimal place).`,
        inputCount: 1,
        inputLabels: ["Height TF (m) ="],
        expectedAnswer: TF,
        keypad: KEYPAD_KEYS,
        steps: [
          `Find the interior angles of non-right-angled triangle $\\triangle ABT$:<br>• $\\angle TAB = ${angleA}^\\circ$<br>• $\\angle ABT = 180^\\circ - ${angleB}^\\circ$<br>• $\\angle ATB = ${angleB}^\\circ - ${angleA}^\\circ = ${angleB - angleA}^\\circ$.`,
          `Apply the Sine Rule in $\\triangle ABT$ to find length $AT$: $\\dfrac{AT}{\\sin(\\angle ABT)} = \\dfrac{AB}{\\sin(\\angle ATB)}$.`,
          `Substitute the angle values: $\\dfrac{AT}{\\sin(180^\\circ - ${angleB}^\\circ)} = \\dfrac{${AB}}{\\sin(${angleB - angleA}^\\circ)}$.`,
          `Since $\\sin(180^\\circ - \\theta) = \\sin(\\theta)$, rearrange to solve for $AT$: $AT = \\dfrac{${AB} \\times \\sin(${angleB}^\\circ)}{\\sin(${angleB - angleA}^\\circ)} \\approx ${AT}\\text{ m}$.`,
          `In right-angled triangle $\\triangle TFA$, set up the sine ratio for height $TF$: $\\sin(\\angle TAB) = \\dfrac{\\text{opposite}}{\\text{hypotenuse}} = \\dfrac{TF}{AT}$.`,
          `Substitute $AT$ into the equation: $TF = AT \\times \\sin(${angleA}^\\circ) = ${AT} \\times \\sin(${angleA}^\\circ) \\approx ${TF}\\text{ m}$.`
        ]
      };
    }
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3 - Helicopter Between Points / Double Pythagorean)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Structure 5: Helicopter Above Ground Between Two Points
    const AB = randInt(180, 320);
    const angleA = randInt(32, 42);
    const angleB = randInt(38, 48);
    const angleH = 180 - angleA - angleB;
    const radA = (angleA * Math.PI) / 180;
    const radB = (angleB * Math.PI) / 180;
    const radH = (angleH * Math.PI) / 180;
    const AH_val = (AB * Math.sin(radB)) / Math.sin(radH);
    const AH = AH_val.toFixed(1);
    const height = (AH_val * Math.sin(radA)).toFixed(1);

    const svg = `<svg width="100%" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="170" x2="370" y2="170" stroke="#333" stroke-width="2"/>
      <line x1="60" y1="170" x2="220" y2="40" stroke="#a93226" stroke-width="2.5"/>
      <line x1="340" y1="170" x2="220" y2="40" stroke="#a93226" stroke-width="2.5"/>
      <circle cx="220" cy="30" r="10" fill="#0077be"/>
      <path d="M 90 170 A 30 30 0 0 0 83 152" fill="none" stroke="#d9534f" stroke-width="2"/>
      <path d="M 310 170 A 30 30 0 0 1 316 150" fill="none" stroke="#d9534f" stroke-width="2"/>
      <text x="45" y="188" font-weight="bold" font-size="15">A</text>
      <text x="345" y="188" font-weight="bold" font-size="15">B</text>
      <text x="215" y="20" font-weight="bold" font-size="15">H</text>
      <text x="190" y="188" font-size="14" font-weight="bold" fill="#003366">${AB} m</text>
      <text x="95" y="162" font-size="13" fill="#d9534f">${angleA}°</text>
      <text x="285" y="162" font-size="13" fill="#d9534f">${angleB}°</text>
    </svg>`;

    return {
      strand: "Geometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Angles of Elevation & Depression",
      prompt: `${svg}<br>Two points, <i>A</i> and <i>B</i>, are ${AB} m apart on level ground and <i>H</i> is a helicopter above the ground between <i>A</i> and <i>B</i>. The angles of elevation of <i>H</i> from <i>A</i> and <i>B</i> are ${angleA}° and ${angleB}° respectively. Find the height of the helicopter above ground (rounded to 1 decimal place).`,
      inputCount: 1,
      inputLabels: ["Height (m) ="],
      expectedAnswer: height,
      keypad: KEYPAD_KEYS,
      steps: [
        `Calculate the interior angle $\\angle AHB$ in $\\triangle ABH$: $\\angle AHB = 180^\\circ - ${angleA}^\\circ - ${angleB}^\\circ = ${angleH}^\\circ$.`,
        `Apply the Sine Rule in $\\triangle ABH$ to calculate side $AH$: $\\dfrac{AH}{\\sin(\\angle ABH)} = \\dfrac{AB}{\\sin(\\angle AHB)}$.`,
        `Substitute known values: $\\dfrac{AH}{\\sin(${angleB}^\\circ)} = \\dfrac{${AB}}{\\sin(${angleH}^\\circ)}$.`,
        `Rearrange to solve for $AH$: $AH = \\dfrac{${AB} \\times \\sin(${angleB}^\\circ)}{\\sin(${angleH}^\\circ)} \\approx ${AH}\\text{ m}$.`,
        `Consider the right-angled triangle formed by $H$, point $A$, and the point on the ground directly beneath $H$. Set up the sine ratio: $\\sin(\\angle HAB) = \\dfrac{\\text{Height}}{AH}$.`,
        `Rearrange to find the height: $\\text{Height} = AH \\times \\sin(${angleA}^\\circ) = ${AH} \\times \\sin(${angleA}^\\circ) \\approx ${height}\\text{ m}$.`
      ]
    };
  } else {
    // Structure 6: Advertisement Board on Vertical Pole (Double Pythagorean Equation)
    const d = randInt(8, 15);
    const BC_val = randInt(6, 10);
    const AB = randInt(2, 5);
    const BD = Math.sqrt(d * d + BC_val * BC_val).toFixed(1);
    const AD = Math.sqrt(d * d + (BC_val + AB) * (BC_val + AB)).toFixed(1);
    const lengthBC = BC_val.toFixed(1);

    const svg = `<svg width="100%" height="210" viewBox="0 0 400 210" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="180" x2="370" y2="180" stroke="#333" stroke-width="2"/>
      <line x1="100" y1="180" x2="100" y2="90" stroke="#8b0000" stroke-width="3"/>
      <rect x="92" y="20" width="16" height="70" fill="#f7a8b8" stroke="#8b0000" stroke-width="2"/>
      <line x1="100" y1="20" x2="330" y2="180" stroke="#8b0000" stroke-width="2"/>
      <line x1="100" y1="90" x2="330" y2="180" stroke="#8b0000" stroke-width="2"/>
      <rect x="100" y="165" width="15" height="15" fill="none" stroke="#333" stroke-width="1.5"/>
      <text x="80" y="25" font-weight="bold" font-size="15">A</text>
      <text x="80" y="95" font-weight="bold" font-size="15">B</text>
      <text x="80" y="198" font-weight="bold" font-size="15">C</text>
      <text x="335" y="198" font-weight="bold" font-size="15">D</text>
      <text x="65" y="60" font-size="13" font-weight="bold">${AB} m</text>
      <text x="210" y="90" font-size="13" font-weight="bold">${AD} m</text>
      <text x="190" y="145" font-size="13" font-weight="bold">${BD} m</text>
    </svg>`;

    return {
      strand: "Geometry",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Angles of Elevation & Depression",
      prompt: `${svg}<br>In the diagram, <i>AB</i> is an advertisement board perched on a vertical pole <i>BC</i>. Points <i>C</i> and <i>D</i> are on level ground. <i>AB</i> = ${AB} m, <i>AD</i> = ${AD} m, and <i>BD</i> = ${BD} m. Find the length of pole <i>BC</i> (rounded to 1 decimal place).`,
      inputCount: 1,
      inputLabels: ["BC (m) ="],
      expectedAnswer: lengthBC,
      keypad: KEYPAD_KEYS,
      steps: [
        `Express $CD^2$ using the Pythagorean theorem in right-angled triangle $\\triangle BCD$: $CD^2 = BD^2 - BC^2$.`,
        `Express $CD^2$ using the Pythagorean theorem in right-angled triangle $\\triangle ACD$, noting that $AC = BC + AB$: $CD^2 = AD^2 - (BC + AB)^2$.`,
        `Equate both expressions for $CD^2$: $BD^2 - BC^2 = AD^2 - (BC + AB)^2$.`,
        `Expand the squared binomial $(BC + AB)^2$: $BD^2 - BC^2 = AD^2 - (BC^2 + 2 \\times AB \\times BC + AB^2)$.`,
        `Distribute the negative sign and eliminate $-BC^2$ from both sides: $BD^2 = AD^2 - 2 \\times AB \\times BC - AB^2$.`,
        `Rearrange the terms to isolate $2 \\times AB \\times BC$: $2 \\times AB \\times BC = AD^2 - BD^2 - AB^2$.`,
        `Solve for $BC$: $BC = \\dfrac{AD^2 - BD^2 - AB^2}{2 \\times AB}$.`,
        `Substitute the given values ($AB = ${AB}\\text{ m}, AD = ${AD}\\text{ m}, BD = ${BD}\\text{ m}$): $BC = \\dfrac{${AD}^2 - ${BD}^2 - ${AB}^2}{2 \\times ${AB}}$.`,
        `Calculate the value and round to 1 decimal place: $BC = ${lengthBC}\\text{ m}$.`
      ]
    };
  }
}

export const anglesOfElevationAndDepression = { generate: generateQuestion };
export default generateQuestion;
