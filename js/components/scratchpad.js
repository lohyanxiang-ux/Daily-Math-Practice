export function initScratchpad(containerEl) {
  const wrapper = containerEl.querySelector(".canvas-wrapper");
  const canvas = containerEl.querySelector("#scratchpad-canvas");
  const ctx = canvas.getContext("2d");

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentMode = "pen"; // 'pen', 'eraser', or 'pointer'
  let currentColor = "#1e293b";
  const currentSize = 2.5;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = wrapper.getBoundingClientRect();
    const totalHeight = 2000;

    canvas.width = rect.width * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${totalHeight}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  resizeCanvas();

  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    // DISABLE MULTI-TOUCH: Block if more than 1 touch point is detected
    if (e.touches && e.touches.length > 1) {
      isDrawing = false;
      return;
    }

    // Pointer / Scroll mode does not draw
    if (currentMode === "pointer") return;

    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
  }

  function draw(e) {
    if (!isDrawing || currentMode === "pointer") return;

    // Reject multi-touch gestures mid-stroke
    if (e.touches && e.touches.length > 1) {
      isDrawing = false;
      return;
    }

    e.preventDefault();
    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);

    if (currentMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = currentSize * 7;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentSize;
    }

    ctx.stroke();
    lastX = coords.x;
    lastY = coords.y;
  }

  function stopDrawing() {
    isDrawing = false;
  }

  // Drawing event listeners
  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", draw);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  // TOOLBAR ACTION HANDLERS
  containerEl.querySelectorAll("[data-tool]").forEach(btn => {
    btn.addEventListener("click", () => {
      containerEl.querySelectorAll("[data-tool]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.getAttribute("data-tool");

      // In Pointer mode, enable touch scrolling; otherwise block touch scrolling for drawing precision
      if (currentMode === "pointer") {
        wrapper.style.touchAction = "pan-y";
        canvas.style.touchAction = "pan-y";
      } else {
        wrapper.style.touchAction = "none";
        canvas.style.touchAction = "none";
      }
    });
  });

  // Color Swatches
  containerEl.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
      containerEl.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      currentColor = swatch.getAttribute("data-color");

      // Auto-switch to pen mode if color selected
      if (currentMode === "pointer" || currentMode === "eraser") {
        currentMode = "pen";
        containerEl.querySelectorAll("[data-tool]").forEach(b => b.classList.remove("active"));
        const penBtn = containerEl.querySelector("[data-tool='pen']");
        if (penBtn) penBtn.classList.add("active");
        wrapper.style.touchAction = "none";
        canvas.style.touchAction = "none";
      }
    });
  });

  // Clear Canvas Button
  const clearBtn = containerEl.querySelector("#btn-clear-canvas");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }
}
