import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String
    }
  },
  { timestamps: true }
);

const RoleModel = mongoose.model("roles", roleSchema);

export default RoleModel;
