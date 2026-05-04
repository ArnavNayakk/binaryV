import { pub as redis } from "../config/redis/redisClient.js";
import { logTradeSecurityEvent } from "../utils/tradeSecurityLogger.js";

const IDEMPOTENCY_TTL_MS = Number(process.env.TRADE_IDEMPOTENCY_TTL_MS || 60_000);
const IDEMPOTENCY_PENDING_TTL_MS = Number(process.env.TRADE_IDEMPOTENCY_PENDING_TTL_MS || 15_000);

function buildRedisKey(userId, idempotencyKey) {
  return `trade-idempotency:${userId}:${idempotencyKey}`;
}

async function getCachedTradeResponse(key) {
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("[tradeIdempotency] Redis read fallback:", error?.message || error);
    return null;
  }
}

async function setPendingTradeResponse(key) {
  try {
    await redis.set(key, JSON.stringify({ status: "pending" }), "PX", IDEMPOTENCY_PENDING_TTL_MS);
  } catch (error) {
    console.warn("[tradeIdempotency] Redis pending fallback:", error?.message || error);
  }
}

async function setCompletedTradeResponse(key, responseBody) {
  try {
    await redis.set(
      key,
      JSON.stringify({
        status: "completed",
        responseBody,
      }),
      "PX",
      IDEMPOTENCY_TTL_MS
    );
  } catch (error) {
    console.warn("[tradeIdempotency] Redis write fallback:", error?.message || error);
  }
}

export default async function tradeIdempotency(req, res, next) {
  try {
    const userId = req.user?.id || req.userId;
    const idempotencyKey = req.headers["x-idempotency-key"];

    if (!userId || !idempotencyKey) {
      return next();
    }

    const redisKey = buildRedisKey(String(userId), String(idempotencyKey));
    const cached = await getCachedTradeResponse(redisKey);

    if (cached?.status === "completed" && cached.responseBody) {
      logTradeSecurityEvent("idempotent-replay-served", {
        userId: String(userId),
        idempotencyKey: String(idempotencyKey),
        path: req.originalUrl,
      });

      return res.status(200).json({
        ...cached.responseBody,
        idempotencyReplay: true,
      });
    }

    if (cached?.status === "pending") {
      logTradeSecurityEvent("idempotent-request-pending", {
        userId: String(userId),
        idempotencyKey: String(idempotencyKey),
        path: req.originalUrl,
      });

      return res.status(409).json({
        success: false,
        message: "An identical trade request is already being processed.",
      });
    }

    await setPendingTradeResponse(redisKey);

    req.tradeIdempotency = {
      key: redisKey,
      idempotencyKey: String(idempotencyKey),
      saveCompletedResponse: (responseBody) => setCompletedTradeResponse(redisKey, responseBody),
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
