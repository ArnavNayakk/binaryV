import jwt from "jsonwebtoken";
import authModel from "../../../models/auth/auth.model.js";
import { createAccessToken } from "../../../helpers/auth.helper.js";

const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge,
});

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    // verify refresh token
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
          });
        }

        const user = await authModel.findById(decoded.id);

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // create new access token
        const userData = user?.toObject?.() ?? {};

        delete userData?.password;
        delete userData?.__v;
        delete userData?.image;
        delete userData?.emailVerified;
        delete userData?.isActive;
        delete userData?.updatedAt;
        delete userData?.createdAt;
        delete userData?.createdBy;
        delete userData?.updatedBy;
        const newAccessToken = createAccessToken(userData);

        // update cookie
        res.cookie("accessToken", newAccessToken, authCookieOptions(2 * 60 * 1000));

        return res.status(200).json({
          success: true,
          message: "New access token generated"
        });
      }
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
