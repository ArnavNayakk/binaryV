// arcLine.js
// Draws a smooth Quadratic Arc (start → mid → end) with transparent gradient fill (Quotex style)

import { computePixels } from "./drawingHelpers.js";

/**
 * Check proximity for selection / hover
 */
export const isPointNearArc = (chart, series, px, py, d, tol = 6) => {
  const p = d._px || computePixels(chart, series, d);
  if (!p?.points || p.points.length < 3) return false;

  const [start, mid, end] = p.points;

  // detect near anchors (start, mid, end)
  const anchors = [start, mid, end];
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    const dx = px - a.x;
    const dy = py - a.y;
    if (Math.hypot(dx, dy) <= tol + 3) return { type: "anchor", index: i };
  }

  // detect near curve (sampled path)
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
    const dist = Math.hypot(px - xOn, py - yOn);
    if (dist < tol) return { type: "curve" };
  }

  return false;
};

/**
 * Draw Arc Line (Quadratic Bezier) + dynamic gradient fill
 */
export const drawArcLine = (ctx, d, highlight = false) => {
  const p = d._px;
  if (!p?.points || p.points.length < 3) return;

  const [start, mid, end] = p.points;
  const baseColor = d.color || "#60a5fa";

  // --- 💡 Dynamic gradient fill (tied to line color) ---
  const minX = Math.min(start.x, mid.x, end.x);
  const maxX = Math.max(start.x, mid.x, end.x);
  const minY = Math.min(start.y, mid.y, end.y);
  const maxY = Math.max(start.y, mid.y, end.y);

  const gradient = ctx.createLinearGradient(minX, minY, maxX, maxY);
  gradient.addColorStop(0, `${baseColor}33`); // 20% opacity
  gradient.addColorStop(1, `${baseColor}0D`); // 5% opacity

  // --- 1️⃣ Fill the area under the curve (Quotex style) ---
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.quadraticCurveTo(mid.x, mid.y, end.x, end.y);
  ctx.lineTo(end.x, start.y + (end.y - start.y)); // baseline
  ctx.lineTo(start.x, start.y + (end.y - start.y));
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // --- 2️⃣ Draw the curve line on top ---
  const strokeColor = highlight ? "#93c5fd" : baseColor;
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

  // --- 3️⃣ Draw anchor points (same as before) ---
  if (highlight) {
    const anchors = [
      start,
      {
        x: (start.x + 2 * mid.x + end.x) / 4,
        y: (start.y + 2 * mid.y + end.y) / 4,
      },
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
 * Compute Arc pixels
 */
export const computeArcPixels = (chart, series, d) => {
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
