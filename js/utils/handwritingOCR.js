import { state } from "../state.js";

const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbwEsVnKapmwUFuv0vyG1wFvyAXoFKQMrpsNxibUqYh891PHXzFgmBThnT62lGoEPo_xiQ/exec";

function getApiUrl() {
  let apiUrl = state.apiUrl || 
               state.config?.apiUrl || 
               state.backendUrl || 
               state.scriptUrl || 
               window.APP_CONFIG?.apiUrl || 
               window.API_URL || 
               localStorage.getItem("math_app_api_url") || 
               DEFAULT_API_URL;
  if (apiUrl && !apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
    apiUrl = "https://" + apiUrl;
  }
  return apiUrl;
}

/**
 * Resizes and compresses canvas image to a max dimension of 600px JPEG.
 * Reduces iPad Retina image payload from ~3MB to ~30KB for instant transfer.
 */
function getCompressedCanvasImage(canvas, maxDimension = 600) {
  const tempCanvas = document.createElement("canvas");
  let width = canvas.width;
  let height = canvas.height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext("2d");
  
  // Fill white background for JPEG rendering
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(canvas, 0, 0, width, height);

  return tempCanvas.toDataURL("image/jpeg", 0.75);
}

export async function recognizeHandwritingFromCanvas(canvasElement) {
  if (!canvasElement) {
    return { status: "error", message: "Scratchpad canvas not found." };
  }

  try {
    const imageBase64 = getCompressedCanvasImage(canvasElement, 600);
    const token = state.userToken || state.token || "STUDENT_SESSION";

    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "recognizeHandwriting",
        token: token,
        image: imageBase64
      })
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("Non-JSON API response:", rawText);
      return { status: "error", message: "Invalid server response format." };
    }

    return data;
  } catch (err) {
    console.error("Handwriting recognition network error:", err);
    return { status: "error", message: `Network error (${err.message || "Connection failed"}).` };
  }
}
