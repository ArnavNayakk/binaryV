import mongoose from "mongoose";

const marketSnapshotSchema = new mongoose.Schema(
  {
    assetName: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    sentiment: {
      type: String, // bullish / bearish / neutral
      required: true,
    },
    changePercent: {
      type: Number,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    extraData: {
      type: Object, // anything API gives (open, high, low, volume)
      default: {},
    }
  },
  { timestamps: true }
);

export default mongoose.model("MarketSnapshot", marketSnapshotSchema);
