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
 * Clean Algebraic Expressions according to standard math conventions:
 * - Omit 1x -> x, -1x -> -x
 * - Clean x + (-2) -> x - 2
 * - Omit + 0, - 0, / 1
 * - Exponents converted to clean LaTeX x^{2} or <sup>2</sup>
 */
export function formatAlgebra(expr, useHtmlSup = false) {
  if (!expr) return "";

  let cleaned = String(expr)
    // Replace addition of negative numbers: x + (-2) -> x - 2
    .replace(/\+\s*\(-\s*([0-9a-zA-Z.]+)\)/g, "- $1")
    .replace(/\+\s*-\s*/g, "- ")
    // Omit addition/subtraction of zero: x + 0 -> x, x - 0 -> x
    .replace(/[\+\-]\s*0(?![0-9.])/g, "")
    // Omit division by 1: / 1 -> ""
    .replace(/\/ 1(?![0-9.])/g, "")
    // Fix coefficients: 1x -> x, -1x -> -x (works for variables like x, y, a, b)
    .replace(/(^|[\+\-\(\s=])1([a-zA-Z])/g, "$1$2")
    .replace(/(^|[\+\-\(\s=])-1([a-zA-Z])/g, "$1-$2");

  if (useHtmlSup) {
    // Format x^2 as x<sup>2</sup>
    cleaned = cleaned.replace(/\^([0-9a-zA-Z]+)/g, "<sup>$1</sup>");
  } else {
    // Format x^2 as LaTeX x^{2}
    cleaned = cleaned.replace(/\^([0-9a-zA-Z]+)/g, "^{$1}");
  }

  return cleaned.trim();
}
