import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vaultAccountId: {
      type: String,
      required: false,
    },

    asset: {
      type: String,
      required: true,
    },

    balance: {
      type: mongoose.Decimal128,
      default: 0,
    },

    pendingOutgoing: {
      type: mongoose.Decimal128,
      default: 0,
    },

    pendingIncoming: {
      type: mongoose.Decimal128,
      default: 0,
    },

    depositAddress: {
      type: String,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index: one wallet per user per asset
walletSchema.index({ userId: 1, asset: 1 }, { unique: true });

export default mongoose.model("Wallet", walletSchema);
