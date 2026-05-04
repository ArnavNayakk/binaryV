import mongoose from "mongoose";

const employeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles",
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    contact: {
      type: Number,
      require: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    qualification: {
      type: String,
      required: true,
    },
    contact:{
        type:Number,
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"employe"
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employe",
    },
    refreshToken:{
      type:String
    }
  },
  { timestamps: true }
);

const employeModel = mongoose.model("employe", employeSchema);
export default employeModel;
