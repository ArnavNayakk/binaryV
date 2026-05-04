import Trade from "../models/trading/Trade.js";
import Wallet from "../models/payment/wallet.js";
import axios from "axios";
import mongoose from "mongoose";

export const settleExpiredTrades = async () => {
  try {
    const now = new Date();

    const trades = await Trade.find({
      status: "ACTIVE",
      expiryTime: { $lte: now },
    }).lean();

    for (const t of trades) {
      const marketPrice = await axios
        .get(`https://api.binance.com/api/v3/ticker/price?symbol=${t.symbol}`)
        .then((r) => parseFloat(r.data.price));

      const wallet = await Wallet.findById(t.walletId);
      if (!wallet) continue;

      const beforeBalance = parseFloat(wallet.balance.toString());
      const beforeLocked = parseFloat(wallet.pendingOutgoing.toString());

      let won = false;

      if (t.direction === "UP") won = marketPrice > t.openingPrice;
      if (t.direction === "DOWN") won = marketPrice < t.openingPrice;

      let profit = 0;

      if (won) {
        profit = (t.investment * t.payoutPercentage) / 100;
        wallet.balance = mongoose.Types.Decimal128.fromString(String(beforeBalance + t.investment + profit));
        wallet.pendingOutgoing = mongoose.Types.Decimal128.fromString(String(beforeLocked - t.investment));

        await Trade.findByIdAndUpdate(t._id, {
          status: "WON",
          closingPrice: marketPrice,
          profit,
        });
      } else {
        profit = -t.investment;
        wallet.pendingOutgoing = mongoose.Types.Decimal128.fromString(
          String(beforeLocked - t.investment)
        );

        await Trade.findByIdAndUpdate(t._id, {
          status: "LOST",
          closingPrice: marketPrice,
          profit,
        });
      }

      await wallet.save();
    }
  } catch (err) {
    console.error("Settlement error:", err);
  }
};
