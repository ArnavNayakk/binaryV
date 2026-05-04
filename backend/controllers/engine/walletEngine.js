// engine/walletEngine.js
// Atomic wallet updates to avoid write conflicts in concurrent trades.

import mongoose from "mongoose";
import Big from "big.js";

import Wallet from "../../models/payment/wallet.js";
import Transaction from "../../models/payment/transaction.js";

/** Helpers **/
function toBig(v) {
  if (v === undefined || v === null) return new Big("0");

  // If Decimal128 → convert using exact string
  if (typeof v === "object" && v.toString) {
    return new Big(v.toString()); // NEVER convert to Number
  }

  // If already Big-compatible value
  return new Big(String(v));
}

function toDecimalString(v) {
  const big = toBig(v);
  return big.toFixed(8); // Big.js handles rounding EXACTLY
}

function toDecimal128(v) {
  return mongoose.Types.Decimal128.fromString(toDecimalString(v));
}

/**
 * Debit for trade (reserve stake) — atomic check+update
 * - ensures balance >= amount atomically
 * - increments pendingOutgoing by amount
 *
 * params:
 *  { userId, walletId, amount, session }
 */
async function debitForTrade({ userId, walletId, amount, session }) {
  console.log("WalletEngine => debitForTrade()");
  if (!walletId) throw new Error("walletId required");

  const amountBig = toBig(amount);
  if (amountBig.lte(0)) throw new Error("Invalid amount");

  const amtNum = Number(amountBig.toFixed(8)); // used for $inc
  const amtDec128 = toDecimal128(amountBig); // used for filter compare

  // Atomic filter ensures balance >= amount
  const updated = await Wallet.findOneAndUpdate(
    {
      _id: walletId,
      balance: { $gte: amtDec128 }
    },
    {
      // use Number for $inc; we format to 8 decimals to match Decimal128 storage
      $inc: {
        balance: -amtNum,
        pendingOutgoing: amtNum
      }
    },
    { session, new: true }
  );

  if (!updated) {
    // Either wallet not found OR insufficient balance
    // Distinguish wallet-not-found vs insufficient if needed
    const exists = await Wallet.findById(walletId).session(session);
    if (!exists) throw new Error("Wallet not found");
    throw new Error("Insufficient balance");
  }

  // Create ledger entry
  await Transaction.create(
    [
      {
        userId,
        asset: updated.asset || "USDT",
        destinationAddress: updated.depositAddress || "",
        type: "Withdrawal",
        status: "COMPLETED",
        transactionMode: "wallet",

        payAmount: toDecimal128(amountBig),
        payCurrency: updated.asset || "USDT",
        actuallyPaid: toDecimal128(amountBig),
        outcomeAmount: toDecimal128(amountBig),
        outcomeCurrency: updated.asset || "USDT",

        metadata: { reason: "trade_debit" },
      },
    ],
    { session }
  );

  return updated;
}

/**
 * Credit for trade (settle). creditAmount may be 0 for losses.
 * - increments balance by creditAmount
 * - decrements pendingOutgoing by stakeAmount
 * - ensures pendingOutgoing doesn't remain negative (clamps to 0)
 */
async function creditForTrade({
  userId,
  walletId,
  creditAmount,
  stakeAmount,
  session,
  metadata = {},
}) {
  console.log("WalletEngine => creditForTrade()");

  const creditBig = toBig(creditAmount || 0);
  const stakeBig = toBig(stakeAmount || 0);

  const creditNum = Number(creditBig.toFixed(8));
  const stakeNum = Number(stakeBig.toFixed(8));

  // Apply atomic increments
  const updated = await Wallet.findByIdAndUpdate(
    walletId,
    {
      $inc: {
        balance: creditNum,
        pendingOutgoing: -stakeNum
      }
    },
    { session, new: true }
  );

  if (!updated) throw new Error("Wallet not found");

  // If pendingOutgoing became negative, clamp it to zero.
  const pendingBig = toBig(updated.pendingOutgoing);
  if (pendingBig.lt(0)) {
    // set to zero (Decimal128)
    await Wallet.findByIdAndUpdate(
      walletId,
      { $set: { pendingOutgoing: toDecimal128(0) } },
      { session }
    );
    // reflect change locally
    updated.pendingOutgoing = toDecimal128(0);
  }

  // Create ledger entry if credit > 0
  if (creditBig.gt(0)) {
    await Transaction.create(
      [
        {
          userId,
          asset: updated.asset || "USDT",
          destinationAddress: updated.depositAddress || "",
          type: "Deposit",
          status: "COMPLETED",
          transactionMode: "wallet",

          payAmount: toDecimal128(creditBig),
          payCurrency: updated.asset || "USDT",
          actuallyPaid: toDecimal128(creditBig),
          outcomeAmount: toDecimal128(creditBig),
          outcomeCurrency: updated.asset || "USDT",

          metadata: { reason: "trade_payout", ...metadata },
        },
      ],
      { session }
    );
  }

  return updated;
}

export default { debitForTrade, creditForTrade };
