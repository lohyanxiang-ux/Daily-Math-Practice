/**
 * Round Half Up (arithmetic rounding away from zero for halfway values)
 */
export function roundHalfUp(val, decimals = 0) {
  if (isNaN(val) || val === null) return "0";
  const factor = Math.pow(10, decimals);
  const sign = val < 0 ? -1 : 1;
  const absVal = Math.abs(val);
  return ((Math.floor(absVal * factor + 0.5) / factor) * sign).toFixed(decimals);
}

/**
 * Currency Formatting: 2 decimal places (e.g. 12.5 -> "$12.50")
 */
export function formatCurrency(amount, currencySymbol = "$") {
  const rounded = roundHalfUp(amount, 2);
  return `${currencySymbol}${rounded}`;
}

/**
 * Angle Formatting: 1 decimal place with degree symbol (e.g. 45.67 -> "45.7°")
 */
export function formatAngle(angle) {
  const rounded = roundHalfUp(angle, 1);
  return `${rounded}°`;
}

/**
 * General Quantities: 3 Significant Figures
 */
export function formatSigFig(num, sf = 3) {
  if (num === 0 || isNaN(num)) return "0";
  const abs = Math.abs(num);
  const d = Math.ceil(Math.log10(abs < 1 ? abs : abs + 1));
  const power = sf - Math.trunc(d);
  const magnitude = Math.pow(10, power);
  const shifted = Math.round(num * magnitude);
  const result = shifted / magnitude;
  return String(result);
}

/**
 * Converts linear math syntax into KaTeX-compatible LaTeX formatting for UI display.
 * e.g., "(x+5/2)^2-29/4" -> "\left(x + \frac{5}{2}\right)^2 - \frac{29}{4}"
 */
export function textToLatex(expr) {
  if (!expr) return "";
  let str = String(expr).trim();

  // Return as-is if already formatted with LaTeX \frac
  if (str.includes("\\frac")) return str;

  // Convert standalone fractions: 5/2 -> \frac{5}{2}
  str = str.replace(/(^|[^\d\w])(\d+)\/(\d+)($|[^\d\w])/g, "$1\\frac{$2}{$3}$4");

  // Wrap parentheses with \left( and \right) for vertical scaling
  str = str.replace(/\(([^()]+)\)/g, "\\left($1\\right)");

  // Clean operator spacing
  str = str.replace(/\+/g, " + ").replace(/\-/g, " - ").replace(/\s+/g, " ").trim();

  return str;
}

/**
 * Clean Algebraic Expressions according to standard math conventions
 */
export function formatAlgebra(expr, useHtmlSup = false) {
  if (!expr) return "";

  let cleaned = String(expr)
    .replace(/\+\s*\(-\s*([0-9a-zA-Z.]+)\)/g, "- $1")
    .replace(/\+\s*-\s*/g, "- ")
    .replace(/[\+\-]\s*0(?![0-9.])/g, "")
    .replace(/\/ 1(?![0-9.])/g, "")
    .replace(/(^|[\+\-\(\s=])1([a-zA-Z])/g, "$1$2")
    .replace(/(^|[\+\-\(\s=])-1([a-zA-Z])/g, "$1-$2");

  if (useHtmlSup) {
    cleaned = cleaned.replace(/\^([0-9a-zA-Z]+)/g, "<sup>$1</sup>");
  } else {
    cleaned = cleaned.replace(/\^([0-9a-zA-Z]+)/g, "^{$1}");
  }

  return cleaned.trim();
}
