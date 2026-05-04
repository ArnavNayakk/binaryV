import React, { useEffect, useRef } from "react";
import IndicatorPanel from "./IndicatorPanel.jsx";

export default function PanelWrapper({
  id,
  version,
  candles,
  options,
  subPanelRefs,
  mainChartRef,
  rightGap,
  deviceType,
  height,             // optional override
  ...rest
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!subPanelRefs) return;
    subPanelRefs.current[id] = { ...(subPanelRefs.current[id] || {}), container: containerRef.current, chart: null };
    return () => {
      try {
        const s = subPanelRefs.current[id];
        if (s && s.chart) { try { s.chart.remove(); } catch {} }
      } catch {}
      subPanelRefs.current[id] = null;
    };
  }, [id, subPanelRefs]);

  const panelHeight = height ?? (deviceType === "mobile" ? 140 : 160);

  const handleChartReady = (chartInstance) => {
    try {
      if (subPanelRefs?.current?.[id]) {
        subPanelRefs.current[id].chart = chartInstance;
      }
    } catch {}
  };

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{
        width: "100%",
        height: `${panelHeight}px`,
        background: "#0b1224",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
      {...rest}
    >
      <IndicatorPanel
        version={version}
        candles={candles}
        options={options}
        containerRef={containerRef}
        mainChartRef={mainChartRef}
        rightGap={rightGap}
        height={panelHeight}
        onChartReady={handleChartReady}
      />
    </div>
  );
}
