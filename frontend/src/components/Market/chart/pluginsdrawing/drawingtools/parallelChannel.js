// parallelChannel.js
// Parallel channel with 3 draggable nodes (2 line ends + 1 bottom mid handle)

import { computePixels } from "./drawingHelpers.js";

/**
 * Check if mouse is near either channel line or bottom handle
 */
export const isPointNearParallelChannel = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  if (!p) return false;

  const { sx, sy, ex, ey, offset } = p;
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return false;

  const nx = -dy / len;
  const ny = dx / len;

  const sx2 = sx + nx * offset;
  const sy2 = sy + ny * offset;
  const ex2 = ex + nx * offset;
  const ey2 = ey + ny * offset;

  // mid handle position
  const mx = (sx2 + ex2) / 2;
  const my = (sy2 + ey2) / 2;

  // line equation distances
  const distMain =
    Math.abs((ey - sy) * px - (ex - sx) * py + ex * sy - ey * sx) / len;
  const distParallel =
    Math.abs((ey2 - sy2) * px - (ex2 - sx2) * py + ex2 * sy2 - ey2 * sx2) / len;

  // near main or bottom lines
  if (distMain <= tol || distParallel <= tol) return true;

  // near bottom handle
  const distHandle = Math.hypot(px - mx, py - my);
  return distHandle <= 8;
};

export const getParallelChannelHandle = (chart, series, px, py, d) => {
  const p = d._px || computePixels(chart, series, d);
  if (!p) return null;

  const { sx, sy, ex, ey, offset } = p;
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  const nx = -dy / len;
  const ny = dx / len;

  const sx2 = sx + nx * offset;
  const sy2 = sy + ny * offset;
  const ex2 = ex + nx * offset;
  const ey2 = ey + ny * offset;
  const mx = (sx2 + ex2) / 2;
  const my = (sy2 + ey2) / 2;

  // Handle hit zones (within 8 px)
  const distStart = Math.hypot(px - sx, py - sy);
  const distEnd = Math.hypot(px - ex, py - ey);
  const distMid = Math.hypot(px - mx, py - my);

  if (distStart <= 8) return "start";
  if (distEnd <= 8) return "end";
  if (distMid <= 8) return "mid";
  return null;
};

/**
 * Draw the parallel channel with dynamic gradient fill + 3 handles
 */
export const drawParallelChannel = (ctx, d, highlight = false) => {
  const p = d._px;
  if (!p) return;

  const { sx, sy, ex, ey, offset } = p;
  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  const nx = -dy / len;
  const ny = dx / len;

  const sx2 = sx + nx * offset;
  const sy2 = sy + ny * offset;
  const ex2 = ex + nx * offset;
  const ey2 = ey + ny * offset;

  const mx = (sx2 + ex2) / 2;
  const my = (sy2 + ey2) / 2;

  ctx.save();

  // ---- 💡 Dynamic gradient fill tied to d.color ----
  const baseColor = d.color || "#60a5fa";
  const gradient = ctx.createLinearGradient(sx, sy, ex2, ey2);
  gradient.addColorStop(0, `${baseColor}33`); // 20% opacity
  gradient.addColorStop(1, `${baseColor}0D`); // 5% opacity

  // Fill channel region
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.lineTo(ex2, ey2);
  ctx.lineTo(sx2, sy2);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // ---- Outline lines ----
  ctx.lineWidth = highlight ? 2 : 1.5;
  ctx.strokeStyle = highlight ? "#93c5fd" : baseColor;

  if (d.style === "dashed") ctx.setLineDash([6, 4]);
  else if (d.style === "dotted") ctx.setLineDash([2, 4]);
  else ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.moveTo(sx2, sy2);
  ctx.lineTo(ex2, ey2);
  ctx.stroke();
  ctx.setLineDash([]);

  // ---- Draw handles when selected ----
  if (highlight) {
    const handles = [
      { x: sx, y: sy },
      { x: ex, y: ey },
      { x: mx, y: my, type: "mid" },
    ];

    handles.forEach((h) => {
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.type === "mid" ? 6 : 5, 0, Math.PI * 2);
      ctx.fillStyle = h.type === "mid" ? "#fef9c3" : "#ffffff";
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1.4;
      ctx.shadowColor =
        h.type === "mid" ? "rgba(250,204,21,0.6)" : `${baseColor}80`;
      ctx.shadowBlur = h.type === "mid" ? 10 : 6;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }

  ctx.restore();
};
