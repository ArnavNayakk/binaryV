import { useEffect } from "react";
import { DRIFT_INTERVAL_MS, DRIFT_MIN_GAP_MS } from "../utils/constants.js";

export default function useDrift({
  mountedRef,
  candlesRef,
  currentPriceRef,
  displayPrecisionRef,
  lastRealTickAtRef,
  runSmoothLoop,
}) {
  useEffect(() => {
    const driftInterval = setInterval(() => {
      if (!mountedRef.current) return;
      if (performance.now() - lastRealTickAtRef.current < DRIFT_MIN_GAP_MS) return;
      const lastCandle = candlesRef.current[candlesRef.current.length - 1];
      if (!lastCandle) return;
      const base = currentPriceRef.current ?? lastCandle.close;
      if (typeof base !== "number" || !isFinite(base)) return;
      const noiseFactor = (Math.random() - 0.5) * 0.0003;
      const driftTarget = Number((base * (1 + noiseFactor)).toFixed(displayPrecisionRef.current ?? 4));
      if (Math.abs(driftTarget - base) <= 0) return;
      runSmoothLoop({ start: base, target: driftTarget, duration: 300 + Math.random() * 400 });
    }, DRIFT_INTERVAL_MS);
    return () => clearInterval(driftInterval);
  }, [mountedRef, candlesRef, currentPriceRef, displayPrecisionRef, lastRealTickAtRef, runSmoothLoop]);
}
