import express from "express";

import {
  employeRegistration,
  employeLogin,
  logoutEmploye,
  refreshAccessToken,
  addPassword,
  verifyOtp,
  forgotPassword,
} from "../../controllers/employe/auth.controller.js";

const employeauthRouter = express.Router();



// Register Employe
employeauthRouter.post("/register", employeRegistration);

// Login Employe
employeauthRouter.post("/login", employeLogin);

// Logout Employe
employeauthRouter.post("/logout", logoutEmploye);

// Refresh Access Token
employeauthRouter.post("/refresh-token", refreshAccessToken);

// Forgot Password (Send OTP)
employeauthRouter.post("/forgot-password", forgotPassword);

// Verify OTP
employeauthRouter.post("/verify-otp", verifyOtp);

// Add / Reset Password
employeauthRouter.post("/add-password", addPassword);

export default employeauthRouter;
