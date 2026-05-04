import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ChevronDown } from "lucide-react";

// utils
const pad2 = (n) => n.toString().padStart(2, "0");
const parseIntervalToSeconds = (iv = "1m") => {
  const m = iv.match(/^(\d+)([smhdwM])$/);
  if (!m) return 60;
  const n = parseInt(m[1], 10);
  const u = m[2];
  const mul = u === "s" ? 1 : u === "m" ? 60 : u === "h" ? 3600 : u === "d" ? 86400 : u === "w" ? 604800 : 2592000;
  return n * mul;
};
// snap a timestamp to the next minute boundary
const snapToNextMinute = (tMs) => {
  const step = 60_000;
  const rem = tMs % step;
  return rem === 0 ? tMs : tMs + (step - rem);
};

// Build a mixed-cadence list of future slots anchored to candle close.
// Base sequence: +5m, +10m, +20m, +30m, +60m; then accumulates and repeats.
const buildMixedCadenceSlots = (anchorMs, count = 15) => {
  const base = [5, 10, 20, 30, 60]; // minutes
  const out = [];
  let i = 0;
  let lastMin = 0;
  while (out.length < count) {
    const mins = base[i % base.length] + lastMin;
    const ts = snapToNextMinute(anchorMs) + mins * 60_000;
    out.push(ts);
    if ((i + 1) % base.length === 0) {
      lastMin = mins;
    }
    i++;
  }
  return out;
};

export default function TimeGridControl({
  valueSeconds,
  onChangeSeconds,
  selectedInterval = "1m",
  symbol,
  gridCols = 3,
  gridRows = 5,
  compact = false,
  totalCells
}) {
  const [open, setOpen] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const [expiryTs, setExpiryTs] = useState(null); // absolute selected target time

  // tick once per second to react to candle rollover without drift
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // close on outside click when open
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!e.target.closest?.(".tg-root")) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const timeframeSeconds = parseIntervalToSeconds(selectedInterval);

  // Derive current candle close from chart times if available, else fallback
  const currentCandleCloseMs = useMemo(() => {
    const tfMs = timeframeSeconds * 1000;
    const openFromChart = symbol && window.lastBarTimes && window.lastBarTimes[symbol]?.openMs;
    if (openFromChart) return openFromChart + tfMs;
    const bucket = Math.floor(nowMs / tfMs) * tfMs;
    return bucket + tfMs;
  }, [nowMs, timeframeSeconds, symbol]);

  // Keep local expiryTs in sync with external seconds
  useEffect(() => {
    const ts = nowMs + valueSeconds * 1000;
    if (!expiryTs || Math.abs(expiryTs - ts) > 1500) {
      setExpiryTs(ts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueSeconds, nowMs]);

  // Ensure selection never sits behind and auto-advance when it passes
  useEffect(() => {
    const exp = expiryTs ?? (nowMs + valueSeconds * 1000);
    if (exp <= nowMs) {
      const slotsMs = buildMixedCadenceSlots(currentCandleCloseMs, 1);
      const delta = Math.ceil((slotsMs[0] - nowMs) / 1000);
      if (delta > 0) {
        onChangeSeconds(delta);
        setExpiryTs(slotsMs[0]);
      }
    } else if (exp < currentCandleCloseMs) {
      const slotsMs = buildMixedCadenceSlots(currentCandleCloseMs, 1);
      const delta = Math.ceil((slotsMs[0] - nowMs) / 1000);
      onChangeSeconds(delta);
      setExpiryTs(slotsMs[0]);
    }
  }, [nowMs, expiryTs, valueSeconds, currentCandleCloseMs, onChangeSeconds]);

  // Build grid of future slots
  const count = totalCells ?? gridCols * gridRows;
  const slots = useMemo(() => {
    const tsList = buildMixedCadenceSlots(currentCandleCloseMs, count);
    return tsList.map((ts) => {
      const d = new Date(ts);
      return {
        ts,
        label: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
        disabled: ts < currentCandleCloseMs
      };
    });
  }, [currentCandleCloseMs, count]);

  // +/- moves by exactly one minute from the current selected expiry
  const adjustSelection = (dir) => {
    const baseExp = expiryTs && expiryTs > nowMs
      ? expiryTs
      : snapToNextMinute(currentCandleCloseMs);

    let nextTs = baseExp + dir * 60_000; // ±1 minute
    const minAllowed = snapToNextMinute(currentCandleCloseMs);
    if (nextTs < minAllowed) nextTs = minAllowed;

    const delta = Math.ceil((nextTs - nowMs) / 1000);
    onChangeSeconds(Math.max(60, delta));
    setExpiryTs(nextTs);
  };

  const pickSlot = (slot) => {
    if (slot.disabled) return;
    const delta = Math.ceil((slot.ts - nowMs) / 1000);
    onChangeSeconds(Math.max(60, delta));
    setExpiryTs(slot.ts);
    setOpen(false);
  };

  // Pill prefers selected absolute clock; fallback to remaining-to-close
  let pillHH, pillMM;
  if (expiryTs && expiryTs > nowMs) {
    const d = new Date(expiryTs);
    pillHH = pad2(d.getHours());
    pillMM = pad2(d.getMinutes());
  } else {
    const remainingMs = Math.max(0, currentCandleCloseMs - nowMs);
    const remainingMinutes = Math.ceil(remainingMs / 60_000);
    pillHH = pad2(Math.floor(remainingMinutes / 60));
    pillMM = pad2(remainingMinutes % 60);
  }

  return (
    <div className="tg-root relative">
      <div className={`flex items-center justify-between bg-slate-800/60 rounded ${compact ? "p-0.5" : "p-1.5"} border border-slate-600/30`}>
        <button onClick={() => adjustSelection(-1)} className={`${compact ? "w-4 h-4" : "w-7 h-7"} bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center`}>
          <Minus size={compact ? 6 : 12} className="text-slate-300" />
        </button>
        <div
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1 bg-slate-900/70 ${compact ? "px-1 py-0.5" : "px-3 py-1.5"} rounded border border-slate-600/50 cursor-pointer select-none`}
        >
          <div className={`${compact ? "text-xs" : "text-sm"} font-mono text-white`}>
            {pillHH}:{pillMM}
          </div>
          <ChevronDown className={`${compact ? "w-2 h-2" : "w-3 h-3"} text-slate-400`} />
        </div>
        <button onClick={() => adjustSelection(1)} className={`${compact ? "w-4 h-4" : "w-7 h-7"} bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center`}>
          <Plus size={compact ? 6 : 12} className="text-slate-300" />
        </button>
      </div>

      {open && (
        <div className={`absolute z-20 mt-2 ${compact ? "w-44" : "w-56"} rounded-xl border border-slate-600/30 bg-slate-900/95 p-2 shadow-2xl`}>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
          >
            {slots.map((s) => {
              const active = expiryTs && Math.abs(expiryTs - s.ts) < 60_000;
              return (
                <button
                  key={s.ts}
                  onClick={() => pickSlot(s)}
                  disabled={s.disabled}
                  className={[
                    "h-9 rounded-lg text-xs font-mono",
                    s.disabled ? "bg-slate-800/60 text-slate-600 cursor-not-allowed" : "bg-slate-700/60 text-slate-200 hover:bg-slate-600/70",
                    active ? "ring-1 ring-slate-400" : ""
                  ].join(" ")}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 text-center">
            Anchored to current candle; rolls forward automatically.
          </div>
        </div>
      )}
    </div>
  );
}