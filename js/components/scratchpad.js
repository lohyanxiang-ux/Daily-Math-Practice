export function initScratchpad(containerEl) {
  const wrapper = containerEl.querySelector(".canvas-wrapper");
  const canvas = containerEl.querySelector("#scratchpad-canvas");
  const ctx = canvas.getContext("2d");
  const clearBtn = containerEl.querySelector("#btn-clear-canvas");

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = wrapper.getBoundingClientRect();
    
    // Set actual canvas pixel size (Retina display sharp rendering)
    canvas.width = rect.width * dpr;
    canvas.height = Math.max(rect.height, 800) * dpr; // Extended height for scrolling
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${Math.max(rect.height, 800)}px`;

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
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
    e.preventDefault(); // Prevents iPad gesture interference

    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastX = coords.x;
    lastY = coords.y;
  }

  function stopDrawing() {
    isDrawing = false;
  }

  // Pointer & Touch Listeners for Apple Pencil
  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", draw);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}
