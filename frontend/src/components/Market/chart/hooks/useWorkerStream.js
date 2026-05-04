import { useEffect } from "react";
import { MAX_HISTORY } from "../utils/constants.js";
import { safeUpdate, safeSetData } from "../utils/seriesGuards.js";

export default function useWorkerStream({
  worker,
  mountedRef,
  candleSeriesRef,
  volumeSeriesRef,
  candlesRef,
  lastTickRef,
  currentPriceRef,
  updatePriceFormat,
  upsertCurrentPriceLine,
  onPostUpdate,
}) {
  useEffect(() => {
    if (!worker) return;
    const onMessage = (evt) => {
      if (!mountedRef.current) return;
      const msg = evt.data;
      try {
        if (msg.type !== "candle" || !msg.data) return;
        const incoming = msg.data;
        const time = Number(incoming.time);
        const open = Number(incoming.open);
        const high = Number(incoming.high);
        const low = Number(incoming.low);
        const close = Number(incoming.close);
        const volume = incoming.volume != null ? Number(incoming.volume) : undefined;

        if (
          !Number.isFinite(time) ||
          !Number.isFinite(open) ||
          !Number.isFinite(high) ||
          !Number.isFinite(low) ||
          !Number.isFinite(close)
        ) return;

        const series = candleSeriesRef.current;
        if (!series) return;

        try {
          safeUpdate(series, { time, open, high, low, close });
        } catch {
          const buf = Array.isArray(candlesRef.current) ? candlesRef.current.slice() : [];
          const idx = buf.findIndex((c) => c.time === time);
          const volVal = Number.isFinite(Number(volume)) ? Number(volume) : buf[buf.length - 1]?.volume ?? 0;
          if (idx >= 0) buf[idx] = { time, open, high, low, close, volume: volVal };
          else buf.push({ time, open, high, low, close, volume: volVal });
          if (buf.length > MAX_HISTORY) buf.splice(0, buf.length - MAX_HISTORY);
          candlesRef.current = buf;
          safeSetData(series, buf.map((c) => ({
            time: c.time, open: c.open, high: c.high, low: c.low, close: c.close,
          })));
        }

        try {
          const arr = Array.isArray(candlesRef.current) ? candlesRef.current : [];
          const idx = arr.findIndex((c) => c.time === time);
          const volVal = Number.isFinite(Number(volume)) ? Number(volume) : arr[arr.length - 1]?.volume ?? 0;
          if (idx >= 0) arr[idx] = { time, open, high, low, close, volume: volVal };
          else arr.push({ time, open, high, low, close, volume: volVal });
          if (arr.length > MAX_HISTORY) arr.shift();
          candlesRef.current = arr;
        } catch {}

        try {
          if (volumeSeriesRef.current && Number.isFinite(Number(volume))) {
            volumeSeriesRef.current.update({
              time,
              value: Number(volume),
              color: close >= open ? "#16a34a" : "#ef4444",
            });
          }
        } catch {}

        try {
          lastTickRef.current = { time, open, high, low, close };
          currentPriceRef.current = close;
          updatePriceFormat(candleSeriesRef.current, close);
          upsertCurrentPriceLine(close, "PRICE");
        } catch {}

        onPostUpdate?.();
      } catch {}
    };

    worker.onmessage = onMessage;
    return () => {
      try { worker.onmessage = null; } catch {}
    };
  }, [
    worker, mountedRef, candleSeriesRef, volumeSeriesRef,
    candlesRef, lastTickRef, currentPriceRef, updatePriceFormat,
    upsertCurrentPriceLine, onPostUpdate
  ]);
}
