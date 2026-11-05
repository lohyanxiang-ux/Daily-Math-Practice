export function initScratchpad(containerEl) {
  const wrapper = containerEl.querySelector(".canvas-wrapper");
  const canvas = containerEl.querySelector("#scratchpad-canvas");

  // Low-latency canvas context configuration for iPad / Apple Pencil
  const ctx = canvas.getContext("2d", {
    desynchronized: true,
    alpha: true
  });

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let midX = 0;
  let midY = 0;
  let currentMode = "pen"; // 'pen', 'eraser', or 'pointer'
  let currentColor = "#1e293b";
  const baseSize = 2.5;

  // Set inline touch-action to block Safari gesture delay instantly
  function updateTouchAction() {
    const touchAction = currentMode === "pointer" ? "pan-y" : "none";
    if (wrapper) wrapper.style.touchAction = touchAction;
    canvas.style.touchAction = touchAction;
  }

  function resizeCanvas() {
    // Cap DPR at 2 for performance stability on large 2000px canvases
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrapper.getBoundingClientRect();
    const totalHeight = 2000;

    // Preserve existing drawing buffer on window resize
    const tempCanvas = document.createElement("canvas");
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = rect.width * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${totalHeight}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr);
    }
  }

  updateTouchAction();
  resizeCanvas();

  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5,
      pointerType: e.pointerType
    };
  }

  function renderStrokeSegment(p1X, p1Y, p2X, p2Y, pressure, pointerType) {
    ctx.beginPath();

    let strokeWidth = baseSize;
    if (currentMode === "eraser") {
      strokeWidth = baseSize * 9;
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = currentColor;

      // Dynamic stroke width scaling for Apple Pencil pressure
      if (pointerType === "pen" && pressure > 0) {
        strokeWidth = baseSize * (0.6 + pressure * 1.8);
      }
    }

    ctx.lineWidth = strokeWidth;

    // Smooth line rendering using midpoint quadratic bezier curves
    const currentMidX = (p1X + p2X) / 2;
    const currentMidY = (p1Y + p2Y) / 2;

    ctx.moveTo(midX, midY);
    ctx.quadraticCurveTo(p1X, p1Y, currentMidX, currentMidY);
    ctx.stroke();

    midX = currentMidX;
    midY = currentMidY;
  }

  function renderPoint(x, y, pressure, pointerType) {
    ctx.beginPath();
    let strokeWidth = baseSize;
    if (currentMode === "eraser") {
      strokeWidth = baseSize * 9;
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = currentColor;
      if (pointerType === "pen" && pressure > 0) {
        strokeWidth = baseSize * (0.6 + pressure * 1.8);
      }
    }
    ctx.arc(x, y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function startDrawing(e) {
    if (currentMode === "pointer" || !e.isPrimary) return;

    isDrawing = true;

    // Capture pointer to lock touch tracking to canvas without latency
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {}

    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
    midX = coords.x;
    midY = coords.y;

    // Render immediate point for quick taps/dots
    renderPoint(coords.x, coords.y, coords.pressure, coords.pointerType);
  }

  function draw(e) {
    if (!isDrawing || currentMode === "pointer" || !e.isPrimary) return;

    e.preventDefault();

    // Extract hardware high-frequency Apple Pencil events (120Hz-240Hz)
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      const coords = getCoordinates(ev);
      renderStrokeSegment(lastX, lastY, coords.x, coords.y, coords.pressure, coords.pointerType);
      lastX = coords.x;
      lastY = coords.y;
    }
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    if (e && e.pointerId !== undefined) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  }

  // Pointer event listeners optimized for touch & stylus
  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", draw);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  // TOOLBAR ACTION HANDLERS
  containerEl.querySelectorAll("[data-tool]").forEach(btn => {
    btn.addEventListener("click", () => {
      containerEl.querySelectorAll("[data-tool]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.getAttribute("data-tool");
      updateTouchAction();
    });
  });

  // Color Swatches
  containerEl.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
      containerEl.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      currentColor = swatch.getAttribute("data-color");

      if (currentMode === "pointer" || currentMode === "eraser") {
        currentMode = "pen";
        containerEl.querySelectorAll("[data-tool]").forEach(b => b.classList.remove("active"));
        const penBtn = containerEl.querySelector("[data-tool='pen']");
        if (penBtn) penBtn.classList.add("active");
        updateTouchAction();
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
