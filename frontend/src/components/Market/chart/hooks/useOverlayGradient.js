import { useCallback, useEffect, useRef } from "react";

export default function useOverlayGradient({
  mountedRef,
  candleSeriesRef,
  chartContainerRef,
  currentPriceRef,
  tradeHoverState,
  overlayUpRef,
  overlayDownRef,
}) {
  const overlayBusyRef = useRef(false);
  const overlayRAFRef = useRef(null);
  const overlayUpdaterRef = useRef(null);

  const updateDynamicOverlay = useCallback(() => {
    if (!mountedRef.current || overlayBusyRef.current) return;
    overlayBusyRef.current = true;
    try {
      if (!tradeHoverState) {
        if (overlayUpRef.current) overlayUpRef.current.style.display = "none";
        if (overlayDownRef.current) overlayDownRef.current.style.display = "none";
        return;
      }
      const series = candleSeriesRef.current;
      const price = currentPriceRef.current;
      const container = chartContainerRef.current;
      if (!series || price == null || !container) return;
      const y = series.priceToCoordinate(price);
      if (y == null) return;
      const rect = container.getBoundingClientRect();
      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      const yClamped = clamp(y, 0, rect.height);
      const mode = tradeHoverState;
      if (overlayRAFRef.current) cancelAnimationFrame(overlayRAFRef.current);
      overlayRAFRef.current = requestAnimationFrame(() => {
        const upEl = overlayUpRef.current;
        const downEl = overlayDownRef.current;
        if (mode === "UP") {
          if (upEl) {
            upEl.style.display = "block";
            upEl.style.position = "absolute";
            upEl.style.left = "0";
            upEl.style.right = "0";
            upEl.style.top = "0";
            upEl.style.height = `${Math.max(0, yClamped)}px`;
            upEl.style.background = "linear-gradient(to bottom, rgba(34,197,94,0.12), rgba(34,197,94,0.05))";
            upEl.style.borderBottom = "1px solid rgba(34,197,94,0.3)";
            upEl.style.pointerEvents = "none";
            upEl.style.zIndex = "100";
          }
          if (downEl) downEl.style.display = "none";
        } else {
          if (downEl) {
            downEl.style.display = "block";
            downEl.style.position = "absolute";
            downEl.style.left = "0";
            downEl.style.right = "0";
            downEl.style.top = `${yClamped}px`;
            downEl.style.height = `${Math.max(0, rect.height - yClamped)}px`;
            downEl.style.background = "linear-gradient(to top, rgba(239,68,68,0.12), rgba(239,68,68,0.05))";
            downEl.style.borderTop = "1px solid rgba(239,68,68,0.3)";
            downEl.style.pointerEvents = "none";
            downEl.style.zIndex = "100";
          }
          if (upEl) upEl.style.display = "none";
        }
      });
    } finally {
      overlayBusyRef.current = false;
    }
  }, [mountedRef, candleSeriesRef, chartContainerRef, currentPriceRef, tradeHoverState, overlayUpRef, overlayDownRef]);

  useEffect(() => {
    overlayUpdaterRef.current = updateDynamicOverlay;
    updateDynamicOverlay();
    return () => {
      if (overlayRAFRef.current) cancelAnimationFrame(overlayRAFRef.current);
      overlayRAFRef.current = null;
    };
  }, [updateDynamicOverlay]);

  return { refreshOverlay: () => requestAnimationFrame(() => overlayUpdaterRef.current?.()) };
}
