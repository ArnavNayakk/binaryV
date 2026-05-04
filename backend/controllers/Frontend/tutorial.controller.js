import { BadRequestError, NotFoundError, UnauthorizedError } from "../../utils/customError.js";
import Tutorial from "../../models/Frontend/tutorial.model.js";

export const addTutorial = async (req, res, next) => {
  try {
    const userId = req?.user?._id || req?.user?.id;

    if (!userId) throw new UnauthorizedError();

    const body = req?.body || {};

    const videoLink = body?.videoLink?.trim();
    const title = body?.title?.trim();
    const description = body?.description?.trim();

    const newTutorial = new Tutorial({
      videoLink,
      title,
      description,
      createdBy: userId,
    });

    await newTutorial.save();

    return res.status(201).json({
      success: true,
      message: "Tutorial created successfully",
      data: newTutorial,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTutorial = async (req, res, next) => {
  try {
    const tutorialId = req?.params?.id;
    const userId = req?.user?._id || req?.user?.id;

    if (!userId) throw new UnauthorizedError();

    const body = req?.body || {};
    const updateData = {};

    if (body?.videoLink) updateData.videoLink = body.videoLink.trim();
    if (body?.title) updateData.title = body.title.trim();
    if (body?.description) updateData.description = body.description.trim();

    updateData.updatedBy =userId;

    const updated = await Tutorial.findByIdAndUpdate(
      tutorialId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) throw new NotFoundError("Tutorial not found");

    return res.status(200).json({
      success: true,
      message: "Tutorial updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTutorials = async (req, res, next) => {
  try {
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 10;

    if (page <= 0 || limit <= 0) {
      throw new BadRequestError("Page and limit must be positive numbers");
    }

    const skip = (page - 1) * limit;

    const total = await Tutorial.countDocuments();

    const tutorials = await Tutorial.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: tutorials,
    });
  } catch (error) {
    next(error);
  }
};

export const getTutorialById = async (req, res, next) => {
  try {
    const tutorialId = req?.params?.id;

    const tutorial = await Tutorial.findById(tutorialId)

    if (!tutorial) throw new NotFoundError("Tutorial not found");

    return res.status(200).json({
      success: true,
      data: tutorial,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTutorial = async (req, res, next) => {
  try {
    const tutorialId = req?.params?.id;
    const userId = req?.user?._id || req?.user?.id;

    if (!userId) throw new UnauthorizedError();


    const deleted = await Tutorial.findByIdAndDelete(tutorialId);

    if (!deleted) throw new NotFoundError("Tutorial not found");

    return res.status(200).json({
      success: true,
      message: "Tutorial deleted successfully",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};