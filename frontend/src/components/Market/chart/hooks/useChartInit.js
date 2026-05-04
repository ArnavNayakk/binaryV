import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function useChartInit({
  chartContainerRef,
  chartConfig,
  deviceType,
  orientation,
  displayPrecisionRef,
}) {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const overlaySeriesRefs = useRef({
    ema20: null, ema50: null, sma20: null, sma50: null,
    bbUpper: null, bbMid: null, bbLower: null,
    roc: null, vroc: null, obv: null,
  });

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const isLandscapeMobile = deviceType === "mobile" && orientation === "landscape";
    const minWidth = isLandscapeMobile ? 200 : deviceType === "mobile" ? 250 : 300;
    const minHeight = isLandscapeMobile ? 150 : deviceType === "mobile" ? 180 : 200;
    const width = Math.max(minWidth, Math.round(rect.width));
    const height = Math.max(minHeight, Math.round(rect.height));

    const chart = createChart(container, { ...chartConfig, width, height });
    chartRef.current = chart;

    const neutralProvider = () => null;

    const candle = chart.addCandlestickSeries({
      upColor: "#00c853",
      downColor: "#d50000",
      borderUpColor: "#00c853",
      borderDownColor: "#d50000",
      wickUpColor: "#00c853",
      wickDownColor: "#d50000",
      priceLineVisible: true,
      lastValueVisible: false,
      priceScaleId: "right",
      priceFormat: {
        type: "custom",
        formatter: (price) => {
          const p = displayPrecisionRef.current ?? 2;
          return Number(price).toFixed(p);
        },
        minMove: 0.01,
      },
    });
    candleSeriesRef.current = candle;

    volumeSeriesRef.current = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      scaleMargins: { top: 0.82, bottom: 0 },
      lastValueVisible: false,
      visible: false, // start hidden
    });

    const addLine = (opts) =>
      chart.addLineSeries({ autoscaleInfoProvider: neutralProvider, ...opts });

    overlaySeriesRefs.current.ema20 = addLine({
      color: "#f59e0b", lineWidth: 1.4,
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });
    overlaySeriesRefs.current.ema50 = addLine({
      color: "#60a5fa", lineWidth: 1.4,
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });
    overlaySeriesRefs.current.sma20 = addLine({
      color: "#fbbf24", lineWidth: 1.3,
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });
    overlaySeriesRefs.current.sma50 = addLine({
      color: "#eab308", lineWidth: 1.3,
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });
    overlaySeriesRefs.current.bbUpper = addLine({
      color: "#60d394", lineWidth: 1,
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });
    overlaySeriesRefs.current.bbMid = addLine({
      color: "#9ca3af", lineWidth: 1, lineStyle: 2,
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });
    overlaySeriesRefs.current.bbLower = addLine({
      color: "#fb7185", lineWidth: 1,
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });
    overlaySeriesRefs.current.roc = addLine({
      color: "#34d399", lineWidth: 1, priceScaleId: "left",
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });
    overlaySeriesRefs.current.vroc = addLine({
      color: "#fb7185", lineWidth: 1, priceScaleId: "left",
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });
    overlaySeriesRefs.current.obv = addLine({
      color: "#f472b6", lineWidth: 1, priceScaleId: "left",
      lastValueVisible: false, priceLineVisible: false, visible: false,
    });

    return () => {
      try { chartRef.current?.remove(); } catch {}
      chartRef.current = null;
      candleSeriesRef.current = null;
      areaSeriesRef.current = null;
      volumeSeriesRef.current = null;
      overlaySeriesRefs.current = {
        ema20: null, ema50: null, sma20: null, sma50: null,
        bbUpper: null, bbMid: null, bbLower: null, roc: null, vroc: null, obv: null,
      };
    };
  }, [chartContainerRef, chartConfig, deviceType, orientation, displayPrecisionRef]);

  return { chartRef, candleSeriesRef, areaSeriesRef, volumeSeriesRef, overlaySeriesRefs };
}
