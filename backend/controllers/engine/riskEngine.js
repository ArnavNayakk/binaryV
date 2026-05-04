// engine/riskEngine.js
// Lightweight risk checks and dynamic payout adjustment hooks.
// In production you will extend this: per-user limits, rolling exposure windows, hedging decisions, etc.

import timerEngine from "./timerEngine.js";
import EventEmitter from "events";

const emitter = new EventEmitter();

// Example in-memory counters (you will replace with Redis counters for multi-node)
const exposureBySymbol = {}; // { SYMBOL: Big(totalExposure) }

function incExposure(symbol, amount) {
    // console.log("I am risk engine(incExposure)");

  exposureBySymbol[symbol] = (exposureBySymbol[symbol] || 0) + Number(amount || 0);
}
function decExposure(symbol, amount) {
  // console.log("I am risk engine(decExposure)");
  exposureBySymbol[symbol] = Math.max(0, (exposureBySymbol[symbol] || 0) - Number(amount || 0));
}

function getExposure(symbol) {
    // console.log("I am risk engine(getExposure)");

  return exposureBySymbol[symbol] || 0;
}

// Simple acceptance check: reject massive single trades or huge exposure
function shouldAcceptTrade({ userId, symbol, amount }) {
  // console.log("I am risk engine(shouldAcceptTrade)");
  const MAX_SINGLE = Number(process.env.MAX_SINGLE_TRADE || 100000); // per trade max
  const MAX_SYMBOL_EXPOSURE = Number(process.env.MAX_SYMBOL_EXPOSURE || 500000); // platform exposure
  if (Number(amount) > MAX_SINGLE) return { accepted: false, reason: "exceeds_max_single_trade" };
  if (getExposure(symbol) + Number(amount) > MAX_SYMBOL_EXPOSURE) return { accepted: false, reason: "symbol_exposure_limit" };
  return { accepted: true };
}

// adjust payout: you may reduce payout if exposure high
function adjustPayoutPercentage(symbol, basePct) {
  // console.log("I am risk engine(adjustPayoutPercentage)");
  const exposure = getExposure(symbol);
  // simple rule: if exposure > threshold, reduce payout by up to 10%
  const threshold = Number(process.env.RISK_EXPOSURE_THRESHOLD || 20000);
  if (exposure <= threshold) return basePct;
  const over = Math.min(1, (exposure - threshold) / threshold); // 0..1
  const reduce = 10 * over; // up to 10 percentage points
  return Math.max(20, basePct - reduce); // bottom floor 20%
}

export default {
  shouldAcceptTrade,
  incExposure,
  decExposure,
  getExposure,
  adjustPayoutPercentage,
  on: (...args) => emitter.on(...args),
  emit: (...args) => emitter.emit(...args),
};
