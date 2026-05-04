export const nearestByTime = (candles, time) => {
  const arr = candles ?? [];
  if (!arr.length || !time) return { idx: -1, bar: null };
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = arr[mid].time;
    if (t === time) return { idx: mid, bar: arr[mid] };
    if (t < time) lo = mid + 1; else hi = mid - 1;
  }
  const a = arr[Math.max(0, Math.min(arr.length - 1, lo))];
  const b = arr[Math.max(0, Math.min(arr.length - 1, hi))];
  const pick = !b ? a : !a ? b :
    Math.abs((a?.time ?? 0) - time) <= Math.abs((b?.time ?? 0) - time) ? a : b;
  const idx = arr.findIndex((c) => c.time === (pick?.time ?? -1));
  return { idx, bar: pick ?? null };
};
