// =====================================================
//   CYCLIC LINES — EXACT QUOTEX + UP/DOWN DRAGGABLE
// =====================================================

const dist = (a, b) => Math.abs(a - b);

// =====================================================
// HIT DETECTION
// =====================================================
export const isPointNearCyclic = (px, py, d, tol = 8) => {
    const p = d._px;
    if (!p) return false;

    // left anchor
    if (dist(px, p.x1) <= tol && dist(py, p.y1) <= tol)
        return { hit: "left" };

    // right anchor
    if (dist(px, p.x2) <= tol && dist(py, p.y2) <= tol)
        return { hit: "right" };

    // clicking anywhere between two anchors → drag whole group
    if (px >= Math.min(p.x1, p.x2) - 10 && px <= Math.max(p.x1, p.x2) + 10)
        return { hit: "inside" };

    return false;
};


// =====================================================
// DRAW (INCLUDING VERTICAL POINTER MOVEMENT)
// =====================================================
export const drawCyclicLines = (ctx, d, highlight, height, width) => {
    const p = d._px;
    if (!p) return;

    const { x1, y1, x2, y2 } = p;
    const spacing = x2 - x1;

    ctx.strokeStyle = d.color;
    ctx.lineWidth = 1.2;

    // -------------- MAIN TWO ANCHOR LINES ----------------
    drawFullVertical(ctx, x1, height);
    drawFullVertical(ctx, x2, height);

    // Draw anchor circles (sliding up/down)
    if (highlight) {
        drawAnchor(ctx, x1, y1, d.color);
        drawAnchor(ctx, x2, y2, d.color);
    }

    // invalid spacing → remove extra lines
    if (spacing <= 0) return;

    // ---------- Infinite left / right cyclic lines ----------
    let lx = x1 - spacing;
    while (lx > -50) {
        drawFullVertical(ctx, lx, height);
        lx -= spacing;
    }

    let rx = x2 + spacing;
    while (rx < width + 50) {
        drawFullVertical(ctx, rx, height);
        rx += spacing;
    }
};


// ---------------- DRAW HELPERS ----------------
const drawFullVertical = (ctx, x, h) => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
};

const drawAnchor = (ctx, x, y, color) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.fill();
    ctx.stroke();
};
