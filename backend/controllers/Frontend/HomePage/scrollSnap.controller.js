import mongoose from "mongoose";
import TradingCard from "../models/tradingCard.model.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/customError.js";
import fs from "fs";
import path from "path";

//ADD TRADING CARD
export const addTradingCard = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const body = req?.body || {};
    const title = body?.title?.trim();
    const description = body?.description?.trim();

    if (!title || !description) {
      throw new BadRequestError("Title and description are required");
    }

    if (!req?.file?.filename) {
      throw new BadRequestError("Image file is required");
    }

    const newCard = new TradingCard({
      title,
      description,
      image: `/uploads/images/${req?.file?.filename}`, // save under uploads/images
      createdBy: userId,
    });

    await newCard.save();

    return res.status(201).json({
      success: true,
      message: "Trading card created successfully",
      data: newCard,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE TRADING CARD 
export const updateTradingCard = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const cardId = req?.params?.id;
    if (!mongoose.isValidObjectId(cardId)) {
      throw new BadRequestError("Invalid Trading Card ID");
    }

    const existing = await TradingCard.findById(cardId);
    if (!existing) throw new NotFoundError("Trading Card not found");

    const body = req?.body || {};
    if (body?.title !== undefined) existing.title = body.title.trim();
    if (body?.description !== undefined) existing.description = body.description.trim();

    if (req?.file?.filename) {
      // Delete old image file if it exists
      if (existing.image) {
        const oldImagePath = path.join(process.cwd(), existing.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.warn("Failed to delete old image:", err.message);
        });
      }
      existing.image = `/uploads/images/${req?.file?.filename}`;
    }

    existing.updatedBy = userId;

    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Trading card updated successfully",
      data: existing,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL TRADING CARDS
export const getAllTradingCards = async (req, res, next) => {
  try {
    const page = Number(req?.query?.page) || 1;
    const limit = Number(req?.query?.limit) || 10;

    if (page <= 0 || limit <= 0) {
      throw new BadRequestError("Page and limit must be positive numbers");
    }

    const skip = (page - 1) * limit;
    const total = await TradingCard.countDocuments();

    const cards = await TradingCard.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

// Delete
export const deleteTradingCard = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) throw new UnauthorizedError();

    const cardId = req?.params?.id;
    if (!mongoose.isValidObjectId(cardId)) {
      throw new BadRequestError("Invalid Trading Card ID");
    }

    const deleted = await TradingCard.findByIdAndDelete(cardId);

    if (!deleted) throw new NotFoundError("Trading Card not found");

    // Delete image file if exists
    if (deleted.image) {
      const imagePath = path.join(process.cwd(), deleted.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("Failed to delete image file:", err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trading card deleted successfully",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};
