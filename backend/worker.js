// worker.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import timerEngine from "./controllers/engine/timerEngine.js";
import priceEngine from "./controllers/engine/priceEngine.js";
import tradingEngine from "./controllers/engine/tradingEngine.js";
import recoveryEngine from "./controllers/engine/recoveryEngine.js";

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tradingdb";
const SYMBOLS = (process.env.BINANCE_SYMBOLS || "BTCUSDT,ETHUSDT,EURUSDT")
  .split(",")
  .map((s) => s.trim().toUpperCase());

async function connectDB() {
  await mongoose.connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("[worker] connected to mongo");
}

async function start() {
  await connectDB();

  // -------------------------------
  // ⭐ START PRICE ENGINE
  // -------------------------------
  priceEngine.start(SYMBOLS);

  priceEngine.onPrice(({ symbol, price, ts }) => {
    // console.log("tick", symbol, price);
  });

  // -------------------------------
  // ⭐ START TIMER ENGINE
  // -------------------------------
  timerEngine.onTick(async (payload) => {
    try {
      if (payload?.action === "tradeExpiry" && payload.tradeId) {
        await tradingEngine.handleExpiry(payload);
      } else {
        console.warn("[worker] unknown timer payload", payload);
      }
    } catch (err) {
      console.error("[worker] timer tick handler error", err?.message || err);
    }
  });

  timerEngine.start(); // <<< IMPORTANT HERE

  // -------------------------------
  // ⭐ START RECOVERY ENGINE
  // -------------------------------
  recoveryEngine.start();

  console.log("[worker] started all engines");
}

start().catch((e) => {
  console.error("[worker] failed to start", e);
  process.exit(1);
});
