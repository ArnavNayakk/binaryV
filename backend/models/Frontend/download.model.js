import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  feature: [
    {
      subTitle: {
        type: String,
        required: true,
      },
      subDescription: {
        type: String,
        required: true,
      },
    },
  ],
  downloadLink: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Download = mongoose.model("Download", downloadSchema);
export default Download;
