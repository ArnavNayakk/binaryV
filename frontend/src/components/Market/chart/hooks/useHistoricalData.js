import { useEffect } from "react";
import { MAX_HISTORY } from "../utils/constants.js";
import { safeSetData } from "../utils/seriesGuards.js";

export default function useHistoricalData({
  symbol,
  interval,
  chartRef,
  candleSeriesRef,
  volumeSeriesRef,
  overlaySeriesRefs,
  candlesRef,
  lastTickRef,
  currentPriceRef,
  displayPrecisionRef,
  updatePriceFormat,
  getPricePrecision,
  stepFor,
  prepareIndicators,
  afterSeed,
}) {
  useEffect(() => {
    const controller = new AbortController();
    const timeScale = chartRef.current?.timeScale();

    const fetchHistoricalData = async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (controller.signal.aborted) return;

        const data = await res.json();
        if (controller.signal.aborted) return;

        const raw = Array.isArray(data) ? data : [];
        const candles = raw
          .filter((i) => Array.isArray(i) && i.length >= 6)
          .map((i) => {
            const t = Number(i[0]);
            const open = Number(i[1]);
            const high = Number(i[2]);
            const low = Number(i[3]);
            const close = Number(i[4]);
            const volume = i[5] != null ? Number(i[5]) : 0;
            return {
              time: Number.isFinite(t) ? Math.floor(t / 1000) : NaN,
              open: Number.isFinite(open) ? open : NaN,
              high: Number.isFinite(high) ? high : NaN,
              low: Number.isFinite(low) ? low : NaN,
              close: Number.isFinite(close) ? close : NaN,
              volume: Number.isFinite(volume) ? volume : 0,
            };
          })
          .filter(
            (c) =>
              Number.isFinite(c.time) &&
              Number.isFinite(c.open) &&
              Number.isFinite(c.high) &&
              Number.isFinite(c.low) &&
              Number.isFinite(c.close)
          );

        if (controller.signal.aborted) return;

        if (candles.length > MAX_HISTORY) candles.splice(0, candles.length - MAX_HISTORY);
        candlesRef.current = candles.slice();

        safeSetData(
          candleSeriesRef.current,
          candles.map((c) => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
        );

        try {
          const totalBarsInitial = Math.max(0, candles.length);
          const toInit = totalBarsInitial - 0.5;
          const fromInit = Math.max(0, toInit - 50);
          timeScale?.setVisibleLogicalRange({ from: fromInit, to: toInit });
          timeScale?.applyOptions({ rightOffset: 0 });
        } catch {}

        try {
          if (volumeSeriesRef.current && candles.length) {
            volumeSeriesRef.current.setData(
              candles.map((c) => ({
                time: c.time,
                value: c.volume,
                color: (c.close ?? 0) >= (c.open ?? 0) ? "#16a34a" : "#ef4444",
              }))
            );
          }
        } catch {}

        prepareIndicators?.(candles, overlaySeriesRefs);

        const latest = candles[candles.length - 1]?.close;
        if (latest != null && !controller.signal.aborted) {
          lastTickRef.current = candles[candles.length - 1];
          currentPriceRef.current = latest;
          displayPrecisionRef.current = getPricePrecision(latest ?? 0);
          updatePriceFormat(candleSeriesRef.current, latest, displayPrecisionRef);
        }

        if (!controller.signal.aborted) afterSeed?.(candles);
      } catch (err) {
        // Ignore aborts during unmount/StrictMode replays
        if (err?.name === "AbortError" || err?.code === 20 || String(err?.message || "").includes("aborted")) {
          return;
        }
        if (process.env.NODE_ENV !== "production") {
          console.warn("fetchHistoricalData error", err);
        }
      }
    };

    fetchHistoricalData();
    return () => controller.abort();
  }, [
    symbol, interval, chartRef,
    candleSeriesRef, volumeSeriesRef, overlaySeriesRefs,
    candlesRef, lastTickRef, currentPriceRef, displayPrecisionRef,
    updatePriceFormat, getPricePrecision, stepFor, prepareIndicators, afterSeed
  ]);
}
