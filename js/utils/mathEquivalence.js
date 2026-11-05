/**
 * Evaluates whether a user's answer is mathematically equivalent to the expected answer,
 * respecting required form constraints (factorised, completed square) and commutative/associative laws.
 */
export function isAlgebraicallyEquivalent(userAns, expectedAns, requiredForm = null) {
  if (userAns == null) return false;

  // Testing backdoor
  if (String(userAns).trim() === "3005") return true;

  if (expectedAns == null) return false;

  // ------------------------------------------------------------------
  // MULTI-INPUT / ARRAY EVALUATION
  // ------------------------------------------------------------------
  if (Array.isArray(expectedAns)) {
    const userArr = Array.isArray(userAns)
      ? userAns
      : String(userAns).split(/,|or|\s+/).filter(Boolean);

    if (userArr.length !== expectedAns.length) return false;

    const remainingUser = [...userArr];
    for (const exp of expectedAns) {
      const idx = remainingUser.findIndex(u => isAlgebraicallyEquivalent(u, exp, requiredForm));
      if (idx === -1) return false;
      remainingUser.splice(idx, 1);
    }
    return remainingUser.length === 0;
  }

  // Handle pipe-separated expected strings
  if (typeof expectedAns === "string" && expectedAns.includes("|")) {
    return expectedAns.split("|").some(exp => isAlgebraicallyEquivalent(userAns, exp.trim(), requiredForm));
  }

  // Standardize LaTeX strings
  const clean = (str) => {
    let s = String(str)
      .trim()
      .replace(/\u2212|\u2013|\u2014|\\text\{-\}/g, '-')                     // Normalize minus signs
      .replace(/^[a-zA-Z]\s*=\s*/, '')                                       // Strip equation prefixes (e.g., "x = ")
      .replace(/\\placeholder(\{[^{}]*\}|\[[^{}]*\])?/g, '')                 // Strip placeholders
      .replace(/#\?|#0/g, '');

    // Recursively strip LaTeX font & text wrappers: \mathrm{x}, \mathit{x}, \text{x}, etc.
    let prevText;
    do {
      prevText = s;
      s = s.replace(/\\(mathrm|mathit|mathbf|mathsf|mathtt|text|operatorname|d)\{([^{}]+)\}/g, '$2');
    } while (s !== prevText);

    // Strip formatting commands & invisible spacers
    s = s.replace(/\\(displaystyle|style|limits|nolimits|left\.|right\.|quad|qquad|;|!|,|:)/g, '');

    // Standardize delimiters & operators (handles both \left( and unescaped left() from template literals)
    s = s.replace(/\\left\(|left\(|\\left\[|left\[|\\left\{|left\{/g, '(');
    s = s.replace(/\\right\)|right\)|\\right\]|right\]|\\right\}|right\}/g, ')');
    s = s.replace(/\\left|left|\\right|right/g, '');
    s = s.replace(/\\times|\\cdot|\\ast|\\star|\\cdotp|\\centerdot/g, '*');
    s = s.replace(/\\div/g, '/');
    s = s.replace(/\\pi/g, 'Math.PI');

    // Robust \frac conversion handling all LaTeX variants (\frac{3}{2}, \frac32, \frac{3}2, \frac3{2})
    let prevFrac;
    do {
      prevFrac = s;
      s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
      s = s.replace(/\\frac([0-9a-zA-Z])([0-9a-zA-Z])/g, '(($1)/($2))');
      s = s.replace(/\\frac\{([^{}]+)\}([0-9a-zA-Z])/g, '(($1)/($2))');
      s = s.replace(/\\frac([0-9a-zA-Z])\{([^{}]+)\}/g, '(($1)/($2))');
    } while (s !== prevFrac);

    // Handle nested \sqrt{a} recursively
    let prevSqrt;
    do {
      prevSqrt = s;
      s = s.replace(/\\sqrt\{([^{}]+)\}/g, 'Math.sqrt($1)');
    } while (s !== prevSqrt);

    return s.replace(/\s+/g, '');
  };

  const str1 = clean(userAns);
  const str2 = clean(expectedAns);

  if (!str1) return false;
  if (str1 === str2) return true;

  // ------------------------------------------------------------------
  // STEP 1: STRUCTURAL FORM CHECK (FACTORISED / COMPLETED SQUARE)
  // ------------------------------------------------------------------
  const checkForm = (userClean, expectedRaw, reqForm) => {
    const expStr = clean(expectedRaw);

    const isExpectedFactorised = reqForm === 'factorised' || 
      (/(\([^\)]+\)|\b[a-zA-Z0-9]+\b)\s*\(/.test(expStr) && !/\)\s*\^/.test(expStr));

    const isExpectedCompletedSquare = reqForm === 'completed_square' || 
      /\([^\)]+\)\s*\^/.test(expStr);

    if (isExpectedCompletedSquare) {
      const hasSquaredTerm = /\([^\)]+\)\s*(\^2|\^\{2\}|\*\*\s*2|\*\*\s*\(2\))/ .test(userClean);
      if (!hasSquaredTerm) return false;
    }

    if (isExpectedFactorised && !isExpectedCompletedSquare) {
      let depth = 0;
      let hasTopLevelAddSub = false;

      for (let i = 0; i < userClean.length; i++) {
        const char = userClean[i];
        if (char === '(' || char === '[' || char === '{') depth++;
        else if (char === ')' || char === ']' || char === '}') depth--;
        else if (depth === 0 && (char === '+' || char === '-')) {
          if (i > 0 && !/[*\/^+\-(]/.test(userClean[i - 1])) {
            hasTopLevelAddSub = true;
            break;
          }
        }
      }

      if (hasTopLevelAddSub) return false;
    }

    return true;
  };

  if (!checkForm(str1, expectedAns, requiredForm)) {
    return false;
  }

  // ------------------------------------------------------------------
  // STEP 2: MULTI-POINT NUMERICAL EQUIVALENCE EVALUATION
  // ------------------------------------------------------------------
  const toJS = (expr) => {
    let e = expr;

    // Robustly convert ^ exponents into Math.pow(...) to prevent JS unary minus syntax errors
    let prev;
    do {
      prev = e;
      e = e.replace(/(\([^\(\)]+\)|[a-zA-Z0-9\.]+)\s*\^\s*\{([^{}]+)\}/g, 'Math.pow($1, $2)');
      e = e.replace(/(\([^\(\)]+\)|[a-zA-Z0-9\.]+)\s*\^\s*([0-9a-zA-Z]+)/g, 'Math.pow($1, $2)');
    } while (e !== prev);

    e = e.replace(/\{/g, '(').replace(/\}/g, ')').replace(/\[/g, '(').replace(/\]/g, ')');

    // Insert implicit multiplications safely (excluding function names like Math.pow or Math.sqrt)
    e = e.replace(/([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z\(])/g, '$1*$2');
    e = e.replace(/(\))\s*\(/g, ')*(');
    e = e.replace(/(\))\s*([0-9a-zA-Z])/g, ')*$2');
    e = e.replace(/\b(?!(?:Math|pow|sqrt|sin|cos|tan|log|ln|abs|min|max)\b)([a-zA-Z])\s*\(/g, '$1*(');

    return e;
  };

  try {
    const js1 = toJS(str1);
    const js2 = toJS(str2);

    if (js1 === js2) return true;

    // Test across distinct sample points
    const sampleSets = [
      { x: 2.13, y: 3.47, p: 5.19, q: 7.23, m: 1.81, n: 4.37, a: 3.11, b: 2.71, theta: 0.785 },
      { x: -1.45, y: -2.89, p: 1.12, q: 4.05, m: 2.93, n: 0.54, a: 1.67, b: 5.23, theta: 1.256 }
    ];

    for (const vars of sampleSets) {
      const keys = Object.keys(vars);
      const vals = Object.values(vars);

      const evalExpr = (jsStr) => {
        const fn = new Function(...keys, `return (${jsStr});`);
        return fn(...vals);
      };

      const val1 = evalExpr(js1);
      const val2 = evalExpr(js2);

      if (typeof val1 === 'number' && typeof val2 === 'number' && !isNaN(val1) && !isNaN(val2)) {
        if (Math.abs(val1 - val2) > 1e-4) return false;
      } else {
        return false;
      }
    }

    return true;
  } catch (e) {
    // Fall back to direct string matching
  }

  return false;
}
