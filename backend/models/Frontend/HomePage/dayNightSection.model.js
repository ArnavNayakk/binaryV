import mongoose  from "mongoose";

const dayNightSchema = new mongoose.Schema({
    bannerImg:{
        type:String,
        required:true
    },
      dayImg:{
        type:String,
        required:true
    },
    dayTitle:{
        type:String,
        required:true
    },
    dayDescription:{
         type:String,
        required:true
    },
    nightImg:{
        type:String,
        required:true
    },
    nightTitle:{
        type:String,
        required:true
    },
    nightDescription:{
         type:String,
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'employes'
    }

},{timestamps:true});

const dayNightModel = mongoose.model('DayNight',dayNightSchema);

export default dayNightModel;