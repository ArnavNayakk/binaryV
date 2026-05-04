import { useEffect } from "react";

export default function useAreaOverlay({
  showAreaOverlay,
  chartRef,
  candleSeriesRef,
  areaSeriesRef,
  candlesRef,
  clampVisibleRangeRight,
  updatePriceFormat,       // pass from LiveChart
  displayPrecisionRef,     // pass from LiveChart
}) {
  useEffect(() => {
    const chart = chartRef.current;
    const candle = candleSeriesRef.current;
    if (!chart || !candle) return;

    const ts = chart.timeScale();

    // Snapshot current viewport
    let prevLogical = null;
    let prevBarSpacing = null;
    try {
      prevLogical = ts.getVisibleLogicalRange();
      prevBarSpacing = ts.options()?.barSpacing ?? null;
    } catch {}

    // Ensure area exists
    if (!areaSeriesRef.current) {
      try {
        const area = chart.addAreaSeries({
          topColor: "rgba(96, 165, 250, 0.25)",
          bottomColor: "rgba(96, 165, 250, 0.04)",
          lineColor: "#60a5fa",
          lineWidth: 1.5,
          priceLineVisible: false,
          lastValueVisible: false,
          priceScaleId: "right",
          crosshairMarkerVisible: false,
          autoscaleInfoProvider: () => null,
          visible: !!showAreaOverlay,
        });
        areaSeriesRef.current = area;

        // Seed data once
        const candles = candlesRef.current ?? [];
        if (candles.length) {
          try { area.setData(candles.map((c) => ({ time: c.time, value: c.close }))); } catch {}
          // Match candle precision/format
          try {
            const latest = candles[candles.length - 1]?.close;
            if (latest != null) {
              updatePriceFormat?.(area, latest, displayPrecisionRef);
            }
          } catch {}
        }
      } catch {}
    } else {
      // Toggle visibility only
      try { areaSeriesRef.current.applyOptions({ visible: !!showAreaOverlay }); } catch {}
      // If enabling and no data yet, seed from candles
      if (showAreaOverlay) {
        const candles = candlesRef.current ?? [];
        if (candles.length) {
          try { areaSeriesRef.current.setData(candles.map((c) => ({ time: c.time, value: c.close }))); } catch {}
          try {
            const latest = candles[candles.length - 1]?.close;
            if (latest != null) {
              updatePriceFormat?.(areaSeriesRef.current, latest, displayPrecisionRef);
            }
          } catch {}
        }
      }
    }

    // Restore viewport
    try {
      const restoreOpts = {};
      if (prevBarSpacing != null) restoreOpts.barSpacing = prevBarSpacing;
      restoreOpts.rightOffset = 0;
      ts.applyOptions(restoreOpts);
      if (prevLogical) ts.setVisibleLogicalRange(prevLogical);
    } catch {}

    // Post adjust
    requestAnimationFrame(() => {
      try { clampVisibleRangeRight(); } catch {}
    });
  }, [
    showAreaOverlay,
    chartRef,
    candleSeriesRef,
    areaSeriesRef,
    candlesRef,
    clampVisibleRangeRight,
    updatePriceFormat,
    displayPrecisionRef,
  ]);
}
