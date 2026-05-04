import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    file: {
      type: String,
      required: true,   
    }
  },
  { timestamps: true }
);

const Book =  mongoose.model("Book", bookSchema);

export default Book;
