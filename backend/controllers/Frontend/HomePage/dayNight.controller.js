import mongoose from "mongoose";
import DayNight from "../../models/dayNight.model.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/customError.js";

export const addDayNight = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const body = req?.body || {};

    const {
      dayTitle,
      dayDescription,
      nightTitle,
      nightDescription,
    } = body;

    if (
      !dayTitle?.trim() ||
      !dayDescription?.trim() ||
      !nightTitle?.trim() ||
      !nightDescription?.trim()
    ) {
      throw new BadRequestError("All text fields are required");
    }

    const newDoc = new DayNight({
      bannerImg: req.files?.bannerImg?.[0]
        ? `/uploads/images/${req.files.bannerImg[0].filename}`
        : null,

      dayImg: req.files?.dayImg?.[0]
        ? `/uploads/images/${req.files.dayImg[0].filename}`
        : null,

      nightImg: req.files?.nightImg?.[0]
        ? `/uploads/images/${req.files.nightImg[0].filename}`
        : null,

      dayTitle: dayTitle.trim(),
      dayDescription: dayDescription.trim(),
      nightTitle: nightTitle.trim(),
      nightDescription: nightDescription.trim(),
      createdBy: userId,
    });

    await newDoc.save();

    return res.status(201).json({
      success: true,
      message: "Day/Night section created successfully",
      data: newDoc,
    });
  } catch (error) {
    next(error);
  }
};



export const updateDayNight = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      throw new BadRequestError("Invalid ID");

    const record = await DayNight.findById(id);
    if (!record) throw new NotFoundError("Record not found");

    const body = req?.body || {};

    if (body?.dayTitle) record.dayTitle = body.dayTitle.trim();
    if (body?.dayDescription) record.dayDescription = body.dayDescription.trim();
    if (body?.nightTitle) record.nightTitle = body.nightTitle.trim();
    if (body?.nightDescription) record.nightDescription = body.nightDescription.trim();

    // Update images consistently
    if (req?.files?.bannerImg?.[0]) {
      record.bannerImg = `/uploads/images/${req.files.bannerImg[0].filename}`;
    }

    if (req?.files?.dayImg?.[0]) {
      record.dayImg = `/uploads/images/${req.files.dayImg[0].filename}`;
    }

    if (req?.files?.nightImg?.[0]) {
      record.nightImg = `/uploads/images/${req.files.nightImg[0].filename}`;
    }

    await record.save();

    return res.status(200).json({
      success: true,
      message: "Day/Night section updated successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDayNight = async (req, res, next) => {
  try {
    const data = await DayNight.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};


export const getDayNightById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id))
      throw new BadRequestError("Invalid ID");

    const record = await DayNight.findById(id);
    if (!record) throw new NotFoundError("Record not found");

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteDayNight = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await DayNight.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundError("Record not found");

    return res.status(200).json({
      success: true,
      message: "Day/Night record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
