// trendLine.js
// Logic for drawing, highlighting, and detecting trend lines.

import { computePixels, distanceToSegment } from "./drawingHelpers.js";

export const isPointNearLine = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  return distanceToSegment(px, py, p.sx, p.sy, p.ex, p.ey) <= tol;
};

export const isPointNearEndpoint = (chart, series, px, py, d, tol = 8) => {
  const p = d._px || computePixels(chart, series, d);
  const nearStart = Math.hypot(px - p.sx, py - p.sy) <= tol;
  const nearEnd = Math.hypot(px - p.ex, py - p.ey) <= tol;
  if (nearStart) return "start";
  if (nearEnd) return "end";
  return null;
};

export const drawTrendLine = (ctx, d, highlight = false) => {
  const p = d._px;
  ctx.beginPath();
  ctx.lineWidth = highlight ? 2.6 : 1.6;
  ctx.strokeStyle = highlight ? "#93c5fd" : d.color || "#60a5fa";

  if (d.style === "dashed") ctx.setLineDash([6, 4]);
  else if (d.style === "dotted") ctx.setLineDash([2, 4]);
  else ctx.setLineDash([]);

  ctx.moveTo(p.sx, p.sy);
  ctx.lineTo(p.ex, p.ey);
  ctx.stroke();
  ctx.setLineDash([]);

  if (highlight) {
    const r = 5;
    ctx.fillStyle = "rgba(147,197,253,0.9)";
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.ex, p.ey, r, 0, Math.PI * 2);
    ctx.fill();
  }
};
