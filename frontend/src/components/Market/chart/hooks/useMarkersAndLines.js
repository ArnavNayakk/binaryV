import { useCallback, useEffect, useRef } from "react";

export default function useMarkersAndLines({
  trades,
  symbol,
  candleSeriesRef,
}) {
  const priceLineMapRef = useRef(new Map());
  const priceLineStateRef = useRef(new Map());
  const lastMarkersSigRef = useRef(null);

  const updateMarkersAndTradeLines = useCallback(() => {
    const series = candleSeriesRef.current;
    if (!series) return;
    const list = Array.isArray(trades) ? trades : [];

    const activeTradesMarkers = list
      .filter((t) => t.symbol === symbol && (t.remaining ?? 1) > 0)
      .map((t, idx) => {
        const id = t.mt?.id ?? t.id ?? t.clientId ?? t.time ?? idx;
        const isUp = t.direction === "UP";
        return {
          id,
          time: t.time ?? Math.floor(Date.now() / 1000),
          position: isUp ? "aboveBar" : "belowBar",
          color: isUp ? "#22c55e" : "#ef4444",
          shape: isUp ? "arrowUp" : "arrowDown",
          text: isUp ? "UP" : "DOWN",
          size: "small",
        };
      });

    const markerSig = activeTradesMarkers.map((m) => `${m.id}|${m.time}|${m.position}`).join("|");
    if (markerSig !== lastMarkersSigRef.current) {
      lastMarkersSigRef.current = markerSig;
      try { series.setMarkers(activeTradesMarkers.sort((a, b) => a.time - b.time)); } catch {}
    }

    const activeTrades = list
      .filter((t) => t.symbol === symbol && (t.remaining ?? 1) > 0)
      .map((t, idx) => ({
        id: t.id ?? t.clientId ?? t.time ?? idx,
        price: Number(t.entryPrice ?? t.price ?? t.level),
        isUp: t.direction === "UP",
        label: t.direction,
      }))
      .filter((t) => typeof t.price === "number" && !Number.isNaN(t.price));

    const nextIds = new Set(activeTrades.map((t) => t.id));
    const map = priceLineMapRef.current;
    const state = priceLineStateRef.current;

    for (const t of activeTrades) {
      const existing = map.get(t.id);
      const prev = state.get(t.id);
      if (!existing) {
        try {
          const line = series.createPriceLine({
            price: t.price,
            color: t.isUp ? "#00c853" : "#d50000",
            lineWidth: 2,
            lineStyle: 0,
            axisLabelVisible: true,
            title: t.label,
          });
          map.set(t.id, line);
          state.set(t.id, { price: t.price, label: t.label, isUp: t.isUp });
        } catch {}
      } else if (!prev || prev.price !== t.price || prev.label !== t.label || prev.isUp !== t.isUp) {
        try {
          existing.applyOptions({
            price: t.price,
            title: t.label,
            color: t.isUp ? "#00c853" : "#d50000",
          });
          state.set(t.id, { price: t.price, label: t.label, isUp: t.isUp });
        } catch {}
      }
    }

    for (const [id, line] of map.entries()) {
      if (!nextIds.has(id)) {
        try { series.removePriceLine(line); } catch {}
        map.delete(id);
        state.delete(id);
      }
    }
  }, [trades, symbol, candleSeriesRef]);

  useEffect(() => {
    updateMarkersAndTradeLines();
  }, [trades, symbol, updateMarkersAndTradeLines]);

  return {};
}
