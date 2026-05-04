import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    subTitle: {
      type: String,
      required: true,
      trim: true,
    },
    subDescription: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    sections: [sectionSchema],
    browseOtherTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog", 
      }
    ],

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

blogSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
