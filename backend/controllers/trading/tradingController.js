import Trade from "../../models/trading/Trade.js";
import TradingEngine from "../engine/tradingEngine.js";

export const placeTrade = async (req, res) => {
  console.log("Hiee i am backed placeTrade")
  
  
  try {
    const {
     symbol,
      direction,
      investment,
      durationSeconds,
      payoutPercentage,
      asset,
    } = req.body;
    const userId = req.user.id;

    const trade = await TradingEngine.placeTrade({
      userId,
      symbol,
      direction,
      investment,
      payoutPercentage,
      durationSeconds,
      asset,
    });

    const responseBody = {
      success: true,
      trade,
    };

    await req.tradeIdempotency?.saveCompletedResponse?.(responseBody);

    return res.status(201).json(responseBody);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getUserTrades = async (req, res) => {
  try {
    console.log("Fetching user trade history...");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "UserId is required" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const trades = await Trade.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formatted = trades.map((t) => ({
      id: t._id.toString(),
      assets: t.symbol,
      symbol: t.symbol,
      direction: t.direction,
      investment: Number(t.investment),
      payout: Number(t.payoutAmount || 0),
      entryPrice: Number(t.openingPrice),
      closingPrice: Number(t.closingPrice),
      startTime: t.startTime,
      expiryTime: t.expiryTime,
      status: t.status,
      mode: "REAL",
    }));

    return res.json({
      success: true,
      count: formatted.length,
      page,
      trades: formatted,
    });

  } catch (error) {
    console.error("getUserTrades error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trades",
      error: error.message,
    });
  }
};



















// import Trade from "../../models/trading/Trade.js";
// import Wallet from "../../models/payment/wallet.js";
// import mongoose from "mongoose";
// import axios from "axios";

// export const startTrade = async (req, res) => {
//     console.log("Fronted hit me");
//   try {
//     const userId = new mongoose.Types.ObjectId('64f0c9b2e1a4f123456789ab'); // replace with authenticated user id
//     const {
//       symbol,
//       direction,
//       investment,
//       duration,
//       payoutPercentage,
//       price,     // optional
//       asset,     // USDT, BTC, etc — from frontend or user default
//     } = req.body;

//     if (!symbol || !direction || !investment || !duration || !asset) {
//       return res.status(400).json({ error: "Missing fields" });
//     }

//     // Fetch wallet
//     const wallet = await Wallet.findOne({ userId, asset });
//     if (!wallet)
//       return res.status(404).json({ error: "Wallet not found" });

//     const available = parseFloat(wallet.balance.toString());
//     const pendingOutgoing = parseFloat(wallet.pendingOutgoing.toString());

//     if (available < investment)
//       return res.status(400).json({ error: "Insufficient balance" });

//     // Deduct investment (move to pendingOutgoing)
//     wallet.balance = mongoose.Types.Decimal128.fromString(String(available - investment));

//     wallet.pendingOutgoing = mongoose.Types.Decimal128.fromString(String(pendingOutgoing + investment));
    

//     await wallet.save();

//     // Fetch price if not provided
//     let openingPrice = price;
//     if (!openingPrice) {
//       const resBinance = await axios.get(
//         `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
//       );
//       openingPrice = parseFloat(resBinance.data.price);
//     }

//     // Create trade
//     const trade = await Trade.create({
//       userId,
//       walletId: wallet._id,
//       symbol,
//       direction,
//       investment,
//       payoutPercentage,
//       openingPrice,
//       durationSeconds: duration,
//       expiryTime: new Date(Date.now() + duration * 1000),
//     });

//     return res.status(201).json({
//       success: true,
//       trade,
//     });

//   } catch (err) {
//     console.error("Start trade error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };
