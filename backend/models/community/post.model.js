import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId,
     ref: "Community", 
     required: true 
    },
  author: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: "User", 
     required: true
     },
  content: {
     type: String 
    },
  images:{
    type:[String]
  }, 
  type: {
    type: String,
    enum: ["text", "image", "mixed"],
    default: "text",
  }
},{timestamps:true});

export default mongoose.model("Post", postSchema);
