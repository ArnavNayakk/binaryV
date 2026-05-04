export default function initDrawingTools(chart, container, candleSeries) {
  if (!chart || !container || !candleSeries) return null;

  const drawings = [];
  let drawingMode = null;
  let startPoint = null;
  let tempEnd = null;
  let selectedLineIndex = null;
  let dragging = false;
  let dragLast = null;
  let resizing = null;

  let defaultColor = "#60a5fa";
  let defaultStyle = "solid";

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 50,
    pointerEvents: "none",
    transition: "z-index 0.1s ease",
  });
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const getMousePosRelToContainer = (clientX, clientY) => {
    const r = container.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const computePixels = (line) => {
    try {
      const x1 = chart.timeScale().timeToCoordinate(line.start.time);
      const y1 = candleSeries.priceToCoordinate(line.start.price);
      const x2 = chart.timeScale().timeToCoordinate(line.end.time);
      const y2 = candleSeries.priceToCoordinate(line.end.price);
      if ([x1, y1, x2, y2].every((v) => v != null && Number.isFinite(v))) {
        return { sx: x1, sy: y1, ex: x2, ey: y2 };
      }
    } catch {}
    return line._px || { sx: 0, sy: 0, ex: 0, ey: 0 };
  };

  const updateAllPixels = () => {
    for (const d of drawings) d._px = computePixels(d);
  };

  const distanceToSegment = (px, py, sx, sy, ex, ey) => {
    const vx = ex - sx, vy = ey - sy;
    const wx = px - sx, wy = py - sy;
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(px - sx, py - sy);
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(px - ex, py - ey);
    const b = c1 / c2;
    const projx = sx + b * vx, projy = sy + b * vy;
    return Math.hypot(px - projx, py - projy);
  };

  const isPointNearLine = (px, py, d, tol = 6) => {
    const p = d._px || computePixels(d);
    return distanceToSegment(px, py, p.sx, p.sy, p.ex, p.ey) <= tol;
  };

  const isPointNearEndpoint = (px, py, d, tol = 8) => {
    const p = d._px || computePixels(d);
    const nearStart = Math.hypot(px - p.sx, py - p.sy) <= tol;
    const nearEnd = Math.hypot(px - p.ex, py - p.ey) <= tol;
    if (nearStart) return "start";
    if (nearEnd) return "end";
    return null;
  };

  const drawLinePixels = (sx, sy, ex, ey, color, style, highlight = false) => {
    ctx.beginPath();
    ctx.lineWidth = highlight ? 2.6 : 1.6;
    ctx.strokeStyle = highlight ? "#93c5fd" : color;
    if (style === "dashed") ctx.setLineDash([6, 4]);
    else if (style === "dotted") ctx.setLineDash([2, 4]);
    else ctx.setLineDash([]);
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawHandles = (p) => {
    const handleRadius = 5;
    ctx.fillStyle = "rgba(147, 197, 253, 0.9)";
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, handleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.ex, p.ey, handleRadius, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLine = (d, highlight = false) => {
    const p = d._px || computePixels(d);
    drawLinePixels(p.sx, p.sy, p.ex, p.ey, d.color || "#60a5fa", d.style || "solid", highlight);
    if (highlight) drawHandles(p);
  };

  const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateAllPixels();
    drawings.forEach((d, i) => drawLine(d, i === selectedLineIndex));
    if (drawingMode && startPoint && tempEnd) {
      const s = startPoint._px || { sx: startPoint.x, sy: startPoint.y };
      const t = tempEnd._px || { ex: tempEnd.x, ey: tempEnd.y };
      drawLinePixels(s.sx, s.sy, t.ex ?? tempEnd.x, t.ey ?? tempEnd.y, "rgba(96,165,250,0.6)", "solid");
    }
  };

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    const { clientWidth, clientHeight } = container;
    canvas.width = Math.max(1, Math.floor(clientWidth * ratio));
    canvas.height = Math.max(1, Math.floor(clientHeight * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    redraw();
  };
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(resizeCanvas);

  // ----- Interaction Logic -----
  let lastProximityState = false;
  const refreshPointerCapture = (clientX, clientY) => {
    const { x, y } = getMousePosRelToContainer(clientX, clientY);
    updateAllPixels();
    let near = false;
    if (drawingMode || dragging || resizing) near = true;
    else {
      for (let i = drawings.length - 1; i >= 0; i--) {
        if (isPointNearLine(x, y, drawings[i]) || isPointNearEndpoint(x, y, drawings[i])) {
          near = true;
          break;
        }
      }
    }

    // 🩵 FIX: lift canvas above indicator panes dynamically when near drawings
    if (near) {
      canvas.style.zIndex = 999;
      canvas.style.pointerEvents = "auto";
    } else {
      canvas.style.zIndex = 50;
      canvas.style.pointerEvents = drawingMode ? "auto" : "none";
    }

    if (drawingMode) canvas.style.cursor = "crosshair";
    else if (dragging) canvas.style.cursor = "grabbing";
    else if (resizing) canvas.style.cursor = "nwse-resize";
    else canvas.style.cursor = near ? "pointer" : "default";
  };
  // 🩵 END FIX

  const onContainerMouseMove = (e) => {
    try { refreshPointerCapture(e.clientX, e.clientY); } catch {}
  };
  container.addEventListener("mousemove", onContainerMouseMove);

  const handleDown = (clientX, clientY, originalEvent) => {
    const { x, y } = getMousePosRelToContainer(clientX, clientY);
    if (originalEvent && originalEvent.button !== undefined && originalEvent.button !== 0) return;

    if (drawingMode) {
      const time = chart.timeScale().coordinateToTime(x);
      const price = candleSeries.coordinateToPrice(y);
      startPoint = { x, y, time, price, _px: { sx: x, sy: y } };
      tempEnd = null;
      canvas.style.pointerEvents = "auto";
      canvas.style.cursor = "crosshair";
      redraw();
      return;
    }

    updateAllPixels();
    selectedLineIndex = null;
    resizing = null;

    for (let i = drawings.length - 1; i >= 0; i--) {
      const resizeSide = isPointNearEndpoint(x, y, drawings[i]);
      if (resizeSide) {
        selectedLineIndex = i;
        resizing = resizeSide;
        canvas.style.cursor = "nwse-resize";
        redraw();
        return;
      }
      if (isPointNearLine(x, y, drawings[i])) {
        selectedLineIndex = i;
        dragging = true;
        dragLast = { x, y };
        canvas.style.cursor = "grabbing";
        redraw();
        return;
      }
    }
    redraw();
  };

  const handleMove = (clientX, clientY) => {
    const { x, y } = getMousePosRelToContainer(clientX, clientY);
    if (dragging && selectedLineIndex !== null) {
      const dx = x - dragLast.x;
      const dy = y - dragLast.y;
      const d = drawings[selectedLineIndex];
      d._px.sx += dx;
      d._px.sy += dy;
      d._px.ex += dx;
      d._px.ey += dy;
      dragLast = { x, y };
      redraw();
      return;
    }

    if (resizing && selectedLineIndex !== null) {
      const d = drawings[selectedLineIndex];
      if (resizing === "start") {
        d._px.sx = x;
        d._px.sy = y;
      } else {
        d._px.ex = x;
        d._px.ey = y;
      }
      redraw();
      return;
    }

    if (drawingMode && startPoint) {
      const time = chart.timeScale().coordinateToTime(x);
      const price = candleSeries.coordinateToPrice(y);
      tempEnd = { x, y, time, price, _px: { ex: x, ey: y } };
      redraw();
    }
  };

  const handleUp = (clientX, clientY) => {
    if (dragging) {
      dragging = false;
      dragLast = null;
    }
    if (resizing) {
      const d = drawings[selectedLineIndex];
      try {
        const newT1 = chart.timeScale().coordinateToTime(d._px.sx);
        const newT2 = chart.timeScale().coordinateToTime(d._px.ex);
        const newP1 = candleSeries.coordinateToPrice(d._px.sy);
        const newP2 = candleSeries.coordinateToPrice(d._px.ey);
        if (newT1 && newT2 && Number.isFinite(newP1) && Number.isFinite(newP2)) {
          d.start = { ...d.start, time: newT1, price: newP1 };
          d.end = { ...d.end, time: newT2, price: newP2 };
        }
      } catch {}
      resizing = null;
      redraw();
      return;
    }

    if (!drawingMode || !startPoint) return;
    const { x, y } = getMousePosRelToContainer(clientX, clientY);
    const time = chart.timeScale().coordinateToTime(x);
    const price = candleSeries.coordinateToPrice(y);
    tempEnd = { x, y, time, price, _px: { ex: x, ey: y } };
    drawings.push({
      start: { ...startPoint },
      end: { ...tempEnd },
      color: defaultColor,
      style: defaultStyle,
      _px: { sx: startPoint.x, sy: startPoint.y, ex: tempEnd.x, ey: tempEnd.y },
    });
    startPoint = null;
    tempEnd = null;
    redraw();
  };

  container.addEventListener("mousedown", (e) => handleDown(e.clientX, e.clientY, e));
  container.addEventListener("mousemove", (e) => {
    handleMove(e.clientX, e.clientY);
    refreshPointerCapture(e.clientX, e.clientY);
  });
  window.addEventListener("mouseup", (e) => handleUp(e.clientX, e.clientY));

  const onContextMenu = (e) => {
    e.preventDefault();
    const { x, y } = getMousePosRelToContainer(e.clientX, e.clientY);
    updateAllPixels();
    if (selectedLineIndex !== null) {
      drawings.splice(selectedLineIndex, 1);
      selectedLineIndex = null;
      redraw();
      return;
    }
    for (let i = drawings.length - 1; i >= 0; i--) {
      if (isPointNearLine(x, y, drawings[i])) {
        drawings.splice(i, 1);
        selectedLineIndex = null;
        redraw();
        return;
      }
    }
  };

  const onKeyDown = (e) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedLineIndex !== null) {
      drawings.splice(selectedLineIndex, 1);
      selectedLineIndex = null;
      redraw();
    }
  };

  chart.timeScale().subscribeVisibleTimeRangeChange(() => requestAnimationFrame(redraw));
  chart.timeScale().subscribeVisibleLogicalRangeChange?.(() => requestAnimationFrame(redraw));

  container.addEventListener("contextmenu", onContextMenu);
  window.addEventListener("keydown", onKeyDown);

  return {
    setMode: (mode) => {
      const active = !!mode;
      drawingMode = active ? mode : null;
      canvas.style.pointerEvents = active ? "auto" : "none";
      canvas.style.cursor = active ? "crosshair" : "default";
      if (!active) {
        startPoint = null;
        tempEnd = null;
        dragging = false;
        resizing = null;
        dragLast = null;
      }
      redraw();
    },
    setStyleOptions: ({ color, style }) => {
      if (color) defaultColor = color;
      if (style) defaultStyle = style;
      if (selectedLineIndex !== null && drawings[selectedLineIndex]) {
        const d = drawings[selectedLineIndex];
        if (color) d.color = color;
        if (style) d.style = style;
        redraw();
      }
    },
    clear: () => {
      drawings.length = 0;
      selectedLineIndex = null;
      redraw();
    },
    export: () =>
      drawings.map((d) => ({
        start: { time: d.start.time, price: d.start.price },
        end: { time: d.end.time, price: d.end.price },
        color: d.color,
        style: d.style,
      })),
    load: (arr) => {
      drawings.length = 0;
      for (const item of arr || []) {
        if (item?.start && item?.end) {
          drawings.push({
            start: { ...item.start },
            end: { ...item.end },
            color: item.color || defaultColor,
            style: item.style || defaultStyle,
            _px: null,
          });
        }
      }
      redraw();
    },
    destroy: () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("keydown", onKeyDown);
      chart.timeScale().unsubscribeVisibleTimeRangeChange?.(redraw);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange?.(redraw);
      container.removeEventListener("mousemove", onContainerMouseMove);
      container.removeEventListener("contextmenu", onContextMenu);
      try { canvas.remove(); } catch {}
    },
  };
}
