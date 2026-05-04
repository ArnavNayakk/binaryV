// MinimalTradeGuides.js — two independent vertical guides + Quotex-style trade markers
export function createTradeGuides(chartContainer) {
  // Root overlay container (one per chart)
  let overlayContainer = chartContainer.querySelector(".trade-guides-overlay");
  if (!overlayContainer) {
    overlayContainer = document.createElement("div");
    overlayContainer.className = "trade-guides-overlay";
    overlayContainer.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    chartContainer.appendChild(overlayContainer);
  }

  // Single canvas for both lines & markers
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  `;
  overlayContainer.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });

  // Internal state
  let startTime = null;
  let endTime = null;
  let markers = []; // [{id,startTime,endTime,direction,color,label}]
  let chartRef = null;
  let frame = null;
  let needsRedraw = false;

  function resize() {
    const rect = chartContainer.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      requestDraw();
    }
  }

  function requestDraw() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      if (!needsRedraw) return;
      needsRedraw = false;
      draw(chartRef);
    });
  }

  function drawLine(x, color, label, align = "left") {
    const h = canvas.height;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.font = "bold 13px Arial";
    ctx.textBaseline = "top";
    ctx.textAlign = align;
    ctx.fillStyle = color;
    const textX = align === "left" ? x + 8 : x - 8;
    ctx.fillText(label, textX, 10);
  }

  function draw(chart) {
    if (!chart) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ts = chart.timeScale();
    const nowSec = Math.floor(Date.now() / 1000);
    const w = canvas.width;
    const h = canvas.height;

    // Draw vertical guide lines
    if (startTime) {
      const x1 = ts.timeToCoordinate(startTime);
      if (x1 != null) drawLine(x1, "#60a5fa", "Beginning of trade >", "right");
    }
    if (endTime) {
      const x2 = ts.timeToCoordinate(endTime);
      if (x2 != null && x2 > 0 && x2 < w) {
        const remaining = Math.max(0, endTime - nowSec);
        const mins = String((remaining / 60) | 0).padStart(2, "0");
        const secs = String(remaining % 60).padStart(2, "0");
        const endText = `< End of trade ${mins}:${secs}`;
        drawLine(x2, "#60a5fa", endText, "left");
      }
    }

    // Draw Quotex-style trade markers between guides
    markers.forEach((m) => {
      const xStart = ts.timeToCoordinate(m.startTime);
      const xEnd = ts.timeToCoordinate(m.endTime);
      if (xStart == null || xEnd == null) return;
      const xMid = (xStart + xEnd) / 2;
      if (xMid < 0 || xMid > w) return;

      const barHeight = 22;
      const y = h / 2; // middle of chart
      const txt = m.label ?? (m.direction === "UP" ? "UP" : "DOWN");
      const textWidth = ctx.measureText(txt).width + 16;

      // rounded rect
      ctx.fillStyle = m.color;
      const rectX = xMid - textWidth / 2;
      const rectY = y - barHeight / 2;
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + textWidth - radius, rectY);
      ctx.quadraticCurveTo(
        rectX + textWidth,
        rectY,
        rectX + textWidth,
        rectY + radius
      );
      ctx.lineTo(rectX + textWidth, rectY + barHeight - radius);
      ctx.quadraticCurveTo(
        rectX + textWidth,
        rectY + barHeight,
        rectX + textWidth - radius,
        rectY + barHeight
      );
      ctx.lineTo(rectX + radius, rectY + barHeight);
      ctx.quadraticCurveTo(
        rectX,
        rectY + barHeight,
        rectX,
        rectY + barHeight - radius
      );
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();
      ctx.fill();

      // label text
      ctx.font = "bold 13px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(txt, xMid, y);
    });
  }

  function update(chart) {
    chartRef = chart;
    needsRedraw = true;
    requestDraw();
  }

  resize();
  const ro = new ResizeObserver(resize);
  try {
    ro.observe(chartContainer);
  } catch {
    window.addEventListener("resize", resize);
  }

  return {
    setStartTime: (t) => {
      startTime = t;
      requestDraw();
    },
    setEndTime: (t) => {
      endTime = t;
      requestDraw();
    },
    setTimes: (s, e) => {
      startTime = s;
      endTime = e;
      requestDraw();
    },
    setMarkers: (m) => {
      markers = Array.isArray(m) ? m : [];
      requestDraw();
    },
    update,
    destroy: () => {
      if (frame) cancelAnimationFrame(frame);
      try {
        ro.disconnect();
      } catch {
        window.removeEventListener("resize", resize);
      }
      if (overlayContainer && chartContainer.contains(overlayContainer)) {
        chartContainer.removeChild(overlayContainer);
      }
    },
  };
}
