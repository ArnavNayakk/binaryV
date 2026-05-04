import React from "react";

const TooltipPanel = ({ tooltip, deviceType }) => {
  if (!tooltip?.data || !tooltip.pos.visible) return null;
  const dt = tooltip.data.time;

  return (
    <div
      style={{
        position: "absolute",
        left: tooltip.pos.left,
        top: tooltip.pos.top,
        pointerEvents: "none",
        padding: deviceType === "mobile" ? "10px 14px" : "14px 18px",
        background: `rgba(0,0,0, ${deviceType === "mobile" ? "0.9" : "0.8"})`,
        backdropFilter: `blur(${deviceType === "mobile" ? "4px" : "8px"})`,
        WebkitBackdropFilter: `blur(${deviceType === "mobile" ? "4px" : "8px"})`,
        border: "1px solid rgba(156, 163, 175, 0.15)",
        borderRadius: deviceType === "mobile" ? 12 : 16,
        boxShadow: `0 ${deviceType === "mobile" ? "4px 15px" : "8px 25px"} -8px rgba(0, 0, 0, 0.2)`,
        color: "#ffffff",
        fontFamily:
          "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
        fontSize: deviceType === "mobile" ? 10 : 12,
        lineHeight: 1.5,
        zIndex: 1001,
        transform: "translateY(-4px)",
        transition: "opacity 0.2s ease-in-out, transform 0.2s ease-in-out",
        minWidth: deviceType === "mobile" ? 140 : 180,
        maxWidth: deviceType === "mobile" ? 180 : 220,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ textAlign: "center", paddingBottom: 6, borderBottom: "1px solid rgba(156,163,175,.2)" }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "#60a5fa", marginBottom: 2 }}>
            {dt?.toLocaleDateString()}
          </div>
          <div style={{ fontSize: 11, color: "#d1d5db" }}>
            {dt?.toLocaleTimeString()}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#9ca3af" }}>Open:</span>
            <span style={{ color: "#fff", fontWeight: 500 }}>{tooltip.data.open}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#9ca3af" }}>High:</span>
            <span style={{ color: "#22c55e", fontWeight: 500 }}>{tooltip.data.high}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#9ca3af" }}>Low:</span>
            <span style={{ color: "#ef4444", fontWeight: 500 }}>{tooltip.data.low}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#9ca3af" }}>Close:</span>
            <span style={{ color: "#fff", fontWeight: 500 }}>{tooltip.data.close}</span>
          </div>
        </div>
        <div style={{ textAlign: "center", paddingTop: 6, borderTop: "1px solid rgba(156,163,175,.2)" }}>
          <div style={{ color: tooltip.data.isPositive ? "#22c55e" : "#ef4444", fontWeight: 600, fontSize: 11 }}>
            {(tooltip.data.isPositive ? "+" : "") + tooltip.data.change} ({(tooltip.data.isPositive ? "+" : "") + tooltip.data.pct}%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default TooltipPanel;
