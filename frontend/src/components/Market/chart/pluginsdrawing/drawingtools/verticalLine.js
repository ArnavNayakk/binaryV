// verticalLine.js
// Draws a vertical time marker line.

import { computePixels } from "./drawingHelpers.js";

export const isPointNearVerticalLine = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  return Math.abs(px - p.sx) <= tol; // Only X distance matters
};

export const drawVerticalLine = (ctx, d, highlight = false, height) => {
  const p = d._px;
  ctx.beginPath();
  ctx.lineWidth = highlight ? 2.6 : 1.6;
  ctx.strokeStyle = highlight ? "#93c5fd" : d.color || "#60a5fa";

  if (d.style === "dashed") ctx.setLineDash([6, 4]);
  else if (d.style === "dotted") ctx.setLineDash([2, 4]);
  else ctx.setLineDash([]);

  ctx.moveTo(p.sx, 0);
  ctx.lineTo(p.sx, height);
  ctx.stroke();
  ctx.setLineDash([]);

  if (highlight) {
    ctx.fillStyle = "rgba(147,197,253,0.9)";
    ctx.beginPath();
    ctx.arc(p.sx, height - 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }
};
