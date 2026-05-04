import mongoose from "mongoose";
import Download from "../../models/Frontend/download.model.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from "../../utils/customError.js";

// Add Download 
export const addDownload = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const existing = await Download.findOne();
    if (existing) throw new ConflictError("Download document already exists");

    const { title, description, feature, downloadLink } = req.body;

    if (!title || !description || !downloadLink) {
      throw new BadRequestError("Title, description, and downloadLink are required");
    }

    if (!Array.isArray(feature) || feature.length === 0) {
      throw new BadRequestError("Feature must be a non-empty array");
    }

    const invalid = feature.some((item) => !item.subTitle || !item.subDescription);
    if (invalid) throw new BadRequestError("Invalid feature items provided");

    const newDoc = await Download.create({
      title,
      description,
      feature,
      downloadLink,
      createdBy:userId,
    });

    return res.status(201).json({
      success: true,
      message: "Download document created successfully",
      data: newDoc,
    });
  } catch (error) {
    next(error);
  }
};


// Get Single Document
export const getDownload = async (req, res, next) => {
  try {
    const doc = await Download.findOne();

    if (!doc) throw new NotFoundError("No download document found");

    return res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

// Update the only document
export const updateDownload = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const existing = await Download.findOne();
    if (!existing) throw new NotFoundError("Download document does not exist");

    const { title, description, feature, downloadLink } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (downloadLink) updateData.downloadLink = downloadLink;

    if (feature) {
      if (!Array.isArray(feature) || feature.length === 0) {
        throw new BadRequestError("Feature must be a non-empty array");
      }

      const invalid = feature.some((item) => !item.subTitle || !item.subDescription);
      if (invalid) throw new BadRequestError("Invalid feature structure");

      updateData.feature = feature;
    }

    updateData.updatedBy = userId;

    const updated = await Download.findByIdAndUpdate(existing._id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Download document updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};


// Delete the only document
export const deleteDownload = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const existing = await Download.findOne();
    if (!existing) throw new NotFoundError("No download document found to delete");

    await Download.findByIdAndDelete(existing._id);

    return res.status(200).json({
      success: true,
      message: "Download document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
