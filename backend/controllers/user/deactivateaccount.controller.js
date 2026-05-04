import authModel from "../../models/auth/auth.model.js";

const deactivateAccount = async (req, res) => {
  try {
    const userId = req?.user?.id;

    const user = await authModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, message: "Account deactivated" });

  } catch (err) {
    res.status(500).json({ message: err?.message });
  }
};

export { deactivateAccount };
