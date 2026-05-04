import mongoose from "mongoose";
import Feature from "../models/feature.model.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError
} from "../../utils/customError.js";
import fs from "fs";
import path from "path";

// -------------------- ADD FEATURE --------------------
export const addFeature = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError("User not authenticated");

    if (!req?.file?.filename) {
      throw new BadRequestError("Feature image is required");
    }

    const { title, description } = req.body;
    if (!title?.trim() || !description?.trim()) {
      throw new BadRequestError("Title and description are required");
    }

    const newFeature = new Feature({
      image: `/uploads/images/${req.file.filename}`,
      title: title.trim(),
      description: description.trim(),
      createdBy: userId
    });

    await newFeature.save();

    return res.status(201).json({
      success: true,
      message: "Feature created successfully",
      data: newFeature,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------- UPDATE FEATURE --------------------
export const updateFeature = async (req, res, next) => {
  try {
    const featureId = req?.params?.id;
    const userId = req?.user?._id || req?.user?.id;

    if (!userId) throw new UnauthorizedError();
    if (!mongoose.Types.ObjectId.isValid(featureId))
      throw new BadRequestError("Invalid Feature ID");

    const feature = await Feature.findById(featureId);
    if (!feature) throw new NotFoundError("Feature not found");

    const { title, description } = req.body;
    if (title !== undefined) feature.title = title.trim();
    if (description !== undefined) feature.description = description.trim();

    // If new image uploaded, delete old image
    if (req?.file?.filename) {
      if (feature.image) {
        const oldImagePath = path.join(process.cwd(), feature.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.warn("Failed to delete old image:", err.message);
        });
      }
      feature.image = `/uploads/images/${req.file.filename}`;
    }

    feature.updatedBy = userId;

    await feature.save();

    return res.status(200).json({
      success: true,
      message: "Feature updated successfully",
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------- GET ALL FEATURES --------------------
export const getAllFeatures = async (req, res, next) => {
  try {
    const features = await Feature.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: features.length,
      data: features,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------- GET FEATURE BY ID --------------------
export const getFeatureById = async (req, res, next) => {
  try {
    const featureId = req?.params?.id;

    const feature = await Feature.findById(featureId);
    if (!feature) throw new NotFoundError("Feature not found");

    return res.status(200).json({
      success: true,
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------- DELETE FEATURE --------------------
export const deleteFeature = async (req, res, next) => {
  try {
    const featureId = req?.params?.id;
    const userId = req?.user?._id || req?.user?.id;

    if (!userId) throw new UnauthorizedError();

    const deleted = await Feature.findByIdAndDelete(featureId);
    if (!deleted) throw new NotFoundError("Feature not found");

    // Delete image file if exists
    if (deleted.image) {
      const imagePath = path.join(process.cwd(), deleted.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("Failed to delete image file:", err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
