// initDrawingTools.js
// Main manager for drawing tools (handles canvas, events, and state).

import { computePixels } from "./drawingHelpers.js";
import { drawTrendLine, isPointNearLine, isPointNearEndpoint } from "./trendLine.js";
import { drawHorizontalLine, isPointNearHorizontalLine } from "./horizontalLine.js";
import { drawVerticalLine, isPointNearVerticalLine } from "./verticalLine.js";
import { drawRectangle, isPointNearRectangle, getRectangleHitZone } from "./rectangle.js"; // <-- added getRectangleHitZone
import { drawRayLine, isPointNearRayLine } from "./rayLine.js";
import { drawParallelChannel, isPointNearParallelChannel, getParallelChannelHandle } from "./parallelChannel.js";
import { drawCrossLine, isPointNearCrossLine } from "./crossLine.js";
import { drawExtendedLine, isPointNearExtendedLine } from "./extendedLine.js";
import { drawTriangle, isPointNearTriangle, getTriangleCorner } from "./triangle.js";
import { drawArcLine, isPointNearArc, computeArcPixels } from "./arcLine.js";
import { drawCurveLine, isPointNearCurve, computeCurvePixels } from "./curveLine.js";
import { drawFlatZone, isPointNearFlatZone } from "./flatZone.js";
import { drawCyclicLines, isPointNearCyclic } from "./cyclicLines.js";
import { drawAngleLine, isPointNearTrendAngle, computeAnglePixels } from "./angleLine.js";
import { drawPitchfork, isPointNearPitchfork, computePitchforkPixels } from "./pitchfork.js";
import {
    computeDisjointPixels,
    getDisjointHandle,
    applyDisjointDrag,
    drawDisjointChannel,
    makeDisjointChannel
} from "./disjointChannel.js";

import {
    drawPitchfan,
    isPointNearPitchfan,
    computePitchfanPixels,
    applyPitchfanDrag,
    makePitchfan,
} from "./pitchfan.js";



export default function initDrawingTools(chart, container, candleSeries) {
    if (!chart || !container || !candleSeries) return null;

    const drawings = [];
    let drawingMode = null;
    let startPoint = null;
    let tempEnd = null;
    let selectedLineIndex = null;
    let dragging = false;
    let dragLast = null;
    let resizing = null;
    let channelHandle = null;

    // ===== Pitchfork draft (3-click A->B->C) =====
    // let pfStep = 0;     // 0 none, 1 have A, 2 have A+B
    // let pfA = null;     // {x,y,time,price}
    // let pfB = null;     // {x,y,time,price}
    // let pfCursor = null;

    // function pfReset() {
    //     pfStep = 0;
    //     pfA = null;
    //     pfB = null;
    //     pfCursor = null;
    // }
    // function pfFinalize(C) {
    //     drawings.push({
    //         type: "pitchfork",
    //         color: defaultColor,
    //         style: defaultStyle,
    //         // mapping: start=A (top/center), mid=B (left), end=C (right)
    //         start: { time: pfA.time, price: pfA.price, x: pfA.x, y: pfA.y },
    //         mid: { time: pfB.time, price: pfB.price, x: pfB.x, y: pfB.y },
    //         end: { time: C.time, price: C.price, x: C.x, y: C.y },
    //         _px: null
    //     });
    //     pfReset();
    // }
    // function pfHandleDown(x, y) {
    //     // no-op; creation is click-based in handleUp (consistent with your engine)
    // }
    // function pfHandleMove(x, y) {
    //     pfCursor = { x, y };
    // }
    // function pfHandleUp(x, y, time, price) {
    //     if (pfStep === 0) {
    //         pfA = { x, y, time: time ?? Date.now() / 1000, price };
    //         pfStep = 1;
    //         return true;
    //     }
    //     if (pfStep === 1) {
    //         pfB = { x, y, time: time ?? Date.now() / 1000, price };
    //         pfStep = 2;
    //         return true;
    //     }
    //     if (pfStep === 2) {
    //         const C = { x, y, time: time ?? Date.now() / 1000, price };
    //         pfFinalize(C);
    //         return true;
    //     }
    //     return true;
    // }
    // function pfDrawPreview(ctx, W, H) {
    //     if (drawingMode !== "pitchfork") return;
    //     if (pfStep === 0) return;

    //     const drawAnchor = (pt, fill = "#ffffff", stroke = "#ff4444") => {
    //         if (!pt) return;
    //         ctx.beginPath();
    //         ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    //         ctx.fillStyle = fill;
    //         ctx.fill();
    //         ctx.lineWidth = 2;
    //         ctx.strokeStyle = stroke;
    //         ctx.stroke();
    //     };

    //     // Always show A
    //     drawAnchor(pfA, "#ffffff", "#ff4444");
    //     if (pfStep === 1) return;

    //     // Show B and vertical ghost fork using cursor as C
    //     if (!pfB || !pfCursor) return;

    //     const Ax = pfA.x;
    //     const Bx = pfB.x;
    //     const Cx = pfCursor.x;
    //     const baseY = (pfB.y + pfCursor.y) / 2;

    //     const x1 = Bx;                // outer left
    //     const x3 = Ax;                // center
    //     const x5 = Cx;                // outer right
    //     const x2 = (x1 + x3) / 2;     // inner left
    //     const x4 = (x3 + x5) / 2;     // inner right

    //     ctx.save();

    //     // baseline (ghost)
    //     ctx.setLineDash([4, 3]);
    //     ctx.lineWidth = 1;
    //     ctx.strokeStyle = "#ffffffaa";
    //     ctx.beginPath();
    //     ctx.moveTo(Math.min(Bx, Cx), baseY);
    //     ctx.lineTo(Math.max(Bx, Cx), baseY);
    //     ctx.stroke();

    //     // draw vertical ghost lines
    //     const drawV = (x) => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); };

    //     // outer left
    //     ctx.setLineDash([]); ctx.lineWidth = 1.5; ctx.strokeStyle = "#ffffff";
    //     drawV(x1);

    //     // inner left
    //     ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.strokeStyle = "#ffffffcc";
    //     drawV(x2);

    //     // center
    //     ctx.setLineDash([]); ctx.lineWidth = 2; ctx.strokeStyle = "#ffffffff";
    //     drawV(x3);

    //     // inner right
    //     ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.strokeStyle = "#ffffffcc";
    //     drawV(x4);

    //     // outer right
    //     ctx.setLineDash([]); ctx.lineWidth = 1.5; ctx.strokeStyle = "#ffffff";
    //     drawV(x5);

    //     // show B anchor
    //     drawAnchor(pfB, "#ffffff", "#ff4444");

    //     ctx.restore();
    // }
    // // ===== end pitchfork draft =====

    // new rectangle-specific state
    let rectResizeCorner = null;
    let isDraggingRect = false;
    let lastClickTime = 0;

    let defaultColor = "#60a5fa";
    let defaultStyle = "solid";

    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 50,
        pointerEvents: "none",
        transition: "z-index 0.1s ease",
    });
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const getMousePosRelToContainer = (clientX, clientY) => {
        const r = container.getBoundingClientRect();
        return { x: clientX - r.left, y: clientY - r.top };
    };

    // ---------- UPDATED updateAllPixels ----------
    const updateAllPixels = () => {
        for (const d of drawings) {
            if (d.type === "flat_zone") {
                d._px = d._px || {};
                d._px.x1 = (typeof d._px.x1 === "number") ? d._px.x1 : (typeof d.x1 === "number" ? d.x1 : 0);
                d._px.x2 = (typeof d._px.x2 === "number") ? d._px.x2 : (typeof d.x2 === "number" ? d.x2 : currentCanvasWidth);
                d._px.topY = (typeof d._px.topY === "number") ? d._px.topY : (typeof d.topY === "number" ? d.topY : 0);
                d._px.bottomY = (typeof d._px.bottomY === "number") ? d._px.bottomY : (typeof d.bottomY === "number" ? d.bottomY : 0);
                d.topY = d._px.topY;
                d.bottomY = d._px.bottomY;
                d.x1 = d._px.x1;
                d.x2 = d._px.x2;
                continue;
            }

            if (d.type === "angle") {
                d._px = computeAnglePixels(chart, candleSeries, d);
                continue;
            }

            // Pitchfork recompute (always from semantics)
            if (d.type === "pitchfork") {
                try {
                    d._px = computePitchforkPixels(chart, candleSeries, d);
                } catch { }
                continue;
            }

            if (d.type === "arc" || d.type === "curve") {
                if (d._px && Array.isArray(d._px.points) && d._px.points.length === 3) {
                    continue;
                }
                if (d.start && d.mid && d.end) {
                    try {
                        if (d.type === "arc") d._px = computeArcPixels(chart, candleSeries, d);
                        else d._px = computeCurvePixels(chart, candleSeries, d);
                    } catch { }
                }
            } else {
                d._px = computePixels(chart, candleSeries, d);
            }

            if (d.type === "disjoint") {
                d._px = computeDisjointPixels(chart, candleSeries, d);
                continue;
            }


            if (d.type === "pitchfan") {
                d._px = computePitchfanPixels(chart, candleSeries, d);
                continue;
            }



        }
    };
    // ---------- end updateAllPixels ----------

    // --- Ray helpers (local, non-invasive) ---
    const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
    const isNearRayAnchor = (d, x, y, tol = 8) => {
        if (!d || !d._px) return null;
        const { sx, sy, ex, ey } = d._px;
        if (dist(x, y, sx, sy) <= tol) return "start";
        if (dist(x, y, ex, ey) <= tol) return "end";
        return null;
    };
    const drawRayAnchors = (ctx, d) => {
        if (!d || !d._px) return;
        const { sx, sy, ex, ey } = d._px;
        const r = 5;
        ctx.beginPath();
        ctx.fillStyle = "rgba(147,197,253,0.95)";
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex, ey, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#2b6cb0";
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ex, ey, r, 0, Math.PI * 2);
        ctx.stroke();
    };
    // --- end ray helpers ---

    const redraw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateAllPixels();

        drawings.forEach((d, i) => {
            if (d.type === "horizontal")
                drawHorizontalLine(ctx, d, i === selectedLineIndex, canvas.width);
            else if (d.type === "vertical")
                drawVerticalLine(ctx, d, i === selectedLineIndex, canvas.height);
            else if (d.type === "rectangle")
                drawRectangle(ctx, d, i === selectedLineIndex);
            else if (d.type === "ray")
                drawRayLine(ctx, d, i === selectedLineIndex, canvas.width);
            else if (d.type === "parallel")
                drawParallelChannel(ctx, d, i === selectedLineIndex);
            else if (d.type === "crossline")
                drawCrossLine(ctx, d, i === selectedLineIndex, canvas.width, canvas.height);
            else if (d.type === "extended")
                drawExtendedLine(ctx, d, i === selectedLineIndex, canvas.width);
            else if (d.type === "triangle")
                drawTriangle(ctx, d, i === selectedLineIndex);
            else if (d.type === "pitchfork")
                drawPitchfork(ctx, d, i === selectedLineIndex);
            else if (d.type === "arc")
                drawArcLine(ctx, d, i === selectedLineIndex);
            else if (d.type === "curve")
                drawCurveLine(ctx, d, i === selectedLineIndex);
            else if (d.type === "flat_zone")
                drawFlatZone(ctx, d, i === selectedLineIndex, canvas.width);
            else if (d.type === "cyclic")
                drawCyclicLines(ctx, d, i === selectedLineIndex, canvas.height);
            else if (d.type === "angle")
                drawAngleLine(ctx, d, i === selectedLineIndex);
            else if (d.type === "disjoint")
                drawDisjointChannel(ctx, d, i === selectedLineIndex);
            else if (d.type === "pitchfan")
                drawPitchfan(ctx, d, i === selectedLineIndex);
            else
                drawTrendLine(ctx, d, i === selectedLineIndex);

            if (d.type === "ray" && i === selectedLineIndex) {
                drawRayAnchors(ctx, d);
            }
        });

        // // Pitchfork live preview (ghost)
        // pfDrawPreview(ctx, canvas.width, canvas.height);

        // Suppress generic ghost trendline while in pitchfork mode
        if (drawingMode && drawingMode !== "pitchfork" && startPoint && tempEnd) {
            drawTrendLine(ctx, {
                _px: { sx: startPoint.x, sy: startPoint.y, ex: tempEnd.x, ey: tempEnd.y },
                color: "rgba(96,165,250,0.6)",
                style: "solid",
            });
        }
    };

    let currentCanvasWidth = 0;

    const resizeCanvas = () => {
        const ratio = window.devicePixelRatio || 1;
        const { clientWidth, clientHeight } = container;

        currentCanvasWidth = clientWidth; // <--- store width for flat lines

        canvas.width = Math.max(1, Math.floor(clientWidth * ratio));
        canvas.height = Math.max(1, Math.floor(clientHeight * ratio));
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        redraw();
    };

    window.addEventListener("resize", resizeCanvas);
    requestAnimationFrame(resizeCanvas);

    // --- Interaction Logic ---
    const refreshPointerCapture = (clientX, clientY) => {
        const { x, y } = getMousePosRelToContainer(clientX, clientY);
        updateAllPixels();
        let near = false;
        if (drawingMode || dragging || resizing || rectResizeCorner || isDraggingRect) near = true;
        else {
            for (let i = drawings.length - 1; i >= 0; i--) {
                const drawing = drawings[i];
                if (!drawing?._px) continue;

                if (
                    isPointNearLine(x, y, drawing) ||
                    isPointNearEndpoint(x, y, drawing) ||
                    isPointNearHorizontalLine(chart, candleSeries, x, y, drawing) ||
                    isPointNearVerticalLine(chart, candleSeries, x, y, drawing) ||
                    isPointNearRayLine(chart, candleSeries, x, y, drawing) ||
                    isPointNearRectangle(chart, candleSeries, x, y, drawing) ||
                    isPointNearCrossLine(chart, candleSeries, x, y, drawing) ||
                    isPointNearExtendedLine(chart, candleSeries, x, y, drawing) ||
                    isPointNearTriangle(chart, candleSeries, x, y, drawing) ||
                    isPointNearArc(chart, candleSeries, x, y, drawing) ||
                    isPointNearCurve(chart, candleSeries, x, y, drawing) ||
                    isPointNearFlatZone(x, y, drawing) ||
                    isPointNearCyclic(x, y, drawing) ||
                    isPointNearTrendAngle(x, y, drawing) ||
                    isPointNearPitchfork(chart, candleSeries, x, y, drawing) ||
                    isPointNearDisjointChannel(x, y, drawing) ||
                    isPointNearParallelChannel(chart, candleSeries, x, y, drawing)
                ) {
                    near = true;
                    break;
                }
            }
        }

        if (near) {
            canvas.style.zIndex = 999;
            canvas.style.pointerEvents = "auto";
        } else {
            canvas.style.zIndex = 50;
            canvas.style.pointerEvents = drawingMode ? "auto" : "none";
        }

        if (drawingMode) canvas.style.cursor = "crosshair";
        else if (isDraggingRect || dragging) canvas.style.cursor = "grabbing";
        else if (rectResizeCorner || resizing) canvas.style.cursor = "nwse-resize";

        // Pitchfork cursor hints when selected
        else if (selectedLineIndex !== null && drawings[selectedLineIndex].type === "pitchfork") {
            if (resizing === "left" || resizing === "mid" || resizing === "right") {
                canvas.style.cursor = "move";
            } else if (dragging) {
                canvas.style.cursor = "grabbing";
            } else {
                canvas.style.cursor = "pointer";
            }
        } else canvas.style.cursor = near ? "pointer" : "default";
    };

    const onContainerMouseMove = (e) => {
        try { refreshPointerCapture(e.clientX, e.clientY); } catch { }
    };
    container.addEventListener("mousemove", onContainerMouseMove);

    const handleDown = (clientX, clientY, originalEvent) => {
        const { x, y } = getMousePosRelToContainer(clientX, clientY);
        if (originalEvent && originalEvent.button !== 0) return;

        const now = Date.now();
        const doubleClick = now - lastClickTime < 250;
        lastClickTime = now;

        // For other drawings (not pitchfork)
        if (drawingMode && drawingMode !== "pitchfork") {
            const time = chart.timeScale().coordinateToTime(x);
            const price = candleSeries.coordinateToPrice(y);
            startPoint = { x, y, time, price, _px: { sx: x, sy: y } };
            tempEnd = null;
            redraw();
            return;
        }

        // ===== Disjoint Channel creation start =====
        if (drawingMode === "disjoint") {
            startPoint = { x, y };
            tempEnd = { x, y };
            redraw();
            return;
        }
        
        // one click creation for pitchfan
        if (drawingMode === "pitchfan") {
            const fan = makePitchfan(x, y, defaultColor);
            drawings.push(fan);

            selectedLineIndex = drawings.length - 1;
            drawingMode = null;
            redraw();
            return;
        }



        // 1-CLICK PITCHFORK CREATION (new)
        if (drawingMode === "pitchfork") {

            const A = { x, y: y - 80, time: chart.timeScale().coordinateToTime(x), price: candleSeries.coordinateToPrice(y - 80) };
            const B = { x: x - 60, y: y + 60, time: chart.timeScale().coordinateToTime(x - 60), price: candleSeries.coordinateToPrice(y + 60) };
            const C = { x: x + 60, y: y + 60, time: chart.timeScale().coordinateToTime(x + 60), price: candleSeries.coordinateToPrice(y + 60) };

            drawings.push({
                type: "pitchfork",
                color: defaultColor,
                style: defaultStyle,
                start: A,   // A = top
                mid: B,     // B = left
                end: C,     // C = right
                _px: null
            });

            selectedLineIndex = drawings.length - 1;
            drawingMode = null;  // auto-exit create mode
            redraw();
            return;
        }



        updateAllPixels();
        selectedLineIndex = null;
        resizing = null;
        rectResizeCorner = null;
        isDraggingRect = false;

        // Rectangle
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type === "rectangle") {
                const zone = getRectangleHitZone(chart, candleSeries, x, y, d);
                if (zone) {
                    selectedLineIndex = i;
                    redraw();

                    if (zone === "inside" && doubleClick) {
                        isDraggingRect = true;
                        dragLast = { x, y };
                        return;
                    }
                    if (zone === "inside") return;
                    rectResizeCorner = zone;
                    return;
                }
            }
        }

        // Arc + Curve
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type === "arc" || d.type === "curve") {
                const hit = d.type === "arc"
                    ? isPointNearArc(chart, candleSeries, x, y, d)
                    : isPointNearCurve(chart, candleSeries, x, y, d);
                if (hit) {
                    selectedLineIndex = i;
                    redraw();
                    if (hit.type === "anchor") {
                        resizing = hit.index;
                    } else if (hit.type === "curve") {
                        dragging = true;
                        dragLast = { x, y };
                    }
                    return;
                }
            }
        }

        // Triangle
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type === "triangle") {
                const corner = getTriangleCorner(chart, candleSeries, x, y, d);
                if (corner !== null) {
                    selectedLineIndex = i;
                    resizing = corner;
                    redraw();
                    return;
                }
                if (isPointNearTriangle(chart, candleSeries, x, y, d)) {
                    const p = d._px;
                    if (p?.points?.length === 3) {
                        const [a, b, c] = p.points;
                        const area = (x1, y1, x2, y2, x3, y3) =>
                            Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
                        const A = area(a.x, a.y, b.x, b.y, c.x, c.y);
                        const A1 = area(x, y, b.x, b.y, c.x, c.y);
                        const A2 = area(a.x, a.y, x, y, c.x, c.y);
                        const A3 = area(a.x, a.y, b.x, b.y, x, y);
                        const inside = Math.abs(A - (A1 + A2 + A3)) < 2;
                        if (inside) {
                            selectedLineIndex = i;
                            dragging = true;
                            dragLast = { x, y };
                            redraw();
                            return;
                        }
                    }
                }
            }
        }

        // Ray
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type === "ray") {
                d._px = d._px || computePixels(chart, candleSeries, d);
                const anchor = isNearRayAnchor(d, x, y, 8);
                if (anchor) {
                    selectedLineIndex = i;
                    resizing = anchor === "start" ? "start" : "end";
                    canvas.style.cursor = "nwse-resize";
                    redraw();
                    return;
                }
                if (isPointNearRayLine(chart, candleSeries, x, y, d)) {
                    selectedLineIndex = i;
                    dragging = true;
                    dragLast = { x, y };
                    canvas.style.cursor = "grabbing";
                    redraw();
                    return;
                }
            }
        }

        // Parallel
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type === "parallel") {
                const handle = getParallelChannelHandle(chart, candleSeries, x, y, d);
                if (handle) {
                    selectedLineIndex = i;
                    channelHandle = handle;
                    dragLast = { x, y };
                    canvas.style.cursor = handle === "mid" ? "ns-resize" : "grabbing";
                    redraw();
                    return;
                }
                if (isPointNearParallelChannel(chart, candleSeries, x, y, d)) {
                    selectedLineIndex = i;
                    dragging = true;
                    dragLast = { x, y };
                    canvas.style.cursor = "grabbing";
                    redraw();
                    return;
                }
            }
        }

        // Flat Zone
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type !== "flat_zone") continue;
            const hit = isPointNearFlatZone(x, y, d);
            if (hit) {
                selectedLineIndex = i;
                dragLast = { x, y };
                if (hit.hit === "inside") {
                    dragging = true;
                } else {
                    resizing = hit.hit;
                    canvas.style.cursor = "nwse-resize";
                }
                redraw();
                return;
            }
        }

        // Cyclic
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type !== "cyclic") continue;
            const hit = isPointNearCyclic(x, y, d);
            if (!hit) continue;
            selectedLineIndex = i;
            dragLast = { x, y };
            if (hit.hit === "left") { resizing = "left"; canvas.style.cursor = "grab"; redraw(); return; }
            if (hit.hit === "right") { resizing = "right"; canvas.style.cursor = "grab"; redraw(); return; }
            if (hit.hit === "inside") { dragging = true; canvas.style.cursor = "grabbing"; redraw(); return; }
        }

        // Trend Angle
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type !== "angle") continue;
            const hit = isPointNearTrendAngle(x, y, d);
            if (!hit) continue;
            selectedLineIndex = i;
            dragLast = { x, y };
            if (hit.hit === "start") { resizing = "start"; canvas.style.cursor = "nwse-resize"; }
            else if (hit.hit === "end") { resizing = "end"; canvas.style.cursor = "nwse-resize"; }
            else if (hit.hit === "line") { dragging = true; canvas.style.cursor = "grabbing"; }
            redraw();
            return;
        }

        // Pitchfork selection / inside (drag handled in handleMove)
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type !== "pitchfork") continue;
            const hit = isPointNearPitchfork(chart, candleSeries, x, y, d);
            if (!hit) continue;
            selectedLineIndex = i;
            dragLast = { x, y };
            if (hit === "left" || hit === "mid" || hit === "right") {
                resizing = hit;
                canvas.style.cursor = "move";
            } else {
                dragging = true;
                canvas.style.cursor = "grabbing";
            }
            redraw();
            return;
        }

        // --- Disjoint Channel hit test ---
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type !== "disjoint") continue;

            const hit = getDisjointHandle(x, y, d);
            if (hit) {
                selectedLineIndex = i;
                resizing = { type: "disjoint", handle: hit };   // << FIXED HERE
                dragLast = { x, y };
                redraw();
                return;
            }
        }


        // --- Pitchfan hit test ---
        for (let i = drawings.length - 1; i >= 0; i--) {
            const d = drawings[i];
            if (d.type !== "pitchfan") continue;

            const hit = isPointNearPitchfan(x, y, d);
            if (!hit) continue;

            selectedLineIndex = i;
            resizing = { type: "pitchfan", handle: hit };
            dragLast = { x, y };
            redraw();
            return;
        }





        // Lines default
        for (let i = drawings.length - 1; i >= 0; i--) {
            const resizeSide = isPointNearEndpoint(chart, candleSeries, x, y, drawings[i]);
            if (resizeSide) {
                selectedLineIndex = i;
                resizing = resizeSide;
                canvas.style.cursor = "nwse-resize";
                redraw();
                return;
            }
            if (isPointNearLine(chart, candleSeries, x, y, drawings[i])) {
                selectedLineIndex = i;
                dragging = true;
                dragLast = { x, y };
                canvas.style.cursor = "grabbing";
                redraw();
                return;
            }
        }
        redraw();
    };

    const handleMove = (clientX, clientY) => {
        const { x, y } = getMousePosRelToContainer(clientX, clientY);

        // Pitchfork preview cursor (when drafting; not dragging an existing fork)
        if (drawingMode === "pitchfork" && selectedLineIndex === null && !dragging && !resizing) {
            pfHandleMove(x, y);
            redraw();
            // fallthrough; hover feedback still ok
        }

        // Move rectangle
        if (isDraggingRect && selectedLineIndex !== null) {
            const d = drawings[selectedLineIndex];
            const dx = x - dragLast.x;
            const dy = y - dragLast.y;
            d._px.sx += dx; d._px.ex += dx;
            d._px.sy += dy; d._px.ey += dy;
            dragLast = { x, y };
            redraw();
            return;
        }

        // Resize rectangle
        if (rectResizeCorner && selectedLineIndex !== null) {
            const d = drawings[selectedLineIndex];
            switch (rectResizeCorner) {
                case "tl": d._px.sx = x; d._px.sy = y; break;
                case "tr": d._px.ex = x; d._px.sy = y; break;
                case "bl": d._px.sx = x; d._px.ey = y; break;
                case "br": d._px.ex = x; d._px.ey = y; break;
            }
            redraw();
            return;
        }

        // Triangle point resize
        if (typeof resizing === "number" && selectedLineIndex !== null) {
            const d = drawings[selectedLineIndex];
            if (d.type === "triangle" && d._px?.points) {
                d._px.points[resizing] = { x, y };
                redraw();
                return;
            }
        }

        // Arc anchor resize
        if (typeof resizing === "number" && selectedLineIndex !== null && drawings[selectedLineIndex]?.type === "arc") {
            const d = drawings[selectedLineIndex];
            if (!d._px || !Array.isArray(d._px.points) || d._px.points.length !== 3) {
                d._px = d._px || { points: [] };
            }
            if (!d._px.points) d._px.points = [{ x, y }, { x, y }, { x, y }];
            d._px.points[resizing] = { x, y };
            redraw();
            return;
        }

        // Curve anchor resize
        if (typeof resizing === "number" && selectedLineIndex !== null && drawings[selectedLineIndex]?.type === "curve") {
            const d = drawings[selectedLineIndex];
            if (!d._px || !Array.isArray(d._px.points) || d._px.points.length !== 3) {
                d._px = d._px || { points: [{ x, y }, { x, y }, { x, y }] };
            }
            d._px.points[resizing] = { x, y };
            redraw();
            return;
        }

        // Ray anchor resize
        if (resizing && selectedLineIndex !== null && drawings[selectedLineIndex]?.type === "ray") {
            const d = drawings[selectedLineIndex];
            if (!d._px) d._px = computePixels(chart, candleSeries, d);
            if (resizing === "start") { d._px.sx = x; d._px.sy = y; }
            else if (resizing === "end") { d._px.ex = x; d._px.ey = y; }
            redraw();
            return;
        }

        // FLAT ZONE drag/resize
        if (selectedLineIndex !== null && drawings[selectedLineIndex].type === "flat_zone") {
            const d = drawings[selectedLineIndex];
            const p = d._px;
            const dx = x - dragLast.x;
            const dy = y - dragLast.y;
            if (resizing === "top-left") { p.x1 = x; p.topLeftY += dy; }
            else if (resizing === "top-right") { p.x2 = x; p.topRightY += dy; }
            else if (resizing === "bottom-left") { p.x1 = x; p.bottomY += dy; }
            else if (resizing === "bottom-right") { p.x2 = x; p.bottomY += dy; }
            else if (resizing === "top") { const diff = p.topRightY - p.topLeftY; p.topLeftY += dy; p.topRightY = p.topLeftY + diff; }
            else if (resizing === "bottom") { p.bottomY += dy; }
            else if (dragging) { p.x1 += dx; p.x2 += dx; p.topLeftY += dy; p.topRightY += dy; p.bottomY += dy; }
            dragLast = { x, y };
            redraw();
            return;
        }

        // CYCLIC drag/resize
        if (selectedLineIndex !== null && drawings[selectedLineIndex].type === "cyclic") {
            const d = drawings[selectedLineIndex];
            const p = d._px;
            const dx = x - dragLast.x;
            const dy = y - dragLast.y;
            if (resizing === "left") { p.x1 += dx; p.y1 += dy; dragLast = { x, y }; redraw(); return; }
            if (resizing === "right") { p.x2 += dx; p.y2 += dy; dragLast = { x, y }; redraw(); return; }
            if (dragging) { p.x1 += dx; p.x2 += dx; p.y1 += dy; p.y2 += dy; dragLast = { x, y }; redraw(); return; }
        }

        // ===== MOVE / RESIZE — Disjoint Channel =====
        if (selectedLineIndex !== null && drawings[selectedLineIndex].type === "disjoint") {
            const d = drawings[selectedLineIndex];

            const dx = x - dragLast.x;
            const dy = y - dragLast.y;

            // RESIZE / HANDLE DRAG
            if (resizing && resizing.type === "disjoint") {
                applyDisjointDrag(d, resizing.handle, dx, dy);
                computeDisjointPixels(chart, candleSeries, d);
                dragLast = { x, y };
                redraw();
                return;
            }

            // DRAG WHOLE SHAPE
            if (dragging) {
                applyDisjointDrag(d, "inside", dx, dy);
                computeDisjointPixels(chart, candleSeries, d);
                dragLast = { x, y };
                redraw();
                return;
            }
        }

        // ===== MOVE / RESIZE — Pitchfan =====
        if (selectedLineIndex !== null && drawings[selectedLineIndex].type === "pitchfan") {
            const d = drawings[selectedLineIndex];
            const dx = x - dragLast.x;
            const dy = y - dragLast.y;

            if (resizing && resizing.type === "pitchfan") {
                applyPitchfanDrag(d, resizing.handle, dx, dy);
                computePitchfanPixels(chart, candleSeries, d);
                dragLast = { x, y };
                redraw();
                return;
            }

            if (dragging) {
                applyPitchfanDrag(d, "inside", dx, dy);
                computePitchfanPixels(chart, candleSeries, d);
                dragLast = { x, y };
                redraw();
                return;
            }
        }




        // ANGLE drag/resize
        if (selectedLineIndex !== null && drawings[selectedLineIndex].type === "angle") {
            const d = drawings[selectedLineIndex];
            d._px = d._px || {};
            const dx = x - dragLast.x;
            const dy = y - dragLast.y;

            if (resizing === "start") {
                d._px.sx = x; d._px.sy = y;
                d.start.time = chart.timeScale().coordinateToTime(x);
                d.start.price = candleSeries.coordinateToPrice(y);
                dragLast = { x, y };
                redraw();
                return;
            }
            if (resizing === "end") {
                d._px.ex = x; d._px.ey = y;
                d.end.time = chart.timeScale().coordinateToTime(x);
                d.end.price = candleSeries.coordinateToPrice(y);
                dragLast = { x, y };
                redraw();
                return;
            }
            if (dragging) {
                d._px.sx += dx; d._px.sy += dy;
                d._px.ex += dx; d._px.ey += dy;
                d.start.time = chart.timeScale().coordinateToTime(d._px.sx);
                d.start.price = candleSeries.coordinateToPrice(d._px.sy);
                d.end.time = chart.timeScale().coordinateToTime(d._px.ex);
                d.end.price = candleSeries.coordinateToPrice(d._px.ey);
                dragLast = { x, y };
                redraw();
                return;
            }
        }

        // ---- Pitchfork resize / drag ----
        if (selectedLineIndex !== null && drawings[selectedLineIndex].type === "pitchfork") {
            const d = drawings[selectedLineIndex];
            const p = d._px;
            const dx = x - dragLast.x;
            const dy = y - dragLast.y;

            // Move B
            if (resizing === "left") {
                p.b.x += dx;
                p.b.y += dy;
            }

            // Move A
            else if (resizing === "mid") {
                p.a.x += dx;
                p.a.y += dy;
            }

            // Move C
            else if (resizing === "right") {
                p.c.x += dx;
                p.c.y += dy;
            }

            // Drag entire tool
            else if (dragging) {
                p.a.x += dx; p.a.y += dy;
                p.b.x += dx; p.b.y += dy;
                p.c.x += dx; p.c.y += dy;
            }

            // ---- IMPORTANT FIX ----
            // Update semantic points
            const toTime = px => chart.timeScale().coordinateToTime(px);
            const toPrice = py => candleSeries.coordinateToPrice(py);

            d.start = { time: toTime(p.a.x), price: toPrice(p.a.y), x: p.a.x, y: p.a.y };
            d.mid = { time: toTime(p.b.x), price: toPrice(p.b.y), x: p.b.x, y: p.b.y };
            d.end = { time: toTime(p.c.x), price: toPrice(p.c.y), x: p.c.x, y: p.c.y };

            // ---- THE REAL FIX ----
            // Recompute direction + passPoints + all lines
            computePitchforkPixels(chart, candleSeries, d);

            dragLast = { x, y };
            redraw();
            return;
        }








        // Original drag logic
        if (dragging && selectedLineIndex !== null) {
            const dx = x - dragLast.x;
            const dy = y - dragLast.y;
            const d = drawings[selectedLineIndex];

            if (d.type === "arc" && d._px?.points) {
                d._px.points.forEach((p) => { p.x += dx; p.y += dy; });
                dragLast = { x, y };
                redraw();
                return;
            }

            if (d.type === "curve" && d._px?.points) {
                d._px.points.forEach((p) => { p.x += dx; p.y += dy; });
                dragLast = { x, y };
                redraw();
                return;
            }

            if (d.type === "triangle" && d._px?.points) {
                for (const pt of d._px.points) { pt.x += dx; pt.y += dy; }
            } else {
                d._px.sx += dx; d._px.sy += dy;
                d._px.ex += dx; d._px.ey += dy;

                try {
                    const newT1 = chart.timeScale().coordinateToTime(d._px.sx);
                    const newT2 = chart.timeScale().coordinateToTime(d._px.ex);
                    const newP1 = candleSeries.coordinateToPrice(d._px.sy);
                    const newP2 = candleSeries.coordinateToPrice(d._px.ey);
                    if (newT1 && newT2 && Number.isFinite(newP1) && Number.isFinite(newP2)) {
                        d.start = { ...d.start, time: newT1, price: newP1 };
                        d.end = { ...d.end, time: newT2, price: newP2 };
                    }
                } catch { }
            }

            dragLast = { x, y };
            redraw();
            return;
        }

        // Parallel channel move/stretch
        if (channelHandle && selectedLineIndex !== null) {
            const d = drawings[selectedLineIndex];
            const p = d._px;
            const dx = x - dragLast.x;
            const dy = y - dragLast.y;

            if (channelHandle === "start") { p.sx += dx; p.sy += dy; p.ex += dx; p.ey += dy; }
            else if (channelHandle === "end") { p.ex += dx; p.ey += dy; }
            else if (channelHandle === "mid") { const stretch = dy; p.offset = Math.max(5, p.offset + stretch); }

            dragLast = { x, y };
            redraw();
            return;
        }

        if (resizing && selectedLineIndex !== null) {
            const d = drawings[selectedLineIndex];
            if (d.type === "ray") { if (!d._px) d._px = computePixels(chart, candleSeries, d); }
            if (resizing === "start") { d._px.sx = x; d._px.sy = y; }
            else { d._px.ex = x; d._px.ey = y; }
            redraw();
            return;
        }

        if (drawingMode && drawingMode !== "pitchfork" && startPoint) {
            const time = chart.timeScale().coordinateToTime(x);
            const price = candleSeries.coordinateToPrice(y);
            tempEnd = { x, y, time, price, _px: { ex: x, ey: y } };
            redraw();
        }

        // ===== Disjoint Channel preview =====
        if (drawingMode === "disjoint" && startPoint) {
            tempEnd = { x, y };
            redraw();
            return;
        }

    };

    const handleUp = (clientX, clientY) => {
        isDraggingRect = false;
        channelHandle = null;

        rectResizeCorner = null;
        if (dragging) {
            dragging = false;
            dragLast = null;
        }

        // ===== Finalize Disjoint Channel =====
        if (drawingMode === "disjoint" && startPoint && tempEnd) {

            const ch = makeDisjointChannel(
                startPoint.x,
                startPoint.y,
                tempEnd.x,
                tempEnd.y,
                defaultColor
            );

            drawings.push(ch);
            selectedLineIndex = drawings.length - 1;

            drawingMode = null;
            startPoint = null;
            tempEnd = null;

            redraw();
            return;
        }

        if (drawingMode === "pitchfan" && startPoint && tempEnd) {
            const fan = makePitchfan(startPoint.x, startPoint.y, defaultColor);
            drawings.push(fan);
            selectedLineIndex = drawings.length - 1;

            drawingMode = null;
            startPoint = null;
            tempEnd = null;

            redraw();
            return;
        }



        if (typeof resizing === "number" && selectedLineIndex !== null) {
            const d = drawings[selectedLineIndex];
            if (d.type === "triangle" && d._px?.points) {
                d.points = d._px.points.map(pt => ({ x: pt.x, y: pt.y }));
            }

            if (selectedLineIndex !== null && drawings[selectedLineIndex].type === "cyclic") {
                const d2 = drawings[selectedLineIndex];
                d2.x1 = d2._px.x1;
                d2.spacing = d2._px.spacing;
                resizing = null;
                dragging = false;
                dragLast = null;
                redraw();
            }

            if (d.type === "arc" && d._px?.points) {
                try {
                    const pts = d._px.points;
                    const toTime = (px) => chart.timeScale().coordinateToTime(px);
                    const toPrice = (py) => candleSeries.coordinateToPrice(py);
                    d.start = { time: toTime(pts[0].x), price: toPrice(pts[0].y) };
                    d.mid = { time: toTime(pts[1].x), price: toPrice(pts[1].y) };
                    d.end = { time: toTime(pts[2].x), price: toPrice(pts[2].y) };
                } catch { }
            }

            if (d.type === "curve" && d._px?.points) {
                try {
                    const pts = d._px.points;
                    const toTime = (px) => chart.timeScale().coordinateToTime(px);
                    const toPrice = (py) => candleSeries.coordinateToPrice(py);
                    d.start = { time: toTime(pts[0].x), price: toPrice(pts[0].y) };
                    d.mid = { time: toTime(pts[1].x), price: toPrice(pts[1].y) };
                    d.end = { time: toTime(pts[2].x), price: toPrice(pts[2].y) };
                } catch { }
            }
            resizing = null;
            redraw();
            return;
        }

        if (resizing) {
            const d = drawings[selectedLineIndex];
            try {
                const newT1 = chart.timeScale().coordinateToTime(d._px.sx);
                const newT2 = chart.timeScale().coordinateToTime(d._px.ex);
                const newP1 = candleSeries.coordinateToPrice(d._px.sy);
                const newP2 = candleSeries.coordinateToPrice(d._px.ey);
                if (newT1 && newT2 && Number.isFinite(newP1) && Number.isFinite(newP2)) {
                    d.start = { ...d.start, time: newT1, price: newP1 };
                    d.end = { ...d.end, time: newT2, price: newP2 };
                }
            } catch { }
            resizing = null;
            redraw();
            return;
        }

        // // ----- Pitchfork 3-click creation here -----
        // if (drawingMode === "pitchfork") {
        //     const { x, y } = getMousePosRelToContainer(clientX, clientY);
        //     const time = chart.timeScale().coordinateToTime(x);
        //     const price = candleSeries.coordinateToPrice(y);
        //     pfHandleUp(x, y, time, price); // A -> B -> C -> finalize
        //     redraw();
        //     return;
        // }

        if (!drawingMode || !startPoint) return;
        const { x, y } = getMousePosRelToContainer(clientX, clientY);
        const time = chart.timeScale().coordinateToTime(x);
        const price = candleSeries.coordinateToPrice(y);
        tempEnd = { x, y, time, price, _px: { ex: x, ey: y } };

        const drawingData =
            drawingMode === "horizontal"
                ? {
                    type: "horizontal",
                    start: { ...startPoint },
                    end: { ...tempEnd },
                    color: defaultColor,
                    style: defaultStyle,
                    _px: { sx: 0, sy: startPoint.y, ex: canvas.width, ey: startPoint.y },
                }
                : drawingMode === "vertical"
                    ? {
                        type: "vertical",
                        start: { ...startPoint },
                        end: { ...tempEnd },
                        color: defaultColor,
                        style: defaultStyle,
                        _px: { sx: startPoint.x, sy: 0, ex: startPoint.x, ey: canvas.height },
                    }
                    : drawingMode === "flat_zone"
                        ? {
                            type: "flat_zone",
                            color: defaultColor,
                            style: defaultStyle,
                            topY: startPoint.y,
                            bottomY: tempEnd.y,
                            _px: {
                                x1: startPoint.x,
                                x2: tempEnd.x,
                                topLeftY: startPoint.y,
                                topRightY: startPoint.y,
                                bottomY: tempEnd.y
                            }
                        }
                        : drawingMode === "disjoint"
                            ? makeDisjointChannel(startPoint.x, startPoint.y, tempEnd.x, tempEnd.y, defaultColor)

                            : drawingMode === "cyclic"
                                ? {
                                    type: "cyclic",
                                    color: defaultColor,
                                    style: defaultStyle,
                                    x1: startPoint.x,
                                    x2: tempEnd.x,
                                    _px: { x1: startPoint.x, x2: tempEnd.x }
                                }
                                : drawingMode === "angle"
                                    ? {
                                        type: "angle",
                                        color: defaultColor,
                                        style: defaultStyle,
                                        start: { ...startPoint },
                                        end: { ...tempEnd },
                                        _px: { sx: startPoint.x, sy: startPoint.y, ex: tempEnd.x, ey: tempEnd.y }
                                    }
                                    : drawingMode === "rectangle"
                                        ? {
                                            type: "rectangle",
                                            start: { ...startPoint },
                                            end: { ...tempEnd },
                                            color: defaultColor,
                                            style: defaultStyle,
                                            fill: "rgba(96,165,250,0.1)",
                                            _px: { sx: startPoint.x, sy: startPoint.y, ex: tempEnd.x, ey: tempEnd.y },
                                        }
                                        : drawingMode === "parallel"
                                            ? {
                                                type: "parallel",
                                                start: { ...startPoint },
                                                end: { ...tempEnd },
                                                color: defaultColor,
                                                style: defaultStyle,
                                                offset: 40,
                                                _px: { sx: startPoint.x, sy: startPoint.y, ex: tempEnd.x, ey: tempEnd.y, offset: 40 },
                                            }
                                            : drawingMode === "ray"
                                                ? {
                                                    type: "ray",
                                                    start: { ...startPoint },
                                                    end: { ...tempEnd },
                                                    color: defaultColor,
                                                    style: defaultStyle,
                                                    _px: { sx: startPoint.x, sy: startPoint.y, ex: tempEnd.x, ey: tempEnd.y },
                                                }
                                                : drawingMode === "crossline"
                                                    ? {
                                                        type: "crossline",
                                                        start: { ...startPoint },
                                                        end: { ...tempEnd },
                                                        color: defaultColor,
                                                        style: defaultStyle,
                                                        _px: { sx: startPoint.x, sy: startPoint.y },
                                                    }
                                                    : drawingMode === "extended"
                                                        ? {
                                                            type: "extended",
                                                            start: { ...startPoint },
                                                            end: { ...tempEnd },
                                                            color: defaultColor,
                                                            style: defaultStyle,
                                                            _px: { sx: startPoint.x, sy: startPoint.y, ex: tempEnd.x, ey: tempEnd.y },
                                                        }
                                                        : drawingMode === "triangle"
                                                            ? {
                                                                type: "triangle",
                                                                color: defaultColor,
                                                                style: defaultStyle,
                                                                fill: "rgba(96,165,250,0.1)",
                                                                points: [
                                                                    { x: startPoint.x, y: startPoint.y },
                                                                    { x: tempEnd.x, y: tempEnd.y },
                                                                    { x: tempEnd.x + 40, y: tempEnd.y + 40 },
                                                                ],
                                                                _px: {
                                                                    points: [
                                                                        { x: startPoint.x, y: startPoint.y },
                                                                        { x: tempEnd.x, y: tempEnd.y },
                                                                        { x: tempEnd.x + 40, y: tempEnd.y + 40 },
                                                                    ],
                                                                },
                                                            }
                                                            : drawingMode === "arc"
                                                                ? {
                                                                    type: "arc",
                                                                    color: defaultColor,
                                                                    style: defaultStyle,
                                                                    _px: {
                                                                        points: [
                                                                            { x: startPoint.x, y: startPoint.y },
                                                                            { x: (startPoint.x + tempEnd.x) / 2, y: startPoint.y - 50 },
                                                                            { x: tempEnd.x, y: tempEnd.y },
                                                                        ],
                                                                    },
                                                                    start: { ...startPoint },
                                                                    end: { ...tempEnd },
                                                                }
                                                                : drawingMode === "curve"
                                                                    ? {
                                                                        type: "curve",
                                                                        color: defaultColor,
                                                                        style: defaultStyle,
                                                                        _px: {
                                                                            points: [
                                                                                { x: startPoint.x, y: startPoint.y },
                                                                                { x: (startPoint.x + tempEnd.x) / 2, y: startPoint.y - 50 },
                                                                                { x: tempEnd.x, y: tempEnd.y },
                                                                            ],
                                                                        },
                                                                        start: { ...startPoint },
                                                                        end: { ...tempEnd },
                                                                    }
                                                                    : {
                                                                        type: "trend",
                                                                        start: { ...startPoint },
                                                                        end: { ...tempEnd },
                                                                        color: defaultColor,
                                                                        style: defaultStyle,
                                                                        _px: { sx: startPoint.x, sy: startPoint.y, ex: tempEnd.x, ey: tempEnd.y },
                                                                    };

        drawings.push(drawingData);
        startPoint = null;
        tempEnd = null;
        redraw();
    };

    container.addEventListener("mousedown", (e) => handleDown(e.clientX, e.clientY, e));
    container.addEventListener("mousemove", (e) => { handleMove(e.clientX, e.clientY); refreshPointerCapture(e.clientX, e.clientY); });
    window.addEventListener("mouseup", (e) => handleUp(e.clientX, e.clientY));

    const onContextMenu = (e) => {
        e.preventDefault();
        const { x, y } = getMousePosRelToContainer(e.clientX, e.clientY);
        updateAllPixels();
        if (selectedLineIndex !== null) {
            drawings.splice(selectedLineIndex, 1);
            selectedLineIndex = null;
            redraw();
            return;
        }
        for (let i = drawings.length - 1; i >= 0; i--) {
            if (isPointNearLine(chart, candleSeries, x, y, drawings[i])) {
                drawings.splice(i, 1);
                selectedLineIndex = null;
                redraw();
                return;
            }
        }
    };

    const onKeyDown = (e) => {
        if ((e.key === "Delete" || e.key === "Backspace") && selectedLineIndex !== null) {
            drawings.splice(selectedLineIndex, 1);
            selectedLineIndex = null;
            redraw();
        }
    };

    chart.timeScale().subscribeVisibleTimeRangeChange(() => requestAnimationFrame(redraw));
    chart.timeScale().subscribeVisibleLogicalRangeChange?.(() => requestAnimationFrame(redraw));

    container.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("keydown", onKeyDown);

    return {
        setMode: (mode) => {
            const active = !!mode;
            drawingMode = active ? mode : null;
            canvas.style.pointerEvents = active ? "auto" : "none";
            canvas.style.cursor = active ? "crosshair" : "default";
            if (!active) {
                startPoint = null; tempEnd = null;
                dragging = false; resizing = null; dragLast = null;
                rectResizeCorner = null; isDraggingRect = false;
                pfReset(); // reset pitchfork draft when leaving drawing mode
            }
            redraw();
        },
        setStyleOptions: ({ color, style }) => {
            if (color) defaultColor = color;
            if (style) defaultStyle = style;
            if (color || style) {
                drawings.forEach((d) => {
                    if (color) d.color = color;
                    if (style) d.style = style;
                });
            }
            redraw();
        },

        clear: () => { drawings.length = 0; selectedLineIndex = null; redraw(); },
        export: () => drawings.map((d) => ({
            start: { time: d.start?.time, price: d.start?.price },
            end: { time: d.end?.time, price: d.end?.price },
            color: d.color, style: d.style,
        })),
        load: (arr) => {
            drawings.length = 0;
            for (const item of arr || []) {
                if (item?.start && item?.end) {
                    drawings.push({
                        start: { ...item.start },
                        end: { ...item.end },
                        color: item.color || defaultColor,
                        style: item.style || defaultStyle,
                        _px: null,
                    });
                }
            }
            redraw();
        },
        destroy: () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mouseup", handleUp);
            window.removeEventListener("keydown", onKeyDown);
            chart.timeScale().unsubscribeVisibleTimeRangeChange?.(redraw);
            chart.timeScale().unsubscribeVisibleLogicalRangeChange?.(redraw);
            container.removeEventListener("mousemove", onContainerMouseMove);
            container.removeEventListener("contextmenu", onContextMenu);
            try { canvas.remove(); } catch { }
        }
    };
}
