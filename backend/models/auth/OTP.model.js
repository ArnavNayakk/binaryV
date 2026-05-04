// models/auth/OTP.model.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },

    otp: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    pendingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PendingEmailVerification",
      default: null,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false, // timestamps handled manually (createdAt exists)
  }
);

export default mongoose.model("OTP", otpSchema);
