// IndicatorPanel.jsx
// Eliminates flicker by batching per-frame updates and throttling time-scale sync. [web:21][web:1][web:45]

import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

// Indicator calculators (adjust path as in your repo)
import {
  calculateRSI as calcRSI,
  calculateMACD as calcMACD,
  calculateStochastic as calcStoch,
  calculateMFI as calcMFI,
  calculateOBV as calcOBV,
} from "./chart/indicators.js";

const raf = (fn) => requestAnimationFrame(fn);

export default function IndicatorPanel({
  candles,
  height = 160,
  version = "rsi",
  options,
  containerRef,
  mainChartRef,
  rightGap = 8,
}) {
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const extraSeriesRef = useRef(null);
  const histSeriesRef = useRef(null);
  const unsubMainRef = useRef(null);

  // rAF batching guards
  const pendingFrameRef = useRef(0);
  const lastCandlesHashRef = useRef("");

  // Throttle timescale sync
  const tsSyncIdRef = useRef(0);
  const lastTsSyncAtRef = useRef(0);
  const TS_SYNC_MS = 32;

  // Simple signature to skip redundant setData
  const candlesSig = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "0";
    const n = arr.length;
    const last = arr[n - 1];
    return `${n}:${last?.time ?? "?"}`;
  };

  // Build panel chart once
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const panel = createChart(el, {
      width: el.clientWidth,
      height,
      layout: { background: { type: "solid", color: "#0b1224" }, textColor: "#cbd5e1" },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      rightPriceScale: { borderVisible: false, autoScale: true, entireTextOnly: true },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        rightOffset: rightGap,
        rightBarStaysOnScroll: true,
        lockVisibleTimeRangeOnResize: true,
      },
      crosshair: { mode: 1 },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true },
      handleScale: { mouseWheel: false, pinch: false },
    });
    chartRef.current = panel;

    // Series by version
    if (version === "macd") {
      seriesRef.current = panel.addLineSeries({ color: "#22d3ee", lineWidth: 1.3, priceLineVisible: false, lastValueVisible: false });
      extraSeriesRef.current = panel.addLineSeries({ color: "#f59e0b", lineWidth: 1.1, priceLineVisible: false, lastValueVisible: false });
      histSeriesRef.current = panel.addHistogramSeries({ priceFormat: { type: "price" }, base: 0 });
    } else if (version === "stoch") {
      seriesRef.current = panel.addLineSeries({ color: "#22c55e", lineWidth: 1.3, priceLineVisible: false, lastValueVisible: false });
      extraSeriesRef.current = panel.addLineSeries({ color: "#f97316", lineWidth: 1.1, priceLineVisible: false, lastValueVisible: false });
    } else if (version === "volume") {
      histSeriesRef.current = panel.addHistogramSeries({ priceFormat: { type: "volume" } });
    } else {
      seriesRef.current = panel.addLineSeries({ color: "#f97316", lineWidth: 1.3, priceLineVisible: false, lastValueVisible: false });
    }

    // Sync visible range from main chart with throttle + rAF to avoid flicker [web:21]
    const main = mainChartRef?.current;
    if (main) {
      const ts = main.timeScale();
      const handler = (r) => {
        const now = performance.now();
        if (now - (lastTsSyncAtRef.current || 0) < TS_SYNC_MS) return;
        lastTsSyncAtRef.current = now;
        cancelAnimationFrame(tsSyncIdRef.current || 0);
        tsSyncIdRef.current = raf(() => {
          try { chartRef.current?.timeScale().setVisibleLogicalRange(r); } catch {}
        });
      };
      ts.subscribeVisibleLogicalRangeChange(handler);
      unsubMainRef.current = () => { try { ts.unsubscribeVisibleLogicalRangeChange(handler); } catch {} };
      try {
        const r = ts.getVisibleLogicalRange();
        if (r) chartRef.current.timeScale().setVisibleLogicalRange(r);
      } catch {}
    }

    // Resize on container resize only (not every tick) [web:45]
    const onResize = () => {
      try { chartRef.current?.resize(el.clientWidth, height); } catch {}
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      try { unsubMainRef.current?.(); } catch {}
      try { ro.disconnect(); } catch {}
      try { chartRef.current?.remove(); } catch {}
      chartRef.current = null;
      seriesRef.current = null;
      extraSeriesRef.current = null;
      histSeriesRef.current = null;
    };
  }, [containerRef, height, version, mainChartRef, rightGap]);

  // Utility
  const mapLine = (arr) => (arr ?? [])
    .filter((d) => Number.isFinite(d?.value))
    .map((d) => ({ time: d.time, value: d.value }));

  // Compute and set data — coalesced into ONE rAF [web:21]
  useEffect(() => {
    const panel = chartRef.current;
    if (!panel || !Array.isArray(candles) || candles.length === 0) return;

    const sig = candlesSig(candles);
    if (sig === lastCandlesHashRef.current) {
      try { panel.timeScale().applyOptions({ rightOffset: rightGap }); } catch {}
      return;
    }
    lastCandlesHashRef.current = sig;

    cancelAnimationFrame(pendingFrameRef.current || 0);
    pendingFrameRef.current = raf(() => {
      try {
        if (version === "rsi") {
          const period = options?.period ?? 14;
          const rsi = calcRSI(candles, period);
          seriesRef.current?.setData(mapLine(rsi));
        } else if (version === "macd") {
          const macdData = options?.macd && options?.signal && options?.hist ? options : calcMACD(candles, 12, 26, 9);
          const macdLine = mapLine(macdData.macd);
          const sigLine = mapLine(macdData.signal);
          const hist = (macdData.hist ?? []).map((x) => ({
            time: x.time, value: x.value, color: (x.value ?? 0) >= 0 ? "#16a34a" : "#ef4444",
          }));
          // Batch all MACD parts in the same frame [web:21]
          seriesRef.current?.setData(macdLine);
          extraSeriesRef.current?.setData(sigLine);
          histSeriesRef.current?.setData(hist);
        } else if (version === "stoch") {
          const st = options?.k && options?.d ? options : calcStoch(candles, 14, 3, 3);
          seriesRef.current?.setData(mapLine(st.k));
          extraSeriesRef.current?.setData(mapLine(st.d));
        } else if (version === "mfi") {
          const data = options?.data ?? calcMFI(candles, 14);
          seriesRef.current?.setData(mapLine(data));
        } else if (version === "obv") {
          const data = options?.data ?? calcOBV(candles);
          seriesRef.current?.setData(mapLine(data));
        } else if (version === "volume") {
          const vol = candles.map((x) => ({
            time: x.time,
            value: x.volume ?? 0,
            color: (x.close ?? 0) >= (x.open ?? 0) ? "#16a34a" : "#ef4444",
          }));
          histSeriesRef.current?.setData(vol);
        }

        // Defer timeScale tweak until after data set to avoid mid-frame reflow [web:1][web:21]
        panel.timeScale().applyOptions({ rightOffset: rightGap });
      } catch {}
    });
  }, [candles, version, options, rightGap]);

  return <div ref={containerRef} className="w-full" />;
}
