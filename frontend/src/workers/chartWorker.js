// src/workers/chartWorker.js — optimized lightweight version
// Still fully compatible with LiveChart.jsx

let ws = null;
let currentSymbol = null;
let currentInterval = null;

let reconnectTimer = null;
let heartbeatTimer = null;
let staleTimer = null;

let shouldReconnect = true;
let isPaused = false;

let throttleMs = 50; // relaxed default (overridden by main)
let lastEmitTs = 0;
let pendingCandle = null;
let coalesceCount = 0;

const RECONNECT_DELAY_MIN = 2000;
const RECONNECT_DELAY_MAX = 5000;
const HEARTBEAT_INTERVAL_MS = 15000;
const STALE_TIMEOUT_MS = 45000;

let startedAt = null;
let lastHeartbeatAt = 0;

// Reusable post buffer to reduce allocations
const postBuffer = { type: "", data: null };

// ---------- Utility helpers ----------
function safePost(message) {
  try {
    self.postMessage(message);
  } catch {
    /* ignore */
  }
}

function buildUrl(symbol, interval) {
  const s = String(symbol || "").trim();
  const i = String(interval || "").trim();
  return s && i ? `wss://stream.binance.com:9443/ws/${s.toLowerCase()}@kline_${i}` : null;
}

function clearTimers() {
  if (reconnectTimer) clearTimeout(reconnectTimer), (reconnectTimer = null);
  if (heartbeatTimer) clearInterval(heartbeatTimer), (heartbeatTimer = null);
  if (staleTimer) clearTimeout(staleTimer), (staleTimer = null);
}

function socketStatus() {
  if (!ws) return "disconnected";
  switch (ws.readyState) {
    case WebSocket.CONNECTING: return "connecting";
    case WebSocket.OPEN: return "connected";
    case WebSocket.CLOSING: return "closing";
    case WebSocket.CLOSED: return "disconnected";
    default: return "unknown";
  }
}

// ---------- Core routines ----------
function cleanupSocket() {
  if (ws) {
    try {
      ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
      ws.close(1000, "cleanup");
    } catch {}
  }
  ws = null;
  clearTimers();
  pendingCandle = null;
  coalesceCount = 0;
  lastEmitTs = 0;
}

function reconnect(reason) {
  cleanupSocket();
  if (!shouldReconnect || isPaused) return;
  const delay =
    Math.floor(RECONNECT_DELAY_MIN + Math.random() * (RECONNECT_DELAY_MAX - RECONNECT_DELAY_MIN));
  reconnectTimer = setTimeout(() => {
    if (currentSymbol && currentInterval) {
      connectWS(currentSymbol, currentInterval, throttleMs);
    }
  }, delay);
  safePost({ type: "status", status: "reconnecting", reason, symbol: currentSymbol, interval: currentInterval, startedAt });
}

function scheduleStaleTimeout() {
  if (staleTimer) clearTimeout(staleTimer);
  staleTimer = setTimeout(() => {
    if (shouldReconnect && !isPaused) reconnect("stale");
  }, STALE_TIMEOUT_MS);
}

function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    if (isPaused) return; // skip when paused
    const now = Date.now();
    if (now - lastHeartbeatAt < HEARTBEAT_INTERVAL_MS * 0.8) return;
    lastHeartbeatAt = now;
    safePost({
      type: "status",
      status: socketStatus(),
      symbol: currentSymbol,
      interval: currentInterval,
      startedAt,
      heartbeat: true,
    });
  }, HEARTBEAT_INTERVAL_MS);
}

// ---------- Emit logic ----------
function flushPending() {
  if (!pendingCandle) return;
  const candle = pendingCandle;
  const skipped = coalesceCount;
  pendingCandle = null;
  coalesceCount = 0;
  emitCandle(candle, skipped > 0);
  lastEmitTs = Date.now();
}

let precisionTick = 0;
function emitCandle(candle, coalesced) {
  let precisionHint;
  if (candle.isFinal && ++precisionTick % 5 === 0) {
    const s = String(candle.close);
    const dot = s.indexOf(".");
    precisionHint = dot >= 0 ? s.length - dot - 1 : 0;
  }

  postBuffer.type = "candle";
  postBuffer.data = undefined;
  safePost({
    type: "candle",
    data: candle,
    coalesced: !!coalesced,
    precision: precisionHint,
    symbol: currentSymbol,
    interval: currentInterval,
  });
}

// ---------- WebSocket logic ----------
function connectWS(symbol, interval, nextThrottleMs) {
  const url = buildUrl(symbol, interval);
  if (!url) return safePost({ type: "error", error: "invalid_params" });

  // If same stream already active, just update throttle
  if (ws && ws.readyState <= 1 && currentSymbol === symbol && currentInterval === interval) {
    throttleMs = Number.isFinite(nextThrottleMs) ? Math.max(0, nextThrottleMs) : throttleMs;
    return;
  }

  cleanupSocket();
  currentSymbol = symbol;
  currentInterval = interval;
  shouldReconnect = true;
  throttleMs = Number.isFinite(nextThrottleMs) ? Math.max(0, nextThrottleMs) : throttleMs;
  startedAt = Date.now();

  try {
    ws = new WebSocket(url);
  } catch {
    safePost({ type: "error", error: "ws_construct_error" });
    reconnect("construct_fail");
    return;
  }

  ws.onopen = () => {
    if (isPaused) {
      try { ws.close(1000, "paused"); } catch {}
      return;
    }
    startHeartbeat();
    scheduleStaleTimeout();
    safePost({ type: "status", status: "connected", symbol, interval, startedAt });
  };

  ws.onmessage = (event) => {
    scheduleStaleTimeout();
    if (isPaused) return;
    let payload;
    try {
      const raw = typeof event.data === "string" ? event.data : String(event.data || "");
      payload = JSON.parse(raw);
    } catch {
      return;
    }

    const k = payload?.k;
    if (!k) return;
    const candle = {
      time: Math.floor(k.t / 1000),
      open: +k.o,
      high: +k.h,
      low: +k.l,
      close: +k.c,
      isFinal: !!k.x,
    };
    if (
      !Number.isFinite(candle.time) ||
      !Number.isFinite(candle.open) ||
      !Number.isFinite(candle.high) ||
      !Number.isFinite(candle.low) ||
      !Number.isFinite(candle.close)
    ) return;

    const now = Date.now();
    if (throttleMs <= 0 || now - lastEmitTs >= throttleMs) {
      emitCandle(candle, false);
      lastEmitTs = now;
      if (pendingCandle) {
        setTimeout(() => flushPending(), throttleMs / 2);
      }
    } else {
      pendingCandle = candle;
      coalesceCount = Math.min(9999, coalesceCount + 1);
    }
  };

  ws.onclose = (evt) => {
    clearTimers();
    safePost({ type: "status", status: "disconnected", code: evt?.code, symbol, interval, startedAt });
    if (shouldReconnect && !isPaused) reconnect("close");
  };

  ws.onerror = () => safePost({ type: "error", error: "WebSocket Error" });
}

// ---------- Message API ----------
self.onmessage = (event) => {
  const msg = event.data || {};
  switch (msg.type) {
    case "connect":
    case "switch":
      isPaused = false;
      shouldReconnect = true;
      connectWS(msg.symbol, msg.interval, msg.throttleMs);
      break;

    case "disconnect":
      shouldReconnect = false;
      isPaused = false;
      cleanupSocket();
      safePost({ type: "status", status: "disconnected", symbol: currentSymbol, interval: currentInterval, startedAt });
      break;

    case "pause":
      isPaused = true;
      safePost({ type: "status", status: "paused", symbol: currentSymbol, interval: currentInterval, startedAt });
      break;

    case "resume":
      isPaused = false;
      if (!ws || ws.readyState === WebSocket.CLOSED) {
        shouldReconnect = true;
        connectWS(currentSymbol, currentInterval, throttleMs);
      } else {
        safePost({ type: "status", status: "connected", symbol: currentSymbol, interval: currentInterval, startedAt });
      }
      break;

    case "status":
      safePost({ type: "status", status: isPaused ? "paused" : socketStatus(), symbol: currentSymbol, interval: currentInterval, startedAt });
      break;

    default:
      safePost({ type: "error", error: "unknown_command" });
  }
};
