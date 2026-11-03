export function initScratchpad(containerEl) {
  const wrapper = containerEl.querySelector(".canvas-wrapper");
  const canvas = containerEl.querySelector("#scratchpad-canvas");
  const ctx = canvas.getContext("2d");

  // State controls
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentMode = "pen"; // 'pen' or 'eraser'
  let currentColor = "#1e293b"; // Default dark navy/black
  let currentSize = 2.5;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = wrapper.getBoundingClientRect();
    
    // Set actual canvas resolution with extra vertical scrollable height (2000px)
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
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);

    if (currentMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = currentSize * 6; // Make eraser broader than pen
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

  // Event Listeners for Drawing
  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", draw);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  // --- TOOLBAR CONTROLS SETUP --- //

  // Mode Toggles (Pen / Eraser)
  containerEl.querySelectorAll("[data-tool]").forEach(btn => {
    btn.addEventListener("click", () => {
      containerEl.querySelectorAll("[data-tool]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.getAttribute("data-tool");
    });
  });

  // Color Swatches
  containerEl.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
      containerEl.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      currentColor = swatch.getAttribute("data-color");
      
      // Auto-switch back to Pen mode when selecting a color
      currentMode = "pen";
      const penBtn = containerEl.querySelector("[data-tool='pen']");
      const eraserBtn = containerEl.querySelector("[data-tool='eraser']");
      if (penBtn) penBtn.classList.add("active");
      if (eraserBtn) eraserBtn.classList.remove("active");
    });
  });

  // Size Selector
  const sizeSelect = containerEl.querySelector("#scratchpad-size");
  if (sizeSelect) {
    sizeSelect.addEventListener("change", (e) => {
      currentSize = parseFloat(e.target.value);
    });
  }

  // Clear Canvas Button
  const clearBtn = containerEl.querySelector("#btn-clear-canvas");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }
}
