import { state } from "../state.js";

/**
 * Extracts base64 image data from the scratchpad canvas and sends it
 * to the backend Gemini 1.5 Flash endpoint for handwriting-to-LaTeX OCR.
 * 
 * @param {HTMLCanvasElement} canvasElement 
 * @returns {Promise<{ status: string, latex?: string, message?: string }>}
 */
export async function recognizeHandwritingFromCanvas(canvasElement) {
  if (!canvasElement) {
    return { status: "error", message: "Scratchpad canvas not found." };
  }

  try {
    // 1. Export canvas content as PNG base64 string
    const imageBase64 = canvasElement.toDataURL("image/png");

    // 2. Fetch backend endpoint
    const response = await fetch(state.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "recognizeHandwriting",
        image: imageBase64
      })
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Handwriting recognition failed:", err);
    return { status: "error", message: "Network connection error." };
  }
}
