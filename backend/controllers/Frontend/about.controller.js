import About from "../../models/Frontend/about.model.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../utils/customError.js";
import fs from "fs";
import path from "path";

// ADD ABOUT
export const addAbout = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const body = req?.body || {};
    const description = body?.description?.trim();
    const subTitle = body?.subTitle?.trim();
    const subDescription = body?.subDescription?.trim();

    if (!description || !subTitle || !subDescription) {
      throw new BadRequestError("All fields are required");
    }

    if (!req?.file?.filename) {
      throw new BadRequestError("About image is required");
    }

    const about = new About({
      description,
      aboutImg: `/uploads/about/images/${req?.file?.filename}`, // store in uploads/images
      subTitle,
      subDescription,
      createdBy: userId,
    });

    await about.save();

    return res.status(201).json({
      success: true,
      message: "About section created successfully",
      data: about,
    });
  } catch (error) {
    next(error);
  }
};

//  UPDATE ABOUT 
export const updateAbout = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { id } = req.params;

    const about = await About.findById(id);
    if (!about) throw new NotFoundError("About section not found");

    const body = req?.body || {};

    // If new image provided via multer, delete old image
    if (req?.file?.filename) {
      if (about.aboutImg) {
        const oldImagePath = path.join(process.cwd(), about.aboutImg);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.warn("Failed to delete old image:", err.message);
        });
      }
      about.aboutImg = `/uploads/about/images/${req?.file?.filename}`;
    }

    if (body?.description !== undefined) about.description = body.description.trim();
    if (body?.subTitle !== undefined) about.subTitle = body.subTitle.trim();
    if (body?.subDescription !== undefined) about.subDescription = body.subDescription.trim();

    about.updatedBy = userId;

    await about.save();

    return res.status(200).json({
      success: true,
      message: "About section updated successfully",
      data: about,
    });
  } catch (error) {
    next(error);
  }
};

// GET ABOUT (ALL OR SINGLE)

export const getAbout = async (req, res, next) => {
  try {
    const about = await About.find();

    return res.status(200).json({
      success: true,
      count: about.length,
      data: about,
    });
  } catch (error) {
    next(error);
  }
};



// GET ABOUT BY ID
export const getAboutById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const about = await About.findById(id);
    if (!about) throw new NotFoundError("About section not found");

    return res.status(200).json({
      success: true,
      data: about,
    });
  } catch (error) {
    next(error);
  }
};




// DELETE ABOUT
export const deleteAbout = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { id } = req.params;

    const about = await About.findById(id);
    if (!about) throw new NotFoundError("About section not found");

    await about.deleteOne();

    return res.status(200).json({
      success: true,
      message: "About section deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};