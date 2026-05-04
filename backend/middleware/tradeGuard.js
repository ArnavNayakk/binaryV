import crypto from "crypto";
import { pub as redis } from "../config/redis/redisClient.js";
import { logTradeSecurityEvent } from "../utils/tradeSecurityLogger.js";

const memoryState = {
  windows: new Map(),
  locks: new Map(),
};

const TRADE_WINDOW_MS = Number(process.env.TRADE_RATE_WINDOW_MS || 10_000);
const TRADE_MAX_PER_WINDOW = Number(process.env.TRADE_MAX_PER_WINDOW || 5);
const DUPLICATE_TRADE_LOCK_MS = Number(process.env.DUPLICATE_TRADE_LOCK_MS || 3_000);

function now() {
  return Date.now();
}

function normalizeDirection(direction) {
  return String(direction || "").trim().toUpperCase();
}

function normalizeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

function buildTradeFingerprint(userId, body = {}) {
  const payload = {
    userId: String(userId || ""),
    symbol: String(body.symbol || "").trim().toUpperCase(),
    direction: normalizeDirection(body.direction),
    investment: normalizeNumber(body.investment),
    durationSeconds: normalizeNumber(body.durationSeconds),
    payoutPercentage: normalizeNumber(body.payoutPercentage),
    asset: String(body.asset || "").trim().toUpperCase(),
  };

  return crypto.createHash("sha1").update(JSON.stringify(payload)).digest("hex");
}

function cleanupMemoryWindows() {
  const cutoff = now();
  for (const [key, timestamps] of memoryState.windows.entries()) {
    const fresh = timestamps.filter((timestamp) => cutoff - timestamp < TRADE_WINDOW_MS);
    if (fresh.length === 0) {
      memoryState.windows.delete(key);
      continue;
    }
    memoryState.windows.set(key, fresh);
  }

  for (const [key, expiry] of memoryState.locks.entries()) {
    if (expiry <= cutoff) {
      memoryState.locks.delete(key);
    }
  }
}

function fallbackCheckRate(userId) {
  cleanupMemoryWindows();
  const key = String(userId);
  const timestamps = memoryState.windows.get(key) || [];
  timestamps.push(now());
  const fresh = timestamps.filter((timestamp) => now() - timestamp < TRADE_WINDOW_MS);
  memoryState.windows.set(key, fresh);
  return fresh.length <= TRADE_MAX_PER_WINDOW;
}

function fallbackAcquireLock(fingerprint) {
  cleanupMemoryWindows();
  if (memoryState.locks.has(fingerprint)) return false;
  memoryState.locks.set(fingerprint, now() + DUPLICATE_TRADE_LOCK_MS);
  return true;
}

async function checkRateLimit(userId) {
  const key = `trade-rate:${userId}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.pexpire(key, TRADE_WINDOW_MS);
    }
    return count <= TRADE_MAX_PER_WINDOW;
  } catch (error) {
    console.warn("[tradeGuard] Redis rate limit fallback:", error?.message || error);
    return fallbackCheckRate(userId);
  }
}

async function acquireDuplicateLock(fingerprint) {
  const key = `trade-lock:${fingerprint}`;

  try {
    const result = await redis.set(key, "1", "PX", DUPLICATE_TRADE_LOCK_MS, "NX");
    return result === "OK";
  } catch (error) {
    console.warn("[tradeGuard] Redis duplicate lock fallback:", error?.message || error);
    return fallbackAcquireLock(fingerprint);
  }
}

export default async function tradeGuard(req, res, next) {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const allowed = await checkRateLimit(userId);
    if (!allowed) {
      logTradeSecurityEvent("trade-rate-limit-blocked", {
        userId: String(userId),
        path: req.originalUrl,
        ip: req.ip,
        maxPerWindow: TRADE_MAX_PER_WINDOW,
        windowMs: TRADE_WINDOW_MS,
      });

      return res.status(429).json({
        success: false,
        message: "Too many trade requests. Please wait a few seconds before placing another trade.",
      });
    }

    const fingerprint = buildTradeFingerprint(userId, req.body);
    const lockAcquired = await acquireDuplicateLock(fingerprint);
    if (!lockAcquired) {
      logTradeSecurityEvent("duplicate-trade-blocked", {
        userId: String(userId),
        path: req.originalUrl,
        ip: req.ip,
        fingerprint,
        duplicateLockMs: DUPLICATE_TRADE_LOCK_MS,
      });

      return res.status(429).json({
        success: false,
        message: "Duplicate trade request detected. Please wait a moment before retrying the same trade.",
      });
    }

    req.tradeGuard = {
      fingerprint,
      windowMs: TRADE_WINDOW_MS,
      maxPerWindow: TRADE_MAX_PER_WINDOW,
      duplicateLockMs: DUPLICATE_TRADE_LOCK_MS,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
