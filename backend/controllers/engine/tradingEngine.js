// engine/tradingEngine.js
// Core trading engine: placeTrade, handleExpiry, closeTrade
// Uses priceEngine, timerEngine, walletEngine, payoutEngine, riskEngine.

import mongoose from "mongoose";
import Big from "big.js";

import priceEngine from "./priceEngine.js";
import timerEngine from "./timerEngine.js";
import walletEngine from "./walletEngine.js";
import payoutEngine from "./payoutEngine.js";
import riskEngine from "./riskEngine.js";

import Wallet from "../../models/payment/wallet.js";
import Trade from "../../models/trading/Trade.js";

import { withRetryTransaction } from "../../utils/tradingEngine/withRetryTransaction.js";
 import { getIO } from "../../socket.js";  
import { pub } from "../../config/redis/redisClient.js";

class TradingEngine {
  /**
   * placeTrade - main entry point called by controller/service
   * payload: { userId, walletId (optional), symbol, direction: "UP"|"DOWN", investment, payoutPercentage, durationSeconds }
   *
   * Returns created trade document (from DB).
   */
  async placeTrade(payload) {
    console.log("tradingEngine.placeTrade payload:", payload);

    // Basic validations (fast-fail)
    const { userId, symbol, direction, investment, payoutPercentage, durationSeconds, asset } = payload;
    if (!userId) throw new Error("userId is required");
    if (!symbol) throw new Error("symbol is required");
    if (!direction) throw new Error("direction is required");
    if (!investment && investment !== 0) throw new Error("investment is required");
    if (!durationSeconds && durationSeconds !== 0) throw new Error("durationSeconds is required");
    if (!["UP", "DOWN"].includes(direction)) throw new Error("Invalid direction");
    if (Number(investment) <= 0) throw new Error("investment must be positive");

    // `symbol` is the market/price symbol (e.g. BTCUSDT).
    // `asset` (optional) is the wallet/collateral asset (e.g. USDTMATIC).
    const priceSymbol = symbol.toUpperCase();
    const walletAsset = (asset ?? priceSymbol).toUpperCase();

    // Get entry price BEFORE opening a transaction to keep transactions short
    const entryPrice = await priceEngine.getCurrentPrice(priceSymbol);
    if (entryPrice === null || entryPrice === undefined) {
      throw new Error("Price feed unavailable");
    }

    const now = new Date();
    const expiryTime = new Date(now.getTime() + Number(durationSeconds) * 1000);

    // Use withRetryTransaction to run DB modifications atomically and with retry-on-conflict.
    const createdTrade = await withRetryTransaction(async (session) => {
      // 1) Find wallet inside transaction
      const wallet = await Wallet.findOne({ userId, asset: walletAsset }).session(session);
      if (!wallet) throw new Error(`Wallet not found for asset ${walletAsset}. Create wallet first.`);

      const walletId = wallet._id.toString();

      // 2) Risk check
      const riskCheck = riskEngine.shouldAcceptTrade({
        userId,
        symbol: priceSymbol,
        amount: Number(investment)
      });

      if (!riskCheck.accepted) throw new Error("Trade rejected: " + riskCheck.reason);

      // 3) Debit wallet
      await walletEngine.debitForTrade({
        userId,
        walletId,
        amount: Number(investment),
        session
      });

      // 4) Create trade document
      const created = await Trade.create(
        [
          {
            userId,
            walletId,
            symbol: priceSymbol,
            direction,
            investment,
            payoutPercentage,
            openingPrice: entryPrice,
            durationSeconds,
            startTime: now,
            expiryTime,
            status: "ACTIVE",
            profit: mongoose.Types.Decimal128.fromString("0"),
            payoutAmount: mongoose.Types.Decimal128.fromString("0"),
            closingPrice: null,
            closingPriceSource: "BINANCE",
            meta: {},
          }
        ],
        { session }
      );

      return created[0];
    });

    // NOTE: at this point the transaction committed successfully.

    // Increase exposure (non-db side effect)
    try {
      riskEngine.incExposure(priceSymbol, Number(investment));
    } catch (e) {
      console.warn("Failed to incExposure:", e);
    }

    // Schedule expiry (non-db, after commit)
    timerEngine.schedule(expiryTime.getTime(), {
      action: "tradeExpiry",
      tradeId: createdTrade._id.toString(),
    });

    console.log("this is tradeData", createdTrade);
    console.log("Trade placed:", createdTrade._id.toString());

    // 🔵 WebSocket: notify user that trade is placed
    try {

      const io = getIO(); 
      io.to(userId.toString()).emit("trade:placed", {
        tradeId: createdTrade._id.toString(),
        userId: createdTrade.userId.toString(),
        symbol: createdTrade.symbol,
        direction: createdTrade.direction,
        investment: Number(createdTrade.investment),
        payoutPercentage: Number(createdTrade.payoutPercentage),
        openingPrice: Number(createdTrade.openingPrice),
        closingPrice: null,
        durationSeconds: createdTrade.durationSeconds,
        startTime: createdTrade.startTime,
        expiryTime: createdTrade.expiryTime,
        status: createdTrade.status,
        mode: "REAL",
      });
    } catch (err) {
      console.error("[tradingEngine] failed to emit trade:placed", err?.message || err);
    }

    return createdTrade;
  } // end placeTrade


  /**
   * handleExpiry - idempotent. Called by timer worker on tick.
   * payload: { tradeId }
   */
  async handleExpiry(payload) {
    console.log("tradingEngine.handleExpiry payload:", payload);
    const { tradeId } = payload;
    if (!tradeId) return;
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      console.warn("[tradingEngine] handleExpiry: trade not found", tradeId);
      return;
    }
    if (trade.status !== "ACTIVE") {
      return trade;
    }
    return this.closeTrade(tradeId);
  }


  /**
   * closeTrade - settles trade, credits payout (if any) and writes final state
   * Wraps DB changes in withRetryTransaction to avoid write conflicts.
   */
  async closeTrade(tradeId) {
    if (!tradeId) throw new Error("tradeId required");

    const existing = await Trade.findById(tradeId);
    if (!existing) throw new Error("Trade not found");
    if (existing.status !== "ACTIVE") {
      return existing;
    }

    // Get final price BEFORE transaction
    const expiryPrice = await priceEngine.getCurrentPrice(existing.symbol);
    const finalPrice =
      expiryPrice === null || expiryPrice === undefined
        ? Number(existing.openingPrice)
        : expiryPrice;

    // Calculate result, payout BEFORE transaction
    const opening = Big(
      existing.openingPrice.toString
        ? existing.openingPrice.toString()
        : existing.openingPrice
    );
    const closing = Big(finalPrice);

    let result = "LOST";
    if (existing.direction === "UP" && closing.gt(opening)) result = "WON";
    if (existing.direction === "DOWN" && closing.lt(opening)) result = "WON";
    if (closing.eq(opening)) result = "DRAW";

    const payoutCalc = payoutEngine.calculatePayout(
      Number(existing.investment),
      Number(existing.payoutPercentage),
      result === "WON" ? "WIN" : result === "DRAW" ? "DRAW" : "LOSS"
    );
    const payoutAmount = payoutCalc.payoutAmount;
    const netProfit = payoutCalc.netProfit;

    // DB updates (wallet + trade)
    const updatedTrade = await withRetryTransaction(async (session) => {
      const trade = await Trade.findById(tradeId).session(session);
      if (!trade) throw new Error("Trade not found inside transaction");
      if (trade.status !== "ACTIVE") {
        return trade;
      }

      await walletEngine.creditForTrade({
        userId: trade.userId,
        walletId: trade.walletId,
        creditAmount: payoutAmount,
        stakeAmount: Number(trade.investment),
        session,
        metadata: { tradeId: trade._id.toString() },
      });

      trade.closingPrice = mongoose.Types.Decimal128.fromString(
        Number(finalPrice).toString()
      );
      trade.closingPriceSource = expiryPrice ? "BINANCE" : "SYNTHETIC";
      trade.payoutAmount = mongoose.Types.Decimal128.fromString(
        Number(payoutAmount).toFixed(8)
      );
      trade.profit = mongoose.Types.Decimal128.fromString(
        Number(netProfit).toFixed(8)
      );
      trade.status =
        result === "WON" ? "WON" : result === "DRAW" ? "DRAW" : "LOST";
      trade.settledAt = new Date();

      await trade.save({ session });

      return trade;
    });

    // Reduce exposure
    try {
        console.log("i am risk");

      riskEngine.decExposure(
        existing.symbol.toUpperCase(),
        Number(existing.investment)
      );
    } catch (e) {
      console.warn("Failed to decExposure:", e);
    }
    // 🔵 WebSocket: notify user that trade is closed/settled(use pub/sub)
await pub.publish(
  "tradeClosed",
  JSON.stringify({
    tradeId: updatedTrade._id.toString(),
    userId: updatedTrade.userId.toString(),
    symbol: updatedTrade.symbol,
    direction: updatedTrade.direction,
    investment: Number(updatedTrade.investment),
    payoutPercentage: Number(updatedTrade.payoutPercentage),
    openingPrice: Number(existing.openingPrice),
    closingPrice: Number(updatedTrade.closingPrice),
    profit: Number(updatedTrade.profit),
    payoutAmount: Number(updatedTrade.payoutAmount),
    status: updatedTrade.status,
    settledAt: updatedTrade.settledAt,
    mode: "REAL",
  })
);


    return updatedTrade;
  } // end closeTrade
}

export default new TradingEngine();
