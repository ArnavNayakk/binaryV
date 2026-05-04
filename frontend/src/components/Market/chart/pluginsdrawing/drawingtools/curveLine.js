// curveLine.js
// Quadratic Bezier curve — behaves exactly like arcLine but without fill.

import { computePixels } from "./drawingHelpers.js";

/**
 * Detect if mouse is near the curve or anchors
 */
export const isPointNearCurve = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  if (!p?.points || p.points.length < 3) return false;

  const [start, mid, end] = p.points;

  // near anchor detection
  const anchors = [start, mid, end];
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    const dx = px - a.x;
    const dy = py - a.y;
    if (Math.hypot(dx, dy) <= tol + 3) return { type: "anchor", index: i };
  }

  // near curve line
  const steps = 80;
  for (let t = 0; t <= 1; t += 1 / steps) {
    const xOn =
      (1 - t) ** 2 * start.x +
      2 * (1 - t) * t * mid.x +
      t ** 2 * end.x;
    const yOn =
      (1 - t) ** 2 * start.y +
      2 * (1 - t) * t * mid.y +
      t ** 2 * end.y;
    if (Math.hypot(px - xOn, py - yOn) < tol) return { type: "curve" };
  }

  return false;
};

/**
 * Draw the curve line (no fill, just stroke + anchors)
 */
export const drawCurveLine = (ctx, d, highlight = false) => {
  const p = d._px;
  if (!p?.points || p.points.length < 3) return;

  const [start, mid, end] = p.points;
  const strokeColor = highlight ? "#93c5fd" : d.color || "#60a5fa";

  ctx.lineWidth = highlight ? 2.2 : 1.6;
  ctx.strokeStyle = strokeColor;
  ctx.setLineDash(
    d.style === "dashed"
      ? [6, 4]
      : d.style === "dotted"
      ? [2, 4]
      : []
  );

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.quadraticCurveTo(mid.x, mid.y, end.x, end.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw anchor dots if highlighted
  if (highlight) {
    const anchors = [
      start,
      { x: (start.x + 2 * mid.x + end.x) / 4, y: (start.y + 2 * mid.y + end.y) / 4 },
      end,
    ];
    anchors.forEach((a) => {
      ctx.beginPath();
      ctx.arc(a.x, a.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
    });
  }
};

/**
 * Compute curve control pixels
 */
export const computeCurvePixels = (chart, series, d) => {
  const sp = d.start;
  const mp = d.mid;
  const ep = d.end;

  return {
    points: [
      {
        x: chart.timeScale().timeToCoordinate(sp.time),
        y: series.priceToCoordinate(sp.price),
      },
      {
        x: chart.timeScale().timeToCoordinate(mp.time),
        y: series.priceToCoordinate(mp.price),
      },
      {
        x: chart.timeScale().timeToCoordinate(ep.time),
        y: series.priceToCoordinate(ep.price),
      },
    ],
  };
};
