// rectangle.js
import { computePixels } from "./drawingHelpers.js";

// Detects which part of the rectangle was clicked
export const getRectangleHitZone = (chart, series, px, py, d, tol = 8) => {
  const p = d._px || computePixels(chart, series, d);
  const left = Math.min(p.sx, p.ex);
  const right = Math.max(p.sx, p.ex);
  const top = Math.min(p.sy, p.ey);
  const bottom = Math.max(p.sy, p.ey);

  const inside = px > left && px < right && py > top && py < bottom;
  const nearLeft = Math.abs(px - left) <= tol;
  const nearRight = Math.abs(px - right) <= tol;
  const nearTop = Math.abs(py - top) <= tol;
  const nearBottom = Math.abs(py - bottom) <= tol;

  const nearTL = nearLeft && nearTop;
  const nearTR = nearRight && nearTop;
  const nearBL = nearLeft && nearBottom;
  const nearBR = nearRight && nearBottom;

  if (nearTL) return "tl";
  if (nearTR) return "tr";
  if (nearBL) return "bl";
  if (nearBR) return "br";
  if (inside) return "inside";
  return null;
};

export const isPointNearRectangle = (chart, series, px, py, d) => {
  return !!getRectangleHitZone(chart, series, px, py, d);
};

/**
 * Draw rectangle with dynamic gradient fill that follows d.color
 */
export const drawRectangle = (ctx, d, highlight = false) => {
  const p = d._px;
  if (!p) return;

  const x = Math.min(p.sx, p.ex);
  const y = Math.min(p.sy, p.ey);
  const w = Math.abs(p.ex - p.sx);
  const h = Math.abs(p.ey - p.sy);

  const color = d.color || "#60a5fa";
  ctx.lineWidth = highlight ? 2.4 : 1.6;
  ctx.strokeStyle = highlight ? "#93c5fd" : color;

  // ---- 💡 Dynamic gradient fill using d.color ----
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
  gradient.addColorStop(0, `${color}33`); // 20% opacity
  gradient.addColorStop(1, `${color}0D`); // 5% opacity
  ctx.fillStyle = gradient;

  // ---- Line style (solid / dashed / dotted) ----
  if (d.style === "dashed") ctx.setLineDash([6, 4]);
  else if (d.style === "dotted") ctx.setLineDash([2, 4]);
  else ctx.setLineDash([]);

  // ---- Draw filled rectangle ----
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- Corner anchor dots when selected ----
  if (highlight) {
    const r = 5;
    const corners = [
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h],
    ];
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
    }
  }
};
