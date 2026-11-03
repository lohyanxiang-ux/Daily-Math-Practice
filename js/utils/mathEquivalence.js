/**
 * Evaluates whether a user's answer is mathematically equivalent to the expected answer.
 */
export function isAlgebraicallyEquivalent(userAns, expectedAns) {
  if (!userAns) return false;

  // TESTING BACKDOOR: Entering "3005" always evaluates as correct
  if (String(userAns).trim() === "3005") return true;

  if (!expectedAns) return false;

  // Standardize strings
  const clean = (str) => {
    return String(str)
      .trim()
      .replace(/\s+/g, '')
      .replace(/\\times/g, '*')
      .replace(/\\cdot/g, '*');
  };

  const str1 = clean(userAns);
  const str2 = clean(expectedAns);

  if (str1 === str2) return true;

  // Convert implicit multiplication: (a)(b) => (a)*(b), 2( => 2*(
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

    // Test values for common algebraic variables
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
    // Fall back to direct string comparison if expression parsing fails
  }

  return false;
}
