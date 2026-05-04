// engine/priceEngine.js
// Binance websocket primary feed + REST fallback + synthetic fallback.
// Exports:
//   start(symbolsArray)           -> starts binance ws for symbols listed (eg ["BTCUSDT","ETHUSDT","EURUSDT"])
//   getCurrentPrice(symbol)       -> Number or null
//   onPrice(fn)                   -> subscribe to price ticks { symbol, price, ts }
//   stop()
// Notes: change symbol format to uppercase Binance format (BTCUSDT). Uses axios for REST fallback.

import WebSocket from "ws";
import axios from "axios";
import EventEmitter from "events";

const emitter = new EventEmitter();
const prices = {};             // { SYMBOL: { price: Number, ts: Number } }
const synthetic = {};          // synthetic price per symbol
let ws = null;
let activeSymbols = [];
let reconnectTimeout = 2000;
let isUsingWs = false;
let syntheticMode = false;

function setPrice(symbol, price) {
  prices[symbol] = { price: Number(price), ts: Date.now() };
  emitter.emit("price", { symbol, price: Number(price), ts: Date.now() });
}

async function restFetchPrice(symbol) {
  try {
    // Binance REST endpoint expects uppercase symbol
    const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (res?.data?.price) {
      setPrice(symbol, Number(res.data.price));
      return Number(res.data.price);
    }
  } catch (err) {
    // ignore
  }
  return null;
}

async function getCurrentPrice(symbol) {
  // console.log("Hiee I am priceEngine")
  symbol = symbol.toUpperCase();
  if (prices[symbol] && (Date.now() - prices[symbol].ts) < 5000) {
    return prices[symbol].price;
  }
  // try REST fallback
  const rest = await restFetchPrice(symbol).catch(() => null);
  if (rest) return rest;
  // synthetic fallback
  syntheticMode = true;
  if (!synthetic[symbol]) synthetic[symbol] = 1.0;
  const last = synthetic[symbol];
  const delta = (Math.random() - 0.5) * 0.0005 * (last || 1);
  const next = Math.max(0.0000001, last + delta);
  synthetic[symbol] = Number(next);
  setPrice(symbol, Number(next));
  return Number(next);
}

function buildStreamUrl(symbols) {
  // converts ["BTCUSDT","ETHUSDT"] -> stream path btcusdt@trade/ethusdt@trade
  const streams = symbols.map(s => `${s.toLowerCase()}@trade`).join("/");
  return `wss://stream.binance.com:9443/stream?streams=${streams}`;
}

function start(symbols = []) {
  // symbols: array of strings in Binance format, uppercase
  if (!Array.isArray(symbols) || symbols.length === 0) throw new Error("priceEngine.start requires symbols array");
  activeSymbols = symbols.map(s => s.toUpperCase());
  const url = buildStreamUrl(activeSymbols);
  ws = new WebSocket(url, { handshakeTimeout: 5000 });

  ws.on("open", () => {
    isUsingWs = true;
    syntheticMode = false;
    console.log("[priceEngine] Binance WS open");
  });

  ws.on("message", (raw) => {
    try {
      const parsed = JSON.parse(raw);
      const data = parsed?.data;
      if (!data) return;
      const symbol = (data.s || "").toUpperCase();
      const price = Number(data.p || data.price);
      if (symbol && !Number.isNaN(price)) {
        setPrice(symbol, price);
      }
    } catch (err) {
      // ignore
    }
  });

  ws.on("close", () => {
    isUsingWs = false;
    syntheticMode = true;
    console.warn("[priceEngine] Binance WS closed — switching to synthetic fallback and will attempt reconnect");
    setTimeout(() => start(activeSymbols), reconnectTimeout);
  });

  ws.on("error", (e) => {
    console.error("[priceEngine] ws error", e?.message || e);
    try { ws.terminate(); } catch (e) {}
  });
}

function stop() {
  try { if (ws) ws.close(); } catch (e) {}
  ws = null;
  isUsingWs = false;
}

function onPrice(fn) {
  emitter.on("price", fn);
}

export default {
  start,
  stop,
  getCurrentPrice,
  onPrice,
};
