function decodeHtmlEntities(str) {
  return str
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&/g, "&");
}

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

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "PRE", "CODE", "TEXTAREA"]);
  let insideSkipTag = false;

  const formatTextSegment = (segment) => {
    if (!segment || insideSkipTag) return segment;

    // 1. Render Display Math ($$ ... $$)
    let out = segment.replace(/\$\$(.*?)\$\$/gs, (match, math) => {
      try {
        const cleanMath = decodeHtmlEntities(math).trim();
        return kObj.renderToString(cleanMath, { displayMode: true, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    // 2. Render Inline Math ($ ... $) without crossing into $$ or currency
    out = out.replace(/(?<!\$)\$(?!\$)((?:\\.|[^$\n])+?)\$(?!\$)/gs, (match, math) => {
      try {
        const cleanMath = decodeHtmlEntities(math).trim();
        return kObj.renderToString(cleanMath, { displayMode: false, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    // 3. Convert newlines to <br> in text outside math
    return out.replace(/\n\n+/g, "<br><br>").replace(/\n/g, "<br>");
  };

  // Split into alternating [text, tag, text, tag, ...] parts so HTML tags/SVGs stay intact
  const parts = element.innerHTML.split(/(<[^>]+>)/g);
  const updatedHtml = parts
    .map((part) => {
      if (part.startsWith("<") && part.endsWith(">")) {
        const tagMatch = part.match(/^<\/?\s*([a-zA-Z0-9-]+)/);
        if (tagMatch) {
          const tagName = tagMatch[1].toUpperCase();
          const isClosing = /^<\s*\//.test(part);
          const isSelfClosing = /\/>\s*$/.test(part);
          if (SKIP_TAGS.has(tagName) && !isSelfClosing) {
            insideSkipTag = !isClosing;
          }
        }
        return part;
      }
      return formatTextSegment(part);
    })
    .join("");

  element.innerHTML = updatedHtml;
}

// ALIAS EXPORTS (Prevents named export SyntaxErrors across dailyView.js and other views)
export const renderMath = renderKaTeX;
export const renderKaTeXInElement = renderKaTeX;
export default renderKaTeX;
