// triangle.js
// Full interactive 3-point triangle: selectable, draggable, resizable

import { computePixels } from "./drawingHelpers.js";

// --- Hit testing ---
export const isPointNearTriangle = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  if (!p?.points?.length) return false;
  const pts = p.points;

  const nearEdge = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return false;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    const projX = x1 + t * dx, projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY) < tol;
  };

  // Check edge proximity
  const [a, b, c] = pts;
  if (
    nearEdge(a.x, a.y, b.x, b.y) ||
    nearEdge(b.x, b.y, c.x, c.y) ||
    nearEdge(c.x, c.y, a.x, a.y)
  ) return true;

  // Check inside shape (for dragging)
  const area = (x1, y1, x2, y2, x3, y3) =>
    Math.abs((x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2);
  const A = area(a.x,a.y,b.x,b.y,c.x,c.y);
  const A1 = area(px,py,b.x,b.y,c.x,c.y);
  const A2 = area(a.x,a.y,px,py,c.x,c.y);
  const A3 = area(a.x,a.y,b.x,b.y,px,py);
  return Math.abs(A - (A1 + A2 + A3)) < 2;
};

export const getTriangleCorner = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  if (!p?.points?.length) return null;
  const pts = p.points;
  for (let i = 0; i < pts.length; i++) {
    if (Math.hypot(px - pts[i].x, py - pts[i].y) < tol + 3) return i; // return corner index
  }
  return null;
};

// --- Drawing ---
export const drawTriangle = (ctx, d, highlight = false) => {
  const p = d._px;
  if (!p?.points || p.points.length < 3) return;
  const [a, b, c] = p.points;

  const color = d.color || "#60a5fa";

  // Create a smooth gradient fill based on triangle area
  const minX = Math.min(a.x, b.x, c.x);
  const maxX = Math.max(a.x, b.x, c.x);
  const minY = Math.min(a.y, b.y, c.y);
  const maxY = Math.max(a.y, b.y, c.y);

  const gradient = ctx.createLinearGradient(minX, minY, maxX, maxY);
  gradient.addColorStop(0, `${color}33`); // 20% opacity
  gradient.addColorStop(1, `${color}0D`); // 5% opacity

  // Draw triangle
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.closePath();

  ctx.fillStyle = gradient; // 🩵 Dynamic fill color
  ctx.strokeStyle = highlight ? "#93c5fd" : color;
  ctx.lineWidth = highlight ? 2 : 1.5;

  ctx.fill();
  ctx.stroke();

  // Draw highlight points (anchors)
  if (highlight) {
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = color;
    ctx.fillStyle = "#fff";
    for (const pt of [a, b, c]) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
};
