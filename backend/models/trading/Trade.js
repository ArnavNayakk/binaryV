// /models/Trade.js
import mongoose from "mongoose";

const { Decimal128, ObjectId } = mongoose.Schema.Types;

const TradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",            // your user model is exported as "auth" - change to "User" if you use that
      required: true,
      index: true,
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallets",        // adjust if your Wallet model uses a different model name
      required: true,
    },

    symbol: {
      type: String,
      required: true,
      index: true,
    },

    direction: {
      type: String,
      enum: ["UP", "DOWN"],
      required: true,
    },

    // Investment amount (stored as Decimal128 for precision)
    investment: {
      type: Decimal128,
      required: true,
      get: v => (v == null ? v : parseFloat(v.toString())),
      set: v => mongoose.Types.Decimal128.fromString(Number(v).toFixed(8)),
    },

    // percentage (0-100). Example: 80 = 80% => payout = investment + investment*(80/100)
    payoutPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Opening (entry) price — Decimal128 for precision
    openingPrice: {
      type: Decimal128,
      required: true,
      get: v => (v == null ? v : parseFloat(v.toString())),
      set: v => mongoose.Types.Decimal128.fromString(Number(v).toString()),
    },

    // Closing (expiry) price — null until settled
    closingPrice: {
      type: Decimal128,
      default: null,
      get: v => (v == null ? v : parseFloat(v.toString())),
      set: v => (v == null ? null : mongoose.Types.Decimal128.fromString(Number(v).toString())),
    },

    // duration in seconds (eg. 30, 60)
    durationSeconds: {
      type: Number,
      required: true,
    },

    startTime: {
      type: Date,
      default: () => new Date(),
    },

    expiryTime: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "WON", "LOST", "DRAW"],
      default: "ACTIVE",
      index: true,
    },

    // Net profit (or zero) as Decimal128.
    // Definition: NET PROFIT = (payoutAmount - investment)
    // Example (investment=10, payoutPercentage=80):
    //  - WIN => payoutAmount = 18 => profit = 8
    //  - LOSS => payoutAmount = 0 => profit = -10 (or you can keep loss = 0 and store negative; app choice)
    profit: {
      type: Decimal128,
      default: mongoose.Types.Decimal128.fromString("0"),
      get: v => (v == null ? v : parseFloat(v.toString())),
      set: v => mongoose.Types.Decimal128.fromString(Number(v).toFixed(8)),
    },

    // The actual amount returned to user (includes original investment when appropriate)
    payoutAmount: {
      type: Decimal128,
      default: mongoose.Types.Decimal128.fromString("0"),
      get: v => (v == null ? v : parseFloat(v.toString())),
      set: v => mongoose.Types.Decimal128.fromString(Number(v).toFixed(8)),
    },

    // Source used to fetch closingPrice — useful for audits & disputes
    closingPriceSource: {
      type: String,
      enum: ["BINANCE", "FOREX", "SYNTHETIC", "MANUAL", "UNKNOWN"],
      default: "BINANCE",
    },

    // When the trade was settled (ms timestamp stored as Date)
    settledAt: {
      type: Date,
      default: null,
    },

    // optional metadata for audits (orderId, feedId, eventId etc.)
    meta: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: false },
    toObject: { getters: true, virtuals: false },
  }
);

// Indexes: compound index for quick queries by status + expiry
TradeSchema.index({ status: 1, expiryTime: 1 });
TradeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Trade", TradeSchema);
