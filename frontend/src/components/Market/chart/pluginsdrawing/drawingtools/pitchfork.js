// pitchfork.js — TRUE ANDREWS PITCHFORK (rotating, parallel lines) + SHADING

const EPS = 1e-6;

// ---------------------- helpers ----------------------
const pxFrom = (chart, series, p) => {
  if (!p) return { x: 0, y: 0 };
  let x = 0, y = 0;

  if (typeof p.x === "number" && Number.isFinite(p.x)) {
    x = p.x;
  } else if (p.time != null) {
    try { x = chart.timeScale().timeToCoordinate(p.time) ?? 0; } catch { }
  }

  if (typeof p.y === "number" && Number.isFinite(p.y)) {
    y = p.y;
  } else if (p.price != null) {
    try { y = series.priceToCoordinate(p.price) ?? 0; } catch { }
  }

  return { x, y };
};

const normalize = (vx, vy) => {
  const m = Math.hypot(vx, vy);
  if (m < EPS) return { x: 0, y: -1 };
  return { x: vx / m, y: vy / m };
};

function distPointToLine(x, y, p0, dir) {
  const vx = x - p0.x;
  const vy = y - p0.y;
  return Math.abs(vx * dir.y - vy * dir.x);
}

function longLine(pass, dir) {
  const far = 5000;
  return [
    { x: pass.x - dir.x * far, y: pass.y - dir.y * far },
    { x: pass.x + dir.x * far, y: pass.y + dir.y * far }
  ];
}

// SHADING COLOR HELPER
function hexToRGBA(hex, a) {
  try {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  } catch {
    return `rgba(255,255,255,${a})`;
  }
}

// ------------------- compute -----------------------
export function computePitchforkPixels(chart, series, d) {
  if (!d) return;
  if (!d._px) d._px = {};

  const A = pxFrom(chart, series, d.start);
  const B = pxFrom(chart, series, d.mid);
  const C = pxFrom(chart, series, d.end);

  const M = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
  const dir = normalize(A.x - M.x, A.y - M.y);

  const midBA = { x: (B.x + A.x) / 2, y: (B.y + A.y) / 2 };
  const midAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };

  d._px.a = A;
  d._px.b = B;
  d._px.c = C;
  d._px.dir = dir;
  d._px.passPoints = [B, midBA, A, midAC, C];

  return d._px;
}

// -------------------- hit test -----------------------
export function isPointNearPitchfork(chart, series, x, y, d, tol = 10) {
  if (!d || !d._px) return false;
  const p = d._px;

  if (Math.hypot(x - p.a.x, y - p.a.y) <= tol) return "mid";
  if (Math.hypot(x - p.b.x, y - p.b.y) <= tol) return "left";
  if (Math.hypot(x - p.c.x, y - p.c.y) <= tol) return "right";

  if (p.passPoints && p.dir) {
    for (const pass of p.passPoints) {
      if (distPointToLine(x, y, pass, p.dir) <= tol) return true;
    }
  }

  // baseline BC
  const bx = p.b.x, by = p.b.y, cx = p.c.x, cy = p.c.y;
  const len2 = (cx - bx) ** 2 + (cy - by) ** 2;
  if (len2 > EPS) {
    const t = ((x - bx) * (cx - bx) + (y - by) * (cy - by)) / len2;
    const T = Math.max(0, Math.min(1, t));
    const px = bx + (cx - bx) * T;
    const py = by + (cy - by) * T;
    if (Math.hypot(x - px, y - py) <= tol) return true;
  }

  return false;
}

// ----------------------- DRAW ---------------------------
export function drawPitchfork(ctx, d, highlight = false) {
  if (!d?._px) return;

  const p = d._px;
  const color = d.color || "#ffffff";
  const isSelected = highlight;

  const passes = p.passPoints;
  const dir = p.dir;

  const A = p.a;
  const B = p.b;
  const C = p.c;

  const Ay = A.y;
  const baselineY = (B.y + C.y) / 2;

  // same vertical flip rule as your vertical version
  const AisBelow = Ay > baselineY;

  const H = ctx.canvas.height;

  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = color;

  // ---------- BC LINE INTERSECTION (real angled baseline) ----------
  function intersectWithBaseline(P1, P2) {
    const x1 = B.x, y1 = B.y;
    const x2 = C.x, y2 = C.y;
    const x3 = P1.x, y3 = P1.y;
    const x4 = P2.x, y4 = P2.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < EPS) return null;

    const px =
      ((x1 * y2 - y1 * x2) * (x3 - x4) -
        (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;

    const py =
      ((x1 * y2 - y1 * x2) * (y3 - y4) -
        (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

    return { x: px, y: py };
  }

  function longLine(pass, dir) {
    const far = 5000;
    return [
      { x: pass.x - dir.x * far, y: pass.y - dir.y * far },
      { x: pass.x + dir.x * far, y: pass.y + dir.y * far }
    ];
  }

  // clip helpers against horizontal Y (for center line vs A)
  function clipDown(seg, yCut) {
    let [P1, P2] = seg;
    if (P1.y > P2.y) [P1, P2] = [P2, P1];
    if (P1.y >= yCut) return { top: P1, bottom: P2 };
    const t = (yCut - P1.y) / (P2.y - P1.y);
    return { top: { x: P1.x + (P2.x - P1.x) * t, y: yCut }, bottom: P2 };
  }
  function clipUp(seg, yCut) {
    let [P1, P2] = seg;
    if (P1.y < P2.y) [P1, P2] = [P2, P1];
    if (P1.y <= yCut) return { top: P1, bottom: P2 };
    const t = (yCut - P1.y) / (P2.y - P1.y);
    return { top: P2, bottom: { x: P1.x + (P2.x - P1.x) * t, y: yCut } };
  }

  const clipped = [];

  for (let i = 0; i < passes.length; i++) {
    const seg = longLine(passes[i], dir);

    // CENTER line (index 2): never above A; flips direction at A
    if (i === 2) {
      const c = AisBelow ? clipUp(seg, Ay) : clipDown(seg, Ay);
      // ensure "top" is the end farther from A on the "allowed" side
      // (clipUp/clipDown already guarantee bottom.y == Ay or beyond)
      clipped.push(c);
      continue;
    }

    // OUTER + INNER lines: attach to real BC; flip around BC
    const I = intersectWithBaseline(seg[0], seg[1]);

    if (!I) {
      // fallback: order by y
      let P1 = seg[0], P2 = seg[1];
      const top = P1.y < P2.y ? P1 : P2;
      const bottom = P1.y > P2.y ? P1 : P2;
      // when below, we want the upward piece — but without baseline we just keep as-is
      clipped.push(AisBelow ? { top, bottom: { ...top } } : { top, bottom });
      continue;
    }

    if (AisBelow) {
      // A below → all 4 lines go UP from the BC line.
      // So: bottom = intersection (I), top = the endpoint ABOVE I (smaller y).
      const topEnd = seg[0].y < seg[1].y ? seg[0] : seg[1];
      const top = (topEnd.y < I.y) ? topEnd : I; // guard (should usually be <)
      const bottom = I;
      clipped.push({ top, bottom });
    } else {
      // A above → lines go DOWN from BC: top = I, bottom = the LOWER endpoint (bigger y)
      const bottomEnd = seg[0].y > seg[1].y ? seg[0] : seg[1];
      const bottom = (bottomEnd.y > I.y) ? bottomEnd : I;
      const top = I;
      clipped.push({ top, bottom });
    }
  }

  // ---------- SHADING (between outer lines 0 and 4) ----------
  const L = clipped[0];
  const R = clipped[4];
  if (L && R) {
    const grad = ctx.createLinearGradient(0, L.top.y, 0, H);
    grad.addColorStop(0, hexToRGBA(color, 0.18));
    grad.addColorStop(1, hexToRGBA(color, 0.05));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(L.top.x, L.top.y);
    ctx.lineTo(R.top.x, R.top.y);
    ctx.lineTo(R.bottom.x, R.bottom.y);
    ctx.lineTo(L.bottom.x, L.bottom.y);
    ctx.closePath();
    ctx.fill();
  }

  // ---------- DRAW LINES ----------
  for (let i = 0; i < clipped.length; i++) {
    const c = clipped[i];
    ctx.lineWidth = i === 2 ? (isSelected ? 3 : 2) : (isSelected ? 2 : 1.5);
    ctx.beginPath();
    ctx.moveTo(c.top.x, c.top.y);
    ctx.lineTo(c.bottom.x, c.bottom.y);
    ctx.stroke();
  }

  // ---------- DRAW BASELINE (B—C) ----------
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(B.x, B.y);
  ctx.lineTo(C.x, C.y);
  ctx.stroke();

  if (isSelected) {
    drawAnchor(ctx, A, "#ff4444", "#ffffff");
    drawAnchor(ctx, B, "#ffffff", "#ff4444");
    drawAnchor(ctx, C, "#ffffff", "#ff4444");
  }

  ctx.restore();
}




// ------- anchor helper -------
function drawAnchor(ctx, pt, fill, stroke) {
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}
