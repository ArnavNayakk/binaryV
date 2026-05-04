// horizontalLine.js
// Draws a constant-price horizontal line.

import { computePixels } from "./drawingHelpers.js";

export const isPointNearHorizontalLine = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  return Math.abs(py - p.sy) <= tol; // y distance only matters
};

export const drawHorizontalLine = (ctx, d, highlight = false, width) => {
  const p = d._px;
  ctx.beginPath();
  ctx.lineWidth = highlight ? 2.6 : 1.6;
  ctx.strokeStyle = highlight ? "#93c5fd" : d.color || "#60a5fa";

  if (d.style === "dashed") ctx.setLineDash([6, 4]);
  else if (d.style === "dotted") ctx.setLineDash([2, 4]);
  else ctx.setLineDash([]);

  ctx.moveTo(0, p.sy);
  ctx.lineTo(width, p.sy);
  ctx.stroke();
  ctx.setLineDash([]);

  if (highlight) {
    ctx.fillStyle = "rgba(147,197,253,0.9)";
    ctx.beginPath();
    ctx.arc(width - 5, p.sy, 4, 0, Math.PI * 2);
    ctx.fill();
  }
};
