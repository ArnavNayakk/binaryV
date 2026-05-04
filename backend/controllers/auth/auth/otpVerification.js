// controllers/auth/auth/verify.controller.js
import authModel from "../../../models/auth/auth.model.js";
import pendingEmailVerificationSchema from "../../../models/auth/emailver.model.js";
import otpModel from "../../../models/auth/OTP.model.js";

export const verifyEmail = async (req, res) => {
  try {
    const email = req?.body?.email;
    const otp = req?.body?.otp;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required." });
    }

    const pending = await pendingEmailVerificationSchema?.findOne?.({ email });
    if (!pending) {
      return res.status(400).json({ success: false, message: "No pending verification found." });
    }

    const otpRecord = await otpModel?.findOne?.({
      email,
      otp,
      isUsed: false,
      expiresAt: { $gt: Date.now?.() },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    const user = await authModel?.create?.({
      name: pending?.name,
      email: pending?.email,
      userName: pending?.userName,
      password: pending?.password,
      country: pending?.country,
      currency: pending?.currency,
      referralCode: pending?.referralCode,
      emailVerified: true,
      isActive: true,
    });

    if (otpRecord) {
      otpRecord.isUsed = true;
      await otpRecord?.save?.();
    }

    await pendingEmailVerificationSchema?.deleteOne?.({ _id: pending?._id });

    return res.status(200).json({
      success: true,
      message: "Email verified. Registration completed.",
      user: {
        _id: user?._id,
        email: user?.email,
        userName: user?.userName,
        name: user?.name,
      },
    });
  } catch (err) {
    console?.error?.("verifyEmail error:", err);
    return res.status(500).json({ success: false, message: err?.message });
  }
};