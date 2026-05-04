// LiveChart.optimized.jsx
// Updated: micro-optimizations applied (debounced reflows, RAF guards, idle storage, batching toggles, memoized panels)

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createChart } from "lightweight-charts";

// Context + UI
import { useTrade } from "../../context/TradeContext.jsx";
import LegendPanel from "./LegendPanel";
import TooltipPanel from "./TooltipPanel";
import IndicatorToggle from "./IndicatorToggle.jsx";
import PanelWrapper from "./PanelWrapper.jsx";
import initDrawingTools from "./chart/pluginsdrawing/drawingtools/initDrawingTools.js";
import DrawingToolbar from "./chart/pluginsdrawing/DrawingToolbar.jsx";


// Indicators for overlays
import {
  calculateEMA,
  calculateBollingerBands,
  calculateRSI,
  calculateSMA,
  calculateMACD,
  calculateStochastic,
  calculateMFI,
  calculateOBV,
  calculateROC,
  calculateVROC,
} from "./chart/indicators.js";

// Hooks
import useChartInit from "./chart/hooks/useChartInit.js";
import useCrosshairDom from "./chart/hooks/useCrosshairDom.js";
import useOverlayGradient from "./chart/hooks/useOverlayGradient.js";
import useZoomAndAttach from "./chart/hooks/useZoomAndAttach.js";
import useAreaOverlay from "./chart/hooks/useAreaOverlay.js";
import useHistoricalData from "./chart/hooks/useHistoricalData.js";
import useWorkerStream from "./chart/hooks/useWorkerStream.js";
import useMarkersAndLines from "./chart/hooks/useMarkersAndLines.js";
import useDrift from "./chart/hooks/useDrift.js";

// Utils
import { FUTURE_BAR_COUNT, DEFAULT_WORKER_THROTTLE_MS } from "./chart/utils/constants.js";
import { intervalsInSec, stepFor } from "./chart/utils/intervals.js";
import { getPricePrecision, precisionToMinMove, updatePriceFormat as updateFormatUtil } from "./chart/utils/precision.js";
import { nearestByTime as nearestUtil } from "./chart/utils/nearest.js";

// Worker (singleton)
/* eslint-disable no-undef */
const chartWorkerSingleton = new Worker(
  new URL("../../workers/chartWorker.js", import.meta.url),
  { type: "module" }
);

// Static helper for zoom limits to avoid re-creating function on each render
const computeZoomLimits = (deviceType, orientation) => {
  const isLandscapeMobile = deviceType === "mobile" && orientation === "landscape";
  const isLandscapeTablet = deviceType === "tablet" && orientation === "landscape";
  if (isLandscapeMobile) return { MIN_SPACING: 6, MAX_SPACING: 20 };
  if (deviceType === "mobile") return { MIN_SPACING: 8, MAX_SPACING: 22 };
  if (isLandscapeTablet) return { MIN_SPACING: 10, MAX_SPACING: 26 };
  if (deviceType === "tablet") return { MIN_SPACING: 10, MAX_SPACING: 26 };
  return { MIN_SPACING: 5, MAX_SPACING: 55 };
};

const LiveChart = ({
  symbol,
  interval,
  showAreaOverlay = false,
  tradeHoverState,
  orientation = "portrait",
  deviceType = "desktop",
}) => {
  const trades = useTrade();

  // Container
  const chartContainerRef = useRef(null);

  // State/refs
  const mountedRef = useRef(false);
  const candlesRef = useRef([]);
  const lastTickRef = useRef({ time: null, open: null, high: null, low: null, close: null });
  const currentPriceRef = useRef(null);
  const displayPrecisionRef = useRef(2);
  const lastRealTickAtRef = useRef(0);

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [attached, setAttached] = useState(true);
  const [legend, setLegend] = useState(null);
  const [tooltip, setTooltip] = useState({ data: null, pos: { left: 0, top: 0 }, visible: false });
  const [drawingPlugin, setDrawingPlugin] = useState(null);

  // Indicator toggles with persistence (idle-saved)
  const [indicatorToggles, setIndicatorToggles] = useState(() => {
    const def = {
      sma20: false,
      sma50: false,
      ema20: false,
      ema50: false,
      bb: false,
      roc: false,
      vroc: false,
      volume: false,
      obv: false,
      rsi: false,
      macd: false,
      stoch: false,
      mfi: false,
    };
    try {
      const raw = localStorage.getItem("lc_ind_toggles");
      return raw ? { ...def, ...JSON.parse(raw) } : def;
    } catch {
      return def;
    }
  });

  // Idle-save refs
  const idleSaveId = useRef(null);
  useEffect(() => {
    try {
      if (typeof requestIdleCallback !== "undefined") {
        idleSaveId.current = requestIdleCallback(() => {
          localStorage.setItem("lc_ind_toggles", JSON.stringify(indicatorToggles));
        });
      } else {
        // fallback
        idleSaveId.current = setTimeout(() => {
          localStorage.setItem("lc_ind_toggles", JSON.stringify(indicatorToggles));
        }, 500);
      }
    } catch {}
    return () => {
      try {
        if (typeof cancelIdleCallback !== "undefined" && idleSaveId.current) cancelIdleCallback(idleSaveId.current);
        else if (idleSaveId.current) clearTimeout(idleSaveId.current);
      } catch {}
    };
  }, [indicatorToggles]);

  // Sub-panels registry
  const subPanelRefs = useRef({ volume: null, rsi: null, macd: null, stoch: null, mfi: null, obv: null });

  // Overlay gradient DOM refs
  const overlayUpRef = useRef(null);
  const overlayDownRef = useRef(null);

  // Derived
  const intervalStep = stepFor(interval);
  const rightGap = deviceType === "mobile" ? 6 : deviceType === "tablet" ? 8 : 10;

  const zoomLimits = useMemo(() => computeZoomLimits(deviceType, orientation), [deviceType, orientation]);

  const chartConfig = useMemo(() => {
    const isLandscapeMobile = deviceType === "mobile" && orientation === "landscape";
    const isLandscapeTablet = deviceType === "tablet" && orientation === "landscape";
    const isPortraitMobile = deviceType === "mobile" && orientation === "portrait";

    const baseSpacing = isLandscapeMobile
      ? 9
      : deviceType === "mobile"
      ? 10
      : isLandscapeTablet
      ? 16
      : deviceType === "tablet"
      ? 16
      : 18;

    return {
      layout: {
        background: { type: "solid", color: "#111827" },
        textColor: "#d1d4dc",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        fontSize: isLandscapeMobile ? 9 : deviceType === "mobile" ? 10 : deviceType === "tablet" ? 11 : 12,
      },
      grid: {
        vertLines: { color: "rgba(42,46,57,0.5)", style: 0, visible: !isPortraitMobile },
        horzLines: { color: "rgba(42,46,57,0.5)", style: 0, visible: true },
      },
      crosshair: {
        mode: deviceType === "mobile" ? 0 : 1,
        vertLine: { visible: false, labelVisible: true },
        horzLine: { visible: false, labelVisible: true },
      },
      rightPriceScale: {
        scaleMargins: { top: 0.15, bottom: 0.15 },
        borderVisible: !(deviceType === "mobile" && orientation === "portrait"),
        entireTextOnly: true,
        autoScale: true,
        mode: 0,
        borderColor: "rgba(197, 203, 206, 0.3)",
        visible: true,
        alignLabels: true,
      },
      timeScale: {
        borderVisible: !(deviceType === "mobile" && orientation === "portrait"),
        timeVisible: true,
        secondsVisible: deviceType !== "mobile",
        barSpacing: baseSpacing,
        rightOffset: rightGap,
        rightBarStaysOnScroll: true,
        lockVisibleTimeRangeOnResize: true,
        tickMarkFormatter: (time) => {
          const date = new Date((time ?? 0) * 1000);
          return date.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
        },
      },
      handleScroll: {
        mouseWheel: deviceType !== "mobile",
        horzTouchDrag: false,
        vertTouchDrag: false,
        pressedMouseMove: false,
      },
      handleScale: {
        axisPressedMouseMove: deviceType !== "mobile",
        pinch: true,
        mouseWheel: deviceType !== "mobile",
        axisDoubleClickReset: deviceType !== "mobile",
      },
      trackingMode: { exitMode: 0 },
    };
  }, [deviceType, orientation, rightGap]);

  // Initialize chart and main series
  const {
    chartRef,
    candleSeriesRef,
    areaSeriesRef,
    volumeSeriesRef,
    overlaySeriesRefs,
  } = useChartInit({
    chartContainerRef,
    chartConfig,
    deviceType,
    orientation,
    displayPrecisionRef,
  });

  // Keep main-pane volume hidden (use bottom panel)
  useEffect(() => {
    if (!volumeSeriesRef?.current) return;
    try {
      volumeSeriesRef.current.applyOptions({ visible: false });
    } catch {}
  }, [volumeSeriesRef]);

 // inside LiveChart component drawing component
useEffect(() => {
  if (!chartRef.current || !chartContainerRef.current || !candleSeriesRef.current) return;
  const plugin = initDrawingTools(
    chartRef.current,
    chartContainerRef.current,
    candleSeriesRef.current
  );
  setDrawingPlugin(plugin);
  return () => plugin?.destroy?.();
}, [chartRef, chartContainerRef, candleSeriesRef]);




  // Match overlay visibility with toggles (batched within RAF)
  useEffect(() => {
    const s = overlaySeriesRefs.current;
    if (!s) return;
    try {
      requestAnimationFrame(() => {
        s.ema20?.applyOptions({ visible: !!indicatorToggles.ema20 });
        s.ema50?.applyOptions({ visible: !!indicatorToggles.ema50 });
        s.sma20?.applyOptions({ visible: !!indicatorToggles.sma20 });
        s.sma50?.applyOptions({ visible: !!indicatorToggles.sma50 });
        s.bbUpper?.applyOptions({ visible: !!indicatorToggles.bb });
        s.bbMid?.applyOptions({ visible: !!indicatorToggles.bb });
        s.bbLower?.applyOptions({ visible: !!indicatorToggles.bb });
        s.roc?.applyOptions({ visible: !!indicatorToggles.roc });
        s.vroc?.applyOptions({ visible: !!indicatorToggles.vroc });
        s.obv?.applyOptions({ visible: !!indicatorToggles.obv });
      });
    } catch {}
  }, [overlaySeriesRefs, indicatorToggles]);

  // Helpers
  const nearestByTime = useCallback((t) => nearestUtil(candlesRef.current, t), []);
  const updatePriceFormat = useCallback(
    (series, priceSample) => updateFormatUtil(series, priceSample, displayPrecisionRef, precisionToMinMove),
    []
  );

  // Crosshair overlays + legend/tooltip
  useCrosshairDom({
    chartRef,
    containerRef: chartContainerRef,
    nearestByTime,
    getPricePrecision,
    deviceType,
    orientation,
    setLegend,
    setTooltip,
  });

  // Gradient overlays
  const { refreshOverlay } = useOverlayGradient({
    mountedRef,
    candleSeriesRef,
    chartContainerRef,
    currentPriceRef,
    tradeHoverState,
    overlayUpRef,
    overlayDownRef,
  });

  // Attach/detach behavior, zoom clamping (pass zoomLimits directly)
  const { applyInteractionMode, clampVisibleRangeRight } = useZoomAndAttach({
    chartRef,
    containerRef: chartContainerRef,
    candlesRef,
    deviceType,
    orientation,
    getZoomLimits: () => zoomLimits,
  });

  // Area overlay
  useAreaOverlay({
    showAreaOverlay,
    chartRef,
    candleSeriesRef,
    areaSeriesRef,
    candlesRef,
    clampVisibleRangeRight,
    updatePriceFormat,
    displayPrecisionRef,
  });

  // Price line
  const currentPriceLineRef = useRef(null);
  const lastAppliedPriceRef = useRef(null);
  const lastAppliedTitleRef = useRef(null);
  const upsertCurrentPriceLine = useCallback((price, title = "PRICE") => {
    if (!candleSeriesRef.current || typeof price !== "number" || !isFinite(price)) return;
    const p = Number(price.toFixed(displayPrecisionRef.current ?? 2));
    const samePrice = lastAppliedPriceRef.current != null && Math.abs((lastAppliedPriceRef.current ?? 0) - p) < 1e-9;
    const sameTitle = lastAppliedTitleRef.current === title;
    if (!currentPriceLineRef.current) {
      try {
        currentPriceLineRef.current = candleSeriesRef.current.createPriceLine({
          price: p,
          color: "#60a5fa",
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title,
        });
      } catch {}
      lastAppliedPriceRef.current = p;
      lastAppliedTitleRef.current = title;
    } else if (!samePrice || !sameTitle) {
      try {
        currentPriceLineRef.current.applyOptions({ price: p, title, color: "#60a5fa" });
      } catch {}
      lastAppliedPriceRef.current = p;
      lastAppliedTitleRef.current = title;
    }
  }, []);

  // Smooth animation with RAF guard + cancel
  const smoothAnimRef = useRef({ running: false, startTs: 0, startClose: 0, targetClose: 0, duration: 550, frameId: null });
  const runSmoothLoop = useCallback((opts) => {
    if (smoothAnimRef.current.running) return; // guard single active loop
    const { start, target, duration } = opts || {};
    smoothAnimRef.current.running = true;
    smoothAnimRef.current.startClose = start ?? currentPriceRef.current ?? lastTickRef.current?.close ?? 0;
    smoothAnimRef.current.targetClose = target ?? smoothAnimRef.current.startClose;
    smoothAnimRef.current.duration = duration ?? 550;

    const step = (ts) => {
      if (!mountedRef.current) {
        smoothAnimRef.current.running = false;
        if (smoothAnimRef.current.frameId) cancelAnimationFrame(smoothAnimRef.current.frameId);
        smoothAnimRef.current.frameId = null;
        return;
      }
      const { startTs, startClose, targetClose, duration } = smoothAnimRef.current;
      const t = Math.min(1, (ts - startTs) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const cur = startClose + (targetClose - startClose) * eased;
      const p = getPricePrecision(cur);
      const rounded = Number(cur.toFixed(p));
      currentPriceRef.current = rounded;

      const time = lastTickRef.current.time;
      if (time != null) {
        try {
          candleSeriesRef.current.update({
            time,
            open: lastTickRef.current.open,
            high: Math.max(lastTickRef.current.high, rounded),
            low: Math.min(lastTickRef.current.low, rounded),
            close: rounded,
          });
        } catch {}
        if (areaSeriesRef.current) {
          try {
            areaSeriesRef.current.update({ time, value: rounded });
          } catch {}
        }
        upsertCurrentPriceLine(rounded, "PRICE");
      }

      if (t < 1) smoothAnimRef.current.frameId = requestAnimationFrame(step);
      else {
        smoothAnimRef.current.running = false;
        smoothAnimRef.current.startTs = performance.now();
        smoothAnimRef.current.frameId = null;
      }
    };

    smoothAnimRef.current.startTs = performance.now();
    smoothAnimRef.current.frameId = requestAnimationFrame(step);
  }, [upsertCurrentPriceLine]);

  // Indicators (overlays only) — setData on seed, not on toggle
  const prepareIndicators = useCallback((candles, overlays) => {
    try {
      const ema20 = calculateEMA(candles, 20);
      const ema50 = calculateEMA(candles, 50);
      if (ema20?.length && overlays.current?.ema20) overlays.current.ema20.setData(ema20.map((d) => ({ time: d.time, value: d.value })));
      if (ema50?.length && overlays.current?.ema50) overlays.current.ema50.setData(ema50.map((d) => ({ time: d.time, value: d.value })));

      const sma20 = calculateSMA(candles, 20);
      const sma50 = calculateSMA(candles, 50);
      if (sma20?.length && overlays.current?.sma20) overlays.current.sma20.setData(sma20.map((d) => ({ time: d.time, value: d.value })));
      if (sma50?.length && overlays.current?.sma50) overlays.current.sma50.setData(sma50.map((d) => ({ time: d.time, value: d.value })));

      const bb = calculateBollingerBands(candles, 20, 2);
      if (bb?.upper?.length && bb?.middle?.length && bb?.lower?.length && overlays.current?.bbUpper) {
        overlays.current.bbUpper.setData(bb.upper.map((b) => ({ time: b.time, value: b.value })));
        overlays.current.bbMid.setData(bb.middle.map((b) => ({ time: b.time, value: b.value })));
        overlays.current.bbLower.setData(bb.lower.map((b) => ({ time: b.time, value: b.value })));
      }

      const obv = calculateOBV?.(candles);
      if (obv?.length && overlays.current?.obv) overlays.current.obv.setData(obv.map((d) => ({ time: d.time, value: d.value })));

      const roc = calculateROC?.(candles, 12);
      const vroc = calculateVROC?.(candles, 14);
      if (roc?.length && overlays.current?.roc) overlays.current.roc.setData(roc.map((d) => ({ time: d.time, value: d.value })));
      if (vroc?.length && overlays.current?.vroc) overlays.current.vroc.setData(vroc.map((d) => ({ time: d.time, value: d.value })));
    } catch {}
  }, []);

  // After seeding historical data
  const afterSeed = useCallback(() => {
    try {
      const timeScale = chartRef.current?.timeScale();
      timeScale?.applyOptions({ rightOffset: rightGap });
      clampVisibleRangeRight();
      requestAnimationFrame(() => refreshOverlay());
    } catch {}
  }, [chartRef, clampVisibleRangeRight, refreshOverlay, rightGap]);

  // Mount/unmount side effects
  useEffect(() => {
    mountedRef.current = true;
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // small delay to allow layout to settle
      setTimeout(() => {
        try {
          chartRef.current?.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
        } catch {}
      }, 50);
    };
    document.addEventListener("fullscreenchange", onFsChange, { passive: true });
    return () => {
      mountedRef.current = false;
      document.removeEventListener("fullscreenchange", onFsChange);
      try {
        if (candleSeriesRef.current && currentPriceLineRef.current) {
          candleSeriesRef.current.removePriceLine(currentPriceLineRef.current);
        }
      } catch {}
      currentPriceLineRef.current = null;
      // cancel any running smooth frame
      if (smoothAnimRef.current.frameId) cancelAnimationFrame(smoothAnimRef.current.frameId);
      smoothAnimRef.current.frameId = null;
    };
  }, []);

  // Fetch historical data and seed overlays
  useHistoricalData({
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
    areaSeriesRef,
  });

  // Worker streaming and incremental updates
  useWorkerStream({
    worker: chartWorkerSingleton,
    mountedRef,
    candleSeriesRef,
    volumeSeriesRef,
    candlesRef,
    lastTickRef,
    currentPriceRef,
    areaSeriesRef,
    updatePriceFormat: (series, price) => updatePriceFormat(series ?? candleSeriesRef.current, price),
    upsertCurrentPriceLine,
    onPostUpdate: () => {
      try {
        lastRealTickAtRef.current = performance.now();
        clampVisibleRangeRight();
        requestAnimationFrame(() => refreshOverlay());
      } catch {}
    },
  });

  // Markers and trade price lines
  useMarkersAndLines({ trades, symbol, candleSeriesRef });

  // Drift loop
  useDrift({
    mountedRef,
    candlesRef,
    currentPriceRef,
    displayPrecisionRef,
    lastRealTickAtRef,
    runSmoothLoop,
  });

  // Worker switch on symbol/interval/device (stop-then-switch)
  useEffect(() => {
    try {
      chartWorkerSingleton.postMessage({ type: "stop" });
    } catch {}
    try {
      chartWorkerSingleton.postMessage({
        type: "switch",
        symbol,
        interval,
        throttleMs: deviceType === "mobile" ? 32 : DEFAULT_WORKER_THROTTLE_MS,
      });
    } catch {}
  }, [symbol, interval, deviceType]);

  // Hover overlay refresh when tradeHoverState changes
  useEffect(() => {
    requestAnimationFrame(() => refreshOverlay());
  }, [tradeHoverState, refreshOverlay]);

  // Fullscreen toggle
  const handleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      chartContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Indicator toggle apply for overlay lines only (visibility-only; batched)
  const onToggle = useCallback((key, enabled) => {
    setIndicatorToggles((t) => ({ ...t, [key]: enabled }));
    try {
      const overlays = overlaySeriesRefs.current;
      if (!overlays) return;
      const mapKey = (k) => {
        if (k === "bb") return ["bbUpper", "bbMid", "bbLower"];
        if (k === "volume") return ["volume"];
        // direct mapping for overlays that match keys
        return [k];
      };

      requestAnimationFrame(() => {
        mapKey(key).forEach((k) => overlays[k]?.applyOptions({ visible: enabled }));
        try {
          chartRef.current?.timeScale().applyOptions({ rightOffset: rightGap });
        } catch {}
      });
    } catch {}
  }, [rightGap, overlaySeriesRefs, chartRef]);

  // Reflow / resize chart when bottom panels appear/disappear or when toggles change (debounced in single timeout + RAF)
  const resizeTimeout = useRef(null);
  useEffect(() => {
    const doResize = () => {
      try {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
          chartRef.current.timeScale().applyOptions({ rightOffset: rightGap });
        }
        clampVisibleRangeRight();
        refreshOverlay();
      } catch {}
    };

    if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(() => {
      requestAnimationFrame(doResize);
    }, 180);

    return () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    };
  }, [indicatorToggles, clampVisibleRangeRight, refreshOverlay, rightGap, chartRef]);

  // Count active bottom panels (optional) - memoized list
  const panelList = useMemo(() => ["volume", "rsi", "macd", "stoch", "mfi", "obv"].filter((k) => !!indicatorToggles[k]), [indicatorToggles]);

  return (
    <div
      className="relative w-full bg-gray-900 flex flex-col"
      style={{
        height: isFullscreen ? "100vh" : deviceType === "mobile" ? "90vh" : "100vh",
        minHeight: deviceType === "mobile" ? "180px" : "200px",
        overflow: "hidden",
      }}
      data-livechart-root
    >
      {/* Top: chart area */}
      <div className="relative w-full flex-1" style={{ minHeight: 120 }} data-livechart-chartwrap>
        <div ref={chartContainerRef} className="relative w-full h-full" />


        <div style={{ position: "absolute", left: 8, bottom: 8, zIndex: 60 }}>
          <LegendPanel legend={legend} deviceType={deviceType} orientation={orientation} />
        </div>

        <div ref={overlayUpRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div ref={overlayDownRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        {tooltip.visible && tooltip.data ? <TooltipPanel data={tooltip.data} pos={tooltip.pos} deviceType={deviceType} /> : null}

        <div className="absolute top-2 left-58 z-50 pointer-events-auto">
          <IndicatorToggle toggles={indicatorToggles} onToggle={onToggle} />
        </div>

          {/* Drawing toolbar */}
  <DrawingToolbar plugin={drawingPlugin} />

        {deviceType !== "mobile" ? (
          <button
            onClick={handleFullScreen}
            className="absolute top-2 right-2 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded text-white text-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? "Exit FS" : "FS"}
          </button>
        ) : null}

        <button
          onClick={() => {
            const next = !attached;
            setAttached(next);
            applyInteractionMode(next);
          }}
          className="absolute bottom-2 right-2 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs"
          title={attached ? "Detach from right edge" : "Attach to right edge"}
        >
          {attached ? "Detach" : "Attach"}
        </button>
      </div>

      {/* Bottom stacked indicator panels */}
      <div className="w-full bg-transparent mt-0 pb-2 flex flex-col gap-2" style={{ zIndex: 40 }} data-livechart-panels>
        {panelList.map((id) => (
          <PanelWrapper
            key={id}
            id={id}
            version={id}
            subPanelRefs={subPanelRefs}
            candles={candlesRef.current}
            options={{}}
            mainChartRef={chartRef}
            rightGap={rightGap}
            deviceType={deviceType}
          />
        ))}
      </div>
    </div>
  );
};

export default LiveChart;
