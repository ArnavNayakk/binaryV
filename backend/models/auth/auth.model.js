import mongoose from "mongoose";

// -----------------------------
// USER SCHEMA
// -----------------------------
const userSchema = new mongoose.Schema(
  {
    // BASIC INFO
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      required: function () {
        return !this.googleId;
      },
      select: false, // hides password in queries
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    dob: {
      type: Date,
    },

    country: {
      type: String,
      default: "India",
    },

    currency: {
      type: String,
      default: "INR",
    },

    refreshToken:{
      type: String,
      
    },

    image: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/learning-63a18.appspot.com/o/users%2F21bed273-2706-4708-a35b-7d9bd0b8140e-1733399052578.jpeg?alt=media&token=b235cc0c-d341-4216-9e33-e95bded48224",
    },

    referralCode: {
      type: String,
      unique: true,
      minlength: 6,
      maxlength: 10,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    mobileVerified: {
      type: Boolean,
      default: false,
    },

    // REFRESH TOKEN FIELD
    refreshToken: {
      type: String,
      default: "",
    },

    // WALLET FIELDS
    totalBalance: {
      type: Number,
      default: 0,
    },

    totalIncome: {
      type: Number,
      default: 0,
    },

    totalSaving: {
      type: Number,
      default: 0,
    },

    totalExpenses: {
      type: Number,
      default: 0,
    },

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    // TRACK WHO CREATED / UPDATED
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
    },
  },
  {
    timestamps: true,
  }
);

// -----------------------------
// AUTO-GENERATE REFERRAL CODE
// -----------------------------
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
  }
  next();
});

// -----------------------------
// EXPORT MODEL (ESM)
// -----------------------------
const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
