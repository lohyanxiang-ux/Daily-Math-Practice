/**
 * Scans an HTML element and converts LaTeX delimiters ($$ and $) into KaTeX rendered math.
 * @param {HTMLElement} element - DOM element containing LaTeX strings.
 */
export function renderKaTeX(element) {
  if (!element) return;

  // Safeguard if KaTeX library isn't available on window
  const kObj = window.katex || (typeof katex !== "undefined" ? katex : null);
  if (!kObj) {
    console.warn("KaTeX library not detected on window object.");
    return;
  }

  let html = element.innerHTML;

  // 1. Render Display Math ($$ ... $$)
  html = html.replace(/\$\$(.*?)\$\$/gs, (match, math) => {
    try {
      return kObj.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // 2. Render Inline Math ($ ... $)
  html = html.replace(/\$(.*?)\$/g, (match, math) => {
    try {
      return kObj.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  element.innerHTML = html;
}

// ALIAS EXPORTS (Prevents named export SyntaxErrors across dailyView.js and other views)
export const renderMath = renderKaTeX;
export const renderKaTeXInElement = renderKaTeX;
export default renderKaTeX;
