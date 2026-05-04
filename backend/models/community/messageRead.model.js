import mongoose from "mongoose";
const { Schema } = mongoose;

const messageReadSchema = new Schema(
  {
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate read docs
messageReadSchema.index({ message: 1, user: 1 }, { unique: true });

export default mongoose.model("MessageRead", messageReadSchema);
