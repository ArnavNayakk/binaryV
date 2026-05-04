// disjointChannel.js — Quotex-style Disjoint Channel (top+bottom lines, shaded, side-linked, crossing allowed)

const EPS = 1e-6;

// ---------- helpers ----------
function hexToRGBA(hex, a) {
  try {
    let h = (hex || "#ffffff").replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  } catch {
    return `rgba(255,255,255,${a})`;
  }
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

// simple point-in-quad
function pointInQuad(x, y, q) {
  const areaTri = (x1, y1, x2, y2, x3, y3) =>
    Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);

  const [p1, p2, p3, p4] = q;
  const full = areaTri(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y) +
               areaTri(p1.x, p1.y, p3.x, p3.y, p4.x, p4.y);

  const a1 = areaTri(x, y, p1.x, p1.y, p2.x, p2.y);
  const a2 = areaTri(x, y, p2.x, p2.y, p3.x, p3.y);
  const a3 = areaTri(x, y, p3.x, p3.y, p4.x, p4.y);
  const a4 = areaTri(x, y, p4.x, p4.y, p1.x, p1.y);

  return Math.abs((a1 + a2 + a3 + a4) - full) < 1.2;
}

// ---------- compute ----------
export function computeDisjointPixels(chart, series, d) {
  d._px = d._px || {};
  const P = d.points;

  const tl = { x: P.tl.x, y: P.tl.y };
  const tr = { x: P.tr.x, y: P.tr.y };
  const bl = { x: P.bl.x, y: P.bl.y };
  const br = { x: P.br.x, y: P.br.y };

  // ⛔ NO AUTO-FLIP — crossing allowed
  d._px.tl = tl;
  d._px.tr = tr;
  d._px.bl = bl;
  d._px.br = br;

  d._px.points = { tl, tr, bl, br };
  return d._px;
}

// ---------- hit test ----------
export function getDisjointHandle(x, y, d, tol = 8) {
  if (!d?._px) return null;
  const { tl, tr, bl, br } = d._px;

  // corners
  if (dist(x, y, tl.x, tl.y) <= tol) return "tl";
  if (dist(x, y, tr.x, tr.y) <= tol) return "tr";
  if (dist(x, y, bl.x, bl.y) <= tol) return "bl";
  if (dist(x, y, br.x, br.y) <= tol) return "br";

  // line segments
  const nearSeg = (ax, ay, bx, by) => {
    const vx = bx - ax, vy = by - ay;
    const wx = x - ax, wy = y - ay;
    const c1 = vx * wx + vy * wy;
    const c2 = vx * vx + vy * vy;
    const t = c2 > EPS ? Math.max(0, Math.min(1, c1 / c2)) : 0;
    const px = ax + t * vx, py = ay + t * vy;
    return Math.hypot(x - px, y - py) <= tol;
  };

  if (nearSeg(tl.x, tl.y, tr.x, tr.y)) return "top";
  if (nearSeg(bl.x, bl.y, br.x, br.y)) return "bottom";

  // inside quad
  if (pointInQuad(x, y, [tl, tr, br, bl])) return "inside";

  return null;
}

// ---------- drag updater (CROSSING ENABLED) ----------
export function applyDisjointDrag(d, handle, dx, dy) {
  const P = d.points;

  switch (handle) {
    case "tr":
      P.tr.x += dx; P.tr.y += dy;
      P.br.x += dx; P.br.y -= dy;
      break;

    case "br":
      P.br.x += dx; P.br.y += dy;
      P.tr.x += dx; P.tr.y -= dy;
      break;

    case "tl":
      P.tl.x += dx; P.tl.y += dy;
      P.bl.x += dx; P.bl.y -= dy;
      break;

    case "bl":
      P.bl.x += dx; P.bl.y += dy;
      P.tl.x += dx; P.tl.y -= dy;
      break;

    case "top":
      P.tl.x += dx; P.tr.x += dx;
      P.tl.y += dy; P.tr.y += dy;
      P.bl.y -= dy; P.br.y -= dy;
      break;

    case "bottom":
      P.bl.x += dx; P.br.x += dx;
      P.bl.y += dy; P.br.y += dy;
      P.tl.y -= dy; P.tr.y -= dy;
      break;

    case "inside":
      P.tl.x += dx; P.tl.y += dy;
      P.tr.x += dx; P.tr.y += dy;
      P.bl.x += dx; P.bl.y += dy;
      P.br.x += dx; P.br.y += dy;
      break;

    default:
      return;
  }

  // ❌ NO sideFlip() → crossing fully allowed
}

// ---------- draw ----------
export function drawDisjointChannel(ctx, d, highlight = false) {
  if (!d?._px) return;
  const { tl, tr, bl, br } = d._px;

  const color = d.color || "#ffd54a";
  const isSelected = !!highlight;
  const H = ctx.canvas.height;

  ctx.save();

  // fill
  if (d.fill) {
    ctx.fillStyle = d.fill;
  } else {
    const topY = Math.min(tl.y, tr.y);
    const grad = ctx.createLinearGradient(0, topY, 0, H);
    grad.addColorStop(0, hexToRGBA(color, 0.22));
    grad.addColorStop(1, hexToRGBA(color, 0.06));
    ctx.fillStyle = grad;
  }

  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.fill();

  // strokes
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = isSelected ? 2 : 1.5;

  // top
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.stroke();

  // bottom
  ctx.beginPath();
  ctx.moveTo(bl.x, bl.y);
  ctx.lineTo(br.x, br.y);
  ctx.stroke();

  // anchors
  if (isSelected) {
    const drawAnchor = (pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffff66";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000";
      ctx.stroke();
    };

    drawAnchor(tl);
    drawAnchor(tr);
    drawAnchor(bl);
    drawAnchor(br);
  }

  ctx.restore();
}

// ---------- create new channel ----------
export function makeDisjointChannel(x1, yTop, x2, yBot, color = "#ffd54a") {
  return {
    type: "disjoint",
    color,
    fill: null,
    points: {
      tl: { x: x1, y: yTop },
      tr: { x: x2, y: yTop },
      bl: { x: x1, y: yBot },
      br: { x: x2, y: yBot },
    },
    _px: null,
  };
}
