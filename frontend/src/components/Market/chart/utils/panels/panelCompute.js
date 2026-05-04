import {
  calculateEMA,
  calculateBollingerBands,
  calculateRSI,
  calculateMACD,
  calculateStochastic,
  calculateMFI,
  calculateOBV,
  calculateROC,
  calculateVROC,
} from "../../indicators.js";

export const computePanelOptions = (candles) => {
  const volumeData = (candles ?? []).map((c) => ({
    time: c.time,
    value: c.volume ?? 0,
    color: (c.close ?? 0) >= (c.open ?? 0) ? "#16a34a" : "#ef4444",
  }));

  let rsiData, macdData = { macd: [], signal: [], hist: [] }, stochData = { k: [], d: [] }, mfiData, obvData, rocData, vrocData;
  try { rsiData = calculateRSI ? calculateRSI(candles, 14) : undefined; } catch {}
  try {
    const m = calculateMACD ? calculateMACD(candles, 12, 26, 9) : null;
    if (m) macdData = m;
  } catch {}
  try {
    const s = calculateStochastic ? calculateStochastic(candles, 14, 3, 3) : null;
    if (s) stochData = s;
  } catch {}
  try { mfiData = calculateMFI ? calculateMFI(candles, 14) : undefined; } catch {}
  try { obvData = calculateOBV ? calculateOBV(candles) : undefined; } catch {}
  try { rocData = calculateROC ? calculateROC(candles, 12) : undefined; } catch {}
  try { vrocData = calculateVROC ? calculateVROC(candles, 14) : undefined; } catch {}

  return { volumeData, rsiData, macdData, stochData, mfiData, obvData, rocData, vrocData };
};
