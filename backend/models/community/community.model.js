import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
 
    image: {
      type: String,
      required: true,
    },

    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",   
    },

    deleted: {
      type: Boolean,
      default: false
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Community", communitySchema);
