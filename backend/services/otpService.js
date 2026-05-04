// services/otpService.js
import otpModel from "../models/auth/OTP.model.js";
import Email from "../utils/auth/email.js";

const saveOtpRecord = async ({ otp, email, userId, pendingId, ttlSeconds = 600 }) => {
  const doc = await otpModel.create({
    userId: userId || null,
    pendingId: pendingId || null,
    email,
    otp,
    isUsed: false,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return doc;
};

const generateAndSendOtp = async (payload) => {
  try {
    const { email, otp: incomingOtp, userId, pendingId } = payload;
    if (!email) throw new Error("Missing email for OTP sending.");

    const otp = incomingOtp || Math.floor(100000 + Math.random() * 900000).toString();

    // save OTP record (works for both pending and real users)
    await saveOtpRecord({ otp, email, userId, pendingId });

    // send email
    await new Email({ email }).sendOtp(otp);

    console.log(`✅ OTP sent to ${email}`);
    return otp;
  } catch (error) {
    console.error("❌ Error in generateAndSendOtp:", error);
    throw new Error("Failed to send OTP");
  }
};

export default generateAndSendOtp;
