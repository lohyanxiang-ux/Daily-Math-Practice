/**
 * Question Generator: Completing the Square Trainer
 * Curriculum Skill: Sec 3 G3 - Algebra & Functions
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randIntExclude(min, max, excludeZero = true) {
  let val = 0;
  do {
    val = randInt(min, max);
  } while (excludeZero && val === 0);
  return val;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function simplifyFrac(n, d) {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  n = n / g;
  d = d / g;

  let str = "";
  let latex = "";
  if (d === 1) {
    str = n.toString();
    latex = n.toString();
  } else if (n < 0) {
    str = `-${Math.abs(n)}/${d}`;
    latex = `-\\frac{${Math.abs(n)}}{${d}}`;
  } else {
    str = `${n}/${d}`;
    latex = `\\frac{${n}}{${d}}`;
  }
  return { num: n, den: d, str: str, latex: latex };
}

function formatFracAbsLatex(fracObj) {
  if (fracObj.den === 1) return Math.abs(fracObj.num).toString();
  return `\\frac{${Math.abs(fracObj.num)}}{${fracObj.den}}`;
}

// Formats a fraction or integer into signed LaTeX term: e.g., "+\frac{3}{2}" or "-\frac{11}{4}"
function formatSignedFracTermLatex(fracObj) {
  if (fracObj.num === 0) return "";
  if (fracObj.den === 1) {
    return fracObj.num > 0 ? `+${fracObj.num}` : `${fracObj.num}`;
  }
  return fracObj.num > 0
    ? `+\\frac{${fracObj.num}}{${fracObj.den}}`
    : `-\\frac{${Math.abs(fracObj.num)}}{${fracObj.den}}`;
}

function formatPoly(a, b, c) {
  let str = a === -1 ? "-x^2" : "x^2";
  
  if (b === 1) str += " + x";
  else if (b === -1) str += " - x";
  else if (b > 0) str += ` + ${b}x`;
  else if (b < 0) str += ` - ${Math.abs(b)}x`;

  if (c > 0) str += ` + ${c}`;
  else if (c < 0) str += ` - ${Math.abs(c)}`;

  return str;
}

export function generateQuestion(tier = 1) {
  const defaultKeypad = [
    "x", "^2", "/", "+",
    "7", "8", "9", "-",
    "4", "5", "6", "(",
    "1", "2", "3", ")",
    "0", ".", "⌫", "Clear"
  ];

  // =========================================================
  // TIER 1: BASIC (Level 1: Integer roots, a = 1, Even b)
  // =========================================================
  if (tier === 1) {
    const k = randIntExclude(-6, 6, true);
    const c = randIntExclude(-10, 10, true);

    const b = 2 * k;
    const q = c - k * k;
    const poly = formatPoly(1, b, c);

    const step2K = k > 0 ? `+ ${k}` : `- ${Math.abs(k)}`;
    const step2C = c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
    const step2 = `\\left(x ${step2K}\\right)^2 - ${k * k} ${step2C}`;

    const step3Q = q > 0 ? `+ ${q}` : (q < 0 ? `- ${Math.abs(q)}` : "");
    const step3 = `\\left(x ${step2K}\\right)^2 ${step3Q}`.trim();

    const ansK = k > 0 ? `+${k}` : `${k}`;
    const ansQ = q > 0 ? `+${q}` : (q < 0 ? `${q}` : "");
    const ans = `\\left(x${ansK}\\right)^2${ansQ}`;

    return {
      strand: "Algebra & Functions",
      tier: 1,
      tierName: "Basic",
      skillTitle: "Completing the Square",
      requiredForm: "completed_square",
      prompt: `Express $$${poly}$$ in completed square form:`,
      expectedAnswer: ans,
      keypad: defaultKeypad,
      steps: [
        `Given expression: $$${poly}$$`,
        `Apply completing the square: $$${step2}$$`,
        `Simplify the expression: $$${step3}$$`
      ]
    };
  }

  // =========================================================
  // TIER 2: INTERMEDIATE (Level 2: Fractional roots, a = 1, Odd b)
  // =========================================================
  if (tier === 2) {
    const b_raw = randIntExclude(-9, 9, true);
    const c = randIntExclude(-8, 8, true);

    const b = b_raw % 2 === 0 ? b_raw + 1 : b_raw;
    const pFrac = simplifyFrac(b, 2);
    const qFrac = simplifyFrac(4 * c - b * b, 4);
    const poly = formatPoly(1, b, c);

    const bSign = b > 0 ? "+ " : "- ";
    const cSign = c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
    const step2 = `\\left(x ${bSign}\\frac{${Math.abs(b)}}{2}\\right)^2 - \\frac{${b * b}}{4} ${cSign}`;

    const pSign = pFrac.num > 0 ? "+ " : "- ";
    const qSign = qFrac.num > 0 ? "+ " : "- ";
    const step3 = `\\left(x ${pSign}${formatFracAbsLatex(pFrac)}\\right)^2 ${qSign}${formatFracAbsLatex(qFrac)}`;

    const ansP = formatSignedFracTermLatex(pFrac);
    const ansQ = formatSignedFracTermLatex(qFrac);
    const ans = `\\left(x${ansP}\\right)^2${ansQ}`;

    return {
      strand: "Algebra & Functions",
      tier: 2,
      tierName: "Intermediate",
      skillTitle: "Completing the Square",
      requiredForm: "completed_square",
      prompt: `Express $$${poly}$$ in completed square form:`,
      expectedAnswer: ans,
      keypad: defaultKeypad,
      steps: [
        `Given expression: $$${poly}$$`,
        `Apply completing the square: $$${step2}$$`,
        `Simplify the expression: $$${step3}$$`
      ]
    };
  }

  // =========================================================
  // TIER 3: ADVANCED (Level 3: Negative leading coefficient, a = -1)
  // =========================================================
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Sub-type A: Even b, a = -1
    const k = randIntExclude(-6, 6, true);
    const c = randIntExclude(-10, 10, true);

    const b = 2 * k;
    const q = c + k * k;
    const poly = formatPoly(-1, b, c);

    const negB = -b;
    const step2Inner = negB > 0 ? `+ ${negB === 1 ? '' : negB}x` : `- ${Math.abs(negB) === 1 ? '' : Math.abs(negB)}x`;
    const step2C = c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
    const step2 = `- \\left(x^2 ${step2Inner}\\right) ${step2C}`;

    const negK = -k;
    const step3K = negK > 0 ? `+ ${negK}` : `- ${Math.abs(negK)}`;
    const step3 = `- \\left[\\left(x ${step3K}\\right)^2 - ${k * k}\\right] ${step2C}`;

    const step4Q = q > 0 ? `+ ${q}` : (q < 0 ? `- ${Math.abs(q)}` : "");
    const step4 = `- \\left(x ${step3K}\\right)^2 ${step4Q}`.trim();

    const ansK = negK > 0 ? `+${negK}` : `${negK}`;
    const ansQ = q > 0 ? `+${q}` : (q < 0 ? `${q}` : "");
    const ans = `-\\left(x${ansK}\\right)^2${ansQ}`;

    return {
      strand: "Algebra & Functions",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Completing the Square",
      requiredForm: "completed_square",
      prompt: `Express $$${poly}$$ in completed square form:`,
      expectedAnswer: ans,
      keypad: defaultKeypad,
      steps: [
        `Factorise out -1 from $x$ terms: $$${step2}$$`,
        `Apply completing the square inside brackets: $$${step3}$$`,
        `Expand brackets and simplify: $$${step4}$$`
      ]
    };
  } else {
    // Sub-type B: Odd b, a = -1
    const b_raw = randIntExclude(-9, 9, true);
    const c = randIntExclude(-8, 8, true);

    const b = b_raw % 2 === 0 ? b_raw + 1 : b_raw;
    const pFrac = simplifyFrac(-b, 2);
    const qFrac = simplifyFrac(4 * c + b * b, 4);
    const poly = formatPoly(-1, b, c);

    const negB = -b;
    const step2Inner = negB > 0 ? `+ ${negB === 1 ? '' : negB}x` : `- ${Math.abs(negB) === 1 ? '' : Math.abs(negB)}x`;
    const step2C = c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
    const step2 = `- \\left(x^2 ${step2Inner}\\right) ${step2C}`;

    const negBSign = negB > 0 ? "+ " : "- ";
    const step3 = `- \\left[\\left(x ${negBSign}\\frac{${Math.abs(b)}}{2}\\right)^2 - \\frac{${b * b}}{4}\\right] ${step2C}`;

    const pSign = pFrac.num > 0 ? "+ " : "- ";
    const qSign = qFrac.num > 0 ? "+ " : "- ";
    const step4 = `- \\left(x ${pSign}${formatFracAbsLatex(pFrac)}\\right)^2 ${qSign}${formatFracAbsLatex(qFrac)}`;

    const ansP = formatSignedFracTermLatex(pFrac);
    const ansQ = formatSignedFracTermLatex(qFrac);
    const ans = `-\\left(x${ansP}\\right)^2${ansQ}`;

    return {
      strand: "Algebra & Functions",
      tier: 3,
      tierName: "Advanced",
      skillTitle: "Completing the Square",
      requiredForm: "completed_square",
      prompt: `Express $$${poly}$$ in completed square form:`,
      expectedAnswer: ans,
      keypad: defaultKeypad,
      steps: [
        `Factorise out -1 from $x$ terms: $$${step2}$$`,
        `Apply completing the square inside brackets: $$${step3}$$`,
        `Expand brackets and simplify: $$${step4}$$`
      ]
    };
  }
}

export const completingTheSquare = { generate: generateQuestion };
export default generateQuestion;
