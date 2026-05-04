// ==========================================================
// QUOTEX-STYLE TREND ANGLE TOOL (FINAL FIX)
// ==========================================================

// helper
const dist = (a,b,c,d)=>Math.hypot(a-c,b-d);

// convert time/price → pixel
export const computeAnglePixels = (chart, candleSeries, d) => {
  if (d._px && typeof d._px.sx === "number") return d._px;

  const sx = chart.timeScale()?.timeToCoordinate(d.start?.time) ?? d.start.x;
  const sy = candleSeries.priceToCoordinate(d.start?.price) ?? d.start.y;

  const ex = chart.timeScale()?.timeToCoordinate(d.end?.time) ?? d.end.x;
  const ey = candleSeries.priceToCoordinate(d.end?.price) ?? d.end.y;

  d._px = { sx, sy, ex, ey };
  return d._px;
};

// hit detection
export function isPointNearTrendAngle(px, py, d, tol = 10) {
  if (!d?._px) return false;
  const { sx, sy, ex, ey } = d._px;

  if (dist(px,py,sx,sy) <= tol+4) return { hit: "start" };
  if (dist(px,py,ex,ey) <= tol+4) return { hit: "end" };

  const A = ex - sx;
  const B = ey - sy;
  const L2 = A*A + B*B;
  if (L2 < 0.5) return false;

  const t = ((px-sx)*A + (py-sy)*B) / L2;
  if (t < 0 || t > 1) return false;

  const projX = sx + A*t;
  const projY = sy + B*t;

  if (dist(px,py,projX,projY) <= tol) return { hit:"line" };
  return false;
}

// compute raw angle (no normalization)
function computeRawAngle(sx, sy, ex, ey) {
  const dx = ex - sx;
  const dy = ey - sy;
  const rad = Math.atan2(dy, dx);       // -180° → +180°
  const deg = Math.abs(rad * 180 / Math.PI);
  return { rad, deg };
}

// draw anchor
function drawAnchor(ctx,x,y){
  ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2);
  ctx.fillStyle="rgba(255,255,255,0.25)"; ctx.fill();

  ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
  ctx.fillStyle="#fff"; ctx.fill();
}

// rounded rectangle
function roundRect(ctx,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

// ------------------------------------------------------------
// MAIN DRAW (FINAL) — ALWAYS SHOW WEDGE, NEVER DISAPPEAR
// ------------------------------------------------------------
export function drawAngleLine(ctx, d, highlight = false) {
  if (!d?._px) return;

  const { sx, sy, ex, ey } = d._px;
  const color = d.color ?? "#2ee6ff";
  const R = 45;
  const fontSize = 13;

  ctx.save();

  // 1 — line segment
  ctx.lineWidth = highlight ? 2.4 : 1.6;
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke();

  // 2 — compute angle vs horizontal baseline (NO NORMALIZATION)
  const { rad, deg } = computeRawAngle(sx, sy, ex, ey);

  const start = 0;      // always baseline
  const end = rad;      // always real angle
  const mid = (start + end) / 2;

  // 3 — dotted wedge (never disappears)
  ctx.setLineDash([4,6]);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(sx, sy, R, start, end, end < start);
  ctx.stroke();
  ctx.setLineDash([]);

  // 3b — straight dotted bridge from END to the arc endpoint (only addition)
  {
    // Terminal point of the wedge arc on the START-centered circle at angle "end"
    const arcEndX = sx + Math.cos(end) * (R - 4);
    const arcEndY = sy + Math.sin(end) * (R - 4);

    // Draw a straight dotted connector: END → arc end (the right-side "|" in your diagram)
    const len = Math.hypot(arcEndX - ex, arcEndY - ey);
    if (len > 0.75) {
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(arcEndX, arcEndY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // If you ever want the left "|" instead, use start angle:
    // const arcStartX = sx + Math.cos(start) * (R - 4);
    // const arcStartY = sy + Math.sin(start) * (R - 4);
    // ...and connect END → (arcStartX, arcStartY)
  }

  // 4 — faint outer arc
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.setLineDash([3,9]);
  ctx.beginPath();
  ctx.arc(sx, sy, R + 15, start, end, end < start);
  ctx.stroke();
  ctx.restore();

  // 5 — anchors
  drawAnchor(ctx, sx, sy);
  drawAnchor(ctx, ex, ey);

  // 6 — degree label
  const tx = sx + Math.cos(mid) * (R+18);
  const ty = sy + Math.sin(mid) * (R+18);
  const text = `${Math.round(deg)}°`;

  ctx.font = `${fontSize}px Inter`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const pad = 6;
  const w = ctx.measureText(text).width;
  const h = fontSize + 6;

  ctx.beginPath();
  roundRect(ctx, tx - w/2 - pad, ty - h/2, w + pad*2, h, 8);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fill();

  ctx.fillStyle="#fff";
  ctx.fillText(text, tx, ty);

  ctx.restore();
}
