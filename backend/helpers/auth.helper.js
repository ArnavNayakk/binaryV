import jwt from "jsonwebtoken";
import userModel from "../models/auth/auth.model.js";

//TOKEN HELPERS
export const createAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "2m" }); //2min
};

export const createRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "24h" }); // 24hour
};

// generate referral token
export const generateReferralCode = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let exists;

  do {
    code = Array.from({ length: 8 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");
    exists = await userModel.findOne({ referralCode: code });
    if(exists){
      res.status(500).json({success:false,message:"The referalcode must be unique"})
    }
  } while (exists);

  return code;
};