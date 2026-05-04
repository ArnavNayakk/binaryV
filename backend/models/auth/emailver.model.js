// models/auth/emailver.model.js
import mongoose from "mongoose";

const pendingEmailVerificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    currency: {
      type: String,
      required: true,
    },

    referralCode: {
      type: String,
      default: null,
    },

    // Storing OTP temporarily (real OTP stored in OTP collection)
    otp: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-delete document automatically after 24 hours
pendingEmailVerificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 24 * 60 * 60 }
);

export default mongoose.model(
  "PendingEmailVerification",
  pendingEmailVerificationSchema
);
