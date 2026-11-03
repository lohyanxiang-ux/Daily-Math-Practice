/**
 * Scans an HTML element and converts LaTeX delimiters ($$ and $) into KaTeX rendered math.
 */
export function renderMath(element) {
  if (!element || !window.katex) return;

  let html = element.innerHTML;

  // 1. Render Display Math ($$ ... $$)
  html = html.replace(/\$\$(.*?)\$\$/gs, (match, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // 2. Render Inline Math ($ ... $)
  html = html.replace(/\$(.*?)\$/gs, (match, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  element.innerHTML = html;
}
