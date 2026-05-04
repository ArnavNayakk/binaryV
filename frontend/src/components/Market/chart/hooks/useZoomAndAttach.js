import { useCallback, useEffect, useRef } from "react";
import { FUTURE_BAR_COUNT } from "../utils/constants.js";

export default function useZoomAndAttach({
  chartRef,
  containerRef, // pass chartContainerRef from LiveChart
  candlesRef,
  deviceType,
  orientation,
  getZoomLimits,
}) {
  const isSettingRangeRef = useRef(false);
  const isAttachedRef = useRef(true);
  const rightGap = deviceType === "mobile" ? 6 : deviceType === "tablet" ? 8 : 10;

  const clampToRightEdge = useCallback(
    (ts) => {
      if (!ts) return;
      const vr = ts.getVisibleLogicalRange();
      if (!vr) return;
      const width = Math.max(1, vr.to - vr.from);
      const totalBars = (candlesRef.current?.length ?? 0) + FUTURE_BAR_COUNT;
      const to = totalBars - 0.5;
      const from = Math.max(0, to - width);
      isSettingRangeRef.current = true;
      try {
        ts.setVisibleLogicalRange({ from, to });
        ts.applyOptions({ rightOffset: rightGap }); // keep breathing room
      } finally {
        requestAnimationFrame(() => {
          isSettingRangeRef.current = false;
        });
      }
    },
    [candlesRef, rightGap]
  );

  const clampVisibleRangeRight = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const ts = chart.timeScale();
    if (!ts) return;
    const vr = ts.getVisibleLogicalRange();
    if (!vr) return;
    const totalBars = (candlesRef.current?.length ?? 0) + FUTURE_BAR_COUNT;
    const maxTo = totalBars - 0.5;
    const width = Math.max(1, vr.to - vr.from);

    if (isAttachedRef.current) {
      clampToRightEdge(ts);
      return;
    }

    let to = Math.min(vr.to, maxTo);
    let from = to - width;
    if (from < 0) {
      from = 0;
      to = width;
    }

    if (Math.abs(vr.to - to) < 0.001 && Math.abs(vr.from - from) < 0.001) return;

    isSettingRangeRef.current = true;
    try {
      ts.setVisibleLogicalRange({ from, to });
      ts.applyOptions({ rightOffset: rightGap }); // preserve gap even when detached
    } finally {
      requestAnimationFrame(() => {
        isSettingRangeRef.current = false;
      });
    }
  }, [chartRef, candlesRef, clampToRightEdge, rightGap]);

  useEffect(() => {
    const chart = chartRef.current;
    let el = containerRef?.current;
    if (!chart || !(el instanceof Element)) return;

    const parentEl = el.parentElement instanceof Element ? el.parentElement : null;

    try {
      chart.applyOptions({
        handleScale: {
          ...(chart.options?.().handleScale ?? {}),
          mouseWheel: deviceType !== "mobile",
          pinch: true,
          axisDoubleClickReset: deviceType !== "mobile",
        },
      });
    } catch {}

    const ts = chart.timeScale();
    if (!ts) return;

    // --- ✅ Added stability improvements ---
    try {
      ts.applyOptions({
        rightBarStaysOnScroll: true,
        autoScale: true,
      });
    } catch {}

    const { MIN_SPACING, MAX_SPACING } = getZoomLimits();

    // --- Prevent LC from initializing with wrong spacing ---
    try {
      const cur = ts.options().barSpacing || 10;
      if (cur > MAX_SPACING) ts.applyOptions({ barSpacing: MAX_SPACING });
      if (cur < MIN_SPACING) ts.applyOptions({ barSpacing: MIN_SPACING });
    } catch {}

    const onWheel = (e) => {
      const zoomIn = e.deltaY < 0;
      const zoomOut = e.deltaY > 0;
      const spacing = ts.options().barSpacing;

      if (zoomIn && spacing >= MAX_SPACING) {
        e.preventDefault();
        e.stopPropagation();
        ts.applyOptions({ barSpacing: MAX_SPACING });
        return;
      }
      if (zoomOut && spacing <= MIN_SPACING) {
        e.preventDefault();
        e.stopPropagation();
        ts.applyOptions({ barSpacing: MIN_SPACING });
        return;
      }

      // clamp after LC updates
      requestAnimationFrame(() => {
        const s = ts.options().barSpacing;
        if (s > MAX_SPACING) ts.applyOptions({ barSpacing: MAX_SPACING });
        else if (s < MIN_SPACING) ts.applyOptions({ barSpacing: MIN_SPACING });
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    if (parentEl && parentEl !== el) parentEl.addEventListener("wheel", onWheel, { passive: false });

    // --- Debounced initial right-edge clamp ---
    const initTimer = setTimeout(() => {
      try {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect?.width > 30 && rect?.height > 30) {
          clampToRightEdge(ts);
        }
      } catch {}
    }, 150);

    const unsub = ts.subscribeVisibleLogicalRangeChange((range) => {
      if (!range || isSettingRangeRef.current) return;
      clampVisibleRangeRight();
    });

    return () => {
      clearTimeout(initTimer);
      try {
        el.removeEventListener("wheel", onWheel);
      } catch {}
      try {
        if (parentEl && parentEl !== el) parentEl.removeEventListener("wheel", onWheel);
      } catch {}
      try {
        if (typeof unsub === "function") unsub();
      } catch {}
    };
  }, [chartRef, containerRef, getZoomLimits, clampVisibleRangeRight, deviceType, orientation, clampToRightEdge]);

  const applyInteractionMode = useCallback(
    (attachedNow) => {
      const chart = chartRef.current;
      if (!chart) return;
      const ts = chart.timeScale();

      chart.applyOptions({
        handleScroll: {
          mouseWheel: deviceType !== "mobile",
          horzTouchDrag: !attachedNow,
          vertTouchDrag: false,
          pressedMouseMove: !attachedNow,
        },
        handleScale: {
          ...(chart.options?.().handleScale ?? {}),
          mouseWheel: deviceType !== "mobile",
          pinch: true,
          axisDoubleClickReset: deviceType !== "mobile",
        },
      });

      isAttachedRef.current = attachedNow;

      // ensure auto-scale + right-bar-stays-on-scroll consistency
      try {
        ts.applyOptions({ rightBarStaysOnScroll: true, autoScale: true });
      } catch {}

      if (attachedNow) {
        if (ts) clampToRightEdge(ts);
      } else {
        clampVisibleRangeRight();
      }
    },
    [chartRef, deviceType, clampToRightEdge, clampVisibleRangeRight]
  );

  return { applyInteractionMode, clampVisibleRangeRight, isAttachedRef, isSettingRangeRef };
}
