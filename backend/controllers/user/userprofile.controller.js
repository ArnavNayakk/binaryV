import authModel from "../../models/auth/auth.model.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const normalizeUserImage = (imageValue) => {
  if (typeof imageValue !== "string" || !imageValue) return imageValue;
  if (imageValue.startsWith("/uploads/")) return imageValue;
  if (imageValue.startsWith("http://") || imageValue.startsWith("https://")) return imageValue;
  const uploadsMarker = `${path.sep}uploads${path.sep}`;
  if (imageValue.includes(uploadsMarker)) {
    const [, relPath] = imageValue.split(uploadsMarker);
    return `/uploads/${relPath.split(path.sep).join("/")}`;
  }
  return imageValue;
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req?.user?.id;

    const user = await authModel
      .findById(userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.image = normalizeUserImage(user.image);
    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ message: err?.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, currency, password, dob } = req?.body || {};
    const file = req?.file;

    const userId = req?.user?.id;
    const user = await authModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (dob && user?.dob) {
      return res.status(400).json({ message: "DOB cannot be changed once set" });
    }

    if (password) user.password = await bcrypt.hash(password, 10);
    if (name) user.name = name;
    if (currency) user.currency = currency;
    if (dob) user.dob = new Date(dob);

    // If a new file is uploaded, replace the image.
    // NOTE: multer stores an absolute filesystem path in `file.path`.
    if (file?.path) {
      const uploadsDir = path.join(process.cwd(), "uploads");

      const resolveLocalImageFsPath = (imageValue) => {
        if (typeof imageValue !== "string") return null;
        if (imageValue.startsWith("/uploads/")) return path.join(process.cwd(), imageValue.slice(1));
        if (imageValue.startsWith("uploads/")) return path.join(process.cwd(), imageValue);
        if (path.isAbsolute(imageValue)) return imageValue;
        return null;
      };

      // Delete old uploaded image if it is stored locally under /uploads
      const oldFsPath = resolveLocalImageFsPath(user?.image);
      if (oldFsPath && fs.existsSync(oldFsPath)) {
        try {
          fs.unlinkSync(oldFsPath);
        } catch {
          // Best effort cleanup; never block profile update
        }
      }

      const relPath = path.relative(uploadsDir, file.path);
      user.image = `/uploads/${relPath.split(path.sep).join("/")}`;
    }

    await user.save();

    const cleanUser = user?.toObject?.();
    delete cleanUser?.password;
    cleanUser.image = normalizeUserImage(cleanUser.image);

    res.json({
      success: true,
      message: "Profile updated",
      user: cleanUser,
    });

  } catch (err) {
    res.status(500).json({ message: err?.message });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req?.body || {};
    const userId = req?.user?.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password, and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password must match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const user = await authModel.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to change password",
    });
  }
};

export { getUserProfile, updateUserProfile, changeUserPassword };
