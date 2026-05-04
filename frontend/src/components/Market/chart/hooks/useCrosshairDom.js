import { useEffect, useRef } from "react";
import { pxClamp, createVertLine, createHorzLine } from "../utils/dom.js";

export default function useCrosshairDom({
  chartRef,
  containerRef,
  nearestByTime,
  getPricePrecision,
  deviceType,
  orientation,
  setLegend,
  setTooltip,
}) {
  const domVertRef = useRef(null);
  const domHorzRef = useRef(null);
  const rafIdRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const chart = chartRef.current;
    if (!container || !chart) return;

    // create DOM lines
    const vertEl = createVertLine();
    const horzEl = createHorzLine();
    container.appendChild(vertEl);
    container.appendChild(horzEl);
    domVertRef.current = vertEl;
    domHorzRef.current = horzEl;

    const onMove = (param) => {
      if (!param || !param.point || param.point.x == null || param.point.y == null) {
        if (domVertRef.current) domVertRef.current.style.display = "none";
        if (domHorzRef.current) domHorzRef.current.style.display = "none";
        setTooltip((t) => (t.pos?.visible ? { ...t, pos: { ...t.pos, visible: false } } : t));
        return;
      }

      const rect = container.getBoundingClientRect();
      const px = pxClamp(param.point.x, 0, rect.width);  // actual mouse X (pixels)
      const py = pxClamp(param.point.y, 0, rect.height); // actual mouse Y (pixels)
      const hoveredTime = param.time;

      // nearest candle (used for legend/tooltip and snapped vertical DOM)
      const { bar: hoveredBar } = nearestByTime(hoveredTime);
      if (!hoveredBar) {
        if (domVertRef.current) domVertRef.current.style.display = "none";
        if (domHorzRef.current) domHorzRef.current.style.display = "none";
        setTooltip((t) => (t.pos?.visible ? { ...t, pos: { ...t.pos, visible: false } } : t));
        return;
      }

      // X coordinate for DOM vertical line (snapped to candle)
      const snappedX = chart.timeScale().timeToCoordinate(hoveredBar.time) ?? px;

      // show DOM lines immediately (avoid flicker)
      if (domVertRef.current) domVertRef.current.style.display = "block";
      if (domHorzRef.current) domHorzRef.current.style.display = "block";

      // update DOM lines on RAF
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (snappedX != null && domVertRef.current) {
            domVertRef.current.style.left = `${Math.round(snappedX)}px`; // keep visual vertical snapped
          }
          if (py != null && domHorzRef.current) {
            domHorzRef.current.style.top = `${Math.round(py)}px`;
          }
          rafIdRef.current = null;
        });
      }

      // convert pixel Y to price (important)
      let priceAtY;
      try {
        const priceScale = chart.priceScale("right");
        priceAtY = priceScale.coordinateToPrice(py);
      } catch (err) {
        priceAtY = null;
      }

      // move built-in internal crosshair to (mouseX px, priceAtY)
      // IMPORTANT: we use px (mouse X) here — not snappedX — so price label follows the horizontal line
      try {
        if (typeof priceAtY === "number" && isFinite(priceAtY)) {
          chart.moveCrosshair({ x: px, y: priceAtY });
        } else {
          // fallback: still move using px only (some LC builds accept px for x)
          chart.moveCrosshair?.({ x: px });
        }
      } catch {}

      // legend & tooltip (still derived from hoveredBar)
      const prec = getPricePrecision(hoveredBar.close ?? 0);
      const fmt = (v, p = prec) => (typeof v === "number" ? v.toFixed(p) : v);
      const change = (hoveredBar.close ?? 0) - (hoveredBar.open ?? 0);
      const changePercent = (change / Math.max(hoveredBar.open ?? 1, 1e-9)) * 100;
      const isPositive = change >= 0;

      setLegend({
        open: fmt(hoveredBar.open),
        high: fmt(hoveredBar.high),
        low: fmt(hoveredBar.low),
        close: fmt(hoveredBar.close),
        change: change.toFixed(prec),
        pct: changePercent.toFixed(2),
        isPositive,
        time: new Date((hoveredBar.time ?? 0) * 1000),
      });

      if (!(deviceType === "mobile" && orientation === "portrait")) {
        const panelW = 220;
        let left = (snappedX ?? px) + 15;
        let top = (py ?? param.point.y) - 10;
        if (left + panelW > rect.width) left = (snappedX ?? px) - panelW - 15;
        if (top < 10) top = (py ?? param.point.y) + 15;
        setTooltip({
          data: {
            open: fmt(hoveredBar.open),
            high: fmt(hoveredBar.high),
            low: fmt(hoveredBar.low),
            close: fmt(hoveredBar.close),
            change: change.toFixed(prec),
            pct: changePercent.toFixed(2),
            isPositive,
            time: new Date((hoveredBar.time ?? 0) * 1000),
          },
          pos: { left: Math.max(10, left), top: Math.max(10, top) },
          visible: true,
        });
      } else {
        setTooltip((t) => (t.pos?.visible ? { ...t, pos: { ...t.pos, visible: false } } : t));
      }
    };

    try {
      chart.subscribeCrosshairMove(onMove);
    } catch {}

    return () => {
      try { chart.unsubscribeCrosshairMove(onMove); } catch {}
      if (domVertRef.current) domVertRef.current.remove();
      if (domHorzRef.current) domHorzRef.current.remove();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      domVertRef.current = null;
      domHorzRef.current = null;
    };
  }, [
    chartRef,
    containerRef,
    nearestByTime,
    getPricePrecision,
    deviceType,
    orientation,
    setLegend,
    setTooltip,
  ]);

  return { domVertRef, domHorzRef };
}
