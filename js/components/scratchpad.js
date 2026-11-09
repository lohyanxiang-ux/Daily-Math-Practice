export function initScratchpad(containerEl) {
  const wrapper = containerEl.querySelector(".canvas-wrapper");
  const canvas = containerEl.querySelector("#scratchpad-canvas");

  if (!canvas || !wrapper) return;

  const isAppleTouchDevice = 
    /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const ctx = canvas.getContext("2d", {
    desynchronized: isAppleTouchDevice,
    alpha: true
  });

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let midX = 0;
  let midY = 0;
  let currentMode = "pen";
  let currentColor = "#1e293b";
  const baseSize = 2.5;

  let rectCache = canvas.getBoundingClientRect();

  function updateRectCache() {
    rectCache = canvas.getBoundingClientRect();
  }

  function updateTouchAction() {
    const touchAction = currentMode === "pointer" ? "pan-y" : "none";
    if (wrapper) wrapper.style.touchAction = touchAction;
    canvas.style.touchAction = touchAction;
    canvas.style.webkitUserSelect = "none";
    canvas.style.userSelect = "none";
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const width = wrapper.clientWidth || wrapper.offsetWidth || 300;
    const height = Math.max(wrapper.clientHeight || wrapper.offsetHeight || 400, wrapper.scrollHeight || 0);

    if (canvas.width === width * dpr && canvas.height === height * dpr) {
      updateRectCache();
      return;
    }

    const tempCanvas = document.createElement("canvas");
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr);
    }

    updateRectCache();
  }

  updateTouchAction();
  resizeCanvas();

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      resizeCanvas();
    });
    ro.observe(wrapper);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  function prepareContextStyle(pressure = 0.5, pointerType = "mouse") {
    let strokeWidth = baseSize;
    if (currentMode === "eraser") {
      strokeWidth = baseSize * 10;
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;

      if (pointerType === "pen" && pressure > 0) {
        strokeWidth = baseSize * (0.5 + pressure * 1.8);
      }
    }
    ctx.lineWidth = strokeWidth;
  }

  function renderPoint(x, y, pressure, pointerType) {
    prepareContextStyle(pressure, pointerType);
    ctx.beginPath();
    if (currentMode === "eraser") {
      ctx.arc(x, y, (baseSize * 10) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function startDrawing(e) {
    if (currentMode === "pointer" || !e.isPrimary) return;

    isDrawing = true;
    updateRectCache();

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {}

    const x = e.clientX - rectCache.left;
    const y = e.clientY - rectCache.top;
    const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5;

    lastX = x;
    lastY = y;
    midX = x;
    midY = y;

    renderPoint(x, y, pressure, e.pointerType);
  }

  function draw(e) {
    if (!isDrawing || currentMode === "pointer" || !e.isPrimary) return;
    if (e.cancelable) e.preventDefault();

    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    if (events.length === 0) return;

    const lastEvent = events[events.length - 1];
    const avgPressure = lastEvent.pressure !== undefined && lastEvent.pressure > 0 ? lastEvent.pressure : 0.5;

    prepareContextStyle(avgPressure, e.pointerType);

    ctx.beginPath();
    ctx.moveTo(midX, midY);

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      const px = ev.clientX - rectCache.left;
      const py = ev.clientY - rectCache.top;

      const nextMidX = (lastX + px) / 2;
      const nextMidY = (lastY + py) / 2;

      ctx.quadraticCurveTo(lastX, lastY, nextMidX, nextMidY);

      lastX = px;
      lastY = py;
      midX = nextMidX;
      midY = nextMidY;
    }

    ctx.stroke();
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

  canvas.addEventListener("pointerdown", startDrawing, { passive: false });
  canvas.addEventListener("pointermove", draw, { passive: false });
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  canvas.addEventListener("touchstart", (e) => {
    if (currentMode !== "pointer" && e.touches.length === 1) {
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  // TOOLBAR ACTION HANDLERS
  containerEl.querySelectorAll("[data-tool]").forEach(btn => {
    btn.addEventListener("click", () => {
      containerEl.querySelectorAll("[data-tool]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.getAttribute("data-tool");
      updateTouchAction();
    });
  });

  // COLOR SWATCH SELECTION HANDLER FIX
  const swatches = containerEl.querySelectorAll(".color-swatch, .sp-swatch-btn");
  
  // Set initial visual outline for the active swatch
  swatches.forEach(s => {
    if (s.classList.contains("active")) {
      s.style.outline = "2px solid #2563eb";
      s.style.outlineOffset = "1px";
      const initialColor = s.getAttribute("data-color");
      if (initialColor) currentColor = initialColor;
    }
  });

  swatches.forEach(swatch => {
    swatch.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      swatches.forEach(s => {
        s.classList.remove("active");
        s.style.outline = "none";
      });

      swatch.classList.add("active");
      swatch.style.outline = "2px solid #2563eb";
      swatch.style.outlineOffset = "1px";

      const selectedColor = swatch.getAttribute("data-color");
      if (selectedColor) currentColor = selectedColor;

      // Automatically switch back to Pen mode when selecting a color
      currentMode = "pen";
      containerEl.querySelectorAll("[data-tool]").forEach(b => {
        const isPen = b.getAttribute("data-tool") === "pen";
        b.classList.toggle("active", isPen);
      });
      updateTouchAction();
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
