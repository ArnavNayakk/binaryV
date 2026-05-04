// controllers/auth/auth/resendOtp.controller.js
import pendingEmailVerificationSchema from "../../../models/auth/emailver.model.js";
import generateAndSendOtp from "../../../services/otpService.js";

export const resendOtp = async (req, res) => {
  try {
    const { email } = req?.body || {};
    if (!email) return res.status(400).json({ success: false, message: "Email required." });

    const pending = await pendingEmailVerificationSchema.findOne({ email });
    if (!pending) {
      return res.status(400).json({ success: false, message: "No pending registration found." });
    }

    // generate new otp
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP via service (links via pendingId)
    await generateAndSendOtp({ email, otp, pendingId: pending._id });

    // update pending doc (optional)
    pending.otp = otp;
    pending.otpExpiresAt = otpExpiresAt;
    await pending.save();

    return res.status(200).json({ success: true, message: "OTP resent to your email." });
  } catch (err) {
    console.error("resendOtp error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
