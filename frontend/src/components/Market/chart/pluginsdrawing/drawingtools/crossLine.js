// crossLine.js
// Draws a Cross Line (horizontal + vertical intersection lines)

import { computePixels } from "./drawingHelpers.js";

/**
 * Check proximity for selection / hover
 */
export const isPointNearCrossLine = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  const distX = Math.abs(px - p.sx);
  const distY = Math.abs(py - p.sy);
  return distX < tol || distY < tol; // near either vertical or horizontal line
};

/**
 * Draw Cross Line
 */
export const drawCrossLine = (ctx, d, highlight = false, canvasWidth, canvasHeight) => {
  const p = d._px;
  if (!p) return;

  ctx.lineWidth = highlight ? 2.2 : 1.2;
  ctx.strokeStyle = highlight ? "#93c5fd" : d.color || "#60a5fa";

  if (d.style === "dashed") ctx.setLineDash([6, 4]);
  else if (d.style === "dotted") ctx.setLineDash([2, 4]);
  else ctx.setLineDash([]);

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(0, p.sy);
  ctx.lineTo(canvasWidth, p.sy);
  ctx.stroke();

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(p.sx, 0);
  ctx.lineTo(p.sx, canvasHeight);
  ctx.stroke();

  // Intersection point
  ctx.beginPath();
  ctx.arc(p.sx, p.sy, highlight ? 4 : 3, 0, Math.PI * 2);
  ctx.fillStyle = highlight ? "#fff" : d.color || "#60a5fa";
  ctx.fill();
  ctx.setLineDash([]);
};
