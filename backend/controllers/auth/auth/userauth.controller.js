import authModel from "../../../models/auth/auth.model.js";
import bcrypt from "bcrypt";
import generateUniqueUsername from "../../../utils/auth/generateUniqueUsername.js";
import generateAndSendOtp from "../../../services/otpService.js";
import pendingEmailVerificationSchema from "../../../models/auth/emailver.model.js";

import { 
  createAccessToken, 
  createRefreshToken, 
  generateReferralCode 
} from "../../../helpers/auth.helper.js";
import { oauth2client } from "../../../config/OAuth/googleOAuth.js";

const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge,
});


// ------------------------------------------------------
// USER REGISTER  ✓ WITH OPTIONAL CHAINING
// ------------------------------------------------------

export const userRegister = async (req, res) => {
  try {
    const { name, country, currency, email, password } = req?.body ?? {};

    if (!name || !email || !country || !currency || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // Already registered?
    const existingUser = await authModel?.findOne?.({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Already pending?
    const existingPending = await pendingEmailVerificationSchema?.findOne?.({ email });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "OTP already sent. Please verify your email.",
      });
    }

    // Prepare new pending record
    const hashedPassword = await bcrypt?.hash?.(password, 10);
    const userName = await generateUniqueUsername?.(name);
    const referralCode = await generateReferralCode?.();

    // Create OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    // Save pending record
    const pendingUser = await pendingEmailVerificationSchema?.create?.({
      name,
      email,
      userName,
      password: hashedPassword,
      country,
      currency,
      referralCode,
      otp,
      otpExpiresAt,
    });

    // Send OTP (now with pendingId)
    await generateAndSendOtp?.({
      email,
      otp,
      pendingId: pendingUser?._id,
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Verify to complete registration.",
      user: {
        email,
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message,
    });
  }
};


export const googleLogin = async(req,res,next) =>{
    try {
    const  code  = req?.body?.code;
    const googleRes = await oauth2client?.getToken(code);
    oauth2client.setCredentials(googleRes?.tokens)
    
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes?.tokens?.access_token}`
    );
   
    const { email, name, picture } = userRes?.data;

    let user = await authModel.findOne({ email });
    
    if (!user) {
      const referralCode = await generateReferralCode();
      const userName = await generateUniqueUsername?.(name);
      user = await authModel.create({ email, 
        
        name, image: picture,referralCode,userName});
    } 
    const refreshToken = createRefreshToken(user?._id);
    res.cookie("refreshToken", refreshToken, authCookieOptions(7 * 24 * 60 * 60 * 1000));
    user.refreshToken = refreshToken;
  
    user.save();

    user = user.toObject();
    delete user?.__v;
    delete user?.updatedAt;
    delete user?.createdAt;
    delete user?.createdBy;
    delete user?.updatedBy;
    delete user?.password;
    const accessToken = createAccessToken(user);
    res.cookie("accessToken", accessToken, authCookieOptions(24 * 60 * 60 * 1000));
    delete user?._id;
    res.status(200).json({success:true,message:"Login Successfully",user,refreshToken})
  } catch (error) {
    next(error)
  }
}



// ------------------------------------------------------
// USER SIGN IN  ✓ WITH OPTIONAL CHAINING
// ------------------------------------------------------

export const userSignIn = async (req, res) => {
  try {
    const { email, password } = req?.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email & Password required",
      });
    }

    // Get user with password
    const user = await authModel?.findOne?.({ email })?.select?.("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Email not verified
    if (!user?.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Compare password
    const match = await bcrypt?.compare?.(password, user?.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate refresh token
    const refreshToken = await createRefreshToken?.(user?._id);
    user.refreshToken = refreshToken;
    user?.save?.();

    // Clean user object
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

    // Create access token
    const accessToken = await createAccessToken?.(userData);

    // Set cookies safely
    res?.cookie?.("accessToken", accessToken, authCookieOptions(2 * 60 * 1000));

    res?.cookie?.("refreshToken", refreshToken, authCookieOptions(24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: "Login successful",
      refreshToken,
      user: userData,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message,
    });
  }
};
