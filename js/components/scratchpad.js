export function initScratchpad(containerEl) {
  const wrapper = containerEl.querySelector(".canvas-wrapper");
  const canvas = containerEl.querySelector("#scratchpad-canvas");

  if (!canvas || !wrapper) return;

  // Ultra low-latency 2D context configuration
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

  // Cached bounding rect to prevent DOM reflows during drawing
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
    
    // Dynamic sizing strictly matching the actual wrapper height (eliminates huge overdraw)
    const width = wrapper.clientWidth || wrapper.offsetWidth || 300;
    const height = Math.max(wrapper.clientHeight || wrapper.offsetHeight || 400, wrapper.scrollHeight || 0);

    if (canvas.width === width * dpr && canvas.height === height * dpr) {
      updateRectCache();
      return;
    }

    // Preserve existing stroke data across window/container resize
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

  // ResizeObserver automatically keeps canvas sized to wrapper without layout lag
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      resizeCanvas();
    });
    ro.observe(wrapper);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  // Set context styling once per frame batch (removes string-parsing overhead)
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

    // Extract hardware coalesced events (120Hz-240Hz Apple Pencil sampling)
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    if (events.length === 0) return;

    const lastEvent = events[events.length - 1];
    const avgPressure = lastEvent.pressure !== undefined && lastEvent.pressure > 0 ? lastEvent.pressure : 0.5;

    // Prepare style ONCE for the frame burst
    prepareContextStyle(avgPressure, e.pointerType);

    // BATCH ALL COALESCED POINTS INTO A SINGLE PATH (cuts GPU draw-call lag by ~90%)
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

    // SINGLE STROKE CALL FOR THE ENTIRE EVENT BURST
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

  // Register listeners with { passive: false } for immediate iOS touch dispatch
  canvas.addEventListener("pointerdown", startDrawing, { passive: false });
  canvas.addEventListener("pointermove", draw, { passive: false });
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  // Prevent Safari gesture intervention during active drawing
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
