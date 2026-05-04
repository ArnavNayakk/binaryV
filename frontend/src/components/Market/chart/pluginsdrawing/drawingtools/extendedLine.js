// extendedLine.js
// Draws an Extended Line (infinite both directions)

import { computePixels } from "./drawingHelpers.js";

/**
 * Check proximity for selection / hover
 */
export const isPointNearExtendedLine = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  const dx = p.ex - p.sx;
  const dy = p.ey - p.sy;
  if (dx === 0 && dy === 0) return false;

  // Equation y = mx + c
  const m = dy / dx;
  const c = p.sy - m * p.sx;

  // distance from point to line
  const dist = Math.abs(py - (m * px + c)) / Math.sqrt(1 + m * m);

  // Within canvas bounds
  const canvas = chart.chartElement?.querySelector("canvas") || chart;
  const w = canvas?.width || 2000;
  const h = canvas?.height || 1000;
  return dist <= tol && px >= 0 && px <= w && py >= 0 && py <= h;
};

/**
 * Draw Extended Line
 */
export const drawExtendedLine = (ctx, d, highlight = false, canvasWidth) => {
  const p = d._px;
  if (!p) return;

  const dx = p.ex - p.sx;
  const dy = p.ey - p.sy;
  if (dx === 0 && dy === 0) return;

  // line equation
  const m = dy / dx;
  const b = p.sy - m * p.sx;

  // Extend to both sides of canvas
  const x1 = 0;
  const y1 = m * x1 + b;
  const x2 = canvasWidth;
  const y2 = m * x2 + b;

  ctx.lineWidth = highlight ? 2.2 : 1.5;
  ctx.strokeStyle = highlight ? "#93c5fd" : d.color || "#60a5fa";

  if (d.style === "dashed") ctx.setLineDash([6, 4]);
  else if (d.style === "dotted") ctx.setLineDash([2, 4]);
  else ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw endpoints if selected
  if (highlight) {
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
    ctx.arc(p.ex, p.ey, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = d.color || "#60a5fa";
    ctx.lineWidth = 1.2;
    ctx.fill();
    ctx.stroke();
  }
};
