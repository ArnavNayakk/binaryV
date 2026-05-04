import HeroSection from "../../../models/Frontend/HomePage/heroSection.model.js";
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../utils/customError.js";

export const addHeroSection = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;

    if (!userId) {
      throw new UnauthorizedError("Login required to add Hero Section");
    }

    const { title, description } = req?.body || {};

    const existingHero = await HeroSection.findOne();
    if (existingHero) {
      throw new ConflictError("Hero section already exists");
    }

    const hero = new HeroSection({
      title: title.trim(),
      description: description.trim(),
      createdBy: userId,
    });

    await hero.save();

    return res.status(201).json({
      success: true,
      message: "Hero section created successfully",
      data: hero,
    });

  } catch (error) {
    next(error);
  }
};


export const updateHeroSection = async(req,res) =>{
    try {
        const userId = req?.user?.id || req?.user?._id;
        if (!userId){
            throw new UnauthorizedError()
        }  
        const {id} =req?.params?.id;
        const {title,description} = req?.body || {};

        const hero = await HeroSection.findByIdAndUpdate(id,{
            title:title,
            description:description,
            updatedBy:userId
        })
        if(!hero){
            throw new NotFoundError("Thier is not data by this id")
        }
        res.status(200).json({success:true,message:"success",data:hero})
    } catch (error) {
        next(error)
    }
}

export const getHeroSection = async(req,res,next) =>{

    try {
        const data = await HeroSection.find({}).sort({createdAt:-1})
        res.status(200).json({success:true,message:"sucess",data})
    } catch (error) {
        next(error)
    }
}


export const deleteHeroSection = async(req,res,next) =>{
    try {
        const userId =req?.user?.id ||req?.user?._id;
        if(!userId){
            throw new UnauthorizedError()
        }
        const id = req?.params?.id || {};
        await HeroSection.findByIdAndDelete(id);
        res.status(200).json({success:true,message:"success"})
    } catch (error) {
        next(error)
    }
}