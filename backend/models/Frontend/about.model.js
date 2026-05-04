import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true
    },
    aboutImg:{
        type:String,
        required:true
    },
    subTitle:{
        type:String,
        required:true
    },
    subDescription:{
        type:String,
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})

const About = mongoose.model('About',aboutSchema);
export default About;