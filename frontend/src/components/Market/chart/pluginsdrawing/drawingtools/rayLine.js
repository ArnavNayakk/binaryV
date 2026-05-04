// rayLine.js
// Improved Ray line with proper hit detection + dual anchors like Quotex

import { computePixels } from "./drawingHelpers.js";

/**
 * Hit test for ray line — detects clicks near its visible projection.
 */
export const isPointNearRayLine = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  const dx = p.ex - p.sx;
  const dy = p.ey - p.sy;

  if (dx === 0 && dy === 0) return false;

  // Equation of line (y = mx + c)
  const m = dy / dx;
  const c = p.sy - m * p.sx;

  // perpendicular distance of mouse to infinite line
  const dist = Math.abs(py - (m * px + c)) / Math.sqrt(1 + m * m);

  // project point on ray vector (so we ignore clicks "behind" start)
  const u = ((px - p.sx) * dx + (py - p.sy) * dy) / (dx * dx + dy * dy);
  if (u < 0) return false; // behind the start, ignore

  // limit to current visible canvas region
  const canvas = chart.chartElement?.querySelector("canvas") || chart;
  const width = canvas?.width || 5000;
  return dist <= tol && px >= 0 && px <= width + 10;
};

/**
 * Draws a Ray Line and (when selected) its draggable endpoints.
 */
export const drawRayLine = (ctx, d, highlight = false, canvasWidth) => {
  const p = d._px;
  if (!p) return;

  const dx = p.ex - p.sx;
  const dy = p.ey - p.sy;
  if (dx === 0 && dy === 0) return;

  // extend ray to the right edge of the canvas
  const m = dy / dx;
  const b = p.sy - m * p.sx;
  const x2 = canvasWidth;
  const y2 = m * x2 + b;

  // draw ray
  ctx.save();
  ctx.lineWidth = highlight ? 2.2 : 1.5;
  ctx.strokeStyle = highlight ? "#93c5fd" : d.color || "#60a5fa";

  if (d.style === "dashed") ctx.setLineDash([6, 4]);
  else if (d.style === "dotted") ctx.setLineDash([2, 4]);
  else ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(p.sx, p.sy);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  // draw anchor points (Quotex style)
  if (highlight) {
    const anchors = [
      { x: p.sx, y: p.sy },
      { x: x2, y: y2 }
    ];
    anchors.forEach((a) => {
      ctx.beginPath();
      ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = d.color || "#60a5fa";
      ctx.lineWidth = 1.4;
      ctx.shadowColor = "rgba(96,165,250,0.8)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }

  ctx.restore();
};
