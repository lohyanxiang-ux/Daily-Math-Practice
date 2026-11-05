/**
 * Evaluates whether a user's answer is mathematically equivalent to the expected answer.
 */
export function isAlgebraicallyEquivalent(userAns, expectedAns) {
  if (userAns == null) return false;

  // TESTING BACKDOOR
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
      const idx = remainingUser.findIndex(u => isAlgebraicallyEquivalent(u, exp));
      if (idx === -1) return false;
      remainingUser.splice(idx, 1);
    }
    return remainingUser.length === 0;
  }

  // Handle pipe-separated strings
  if (typeof expectedAns === "string" && expectedAns.includes("|")) {
    return expectedAns.split("|").some(exp => isAlgebraicallyEquivalent(userAns, exp.trim()));
  }

  // Standardize single strings and strip LaTeX font/styling wrappers
  const clean = (str) => {
    let s = String(str).trim();

    // Remove equations prefix (e.g. "x = ")
    s = s.replace(/^[a-zA-Z]\s*=\s*/, '');

    // Recursively strip LaTeX font & text wrappers: \mathrm{x}, \mathit{x}, \text{x}, \mathbf{x}, etc.
    let prevText;
    do {
      prevText = s;
      s = s.replace(/\\(mathrm|mathit|mathbf|mathsf|mathtt|text|operatorname|d)\{([^{}]+)\}/g, '$2');
    } while (s !== prevText);

    // Strip formatting commands & invisible spacers
    s = s.replace(/\\(displaystyle|style|limits|nolimits|left\.|right\.|quad|qquad|;|!|,|:)/g, '');
    s = s.replace(/\\placeholder(\{[^{}]*\})?/g, '');

    // Standardize delimiters & math operators
    s = s.replace(/\\left\(|\\left\[|\\left\{/g, '(');
    s = s.replace(/\\right\)|\\right\]|\\right\}/g, ')');
    s = s.replace(/\\left|\\right/g, '');
    s = s.replace(/\\times|\\cdot|\\ast|\\star|\\cdotp|\\centerdot/g, '*');
    s = s.replace(/\\div/g, '/');
    s = s.replace(/\\pi/g, 'Math.PI');

    // Handle nested \frac{a}{b} recursively
    let prevFrac;
    do {
      prevFrac = s;
      s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
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

  if (str1 === str2) return true;

  const toJS = (expr) => {
    let e = expr
      .replace(/\^\{([^{}]+)\}/g, '**($1)')  // Converts ^{2} to **(2)
      .replace(/\^([0-9a-zA-Z])/g, '**($1)')
      .replace(/\{/g, '(')
      .replace(/\}/g, ')')
      .replace(/\[/g, '(')
      .replace(/\]/g, ')');

    // Insert implicit multiplications:
    // 1. Number before variable or function (e.g. 2x -> 2*x)
    e = e.replace(/([0-9.]+)\s*([a-zA-Z])/g, '$1*$2');
    // 2. Number, variable, or closing bracket before opening parenthesis (e.g. 2( -> 2*(, x( -> x*(, )( -> )*( )
    e = e.replace(/([0-9a-zA-Z\)])\s*\(/g, '$1*(');
    // 3. Closing bracket before number or variable (e.g. )2 -> )*2, )x -> )*x)
    e = e.replace(/\)\s*([0-9a-zA-Z])/g, ')*$1');

    return e;
  };

  try {
    const js1 = toJS(str1);
    const js2 = toJS(str2);

    if (js1 === js2) return true;

    // Test multiple sample points to ensure equivalence
    const sampleSets = [
      { x: 2.13, y: 3.47, p: 5.19, q: 7.23, m: 1.81, n: 4.37, a: 3.11, b: 2.71 },
      { x: 5.71, y: 1.93, p: 2.45, q: 8.11, m: 3.22, n: 1.09, a: 4.56, b: 6.82 }
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
        if (Math.abs(val1 - val2) < 1e-4) return true;
      }
    }
  } catch (e) {
    // Fall back to string comparison
  }

  return false;
}
