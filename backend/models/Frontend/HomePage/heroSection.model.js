import mongoose from "mongoose";

const heroSectionSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"employes"
    },
    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"employes"
    }
},{timeStamps:true});

const heroSection = mongoose.model('heroSection',heroSectionSchema);
export default heroSection;