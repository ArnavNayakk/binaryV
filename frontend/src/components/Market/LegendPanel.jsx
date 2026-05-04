import React from "react";

const LegendPanel = ({
  symbol,
  interval,
  showAreaOverlay,
  legend,
  deviceType,
  isLandscapeMobile,
}) => {
  if (!legend) return null;
  const dt = legend.time;

  return (
    <div
      style={{
        position: "absolute",
        bottom: isLandscapeMobile ? 25 : deviceType === "mobile" ? 40 : deviceType === "tablet" ? 35 : 30,
        left: isLandscapeMobile ? 6 : deviceType === "mobile" ? 8 : 12,
        right: deviceType === "mobile" ? 8 : "auto",
        padding: deviceType === "mobile" ? "8px 12px" : "12px 16px",
        background: `rgba(17, 24, 39, ${deviceType === "mobile" ? "0.95" : "0.85"})`,
        backdropFilter: `blur(${deviceType === "mobile" ? "8px" : "12px"})`,
        WebkitBackdropFilter: `blur(${deviceType === "mobile" ? "8px" : "12px"})`,
        border: "1px solid rgba(75, 85, 99, 0.3)",
        borderRadius: deviceType === "mobile" ? 8 : 12,
        boxShadow: `0 ${deviceType === "mobile" ? "4px 16px" : "8px 32px"} rgba(0, 0, 0, 0.3)`,
        color: "#ffffff",
        fontFamily:
          "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
        fontSize: isLandscapeMobile ? 10 : deviceType === "mobile" ? 11 : 13,
        lineHeight: 1.4,
        zIndex: 1000,
        pointerEvents: "none",
        transition: "all 0.2s ease-in-out",
        maxWidth: deviceType === "mobile" ? "auto" : deviceType === "tablet" ? 350 : 400,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#60a5fa" }}>{symbol}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase" }}>{interval}</div>
            {showAreaOverlay && (
              <div style={{ fontSize: 9, color: "#22c55e", background: "rgba(34,197,94,.2)", padding: "2px 6px", borderRadius: 4 }}>
                AREA
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#d1d5db" }}>
            {dt?.toLocaleDateString()} {dt?.toLocaleTimeString()}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, fontSize: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ color: "#9ca3af", fontSize: 10, marginBottom: 2 }}>OPEN</span>
            <span style={{ color: "#fff", fontWeight: 500 }}>{legend.open}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ color: "#9ca3af", fontSize: 10, marginBottom: 2 }}>HIGH</span>
            <span style={{ color: "#22c55e", fontWeight: 500 }}>{legend.high}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ color: "#9ca3af", fontSize: 10, marginBottom: 2 }}>LOW</span>
            <span style={{ color: "#ef4444", fontWeight: 500 }}>{legend.low}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ color: "#9ca3af", fontSize: 10, marginBottom: 2 }}>CLOSE</span>
            <span style={{ color: "#fff", fontWeight: 500 }}>{legend.close}</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 4, borderTop: "1px solid rgba(75,85,99,.3)" }}>
          <span style={{ color: legend.isPositive ? "#22c55e" : "#ef4444", fontWeight: 600, fontSize: 13 }}>
            {(legend.isPositive ? "+" : "") + legend.change}
          </span>
          <span style={{ color: legend.isPositive ? "#22c55e" : "#ef4444", fontWeight: 500, fontSize: 12 }}>
            ({(legend.isPositive ? "+" : "") + legend.pct}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default LegendPanel;
