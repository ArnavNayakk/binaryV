// src/utils/indicators.js
import {
  EMA,
  SMA,
  RSI,
  BollingerBands,
  MACD,
  Stochastic,
  MFI,
} from "technicalindicators";

/** safe map helper */
const mapLine = (candles, arr, offset = 0) => {
  if (!Array.isArray(arr) || !Array.isArray(candles)) return [];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const idx = i + offset;
    if (idx >= 0 && idx < candles.length) out.push({ time: candles[idx].time, value: arr[i] });
  }
  return out;
};

/** EMA */
export function calculateEMA(candles, period = 20) {
  if (!Array.isArray(candles) || candles.length < period) return [];
  const closes = candles.map((c) => c.close);
  const arr = EMA.calculate({ period, values: closes });
  // EMA output length = N - period + 1 -> first EMA aligns at candles[period - 1]
  return mapLine(candles, arr, period - 1);
}

/** SMA */
export function calculateSMA(candles, period = 20) {
  if (!Array.isArray(candles) || candles.length < period) return [];
  const closes = candles.map((c) => c.close);
  const arr = SMA.calculate({ period, values: closes });
  return mapLine(candles, arr, period - 1);
}

/** RSI */
export function calculateRSI(candles, period = 14) {
  if (!Array.isArray(candles) || candles.length < period + 1) return [];
  const closes = candles.map((c) => c.close);
  const arr = RSI.calculate({ period, values: closes });
  // RSI output length = N - period, first value aligns to candles[period]
  return mapLine(candles, arr, period);
}

/** Bollinger Bands -> { upper, middle, lower } */
export function calculateBollingerBands(candles, period = 20, stdDev = 2) {
  if (!Array.isArray(candles) || candles.length < period) return { upper: [], middle: [], lower: [] };
  const closes = candles.map((c) => c.close);
  const arr = BollingerBands.calculate({ period, values: closes, stdDev });
  const upper = [];
  const middle = [];
  const lower = [];
  for (let i = 0; i < arr.length; i++) {
    const idx = i + period - 1;
    if (idx < candles.length) {
      const t = candles[idx].time;
      upper.push({ time: t, value: arr[i].upper });
      middle.push({ time: t, value: arr[i].middle });
      lower.push({ time: t, value: arr[i].lower });
    }
  }
  return { upper, middle, lower };
}

/** MACD: returns { macd, signal, hist } */
export function calculateMACD(candles, fast = 12, slow = 26, signal = 9) {
  if (!Array.isArray(candles) || candles.length < slow + signal - 1) return { macd: [], signal: [], hist: [] };
  const closes = candles.map((c) => c.close);
  const out = MACD.calculate({
    values: closes,
    fastPeriod: fast,
    slowPeriod: slow,
    signalPeriod: signal,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  if (!Array.isArray(out) || !out.length) return { macd: [], signal: [], hist: [] };

  // output starts at index slow + signal - 2  (zero-based)
  const offset = slow + signal - 2;
  const macd = [];
  const sig = [];
  const hist = [];
  for (let i = 0; i < out.length; i++) {
    const idx = i + offset;
    if (idx < candles.length) {
      const t = candles[idx].time;
      // Some builds use lower-case keys; guard both
      const macdVal = out[i].MACD ?? out[i].macd ?? out[i].macdValue ?? 0;
      const sigVal = out[i].signal ?? out[i].SIGNAL ?? out[i].signalValue ?? 0;
      const histVal = out[i].histogram ?? out[i].hist ?? out[i].HIST ?? 0;
      macd.push({ time: t, value: macdVal });
      sig.push({ time: t, value: sigVal });
      hist.push({ time: t, value: histVal });
    }
  }
  return { macd, signal: sig, hist };
}

/** Stochastic Oscillator: returns { k, d } */
export function calculateStochastic(candles, kPeriod = 14, dPeriod = 3, smoothK = 3) {
  if (!Array.isArray(candles) || candles.length < kPeriod + smoothK + dPeriod - 2) return { k: [], d: [] };
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const closes = candles.map((c) => c.close);
  const out = Stochastic.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: kPeriod,
    signalPeriod: dPeriod,
    smoothing: smoothK,
  });
  if (!Array.isArray(out) || !out.length) return { k: [], d: [] };

  // position: (kPeriod - 1) + (smoothK - 1) + (dPeriod - 1) = kPeriod + smoothK + dPeriod - 3
  const offset = kPeriod + smoothK + dPeriod - 3;
  const k = [];
  const d = [];
  for (let i = 0; i < out.length; i++) {
    const idx = i + offset;
    if (idx < candles.length) {
      const t = candles[idx].time;
      k.push({ time: t, value: out[i].k ?? out[i].K ?? 0 });
      d.push({ time: t, value: out[i].d ?? out[i].D ?? 0 });
    }
  }
  return { k, d };
}

/** MFI (Money Flow Index) */
export function calculateMFI(candles, period = 14) {
  if (!Array.isArray(candles) || candles.length < period) return [];
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume ?? 0);
  const arr = MFI.calculate({ high: highs, low: lows, close: closes, volume: volumes, period });
  return mapLine(candles, arr, period);
}

/** OBV (On Balance Volume) */
export function calculateOBV(candles) {
  if (!Array.isArray(candles) || !candles.length) return [];
  const out = [];
  let cum = 0;
  for (let i = 0; i < candles.length; i++) {
    const cur = candles[i];
    const prev = candles[i - 1];
    if (!prev) {
      cum = 0;
    } else if (cur.close > prev.close) {
      cum += cur.volume ?? 0;
    } else if (cur.close < prev.close) {
      cum -= cur.volume ?? 0;
    }
    out.push({ time: cur.time, value: cum });
  }
  return out;
}

/** ROC (Rate of Change, percent) */
export function calculateROC(candles, period = 12) {
  if (!Array.isArray(candles) || candles.length <= period) return [];
  const out = [];
  for (let i = period; i < candles.length; i++) {
    const prevClose = candles[i - period].close;
    const curClose = candles[i].close;
    const v = prevClose !== 0 ? ((curClose - prevClose) / Math.abs(prevClose)) * 100 : 0;
    out.push({ time: candles[i].time, value: v });
  }
  return out;
}

/** VROC (Volume Rate of Change, percent) */
export function calculateVROC(candles, period = 14) {
  if (!Array.isArray(candles) || candles.length <= period) return [];
  const out = [];
  for (let i = period; i < candles.length; i++) {
    const prevVol = candles[i - period].volume ?? 0;
    const curVol = candles[i].volume ?? 0;
    const v = prevVol !== 0 ? ((curVol - prevVol) / Math.abs(prevVol)) * 100 : 0;
    out.push({ time: candles[i].time, value: v });
  }
  return out;
}
