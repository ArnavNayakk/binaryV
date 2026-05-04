// engine/recoveryEngine.js
// Recovery job to scan RUNNING/ACTIVE trades and reschedule/close them.
// Run periodically (example: every 20s) in worker process.

import Trade from "../../models/trading/Trade.js";
import tradingEngine from "./tradingEngine.js";

const SCAN_INTERVAL_MS = Number(process.env.RECOVERY_SCAN_MS || 20000);

let running = false;

async function scanAndRecover() {
  try {
    // Find ACTIVE trades whose expiryTime <= now + small grace (they should have been closed)
    const now = new Date();
    const stale = await Trade.find({ status: "ACTIVE", expiryTime: { $lte: now } }).limit(500);
    if (stale && stale.length) {
      console.log(`[recoveryEngine] found ${stale.length} stale ACTIVE trades`);
      for (const t of stale) {
        try {
          await tradingEngine.handleExpiry({ tradeId: t._id.toString() });
        } catch (err) {
          console.error("[recoveryEngine] recover error for trade", t._id.toString(), err?.message || err);
        }
      }
    }
  } catch (err) {
    console.error("[recoveryEngine] scan error", err?.message || err);
  }
}

function start() {
  if (running) return;
  running = true;
  (async function loop() {
    while (running) {
      await scanAndRecover();
      await new Promise(res => setTimeout(res, SCAN_INTERVAL_MS));
    }
  })();
  console.log("[recoveryEngine] started");
}

function stop() { running = false; console.log("[recoveryEngine] stopped"); }

export default { start, stop };
