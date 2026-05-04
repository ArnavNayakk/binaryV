// pitchfan.js — Andrews Pitch *Fan* (5 rays from A to BC, shaded triangle)

const EPS = 1e-6;

function hexToRGBA(hex, a) {
  try {
    let h = (hex || "#ffffff").replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    return `rgba(${r},${g},${b},${a})`;
  } catch {
    return `rgba(255,255,255,${a})`;
  }
}

function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

function distPointToSeg(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const c1 = vx * wx + vy * wy;
  const c2 = vx * vx + vy * vy;
  const t  = c2 > EPS ? Math.max(0, Math.min(1, c1 / c2)) : 0;
  const sx = ax + t * vx, sy = ay + t * vy;
  return { d: Math.hypot(px - sx, py - sy), sx, sy, t };
}

function pointInTriangle(px, py, a, b, c) {
  const v0x = c.x - a.x, v0y = c.y - a.y;
  const v1x = b.x - a.x, v1y = b.y - a.y;
  const v2x = px - a.x, v2y = py - a.y;
  const dot00 = v0x*v0x + v0y*v0y;
  const dot01 = v0x*v1x + v0y*v1y;
  const dot02 = v0x*v2x + v0y*v2y;
  const dot11 = v1x*v1x + v1y*v1y;
  const dot12 = v1x*v2x + v1y*v2y;
  const denom = dot00*dot11 - dot01*dot01;
  if (Math.abs(denom) < EPS) return false;
  const u = (dot11*dot02 - dot01*dot12) / denom;
  const v = (dot00*dot12 - dot01*dot02) / denom;
  return u >= -0.001 && v >= -0.001 && (u + v) <= 1.001;
}

// ---------- compute ----------
export function computePitchfanPixels(chart, series, d) {
  d._px = d._px || {};
  const P = d.points || d._px.points || d;

  const a = { x: P.a.x, y: P.a.y };
  const b = { x: P.b.x, y: P.b.y };
  const c = { x: P.c.x, y: P.c.y };

  const targets = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    x: b.x + (c.x - b.x) * t,
    y: b.y + (c.y - b.y) * t
  }));

  d._px.a = a; d._px.b = b; d._px.c = c;
  d._px.targets = targets;
  d._px.points = { a, b, c };

  return d._px;
}

// ======== NEW: Infinite-extension ray helper with flip ========
function extendRay(ax, ay, bx, by, targetY) {
  let dx = bx - ax;
  let dy = by - ay;

  if (Math.abs(dy) < EPS) {
    const far = 5000;
    const dir = dx >= 0 ? 1 : -1;
    return { x: ax + dir * far, y: targetY };
  }

  const k = (targetY - ay) / dy;
  return { x: ax + dx * k, y: ay + dy * k };
}

// ---------- hit test ----------
export function isPointNearPitchfan(x, y, d, tol = 8) {
  if (!d?._px) return false;
  const { a, b, c, targets } = d._px;

  if (dist(x, y, a.x, a.y) <= tol) return "a";
  if (dist(x, y, b.x, b.y) <= tol) return "b";
  if (dist(x, y, c.x, c.y) <= tol) return "c";

  for (const t of targets) {
    if (distPointToSeg(x, y, a.x, a.y, t.x, t.y).d <= tol) return "ray";
  }

  if (distPointToSeg(x, y, b.x, b.y, c.x, c.y).d <= tol) return "base";

  if (pointInTriangle(x, y, a, b, c)) return "inside";

  return false;
}

// ---------- drag behavior ----------
export function applyPitchfanDrag(d, handle, dx, dy) {
  const P = d.points;

  switch (handle) {
    case "a": P.a.x += dx; P.a.y += dy; break;
    case "b": P.b.x += dx; P.b.y += dy; break;
    case "c": P.c.x += dx; P.c.y += dy; break;
    case "base":
      P.b.x += dx; P.b.y += dy;
      P.c.x += dx; P.c.y += dy;
      break;
    case "inside":
      P.a.x += dx; P.a.y += dy;
      P.b.x += dx; P.b.y += dy;
      P.c.x += dx; P.c.y += dy;
      break;
  }
}

export function drawPitchfan(ctx, d, highlight = false) {
  if (!d?._px) return;

  const { a, b, c, targets } = d._px;
  const color = d.color || "#4ade80";
  const isSelected = !!highlight;
  const H = ctx.canvas.height;

  ctx.save();
  ctx.lineCap = "round";

  // ---- FLIP LOGIC ----
  const baselineY = (b.y + c.y) / 2;
  const AisBelow = a.y > baselineY;

  // rays should go opposite of A → BC direction
  const targetY = AisBelow ? 0 : H;

  // ===== NEW: Infinite shading polygon =====
  // extend extreme rays (leftmost + rightmost)
  const leftExt  = extendRay(a.x, a.y, targets[0].x, targets[0].y, targetY);
  const rightExt = extendRay(a.x, a.y, targets[4].x, targets[4].y, targetY);

  // gradient fill for infinite wedge
  const topY = Math.min(a.y, b.y, c.y);
  const grad = ctx.createLinearGradient(0, topY, 0, targetY);
  grad.addColorStop(0,  hexToRGBA(color, 0.20));
  grad.addColorStop(1,  hexToRGBA(color, 0.05));
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(leftExt.x, leftExt.y);
  ctx.lineTo(rightExt.x, rightExt.y);
  ctx.closePath();
  ctx.fill();

  // ===== Draw original ABC triangle shading (optional) =====
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.closePath();
  ctx.fill();

  // ===== Draw infinite rays =====
  ctx.strokeStyle = color;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const ext = extendRay(a.x, a.y, t.x, t.y, targetY);

    ctx.lineWidth = (i === 2 ? (isSelected ? 3 : 2) : (isSelected ? 2 : 1.5));
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(ext.x, ext.y);
    ctx.stroke();
  }

  // base BC stays finite
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.stroke();

  // Anchor points
  if (isSelected) {
    const dot = (pt, fill="#b6ff7a", stroke="#003300") => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI*2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    };
    dot(a);
    dot(b);
    dot(c);
  }

  ctx.restore();
}


// ---------- factory ----------
export function makePitchfan(x, y, color = "#4ade80") {
  return {
    type: "pitchfan",
    color,
    fill: null,
    points: {
      a: { x,       y: y - 80 },
      b: { x: x - 70, y: y + 70 },
      c: { x: x + 70, y: y + 70 },
    },
    _px: null,
  };
}
