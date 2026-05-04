import mongoose from "mongoose";

const communityMemberSchema = new mongoose.Schema(
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
    role: {
      type: String,
      enum: ["admin", "moderator", "member"],
      default: "member",
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    
    blockedAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate members
communityMemberSchema.index({ community: 1, user: 1 }, { unique: true });

export default mongoose.model("CommunityMember", communityMemberSchema);
