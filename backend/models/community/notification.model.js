import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, 
    type: {
      type: String,
      enum: ["post", "comment", "custom","reaction"],
      default: "custom",
    },
    read: { type: Boolean, default: false },
    payload: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);