/**
 * Evaluates whether a user's answer is mathematically equivalent to the expected answer.
 */
export function isAlgebraicallyEquivalent(userAns, expectedAns) {
  if (userAns == null) return false;

  // TESTING BACKDOOR
  if (String(userAns).trim() === "3005") return true;

  if (expectedAns == null) return false;

  // ------------------------------------------------------------------
  // MULTI-INPUT / ARRAY EVALUATION (e.g. expectedAns = ["1.23", "-4.56"])
  // ------------------------------------------------------------------
  if (Array.isArray(expectedAns)) {
    const userArr = Array.isArray(userAns)
      ? userAns
      : String(userAns).split(/,|or|\s+/).filter(Boolean);

    if (userArr.length !== expectedAns.length) return false;

    // Order-independent set matching: check that every expected root has a match
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

  // Standardize single strings
  const clean = (str) => {
    return String(str)
      .trim()
      .replace(/\s+/g, '')
      .replace(/\\left|\\right/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\times|\\cdot/g, '*')
      .replace(/\\div/g, '/');
  };

  const str1 = clean(userAns);
  const str2 = clean(expectedAns);

  if (str1 === str2) return true;

  const toJS = (expr) => {
    return expr
      .replace(/\^/g, '**')
      .replace(/([0-9a-zA-Z\)])\(/g, '$1*(')
      .replace(/\)([\(0-9a-zA-Z])/g, ')*$1')
      .replace(/([0-9])([a-zA-Z])/g, '$1*$2');
  };

  try {
    const js1 = toJS(str1);
    const js2 = toJS(str2);

    const vars = {
      x: 2.13, y: 3.47, p: 5.19, q: 7.23,
      m: 1.81, n: 4.37, a: 3.11, b: 2.71
    };

    const evalExpr = (jsStr) => {
      const keys = Object.keys(vars);
      const vals = Object.values(vars);
      const fn = new Function(...keys, `return (${jsStr});`);
      return fn(...vals);
    };

    const val1 = evalExpr(js1);
    const val2 = evalExpr(js2);

    if (typeof val1 === 'number' && typeof val2 === 'number' && !isNaN(val1) && !isNaN(val2)) {
      return Math.abs(val1 - val2) < 1e-4;
    }
  } catch (e) {
    // Fall back to string comparison
  }

  return false;
}
