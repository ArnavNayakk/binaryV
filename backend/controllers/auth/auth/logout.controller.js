import authModel from "../../../models/auth/auth.model.js";

const isProduction = process.env.NODE_ENV === "production";
const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

export const userSignOut = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", clearCookieOptions);

    // Optional DB cleanup: logout should still succeed even if DB is unavailable.
    const userId = req?.user?.id;
    if (userId && globalThis.__mongoConnected !== false) {
      try {
        await authModel.findByIdAndUpdate(userId, { refreshToken: null });
      } catch (err) {
        console.error("Sign-out DB cleanup skipped:", err?.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Successfully signed out",
    });
  } catch (err) {
    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", clearCookieOptions);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
