// drawingHelpers.js
// Shared math & coordinate utilities for all drawing tools.

export const distanceToSegment = (px, py, sx, sy, ex, ey) => {
  const vx = ex - sx, vy = ey - sy;
  const wx = px - sx, wy = py - sy;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(px - sx, py - sy);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(px - ex, py - ey);
  const b = c1 / c2;
  const projx = sx + b * vx, projy = sy + b * vy;
  return Math.hypot(px - projx, py - projy);
};

export const computePixels = (chart, series, line) => {
  try {
    const x1 = chart.timeScale().timeToCoordinate(line.start.time);
    const y1 = series.priceToCoordinate(line.start.price);
    const x2 = chart.timeScale().timeToCoordinate(line.end.time);
    const y2 = series.priceToCoordinate(line.end.price);
    if ([x1, y1, x2, y2].every(v => v != null && Number.isFinite(v))) {
      return { sx: x1, sy: y1, ex: x2, ey: y2 };
    }
  } catch {}
  return line._px || { sx: 0, sy: 0, ex: 0, ey: 0 };
};
