import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  faqs: [
    {
      question: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Guide = mongoose.model("Guide", guideSchema);
export default Guide;
