import authModel from "../../../models/auth/auth.model.js";
import otpModel from "../../../models/auth/OTP.model.js";
import bcrypt from "bcrypt";
import generateAndSendOtp from "../../../services/otpService.js";

// =======================================
//  SEND OTP FOR FORGOT PASSWORD (SAFE)
// =======================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req?.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await authModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await generateAndSendOtp?.generateAndSendOtp?.(user);

    res.status(200).json({
      success: true,
      message: "OTP sent for password reset",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.message,
    });
  }
};

// =======================================
//  RESET PASSWORD (SAFE)
// =======================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req?.body || {};

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    const user = await authModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch latest unused OTP
    const otpRecord = await otpModel
      .findOne({ userId: user?._id, isUsed: false })
      .sort({ createdAt: -1 });

    if (!otpRecord || otpRecord?.otp !== otp?.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Hash & update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.message,
    });
  }
};

export { forgotPassword, resetPassword };
