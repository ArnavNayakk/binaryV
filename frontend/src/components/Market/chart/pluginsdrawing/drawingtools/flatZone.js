// flatZone.js — FINAL FIXED VERSION with perfect gradient + slanted top support

// Distance helper
const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

/** Detect click zones */
export const isPointNearFlatZone = (px, py, d, tol = 8) => {
    if (!d._px) return false;

    const p = d._px;

    // Ensure new properties exist
    p.topLeftY = p.topLeftY ?? p.topY;
    p.topRightY = p.topRightY ?? p.topY;

    const { x1, x2, topLeftY, topRightY, bottomY } = p;

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);

    const topMin = Math.min(topLeftY, topRightY);
    const topMax = Math.max(topLeftY, topRightY);

    const zoneMinY = Math.min(topMin, bottomY);
    const zoneMaxY = Math.max(topMax, bottomY);

    // ---- Corners ----
    if (dist(px, py, x1, topLeftY) <= tol) return { hit: "top-left" };
    if (dist(px, py, x2, topRightY) <= tol) return { hit: "top-right" };
    if (dist(px, py, x1, bottomY) <= tol) return { hit: "bottom-left" };
    if (dist(px, py, x2, bottomY) <= tol) return { hit: "bottom-right" };

    // ---- Slanted top line ----
    const t = (px - x1) / (x2 - x1);
    if (t >= 0 && t <= 1) {
        const yOnTop = topLeftY + (topRightY - topLeftY) * t;
        if (Math.abs(py - yOnTop) <= tol) return { hit: "top" };
    }

    // ---- Bottom line ----
    if (Math.abs(py - bottomY) <= tol && px >= minX && px <= maxX)
        return { hit: "bottom" };

    // ---- Inside zone ----
    if (px >= minX && px <= maxX && py >= zoneMinY && py <= zoneMaxY)
        return { hit: "inside" };

    return false;
};

/** DRAW ZONE — with perfect trapezoid gradient */
export const drawFlatZone = (ctx, d, highlight) => {
    if (!d._px) return;

    const p = d._px;

    // Ensure new properties exist
    p.topLeftY  = p.topLeftY  ?? p.topY;
    p.topRightY = p.topRightY ?? p.topY;

    const { x1, x2, topLeftY, topRightY, bottomY } = p;

    const left  = Math.min(x1, x2);
    const right = Math.max(x1, x2);

    // ============================================================
    // 1. Find gradient bounds (smallest -> largest Y)
    // ============================================================
    const upperY = Math.min(topLeftY, topRightY, bottomY);
    const lowerY = Math.max(topLeftY, topRightY, bottomY);

    // ============================================================
    // 2. Prepare gradient (vertical only)
    // ============================================================
    const grad = ctx.createLinearGradient(0, upperY, 0, lowerY);
    grad.addColorStop(0, d.color + "33");
    grad.addColorStop(1, d.color + "10");

    // ============================================================
    // 3. CLIP to trapezoid region so gradient ONLY fills between lines
    // ============================================================
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, topLeftY);
    ctx.lineTo(x2, topRightY);
    ctx.lineTo(x2, bottomY);
    ctx.lineTo(x1, bottomY);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = grad;
    ctx.fillRect(left, upperY, right - left, lowerY - upperY);

    ctx.restore();

    // ============================================================
    // 4. Draw slanted TOP line
    // ============================================================
    ctx.setLineDash(
        d.style === "dashed" ? [6, 4] :
        d.style === "dotted" ? [2, 4] : []
    );

    ctx.lineWidth = highlight ? 2 : 1.6;
    ctx.strokeStyle = d.color;

    ctx.beginPath();
    ctx.moveTo(x1, topLeftY);
    ctx.lineTo(x2, topRightY);
    ctx.stroke();

    if (highlight) {
        [{ x: x1, y: topLeftY }, { x: x2, y: topRightY }].forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = d.color;
            ctx.fill();
            ctx.stroke();
        });
    }

    // ============================================================
    // 5. Draw bottom line
    // ============================================================
    ctx.beginPath();
    ctx.moveTo(x1, bottomY);
    ctx.lineTo(x2, bottomY);
    ctx.stroke();

    if (highlight) {
        [{ x: x1, y: bottomY }, { x: x2, y: bottomY }].forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = d.color;
            ctx.fill();
            ctx.stroke();
        });
    }

    ctx.setLineDash([]);
};
