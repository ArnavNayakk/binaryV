import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    actionTakenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    message: {
      type: String, 
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate join requests
joinRequestSchema.index({ community: 1, user: 1 }, { unique: true });

export default mongoose.model("JoinRequest", joinRequestSchema);