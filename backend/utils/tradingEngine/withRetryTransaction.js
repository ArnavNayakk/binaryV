// utils/tradingEngine/withRetryTransaction.js

import mongoose from "mongoose";

export async function withRetryTransaction(workFn, maxRetries = 10) {
  let retries = 0;

  while (true) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const result = await workFn(session);

      await session.commitTransaction();
      session.endSession();

      return result; // success

    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      const msg = err?.message?.toLowerCase() || "";

      // 🔥 Updated retry detection
      const retryable =
        err?.errorLabels?.includes("TransientTransactionError") ||
        msg.includes("write conflict") ||                      // <--- FIXED
        msg.includes("writeconflict") ||                       // alternate form
        msg.includes("retry your operation") ||                // Mongo suggestion
        msg.includes("temporarily unavailable") ||
        msg.includes("conflict") ||
        msg.includes("transaction aborted");

      if (!retryable || retries >= maxRetries) {
        console.error("Fatal transaction error:", err);
        throw err;
      }

      retries++;
      const backoff = Math.pow(2, retries) * 10; // exponential backoff

      console.warn(`Retrying transaction (${retries}/${maxRetries}) in ${backoff}ms`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
}
