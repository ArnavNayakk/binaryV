import bcrypt from "bcrypt";
import employeModel from "../../models/employe/employe.model.js";
import RoleModel from "../../models/admin/role.model.js";
import Email from "../../utils/auth/email.js";
import otpModel from "../../models/auth/OTP.model.js";
import { createAccessToken, createRefreshToken } from "../../helpers/auth.helper.js";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../../utils/customError.js";


const employeRegistration = async (req, res, next) => {
  try {
    let {
      name,
      gender,
      joiningDate,
      password,
      qualification,
      designation,
      email,
      contact,
    } = req?.body || {};

    email = email?.trim().toLowerCase();
    
    const employe = await employeModel.findOne({email:email})

    if(employe){
      throw new ConflictError("Email is registerd")
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultRole = await RoleModel.findOne({ role: "employe" });

    const employeData = new employeModel({
      name,
      password: hashedPassword,
      joiningDate,
      gender,
      email,
      role: defaultRole?._id,
      contact,
      qualification,
      designation,
    });
    let data = await employeData?.save();
    data = await data?.populate("role", "role");

    const refreshToken = createRefreshToken(data?._id);
    data.refreshToken = refreshToken;
    data.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    data = data.toObject();
    delete data?.password;
    delete data?.__v;
    delete data?.updatedAt;
    delete data?.createdAt;
    delete data?.createdBy;
    delete data?.updatedBy;
    delete data?.joiningDate;

    const accessToken = createAccessToken(data);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
    delete data?._id;

    return res.status(201).json({
      success: true,
      message: "Successfull register",
      data,
      refreshToken,
    });
  } catch (error) {
    next(error)
  }
};

const employeLogin = async (req, res, next) => {
  try {
    let { email } = req?.body || {};
    const { password } = req?.body || {};

    let data = await employeModel
      .findOne({ email })
      .select("+password")
      .populate("role", "role");

    if (!data) {
      throw new BadRequestError("Email not registered")
    }

    const isMatch = await bcrypt.compare(password, data?.password);

    if (!isMatch) {
      throw new ValidationError("Password or email is incorrect")
    }

    const refreshToken = createRefreshToken(data?._id);

    data.refreshToken = refreshToken;
    data = await data.save();

    data = data?.toObject();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete data?.password;
    delete data?.__v;
    delete data?.updatedAt;
    delete data?.createdAt;
    delete data?.createdBy;
    delete data?.updatedBy;
    delete data?.joiningDate;

    const accessToken = createAccessToken(data);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
    delete data?._id;
    return res
      .status(200)
      .json({ success: true, message: "data login", refreshToken, data });
  } catch (error) {
   next(error)
  }
};
const logoutEmploye = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    return res.status(200).json({
      success: true,
      message: "data logged out successfully",
    });
  } catch (error) {
      next(error)
  }
};


const refreshAccessToken = async (req, res, next) => {
  try {
    const userId = req?.user?.id || req?.user?._id;
    if (!userId) {
      throw new UnauthorizedError("Refresh token missing");
    }

    // Extract refresh token
    let incomingToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.query?.refreshToken ||
      null;

    if (!incomingToken) {
      throw new UnauthorizedError("Refresh token missing");
    }

    // Verify token
    const decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    const dataId = decoded?.id?._id || decoded?._id

    // Get user
    const user = await employeModel
      .findById(dataId)
      .lean();

      delete data?.password;
      delete data?.__v;
      delete data?.updatedAt;
      delete data?.createdAt;
      delete data?.createdBy;
      delete data?.updatedBy;
      delete data?.joiningDate;

    if (!user) {
      throw new UnauthorizedError("Invalid token user not found");
    }

    // Verify DB stored token matches incoming token
    if (user.refreshToken !== incomingToken) {
      throw new UnauthorizedError("Refresh token mismatch");
    }

    // Create new access token
    const accessToken = createAccessToken(user);

    // Set cookie
   res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      accessToken,
    });

  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req?.body || {};

    const employe = await employeModel.findOne({ email });

    if (!employe) {
      throw new ValidationError("No user with this email")
    }

    await otpModel.deleteMany({
      $or: [{ employeId: employe._id }],
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const EmailService = new Email(employe);
    await EmailService.sendPasswordReset(otp);

    await otpModel.create({
      otp: hashedOtp,
      employeId:employe?._id
    });

    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    next(error)
  }
};


const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req?.body || {};

    const employe = await employeModel.findOne({ email });

    if (!employe) {
     throw new ValidationError("Invalid email")
    }

    const otpRecord = await otpModel.findOne({
      $or: [{ employeId: employe?._id }],
      isUsed: false,
    });
    if (!otpRecord) {
      throw new BadRequestError("OTP expired")
    }

    const isMatch = await bcrypt.compare(otp, otpRecord?.otp);
    if (!isMatch) {
      throw new ValidationError("Invalid Otp")
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    next(error)
  }
};

const addPassword = async (req, res, next) => {
  try {
    let { email, password } = req?.body || {};``

    if (!email || !password) {
     throw new ValidationError("Enter the credential")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let data = await employeModel.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
      },
      { new: true }
    );

    if (!data) {
     throw new NotFoundError("No user found")
    }
    const refreshToken = createRefreshToken(data?._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    data.refreshToken = refreshToken;
    data.save();

    data=data.toObject();
    delete data?.password;
    delete data?.__v;
    delete data?.updatedAt;
    delete data?.createdAt;
    delete data?.createdBy;
    delete data?.updatedBy;
    delete data?.joiningDate;

    const accessToken = createAccessToken(data);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    delete data?._id;

    return res.status(200).json({
      success: true,
      data,
      refreshToken,
      message: "Password updated",
    });
  } catch (error) {
   next(error)
  }
};
export {
  employeRegistration,
  employeLogin,
  logoutEmploye,
  refreshAccessToken,
  addPassword,
  verifyOtp,
  forgotPassword,
};
